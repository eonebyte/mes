import { useEffect, useRef, useState } from 'react';
import { EyeOutlined, FormOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Descriptions, Form, Input, InputNumber, Modal, notification, Row, Select, Space, Spin, Switch, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import LayoutDashboard from '../../components/layouts/LayoutDashboard';
import dayjs from 'dayjs';

import { useSelector } from 'react-redux';

const ListPlan = () => {

    const user = useSelector((state) => state.auth.user);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [formData, setFormData] = useState({});

    console.log('selected : ', selectedData);
    console.log('formData : ', formData);


    const [bomOptions, setBomOptions] = useState([]);
    const [resourceOptions, setResourceOptions] = useState([]);
    const [moldOptions, setMoldOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3080/api/plans');
                const result = await response.json();
                if (result && result.data) {
                    setData(result.data); // Set data ke state
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Panggil fetchData untuk ambil data
    }, []);

    useEffect(() => {
        if (editModalVisible && formData.planId) {
            Promise.all([
                fetch(`http://localhost:3080/api/plans/boms?planId=${formData.planId}`).then(res => res.json()),
                fetch(`http://localhost:3080/api/resources`).then(res => res.json()),
                fetch(`http://localhost:3080/api/molds`).then(res => res.json()),
                fetch(`http://localhost:3080/api/plans/products`).then(res => res.json())
            ])
                .then(([bomData, resourceData, moldData, productData]) => {
                    setBomOptions(bomData.data || []);
                    setResourceOptions(resourceData.data || []);
                    setMoldOptions(moldData.data || []);
                    setProductOptions(productData.data || []);
                })
                .catch(err => {
                    console.error('Error fetching data:', err);
                    notification.error({
                        message: 'Gagal Memuat Data',
                        description: 'Terjadi kesalahan saat memuat BOM dan Resource.',
                        placement: 'topRight',
                    });
                });
        }
    }, [editModalVisible, formData]);



    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        // onFilter: (value, record) =>
        //     record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilter: (value, record) => {
            // Pengecekan untuk nilai null atau undefined
            const text = record[dataIndex] || '';  // Jika null/undefined, ganti dengan string kosong
            return text.toString().toLowerCase().includes(value.toLowerCase());
        },
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    // const formatDate = (dateStr) => {
    //     const [datePart] = dateStr.split(' '); // ["30-12-2024"]
    //     const [day, month, year] = datePart.split('-'); // ["30", "12", "2024"]
    //     const formattedDate = new Date(`${year}-${month}-${day}`);
    //     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    //     const formatter = new Intl.DateTimeFormat('id-ID', options);
    //     return formatter.format(formattedDate); // Output: "30/12/2024"
    // };

    // const formatDateTime = (dateStr) => {
    //     if (!dateStr) return '';

    //     try {
    //         const [datePart, timePart] = dateStr.split(' ');
    //         const [day, month, year] = datePart.split('-');
    //         const [hours, minutes, seconds] = timePart.split(':');
    //         const formattedDate = `${day}/${month}/${year}`;
    //         const formattedDateTime = `${formattedDate} ${hours}:${minutes}:${seconds}`;
    //         return formattedDateTime;
    //     } catch (error) {
    //         console.error("Error formatting date/time:", error);
    //         return '';  // Jika terjadi error, kembalikan string kosong
    //     }
    // };

    const handleViewDetail = (record) => {
        setSelectedData(record);
        setModalVisible(true);
    };

    const columns = [
        { title: 'No', dataIndex: 'no', key: 'no', ...getColumnSearchProps('no') },
        {
            title: 'Plan No',
            dataIndex: 'planNo',
            key: 'planNo', ...getColumnSearchProps('planNo'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => {
                // Jika 'planNo' berupa angka, gunakan pembanding numerik
                if (typeof a.planNo === 'number' && typeof b.planNo === 'number') {
                    return a.planNo - b.planNo;
                }
                // Jika 'planNo' berupa string, gunakan localeCompare untuk membandingkan string
                return a.planNo.toString().localeCompare(b.planNo.toString());
            },
        },
        { title: 'Description', dataIndex: 'description', key: 'description', ...getColumnSearchProps('description') },
        { title: 'Resource code', dataIndex: 'resourceCode', key: 'resourceCode', ...getColumnSearchProps('resourceCode') },
        { title: 'Mold', dataIndex: 'moldName', key: 'moldName', ...getColumnSearchProps('moldName') },
        { title: 'Part No', dataIndex: 'partNo', key: 'partNo', ...getColumnSearchProps('partNo') },
        { title: 'Part Name', dataIndex: 'partName', key: 'partName', ...getColumnSearchProps('partName') },
        // { title: 'User', dataIndex: 'user', key: 'user', ...getColumnSearchProps('user') },
        { title: 'Plan Status', dataIndex: 'status', key: 'status', ...getColumnSearchProps('status') },
        { title: 'Qty', dataIndex: 'qty', key: 'qty', ...getColumnSearchProps('qty') },
        // {
        //     title: 'Date Doc',
        //     dataIndex: 'dateDoc',
        //     key: 'dateDoc',
        //     ...getColumnSearchProps('dateDoc'),
        //     render: (text) => formatDate(text),
        // },
        // {
        //     title: 'Start Time',
        //     dataIndex: 'planStartTime',
        //     key: 'planStartTime',
        //     render: (text) => formatDateTime(text),  // Terapkan formatDateTime untuk Start Time
        // },
        // {
        //     title: 'Complete Time',
        //     dataIndex: 'planCompleteTime',
        //     key: 'planCompleteTime',
        //     render: (text) => formatDateTime(text),  // Terapkan formatDateTime untuk Complete Time
        // },
        // { title: 'Cycletime', dataIndex: 'cycletime', key: 'cycletime', ...getColumnSearchProps('cycletime') },
        // { title: 'Cavity', dataIndex: 'cavity', key: 'cavity', ...getColumnSearchProps('cavity') },
        // { title: 'Trial', dataIndex: 'isTrial', key: 'isTrial', ...getColumnSearchProps('isTrial') },
        // { title: 'BOM', dataIndex: 'bom', key: 'bom', ...getColumnSearchProps('bom') },
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <>
                    <Button type="link" onClick={() => handleViewDetail(record)}>
                        <EyeOutlined />
                    </Button>
                    {/* === */}
                    <Button key="edit" onClick={() => {
                        setFormData(record);
                        setEditModalVisible(true);
                    }}>
                        <FormOutlined />
                    </Button>
                </>

            ),
        },
    ];

    return (
        <LayoutDashboard>
            <Card
                style={{ marginTop: 5, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
                styles={{
                    body: {
                        padding: 5
                    }
                }}
            >
                <Spin spinning={loading}>
                    <Table
                        style={{
                            marginTop: 5,
                        }}
                        rowKey="planId"
                        columns={columns}
                        dataSource={data}
                        scroll={{ x: "max-content" }}
                        size='small'
                    />
                </Spin>
            </Card>

            {/* Modal untuk menampilkan detail */}
            <Modal
                title="Plan Detail"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={1000}
            >
                {selectedData && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="No">{selectedData.no}</Descriptions.Item>
                        <Descriptions.Item label="Plan No">{selectedData.planNo}</Descriptions.Item>
                        <Descriptions.Item label="Description">{selectedData.description}</Descriptions.Item>
                        <Descriptions.Item label="Resource Code">{selectedData.resourceCode}</Descriptions.Item>
                        <Descriptions.Item label="Mold">{selectedData.moldName}</Descriptions.Item>
                        <Descriptions.Item label="Part No">{selectedData.partNo}</Descriptions.Item>
                        <Descriptions.Item label="Part Name">{selectedData.partName}</Descriptions.Item>
                        <Descriptions.Item label="User">{selectedData.user}</Descriptions.Item>
                        <Descriptions.Item label="Plan Status">{selectedData.status}</Descriptions.Item>
                        <Descriptions.Item label="Quantity">{selectedData.qty}</Descriptions.Item>
                        <Descriptions.Item label="Date Doc">{selectedData.dateDoc}</Descriptions.Item>
                        <Descriptions.Item label="Start Time">{selectedData.planStartTime}</Descriptions.Item>
                        <Descriptions.Item label="Complete Time">{selectedData.planCompleteTime}</Descriptions.Item>
                        <Descriptions.Item label="Cycletime">{selectedData.cycletime}</Descriptions.Item>
                        <Descriptions.Item label="Cavity">{selectedData.cavity}</Descriptions.Item>
                        <Descriptions.Item label="Trial">{selectedData.isTrial === false ? 'N' : 'Y'}</Descriptions.Item>
                        <Descriptions.Item label="BOM">{selectedData.bom}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* MODAL EDIT */}
            <Modal
                title="Edit Plan"
                open={editModalVisible}
                width={1000}
                onCancel={() => setEditModalVisible(false)}
                onOk={async () => {
                    try {
                        const response = await fetch(`http://localhost:3080/api/plans/${formData.planId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...formData, userId: user.id }),
                        });
                        const result = await response.json();
                        if (result.success) {
                            const refreshed = await fetch('http://localhost:3080/api/plans');
                            const refreshedData = await refreshed.json();
                            setData(refreshedData.data);
                            setEditModalVisible(false);
                            setModalVisible(false);

                            // ⬇️ Tampilkan notifikasi sukses
                            notification.success({
                                message: 'Update Berhasil',
                                description: 'Data plan berhasil diperbarui.',
                                placement: 'topRight',
                            });
                        } else {
                            console.error('Update failed:', result.message);
                            // ⬇️ Notifikasi error (optional)
                            notification.error({
                                message: 'Update Gagal',
                                description: result.message || 'Terjadi kesalahan saat memperbarui data.',
                                placement: 'topRight',
                            });
                        }
                    } catch (error) {
                        console.error('Error updating data:', error);
                        notification.error({
                            message: 'Terjadi Kesalahan',
                            description: error.message,
                            placement: 'topRight',
                        });
                    }
                }}

                okText="Save"
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Plan No">
                                <Input disabled value={formData.planNo} onChange={(e) => setFormData({ ...formData, planNo: e.target.value })} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Description">
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Resource Code">
                                <Select
                                    showSearch
                                    value={formData.resourceCode}
                                    onChange={(code) => {
                                        const selected = resourceOptions.find(r => r.code === code);
                                        setFormData({
                                            ...formData,
                                            resourceCode: selected.code,
                                            resourceId: parseInt(selected.id),
                                        });
                                    }}
                                    placeholder="Select Resource"
                                    options={resourceOptions.map(resource => ({
                                        value: resource.code,  // yang dipakai saat di-select
                                        label: resource.code,  // yang ditampilkan
                                    }))}
                                >
                                </Select>
                            </Form.Item>

                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mold">
                                <Select
                                    showSearch
                                    value={formData.moldName}
                                    onChange={(name) => {
                                        const selected = moldOptions.find(m => m.name === name);
                                        setFormData({
                                            ...formData,
                                            moldName: selected.name,
                                            mold: selected.name,
                                            moldId: parseInt(selected.m_product_id),
                                        });
                                    }}
                                    placeholder="Select Mold"
                                    options={moldOptions.map(mold => ({
                                        value: mold.name,  // yang dipakai saat di-select
                                        label: mold.name,  // yang ditampilkan
                                    }))}
                                >
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Part No">
                                <Select
                                    showSearch
                                    placeholder="Select Part No"
                                    value={formData.partNo}
                                    optionFilterProp="label"
                                    onChange={(selectedPartNo) => {
                                        const selected = productOptions.find(p => p.partno === selectedPartNo);
                                        setFormData({
                                            ...formData,
                                            partNo: selected.partno,
                                            partName: selected.partname,
                                            partId: parseInt(selected.m_product_id)
                                        });
                                    }}
                                    options={productOptions.map(p => ({
                                        value: p.partno,
                                        label: p.partno,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Part Name">
                                <Select
                                    showSearch
                                    placeholder="Select Part Name"
                                    value={formData.partName}
                                    optionFilterProp="label"
                                    onChange={(selectedPartName) => {
                                        const selected = productOptions.find(p => p.partname === selectedPartName);
                                        setFormData({
                                            ...formData,
                                            partNo: selected.partno,
                                            partName: selected.partname,
                                            partId: parseInt(selected.m_product_id)
                                        });
                                    }}
                                    options={productOptions.map(p => ({
                                        value: p.partname,
                                        label: p.partname,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Created By">
                                <Input disabled value={formData.user} onChange={(e) => setFormData({ ...formData, user: e.target.value })} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Status">
                                <Input value={formData.status} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Qty">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    value={formData.qty}
                                    onChange={(value) => setFormData({ ...formData, qty: value })}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Date Doc">
                                <DatePicker
                                    style={{ width: '100%' }}
                                    value={formData.dateDoc ? dayjs(formData.dateDoc, 'DD-MM-YYYY') : null}
                                    onChange={(date) =>
                                        setFormData({ ...formData, dateDoc: date ? date.format('DD-MM-YYYY') : null })
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Start Time">
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    value={formData.planStartTime ? dayjs(formData.planStartTime, 'DD-MM-YYYY HH:mm:ss') : null}
                                    onChange={(date) =>
                                        setFormData({
                                            ...formData,
                                            planStartTime: date ? date.format('DD-MM-YYYY HH:mm:ss') : null,
                                        })
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Complete Time">
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    value={
                                        formData.planCompleteTime
                                            ? dayjs(formData.planCompleteTime, 'DD-MM-YYYY HH:mm:ss')
                                            : null
                                    }
                                    onChange={(date) =>
                                        setFormData({
                                            ...formData,
                                            planCompleteTime: date ? date.format('DD-MM-YYYY HH:mm:ss') : null,
                                        })
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Cycletime">
                                <InputNumber
                                    disabled
                                    style={{ width: '100%' }}
                                    value={formData.cycletime}
                                    onChange={(value) => setFormData({ ...formData, cycletime: value })}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Cavity">
                                <InputNumber
                                    disabled
                                    style={{ width: '100%' }}
                                    value={formData.cavity}
                                    onChange={(value) => setFormData({ ...formData, cavity: value })}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={`Trial ${formData.isTrial === false ? '(N)' : '(Y)'}`}>
                                <Switch
                                    checked={formData.isTrial}
                                    onChange={(checked) => setFormData({ ...formData, isTrial: checked })}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="BOM">
                        <Select
                            showSearch
                            placeholder="Select BOM"
                            value={formData.bomName}
                            optionFilterProp="label"
                            onChange={(bomId) => {
                                const selected = bomOptions.find(bom => bom.pp_product_bom_id === bomId);
                                setFormData({
                                    ...formData,
                                    bomName: selected.name,
                                    bomId: parseInt(selected.pp_product_bom_id),
                                });
                            }}
                            // onChange={(value) => setFormData({ ...formData, bomId: value })}
                            options={bomOptions.map(bom => ({
                                value: bom.pp_product_bom_id,
                                label: bom.name,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>

        </LayoutDashboard>
    );
};

export default ListPlan;