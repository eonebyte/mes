import { useState } from "react";
import { Upload, Table, message, Card, Button, Modal, Alert, List, Typography } from "antd";
import { CloudUploadOutlined, CheckCircleOutlined, SendOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import LayoutDashboard from "../../components/layouts/LayoutDashboard"; // Pastikan path ini benar
import { useSelector } from "react-redux";

const { Text } = Typography;

const { confirm } = Modal;

const { Dragger } = Upload;

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

export default function ImportPlan() {
    const user = useSelector((state) => state.auth.user);
    const [fileList, setFileList] = useState([]);
    const [importData, setImportData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDataImported, setIsDataImported] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isDataValid, setIsDataValid] = useState(true);
    const [errorList, setErrorList] = useState([]);


    // --- FUNGSI FORMAT TANGGAL YANG DISEMPURNAKAN ---
    // Fungsi ini sekarang lebih sederhana, hanya untuk memformat objek Date ke string.
    const formatDateTime = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return date; // Kembalikan nilai asli jika bukan objek Date yang valid
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleImport = async () => {
        if (fileList.length === 0) {
            messageApi.error('Please upload a file first.');
            return;
        }

        setLoading(true);
        setIsDataValid(true);
        setErrorList([]); // Reset error list di awal

        try {
            // ... (Parsing Excel seperti sebelumnya, tidak ada perubahan di sini)
            const file = fileList[0].originFileObj;
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);
            const worksheet = workbook.worksheets[0];

            // 1. Ambil data header (line, mc, tonnage)
            const line = worksheet.getCell('A2').text;
            const mc = worksheet.getCell('B2').text;
            const tonnage = worksheet.getCell('C2').text;

            // 2. Ambil header tabel & filter kolom kosong
            const headerRow = worksheet.getRow(3);
            const headers = [];
            const headerKeys = [];
            headerRow.eachCell({ includeEmpty: true }, (cell) => {
                if (!cell.value) return;
                const rawValue = cell.value;
                const key = rawValue.toString().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
                headers.push({
                    title: rawValue,
                    dataIndex: key,
                    key: key,
                    render: (text) => {
                        // Kondisi untuk format tanggal (sudah ada sebelumnya)
                        if (key === 'start' || key === 'end') {
                            return formatDateTime(text);
                        }
                        // TAMBAHAN: Kondisi untuk format kolom 'hours'
                        if (key === 'hours') {
                            const num = parseFloat(text); // Ubah teks menjadi angka
                            // Jika bukan angka, kembalikan teks asli. Jika angka, format ke 2 desimal.
                            return isNaN(num) ? text : num.toFixed(2);
                        }
                        // Untuk kolom lainnya, kembalikan teks asli
                        return text;
                    }
                });
                headerKeys.push(key);
            });

            // 3. Parsing data baris
            const data = [];
            worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
                if (rowIndex <= 3) return;
                const rowData = {};
                let hasData = false;
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const key = headerKeys[colNumber - 1];
                    if (!key) return;
                    let value = cell.value;
                    if (cell.formula) value = cell.result;

                    if (key === 'partno' && typeof value === 'string') {
                        value = value.trim();
                    }

                    if ((key === 'start' || key === 'end') && value) {
                        if (value instanceof Date) { rowData[key] = value; }
                        else if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(value)) { const parts = value.split(/[/\s:]/); rowData[key] = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]); }
                        else { rowData[key] = value; }
                    } else { rowData[key] = value; }
                    if (value !== null && value !== undefined && value !== "") hasData = true;
                });
                if (hasData) {
                    rowData.key = `row-${rowIndex}`;
                    rowData.line = line;
                    rowData.mc = mc;
                    rowData.tonnage = tonnage;
                    rowData.user_id = user.id;
                    data.push(rowData);
                }
            });

            // --- VALIDASI TERPUSAT DIMULAI DI SINI ---
            if (data.length > 0) {
                console.log('Received data for validation:', data);
                
                const partnosToValidate = [...new Set(data.map(item => item.partno).filter(Boolean))];

                const response = await fetch(`${backendUrl}${prefix}/plan/validate-parts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ partnos: partnosToValidate, rows: data }),
                });

                if (!response.ok) {
                    throw new Error('Validation request failed');
                }

                const validationResult = await response.json();
                const idMap = validationResult.validationData || {};

                // Ini adalah daftar semua error dari backend (termasuk error tanggal kosong)
                let combinedErrors = validationResult.errors ? [...validationResult.errors] : [];
                const rowsWithInitialErrors = new Set(combinedErrors.map(e => e.rowNo));
                let hasInvalidRows = rowsWithInitialErrors.size > 0;

                const enrichedData = data.map(row => {
                    let enrichedRow = { ...row };
                    let isThisRowValid = !rowsWithInitialErrors.has(row.no); // Awalnya valid jika tidak ada error dari backend

                    // Validasi PartNo & Family (hanya jika baris belum ditandai tidak valid)
                    const requiresValidation = row.family !== null && row.family !== undefined && row.family !== '';

                    if (requiresValidation) {
                        const validData = row.partno ? idMap[row.partno] : null;
                        if (validData) {
                            enrichedRow.partid = validData.partid;
                            enrichedRow.moldid = validData.moldid;
                        } else {
                            isThisRowValid = false;
                            const errorMsg = `Row ${row.no} - PartNo "${row.partno}" tidak ditemukan atau belum ada Mold.`;
                            if (!combinedErrors.some(e => e.rowNo === row.no)) {
                                combinedErrors.push({ rowNo: row.no, message: errorMsg });
                            }
                        }
                    } else {
                        const parentRows = data.filter(r => r.family === row.no);
                        if (parentRows.length > 0) {
                            const validData = idMap[row.partno];
                            if (validData) {
                                enrichedRow.partid = validData.partid;
                                enrichedRow.moldid = validData.moldid;
                            } else {
                                isThisRowValid = false;
                                const errorMsg = `Row ${row.no} - PartNo "${row.partno}" digunakan sebagai Family tapi tidak valid.`;
                                if (!combinedErrors.some(e => e.rowNo === row.no)) {
                                    combinedErrors.push({ rowNo: row.no, message: errorMsg });
                                }
                            }
                        }
                    }

                    enrichedRow.isValid = isThisRowValid;
                    if (!isThisRowValid) {
                        hasInvalidRows = true;
                    }
                    return enrichedRow;
                });

                setImportData(enrichedData);
                setErrorList(combinedErrors); // Set daftar error gabungan

                if (hasInvalidRows) {
                    setIsDataValid(false);
                    let messageContent = 'Terdapat data yang tidak valid. Baris ditandai merah.';
                    // Cek jika ada error spesifik tanggal
                    if (combinedErrors.some(e => e.message.includes("Start/End date"))) {
                        messageContent = 'Beberapa data tidak valid (misal: tanggal kosong atau Part No tidak ditemukan). Baris ditandai merah.';
                    }
                    messageApi.warning({
                        content: messageContent,
                        duration: 10,
                    });
                } else {
                    messageApi.success('Semua data valid dan telah dilengkapi. Silakan review.');
                }
            } else {
                setImportData([]);
            }

            const partnoIndex = headers.findIndex(col => col.key === 'partno');
            const lineColumn = { title: 'LINE', dataIndex: 'line', key: 'line' };
            const mcColumn = { title: 'NOMER MC', dataIndex: 'mc', key: 'mc' };
            if (partnoIndex !== -1) { headers.splice(partnoIndex, 0, lineColumn, mcColumn); }
            else { headers.unshift(mcColumn); headers.unshift(lineColumn); }

            setColumns(headers);
            setIsDataImported(true);

        } catch (error) {
            console.error("Import Error:", error);
            messageApi.error('Gagal mengimpor atau memvalidasi file. Periksa konsol untuk detail.');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menangani tombol submit
    const handleSubmit = async () => {
        if (importData.length === 0) {
            messageApi.error("No data to submit.");
            return;
        }

        const submitMessage = message.loading('Submitting data...', 0);

        try {
            // Data tanggal akan dikirim dalam format ISO standar (lebih baik untuk backend)
            const response = await fetch(`${backendUrl}${prefix}/plan/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importData),
            });

            const result = await response.json();
            submitMessage(); // Tutup pesan loading

            if (response.ok) {
                messageApi.success(result.message || 'Data submitted successfully!');
                // --- AUTO EXPORT pakai ExcelJS ---
                if (result.data && Array.isArray(result.data)) {
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet("Result");

                    // Buat header
                    worksheet.columns = [
                        { header: "No", key: "no", width: 10 },
                        { header: "Cust JobOrder ID", key: "cust_joborder_id", width: 20 },
                        { header: "Document No", key: "documentno", width: 20 },
                        { header: "Part No", key: "partno", width: 20 },
                        { header: "Part Name", key: "part_name", width: 40 },
                    ];

                    // Tambahkan data
                    result.data.forEach((row) => {
                        worksheet.addRow({
                            no: row.no,
                            cust_joborder_id: row.cust_joborder_id,
                            documentno: row.documentno,
                            partno: row.partno,
                            part_name: row.part_name,
                        });
                    });

                    // Generate file & trigger download
                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    });

                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "import_result.xlsx";
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
                // Reset state setelah export
                setImportData([]);
                setFileList([]);
                setColumns([]);
                setIsDataImported(false);
            } else {
                messageApi.error(result.message || 'Failed to submit data.');
            }
        } catch (error) {
            submitMessage(); // Tutup pesan loading
            messageApi.error('An error occurred while submitting data.');
            console.error('Submission error:', error);
        }
    };

    return (
        <LayoutDashboard>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
                {contextHolder}
                {!isDataImported && (
                    <Card title="Upload JO" bordered={false}>
                        <Dragger
                            multiple={false}
                            maxCount={1}
                            fileList={fileList}
                            onChange={handleFileChange}
                            beforeUpload={() => false}
                            accept=".xls, .xlsx"
                        >
                            <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">Supports a single upload of an .xls or .xlsx file.</p>
                        </Dragger>
                        <Button
                            type="primary"
                            onClick={handleImport}
                            disabled={fileList.length === 0 || loading}
                            loading={loading}
                            style={{ marginTop: 16 }}
                            icon={<CheckCircleOutlined />}
                        >
                            {loading ? "Importing..." : "Preview"}
                        </Button>
                    </Card>
                )}

                {isDataImported && (
                    <Card
                        title={
                            <Button
                                onClick={() => {
                                    setIsDataImported(false);
                                    setImportData([]);
                                    setColumns([]);
                                    // opsional reset file juga:
                                    // setFileList([]);
                                }}
                            >
                                <ArrowLeftOutlined />
                            </Button>
                        }
                        bordered={false}
                        extra={
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={() => {
                                    confirm({
                                        title: "Apakah Anda yakin ingin submit data?",
                                        icon: <ExclamationCircleOutlined />,
                                        content: "Pastikan semua data sudah benar sebelum melanjutkan.",
                                        okText: "Ya, Submit",
                                        cancelText: "Batal",
                                        onOk: () => handleSubmit(), // baru kirim ke API kalau OK
                                    });
                                }}
                                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                                disabled={!isDataValid}
                            >
                                Submit
                            </Button>
                        }
                    >
                        {errorList.length > 0 && (
                            <Alert
                                message="Ditemukan Masalah Validasi"
                                description={
                                    <List
                                        size="small"
                                        dataSource={errorList}
                                        renderItem={(error) => ( // 'error' adalah objek {rowNo, message}
                                            <List.Item style={{ padding: '4px 0', border: 'none' }}>
                                                <Text type="danger">❌ {error.message}</Text>
                                            </List.Item>
                                        )}
                                    />
                                }
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Table
                            columns={columns}
                            dataSource={importData}
                            pagination={{ pageSize: 10, hideOnSinglePage: true }}
                            disabled={loading || !isDataValid}
                            bordered
                            scroll={{ x: "max-content" }}
                            rowClassName={(record) => record.isValid === false ? 'invalid-row' : ''}
                        />
                    </Card>
                )}
            </div>
        </LayoutDashboard>
    );
}