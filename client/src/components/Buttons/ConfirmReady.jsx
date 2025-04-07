import { CheckOutlined, SettingFilled, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Space } from "antd";

const ConfirmReady = ({ planId, onSuccess }) => {
    Modal.confirm({
        title: 'Plan Preparations',
        content: (
            <>
                <Divider />
                <span style={{ fontSize: '18px' }}>Req Calibration ? Ready to start !</span>
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
                            height: '55px',
                            color: '#595959',
                            fontSize: '14px',
                            fontWeight: '600',
                            padding: '5px 10px',
                            whiteSpace: 'normal', // Allow text to wrap
                            textAlign: 'center', // Center the text inside the button
                        }}
                        onClick={() => {
                            Modal.destroyAll();
                        }}
                    >
                        <StopOutlined style={{ fontSize: '14px', color: '#595959' }} />
                        CANCEL
                    </Button>
                    <Button
                        color="default"
                        variant="text"
                        style={{
                            height: '55px',
                            color: 'red', // Set border color
                            fontSize: '14px',
                            fontWeight: '600',
                            padding: '5px 10px',
                            whiteSpace: 'normal', // Allow text to wrap
                            textAlign: 'center', // Center the text inside the button
                        }}
                        onClick={() => {
                            fetch('http://localhost:3080/api/plans/status/open', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ planId, status: 'NO_NEED_CALIBRATION' }),
                            })
                                .then(() => {
                                    notification.success({
                                        message: 'Status Updated',
                                        description: 'Plan status changed to NO NEED CALIBRATION.',
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
                        <CheckOutlined style={{ fontSize: '14px', color: 'red' }} />
                        NO NEED CALIBRATION
                    </Button>
                    <Button
                        color="default"
                        variant="text"
                        style={{
                            height: '55px',
                            color: '#1677ff',
                            fontSize: '14px',
                            fontWeight: '600',
                            padding: '5px 10px',
                            whiteSpace: 'normal', // Allow text to wrap
                            textAlign: 'center', // Center the text inside the button
                        }}
                        onClick={() => {
                            alert('OK');
                            Modal.destroyAll();
                        }}
                    >
                        <SettingFilled style={{ fontSize: '14px', color: '#1677ff' }} />
                        REQ. CALIBRATION
                    </Button>
                </Space>
            </div>
        ),
    });
};

export default ConfirmReady;
