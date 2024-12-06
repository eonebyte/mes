import { Button, Card, Col, Flex, Form, Input, Modal, Row, Space } from "antd";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const DownWithCategory = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

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

    const handleCardClick = (item) => {
        setSelectedCategory(item);  // Set selected category
        setIsModalVisible(true);     // Show the modal
    };

    useEffect(() => {
        if (selectedCategory) {
            form.setFieldsValue({
                category: selectedCategory.category,
                code: selectedCategory.code,
            });
        }
    }, [selectedCategory, form]);



    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedCategory(null);
        form.resetFields();  // Reset form fields when modal is closed
    };

    const handleFormSubmit = (values) => {
        console.log("Form Submitted:", values);  // You can use this data for further actions
        handleModalClose();
    };


    return (
        <>
            <Card
                title={
                    <div>
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
        </>
    );
};

export default DownWithCategory;