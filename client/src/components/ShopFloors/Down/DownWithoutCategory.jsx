import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Card, Form, Modal, Select, Table } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DownWithoutCategory = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [downtimesWithoutCategory, setDowntimesWithoutCategory] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDowntime, setSelectedDowntime] = useState(null);

    useEffect(() => {
        setDowntimesWithoutCategory([
            { id: 1, startTime: "2024-12-01 10:00:00", endTime: "2024-12-01 12:00:00" },
            { id: 2, startTime: "2024-12-02 08:00:00", endTime: "2024-12-02 09:30:00" },
            { id: 3, startTime: "2024-12-03 13:00:00", endTime: "2024-12-03 14:30:00" },
        ]);
    }, []);

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

    const handleAddCategoryClick = (downtime) => {
        setSelectedDowntime(downtime);  // Track the downtime to add category
        setIsModalVisible(true);  // Show the modal to select category
        form.resetFields();
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
    };

    const handleModalOk = () => {
        form.validateFields()
            .then((values) => {
                console.log(`Downtime ${selectedDowntime.id} diberi kategori: ${selectedCategory}`);
                console.log('Deskripsi:', values.description);
                setIsModalVisible(false);
                setSelectedCategory(null);
            })
            .catch((info) => {
                console.error('Validasi gagal:', info);
            });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

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

    return (
        <>
            <Card 
            style={{ 
                backgroundColor: '#FFF4E6', 
                marginBottom: '20px',
                boxShadow: isDarkMode
                        ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                        : '0 1px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
            }}
            styles={{
                body: {
                    padding: "10px 10px",
                }
            }}
            >
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



            {/* Modal untuk menambah kategori */}
            <Modal
                title="Add Category"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={handleModalOk}>
                        Simpan
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="category"
                    >
                        <Select
                            style={{ width: '100%' }}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            placeholder="Pilih kategori downtime"
                        >
                            {downtimeCategories.map((category) => (
                                <Select.Option key={category.code} value={category.category}>
                                    {category.category}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DownWithoutCategory;