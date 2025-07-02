import { StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Space } from "antd";
import PropTypes from 'prop-types';

import HoldIcon from '../../assets/hold-icon.svg';
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const ConfirmHold = ({ planId, resourceId, open, onClose, onSuccess, userId, productionId, lastProductionOutput, togoQty, outputQty }) => {
    const [loading, setLoading] = useState(false);

    console.log("Last qty prod : ", lastProductionOutput);
    

    const handleOk = (status) => {
        if (lastProductionOutput <= 0) {
            notification.error({
                message: 'Error',
                description: 'Production Qty must be greater than 0 to change the status.',
            });
            setLoading(false)
            onClose();
            return; // Stop the execution
        }

        setLoading(true);

        fetch(`${backendUrl}${prefix}/plan/resource/hold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId, resourceId, status, userId, productionId, togoQty, outputQty }),
            credentials: 'include',
        })
            .then(async res => {
                const data = await res.json();

                console.log('hey data', data);


                if (!res.ok && data.success !== true) {
                    const errorMessages = Array.isArray(data.messages)
                        ? data.messages.join(', ')
                        : data.message || 'Unknown error';

                    throw new Error(errorMessages);
                }

                notification.success({
                    message: 'Status Updated',
                    description: `Plan status changed to ${status}`,
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
            title="Confirm Hold"
            maskClosable={false}
            open={open}
            onCancel={onClose}
            destroyOnClose={false}
            width={400}
            footer={
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
                            onClick={onClose}
                        >
                            <StopOutlined style={{ fontSize: '18px', color: 'red' }} />
                            CANCEL
                        </Button>
                        <Button
                            loading={loading}
                            color="default"
                            variant="text"
                            style={{
                                color: '#fa8c16', // Menetapkan warna border
                                fontSize: '18px',
                                fontWeight: '600',
                                padding: '5px 10px'
                            }}
                            onClick={() => {
                                setLoading(true);
                                handleOk('HOLD');
                            }}
                        >
                            <img src={HoldIcon} alt="Hold Icon" width="24px" height="24px" />
                            HOLD
                        </Button>
                    </Space>
                </div>
            }
            closable={false}
            style={{ padding: "15px" }}
        >
            <>
                <Divider />
                <span style={{ fontSize: '18px' }}>Are you sure to Hold the task ?</span>
                <Divider />
            </>
        </Modal>
    );
};

ConfirmHold.propTypes = {
    planId: PropTypes.number.isRequired,
    resourceId: PropTypes.number.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    userId: PropTypes.number.isRequired,
    productionId: PropTypes.number.isRequired,
    lastProductionOutput: PropTypes.number.isRequired,
    togoQty: PropTypes.number.isRequired,
    outputQty: PropTypes.number.isRequired,
};


export default ConfirmHold;