import { useState } from "react";
import { Button, Divider, InputNumber, Modal, Space } from "antd";
import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import GroupWorkIcon from '@mui/icons-material/GroupWork';


const ChangeCavity = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        alert("OK");
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onChange = (value) => {
        console.log(`selected ${value}`);
    };


    return (
        <>
            <Button
                color="primary"
                variant="text"
                style={{
                    fontWeight: 600,
                    fontFamily: "'Roboto', Arial, sans-serif",
                    fontSize: "12px",
                    padding: "4px 12px",
                }}
                type="primary"
                onClick={showModal}>
                <GroupWorkIcon sx={{ fontSize: 18 }} />
                <span>CAVITY</span>
            </Button>
            <Modal
                title="Change Cavity"
                maskClosable={false}
                open={isModalVisible}
                onCancel={handleCancel}
                width={400}
                footer={
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Space>
                            <Button
                                color="default"
                                variant="text"
                                style={{
                                    color: "red",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    padding: "5px 10px",
                                }}
                                onClick={handleCancel}
                            >
                                <StopOutlined style={{ fontSize: "18px", color: "red" }} />
                                CANCEL
                            </Button>
                            <Button
                                color="default"
                                variant="text"
                                style={{
                                    color: "#52c41a",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    padding: "5px 10px",
                                }}
                                onClick={handleOk}
                            >
                                <CheckOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                                OK
                            </Button>
                        </Space>
                    </div>
                }
                closable={false} // Disables the close (X) button
                style={{ padding: "15px" }}
            >
                <Divider />
                <InputNumber style={{ width: '100%' }} min={1} max={2} defaultValue={1} onChange={onChange} />
                <Divider />
            </Modal>
        </>
    );
};

export default ChangeCavity;
