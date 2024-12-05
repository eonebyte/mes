import { Alert, Button, Card, Col, DatePicker, Flex, Form, Input, List, Modal, Row, Select, Space, Spin, Table } from "antd";
import { resources } from "../../../data/fetchResource";
import { useNavigate, useSearchParams } from "react-router-dom";
import DetailResource from "../DetailResource";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Option } from "antd/es/mentions";

function DownResource() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModal2Visible, setIsModal2Visible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDowntime, setSelectedDowntime] = useState(null);

    const [form] = Form.useForm();

    const downtimeCategories = [
        { category: "DANDORI", code: "R1" },
        { category: "BACKUP MESIN LAIN", code: "R2" },
        { category: "TROUBLE MESIN", code: "R3" },
        { category: "TROUBLE MOLD", code: "R4" },
        { category: "MATERIAL", code: "R5" },
        { category: "NO LOADING", code: "R6" },
        { category: "PACKING", code: "R7" },
        { category: "TROUBLE SHOOTING", code: "R8" },
        { category: "ISTIRAHAT", code: "R9" },
    ];

    const [downtimesWithoutCategory, setDowntimesWithoutCategory] = useState([]);

    console.log(resource);



    useEffect(() => {
        setTimeout(() => {
            const resourceData = resources.find((res) => res.id === Number(resourceId));
            setResource(resourceData);
            setLoading(false);
        }, 500);

        setDowntimesWithoutCategory([
            { id: 1, startTime: "2024-12-01 10:00:00", endTime: "2024-12-01 12:00:00" },
            { id: 2, startTime: "2024-12-02 08:00:00", endTime: "2024-12-02 09:30:00" },
            { id: 3, startTime: "2024-12-03 13:00:00", endTime: "2024-12-03 14:30:00" },
        ]);
    }, [resourceId]);

    useEffect(() => {
        if (selectedCategory) {
            form.setFieldsValue({
                category: selectedCategory.category,
                code: selectedCategory.code,
            });
        }
    }, [selectedCategory, form]);

    const handleCardClick = (item) => {
        setSelectedCategory(item);  // Set selected category
        setIsModalVisible(true);     // Show the modal
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedCategory(null);
        setSelectedDowntime(null);
        form.resetFields();  // Reset form fields when modal is closed
    };

    const handleFormSubmit = (values) => {
        console.log("Form Submitted:", values);  // You can use this data for further actions
        handleModalClose();
    };

    const handleAddCategoryClick = (downtime) => {
        setSelectedDowntime(downtime);  // Track the downtime to add category
        setIsModal2Visible(true);  // Show the modal to select category
    };

    const columns = [
        {
            title: 'No',
            key: 'no',
            render: (text, downtime, index) => index + 1,
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, downtime) => (
                <Button
                    type="primary"
                    onClick={() => handleAddCategoryClick(downtime)}
                >
                    Tambah Kategori
                </Button>
            ),
        },
    ];

    const categories = ['Machine Failure', 'Operator Error', 'Maintenance', 'Power Outage'];


    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
    };

    const handleModalOk = () => {
        if (selectedCategory) {
            // Simulasikan pengaturan kategori pada downtime
            console.log(`Downtime ${selectedDowntime.id} diberi kategori: ${selectedCategory}`);
            // Implementasikan logika untuk memperbarui kategori pada downtime di sini
            setIsModalVisible(false);
            setSelectedCategory(null);
        } else {
            alert('Silakan pilih kategori');
        }
    };

    const handleModal2Cancel = () => {
        setIsModal2Visible(false);
    };


    return (
        <DetailResource>
            {loading ?
                <Col
                    style={{
                        marginTop: 10,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                    lg={24}
                >
                    <Spin tip="Loading...">
                        <Alert
                            style={{ width: '200px', height: '60px' }}
                            type="info"
                        />
                    </Spin>
                </Col>
                :
                <>
                    {/* BODY CONTENT */}
                    <Card
                        title={
                            <div onClick={() => navigate(`/resource/mold/setup?resourceId=${resource.id}`)} style={{ cursor: 'pointer' }}>
                                <Flex align="center" justify="flex-start">
                                    <Space>
                                        <div
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '50%',
                                                backgroundColor: isDarkMode ? '#1890ff' : '#1890ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <AlarmAddIcon sx={{ fontSize: '24px', color: isDarkMode ? '#fff' : '#fff' }} />
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: isDarkMode ? '#e6f7ff' : 'inherit'
                                        }}>
                                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                                <span>Report DOWN </span>
                                                <small>Are you sure to Report Down </small>
                                            </span>
                                        </p>

                                    </Space>
                                </Flex>
                            </div>
                        }
                        style={{
                            border: 0,
                            borderRadius: 3,
                            marginBottom: '20px', // Menambahkan margin bawah agar tidak terlalu rapat dengan konten berikutnya
                            boxShadow: isDarkMode
                                ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                                : '0 1px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                        }}
                        styles={{
                            header: {
                                border: 0,
                                backgroundColor: isDarkMode ? '#2c3e50' : '#e6f4ff  ',
                                color: isDarkMode ? '#e6f4ff' : 'inherit',
                                borderRadius: '3px 3px 0px 0px',
                            },
                            body: {
                                padding: "5px 10px",
                                borderRadius: 3,
                            }
                        }}
                    >
                        <Card
                            styles={{
                                body: {
                                    backgroundColor: '#f5f5f5',
                                    padding: "5px 10px",

                                }
                            }}
                        >
                            <Row gutter={[16, 16]}>
                                {downtimeCategories.map((item, index) => (
                                    <Col xs={24} sm={12} md={8} lg={4} key={index}>
                                        <Card
                                            hoverable
                                            style={{
                                                textAlign: 'center',
                                                backgroundColor: isDarkMode ? '#1e90ff' : '#fff',
                                                color: isDarkMode ? '#fff' : '#000',
                                                borderRadius: 5,
                                                boxShadow: '0 2px 2px rgba(0, 0, 0, 0.5)',
                                            }}
                                            styles={{
                                                body: {
                                                    padding: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }
                                            }}
                                            onClick={() => handleCardClick(item)}
                                        >
                                            <small style={{ fontSize: '12px' }}>
                                                {item.code}
                                            </small>
                                            <span style={{ fontSize: '14px', fontWeight: 500, marginTop: '5px' }}>
                                                {item.category}
                                            </span>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Card>

                    <Card style={{ backgroundColor: '#FFF4E6' }}>
                        <div style={{ marginBottom: 16, fontWeight: 'bold', color: '#D13A3A', fontSize: '16px' }}>
                            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                            <span>Perhatian! Downtime ini belum memiliki kategori, segera ditambahkan!</span>
                        </div>
                        <Table
                            dataSource={downtimesWithoutCategory}
                            columns={columns}
                            rowKey="id"
                            pagination={false}
                            bordered
                            style={{ backgroundColor: '#FFF4E6' }}  // Memberikan latar belakang dengan warna warning
                        />
                    </Card>

                    {/* Modal for Adjusting Category */}
                    <Modal
                        title={`CONFIRM DOWN`}
                        open={isModalVisible}
                        onCancel={handleModalClose}
                        footer={null}
                    >
                        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                            <Form.Item
                                name="code"
                            >
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item
                                label="Category"
                                name="category"
                            >
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    START
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* Modal untuk menambah kategori */}
                    <Modal
                        title="Tambah Kategori Downtime"
                        open={isModal2Visible}
                        onOk={handleModalOk}
                        onCancel={handleModal2Cancel}
                        okText="Simpan"
                        cancelText="Batal"
                    >
                        <div>
                            <label style={{ marginBottom: 8, display: 'block' }}>Pilih Kategori:</label>
                            <Select
                                style={{ width: '100%' }}
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                placeholder="Pilih kategori downtime"
                            >
                                {downtimeCategories.map((category) => (
                                    <Option key={category.code} value={category.category}>
                                        {category.category}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Modal>
                </>
            }
        </DetailResource>
    );
}

export default DownResource;