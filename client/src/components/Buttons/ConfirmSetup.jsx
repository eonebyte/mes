import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Select, Space } from "antd";
import { useState } from "react";
import PropTypes from 'prop-types';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const ConfirmSetup = ({ resourceId, onSuccess, open, onClose }) => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleOk = () => {
        setLoading(true);

        fetch(`${backendUrl}${prefix}/plan/resource/setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resourceId, status: selectedStatus }),
        })
            .then(async res => {
                const data = await res.json();

                if (!res.ok) {
                    const errorMessages = Array.isArray(data.messages)
                        ? data.messages.join(', ')
                        : data.message || 'Unknown error';

                    throw new Error(errorMessages);
                }

                notification.success({
                    message: 'Status Updated',
                    description: `Plan status changed to ${selectedStatus}`,
                });

                onClose();
                onSuccess?.();
            })
            .catch(error => {
                let description = error.message;
                let items = description.includes(', ') ? description.split(', ') : [description];

                description = (
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {items.map((item, index) => {
                            let link = null;

                            if (item.toLowerCase().includes('bom')) {
                                link = <a href="" style={{ marginLeft: 8 }}>→ Klik tombol Material</a>;
                            } else if (item.toLowerCase().includes('mold pada mesin')) {
                                link = <a href={`/resource/mold?resourceId=${resourceId}`} style={{ marginLeft: 8 }}>→ Periksa Mold</a>;
                            }

                            return (
                                <li key={index}>
                                    {item}
                                    {link}
                                </li>
                            );
                        })}
                    </ul>
                );

                notification.error({
                    message: 'Error',
                    description,
                });

                console.error('Error:', error);
            })
            .finally(() => setLoading(false));
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            footer={null}
            title="Confirm Setup"
            styles={{
                content: {
                    padding: 15,
                }
            }}
        >
            <Divider />
            <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Select a setup"
                optionFilterProp="label"
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={[
                    { value: 'SETUP_MOLD', label: 'Setup Mold' },
                    { value: 'TEARDOWN_MOLD', label: 'Teardown Mold' },
                    { value: 'SETTINGS', label: 'Settings' },
                ]}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button
                        style={{
                            color: 'red',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={onClose}
                        disabled={loading}
                    >
                        <StopOutlined style={{ fontSize: '18px', color: 'red' }} />
                        CANCEL
                    </Button>
                    <Button
                        style={{
                            color: '#52c41a',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={handleOk}
                        disabled={!selectedStatus}
                        loading={loading}
                    >
                        <CheckOutlined style={{ fontSize: '24px', color: '#52c41ad' }} />
                        OK
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

ConfirmSetup.propTypes = {
    resourceId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ConfirmSetup;
