import { useState } from "react";
import { Upload, Table, message, Card } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import LayoutDashboard from "../../components/layouts/LayoutDashboard";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;

export default function ImportPlan() {
    const user = useSelector((state) => state.auth.user);
    // const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [importData, setImportData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDataImported, setIsDataImported] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();


    // Fungsi untuk menghandle perubahan file upload
    const handleFileChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const formatDateOnly = (value) => {
        if (value instanceof Date) {
            // Mendapatkan string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
            const isoString = value.toISOString();
            // Mengambil bagian tanggal (YYYY-MM-DD)
            const datePart = isoString.split('T')[0];
            // Ubah format ke DD/MM/YYYY
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}`; // Format: DD/MM/YYYY
        }
        return value;
    }

    const formatDateTime = (value) => {
        if (value instanceof Date) {
            // Mendapatkan string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
            const isoString = value.toISOString();
            // Mengambil bagian tanggal (YYYY-MM-DD)
            const datePart = isoString.split('T')[0];
            // Mengambil bagian waktu (HH:mm:ss)
            const timePart = isoString.split('T')[1].substring(0, 8);
            // Ubah format ke DD/MM/YYYY HH:mm:ss
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year} ${timePart}`; // Format: DD/MM/YYYY HH:mm:ss
        }
        return value;
    }


    // Fungsi untuk memulai import data dari Excel
    const handleImport = async () => {
        if (fileList.length === 0) {
            messageApi.open({
                type: 'error',
                content: 'Please upload a file first.',
            });
            return;
        }

        setLoading(true);

        try {
            // Ambil file dari fileList
            const file = fileList[0].originFileObj;

            // Baca file menggunakan ExcelJS
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);

            // Ambil sheet pertama
            const worksheet = workbook.worksheets[0];

            // Ambil header dari baris pertama
            const headers = [];
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                headers.push({
                    title: cell.value,
                    dataIndex: `col${colNumber}`, // Data index dinamis berdasarkan kolom
                    key: `col${colNumber}`,
                });
            });
            headers.push({
                title: "User ID", // Kolom baru untuk User
                dataIndex: "user_id",
                key: "user_id",
            });
            setColumns(headers);

            // Parsing data dari baris berikutnya
            const data = [];

            worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
                if (rowIndex === 1) return; // Lewati header

                const rowData = {};
                let hasData = false;
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    let value = cell.value;

                    if (colNumber === 3 && value instanceof Date) {
                        value = formatDateOnly(value);
                    }

                    if (value instanceof Date) {
                        value = formatDateTime(value);
                    }

                    if (value !== null && value !== undefined && value !== "") {
                        hasData = true; // Jika ada nilai di sel, tandai sebagai baris valid
                    }

                    rowData[`col${colNumber}`] = value;


                });

                rowData['user_id'] = user.id;
                if (hasData) {
                    rowData.key = `row-${rowIndex}`;
                    console.log(rowData);
                    data.push(rowData);
                }
            });

            setImportData(data);
            setIsDataImported(true); // Set flag menjadi true setelah import berhasil
            messageApi.open({
                type: 'success',
                content: 'File imported successfully!',
            });
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'Failed to import file. Please check the file format.',
            });
        }

        setLoading(false);
    };

    // Fungsi untuk menangani tombol submit
    const handleSubmit = async () => {
        try {
            // Tampilkan pesan loading
            messageApi.open({
                type: 'loading',
                content: 'Submitting data...',
                duration: 0,
            });

            // Kirim data ke backend
            const response = await fetch('http://localhost:3080/api/import-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(importData), // Kirim data yang diimpor
            });

            const result = await response.json();

            // Hapus pesan loading
            messageApi.destroy();

            if (response.ok) {
                messageApi.open({
                    type: 'success',
                    content: result.message || 'Data submitted successfully!',
                });

                // Reset data setelah submit berhasil
                setImportData([]);
                setFileList([]);
                setColumns([]);
                setIsDataImported(false);
                // navigate('/plan/list');
            } else {
                messageApi.open({
                    type: 'error',
                    content: result.message || 'Failed to submit data.',
                });
            }
        } catch (error) {
            messageApi.destroy();
            messageApi.open({
                type: 'error',
                content: 'An error occurred while submitting data.',
            });
            console.error('Submission error:', error);
        }
    };


    return (
        <LayoutDashboard>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    gap: "20px",
                }}
            >
                {contextHolder}
                {/* Komponen Drag & Drop untuk upload */}
                {!isDataImported && (
                    <Card
                        bordered={false}
                        style={{
                            width: "100%",
                            borderRadius: "10px",
                            textAlign: "center",
                        }}
                    >
                        <Dragger
                            fileList={fileList}
                            onChange={handleFileChange}
                            beforeUpload={() => false}
                            accept=".csv, .xls, .xlsx"
                            style={{ padding: "20px" }}
                        >
                            <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                            </p>
                            <p className="ant-upload-text">Click or Drag & Drop file to upload</p>
                            <p className="ant-upload-hint">Supported formats: .csv, .xls, .xlsx</p>
                        </Dragger>
                    </Card>
                )}

                {/* Tabel untuk menampilkan data yang diimpor */}
                {importData.length > 0 && (
                    <Card
                        title="Imported Data"
                        bordered={false}
                        style={{ width: "100%" }}
                    >
                        <Table
                            columns={columns}
                            dataSource={importData}
                            pagination={false}
                            bordered
                            style={{ marginTop: "20px" }}
                            scroll={{ x: "max-content" }}
                        />
                    </Card>
                )}

                {/* Tombol untuk memulai proses import */}
                {!isDataImported && fileList.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            style={{
                                background: "#1890ff",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "10px 20px",
                                cursor: "pointer",
                            }}
                        >
                            {loading ? "Importing..." : "Import Data"}
                        </button>
                    </div>
                )}

                {/* Tombol Submit untuk data yang sudah diimpor */}
                {isDataImported && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                background: "#52c41a",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "10px 20px",
                                cursor: "pointer",
                            }}
                        >
                            Submit Data
                        </button>
                    </div>
                )}
            </div>
        </LayoutDashboard>
    );
}
