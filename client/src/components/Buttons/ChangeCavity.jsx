import { useState } from "react";
import { Button, Divider, InputNumber, Modal, Space, notification } from "antd";
import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import PropTypes from 'prop-types';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1'

const ChangeCavity = ({ moldId, open, onClose, onSuccess, userId, currentCavity }) => {
    const [cavity, setCavity] = useState(currentCavity);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${backendUrl}${prefix}/plan/cavity`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ moldId, userId, cavity }),
            });

            if (!response.ok) {
                throw new Error("Failed to update cavity");
            }

            notification.success({
                message: 'Success',
                description: 'Cavity updated successfully.',
                placement: 'topRight',
            });

            onSuccess?.(); // Callback jika perlu
            onClose();     // Tutup modal
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Error',
                description: 'Failed to update cavity.',
                placement: 'topRight',
            });
        }
    };

    const handleChange = (value) => {
        setCavity(value);
    };

    return (
        <Modal
            title="Change Cavity"
            maskClosable={false}
            open={open}
            onCancel={onClose}
            width={400}
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Space>
                        <Button
                            style={{
                                color: "red",
                                fontSize: "18px",
                                fontWeight: "600",
                                padding: "5px 10px",
                            }}
                            onClick={onClose}
                            icon={<StopOutlined style={{ fontSize: "18px", color: "red" }} />}
                        >
                            CANCEL
                        </Button>
                        <Button
                            style={{
                                color: "#52c41a",
                                fontSize: "18px",
                                fontWeight: "600",
                                padding: "5px 10px",
                            }}
                            onClick={handleSubmit}
                            icon={<CheckOutlined style={{ fontSize: "24px", color: "#52c41a" }} />}
                        >
                            OK
                        </Button>
                    </Space>
                </div>
            }
            closable={false}
            style={{ padding: "15px" }}
        >
            <Divider />
            <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={20}
                value={cavity}
                onChange={handleChange}
            />
            <Divider />
        </Modal>
    );
};

ChangeCavity.propTypes = {
    moldId: PropTypes.number.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    userId: PropTypes.number.isRequired,
    currentCavity: PropTypes.number.isRequired,
};

export default ChangeCavity;
