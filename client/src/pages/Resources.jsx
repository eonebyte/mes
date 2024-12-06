import { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Card } from "antd";
import LayoutDashboard from "../components/layouts/LayoutDashboard";
import { useSelector } from "react-redux";

const Resources = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const [data, setData] = useState([
        {
            id: 1,
            name: "Machine A",
            type: "CNC",
            location: "Workshop 1",
        },
        {
            id: 2,
            name: "Machine B",
            type: "Lathe",
            location: "Workshop 2",
        },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentResource, setCurrentResource] = useState(null);

    const [form] = Form.useForm();

    const columns = [
        {
            title: "No",
            key: "no",
            render: (text, record, index) => index + 1,
            width: "5%", // Lebar kolom No yang lebih kecil
            align: 'center',
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 150, // Lebar kolom Name yang lebih besar
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 120, // Lebar kolom Type yang cukup untuk teks singkat
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            width: 180, // Lebar kolom Location yang cukup untuk teks yang lebih panjang
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
            width: 150, // Lebar kolom Actions yang cukup untuk tombol
        },
    ];

    const handleEdit = (resource) => {
        setCurrentResource(resource);
        form.setFieldsValue(resource);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setData(data.filter((item) => item.id !== id));
    };

    const handleModalClose = () => {
        setCurrentResource(null);
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (values) => {
        if (currentResource) {
            setData(data.map((item) => (item.id === currentResource.id ? { ...item, ...values } : item)));
        } else {
            const newId = Math.max(...data.map((item) => item.id)) + 1;
            setData([...data, { id: newId, ...values }]);
        }
        handleModalClose();
    };

    return (
        <LayoutDashboard>
            <div style={{ marginTop: 5 }}>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Add Resource
                </Button>
                <Card
                    style={{
                        boxShadow: isDarkMode
                            ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                            : '0 1px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                    }}
                    styles={{
                        body: {
                            padding: 10
                        }
                    }}
                >
                    <Table
                        dataSource={data}
                        columns={columns}
                        rowKey="id"
                        bordered
                        size="small" // Padding sel kecil
                    />
                </Card>
                <Modal
                    title={currentResource ? "Edit Resource" : "Add Resource"}
                    open={isModalOpen}
                    onCancel={handleModalClose}
                    footer={null}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormSubmit}
                    >
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: "Please enter the resource name!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Type"
                            name="type"
                            rules={[{ required: true, message: "Please enter the resource type!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Location"
                            name="location"
                            rules={[{ required: true, message: "Please enter the resource location!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                {currentResource ? "Save Changes" : "Add Resource"}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </LayoutDashboard>
    );
};

export default Resources;
