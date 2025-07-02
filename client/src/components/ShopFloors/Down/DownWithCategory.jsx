import { Button, Card, Col, Flex, Form, Input, Modal, notification, Row, Space } from "antd";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import socket from "../../../libs/socket-io/socket.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';


const DownWithCategory = ({ onSuccess, resource }) => {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [downtimeCategories, setDowntimeCategories] = useState([]);



    const [form] = Form.useForm();

    const fetchDownCategories = async () => {
        try {
            const res = await fetch(`${backendUrl}${prefix}/down/categories`);

            const response = await res.json();

            console.log("Response from server:", response);

            if (Array.isArray(response.data)) {
                const filtered = response.data.filter(item => item.code !== 'RUN');
                setDowntimeCategories(filtered);
                console.log("Set buttons with data (filtered):", filtered);
            } else {
                console.warn("Unexpected data format:", response);
            }

        } catch (error) {
            console.error("Failed to fetch down categories data:", error);
        }
    };

    // const downtimeCategories = [
    //     { category: "IDLE", code: "R" },
    //     { category: "OFF", code: "R0" },
    //     { category: "DANDORI & PREPARE", code: "R1" },
    //     { category: "BACKUP MESIN LAIN", code: "R2" },
    //     { category: "TROUBLE MESIN", code: "R3" },
    //     { category: "TROUBLE MOLD", code: "R4" },
    //     { category: "MATERIAL", code: "R5" },
    //     { category: "NO LOADING", code: "R6" },
    //     { category: "PACKING", code: "R7" },
    //     { category: "TROUBLE SHOOTING", code: "R8" },
    //     { category: "ISTIRAHAT", code: "R9" },
    // ];

    useEffect(() => {
        fetchDownCategories();
    }, []);


    const handleCardClick = (item) => {
        setSelectedCategory(item);  // Set selected category
        setIsModalVisible(true);     // Show the modal
    };

    useEffect(() => {
        if (selectedCategory) {
            form.setFieldsValue({
                resourceId: parseInt(resource.id),
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

    const handleStartClick = () => {
        setIsConfirmModalVisible(true);
    };

    const handleConfirm = () => {
        form.submit(); // form di-submit di sini
    };


    const handleFormSubmit = async (values) => {
        console.log("Submitting values:", values);
        console.log("rId:", values.resourceId);

        setLoading(true); // Mulai loading

        try {
            const response = await fetch(`${backendUrl}${prefix}/down/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            const result = await response.json();


            if (!response.ok || result?.data?.success === false) {
                throw new Error(result?.data?.message || "Gagal menyimpan downtime");
            }

            // ✅ Notifikasi sukses
            notification.success({
                message: 'Berhasil Menyimpan',
                description: result?.message || 'Successfully record event.',
                placement: 'topRight',
            });

            onSuccess();

            socket.emit("refreshServer", { success: true, resourceId: [values.resourceId] }); // Emit event to refresh daclientsta on all 

            // Success handling
            handleModalClose();
        } catch (error) {
            console.error("Error submitting downtime:", error.message);

            notification.error({
                message: 'Gagal Menyimpan',
                description: error.message || 'Error occurred while saving event',
                placement: 'topRight',
            });
            handleModalClose();
        } finally {
            setLoading(false); // Hentikan loading setelah selesai
        }
    };


    return (
        <>
            <Card
                title={
                    <Flex align="center" justify="space-between" style={{ width: '100%' }}>
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
                                <AlarmAddIcon sx={{ fontSize: '24px', color: '#fff' }} />
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '600',
                                color: isDarkMode ? '#e6f7ff' : 'inherit'
                            }}>
                                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <span>Report DOWN</span>
                                    <small>Are you sure to Report Down</small>
                                </span>
                            </p>
                        </Space>
                    </Flex>

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
                                        backgroundColor: item.code === resource.status
                                            ? (isDarkMode ? '#0000aa' : '#cce5ff')  // Warna berbeda saat aktif
                                            : (isDarkMode ? '#1e90ff' : '#fff'),
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
                    <Form.Item name="resourceId" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="code"
                    >
                        <Input readOnly disabled />
                    </Form.Item>
                    <Form.Item
                        label="Category"
                        name="category"
                    >
                        <Input readOnly disabled />
                    </Form.Item>
                    <Form.Item
                        label="Reason"
                        name="reason"
                        initialValue="-"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" block onClick={handleStartClick} loading={loading}>
                            START
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="CONFIRM START"
                open={isConfirmModalVisible}
                onCancel={() => setIsConfirmModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsConfirmModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleConfirm} loading={loading}>
                        Confirm
                    </Button>,
                ]}
            >
                <p>Are you sure you want to start this event?</p>
            </Modal>
        </>
    );
};

DownWithCategory.propTypes = {
    onSuccess: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
};

export default DownWithCategory;