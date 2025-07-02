import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Space } from "antd";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const ConfirmStartActive = ({ planId, resourceId, onSuccess }) => {
    Modal.confirm({
        title: 'Confirm Complete',
        content: (
            <>
                <Divider />
                <span style={{ fontSize: '18px' }}>Are you sure to complete the task ?</span>
                <Divider />
            </>

        ),
        styles: {
            content: {
                padding: 15,
            }
        },
        footer: (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button
                        color="default"
                        variant="text"
                        style={{
                            color: 'red',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={() => {
                            Modal.destroyAll();
                        }}
                    >
                        <StopOutlined style={{ fontSize: '18px', color: 'red' }} />
                        CANCEL
                    </Button>
                    <Button
                        color="default"
                        variant="text"
                        style={{
                            color: '#52c41a',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={() => {
                            fetch(`${backendUrl}${prefix}/plan/resource/start`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ planId, resourceId }),
                            })
                                .then(() => {
                                    notification.success({
                                        message: 'Status Updated',
                                        description: 'Plan status changed to START.',
                                    });
                                    Modal.destroyAll();
                                    onSuccess?.();
                                })
                                .catch(error => {
                                    notification.error({
                                        message: 'Error',
                                        description: 'Failed to update plan status.',
                                    });
                                    console.error('Error:', error);
                                });
                        }}
                    >
                        <CheckOutlined style={{ fontSize: '24px', color: '#52c41ad' }} />
                        OK
                    </Button>
                </Space>
            </div>
        ),
    });
};

export default ConfirmStartActive;