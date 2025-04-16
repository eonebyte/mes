import { Button, Col, Divider, InputNumber, Modal, notification, Row, Space } from "antd";
import { useState } from "react";
import { StopOutlined } from "@ant-design/icons";
import PropTypes from 'prop-types';

const ConfirmMaterialNew = ({ bomComponent, planId, open, onClose, onSuccess }) => {
    const [qtyMap, setQtyMap] = useState({});
    const [qtyMapRMP, setQtyMapRMP] = useState({});

    const handleQtyChange = (key, value) => {
        setQtyMap(prev => ({ ...prev, [key]: value }));
    };

    const handleQtyChangeRMP = (key, value) => {
        setQtyMapRMP(prev => ({ ...prev, [key]: value }));
    };

    const filterByCategory = (category) => {
        return bomComponent.filter(item => item.category === category);
    };

    const rmItems = filterByCategory("Raw Material");
    const rmpItems = filterByCategory("Raw Material Penunjang");

    const allItems = [...rmItems, ...rmpItems];


    const handleSubmit = async () => {
        const result = allItems.map(item => ({
            ...item,
            planId,
            qty: Math.max(0, Number(qtyMap[item.partId] || 0)) // Ensure qty is non-negative
        }));

        try {
            const response = await fetch('/api/material-input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(result)
            });

            if (!response.ok) {
                // Handle HTTP errors
                const errorData = await response.json();
                notification.error({
                    message: 'Error',
                    description: errorData.message || 'Failed to submit material data',
                });
                return;
            }

            const data = await response.json();

            // Success notification
            notification.success({
                message: 'Submitted',
                description: data.message || 'Material qty saved successfully!',
            });

            // Trigger success callback and close modal
            onSuccess?.(result);
            onClose();

        } catch (error) {
            console.error('Submit error:', error);
            notification.error({
                message: 'Network Error',
                description: 'Could not reach server',
            });
        }
    };


    return (
        <Modal
            title="Material Input"
            open={open}
            onCancel={onClose}
            footer={null}
            width={'80%'}
        >
            <Row gutter={16}>
                {/* KIRI: RM */}
                <Col span={12}>
                    <div style={{
                        display: 'flex',
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        background: '#f5f5f5',
                        borderBottom: '1px solid #ddd'
                    }}>
                        <div style={{ flex: 14 }}>Material</div>
                        <div style={{ flex: 6, textAlign: 'center' }}>Qty</div>
                        <div style={{ flex: 4, textAlign: 'center' }}>UOM</div>
                    </div>
                    {rmItems.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderBottom: '1px dashed #eee'
                        }}>
                            <div style={{ flex: 14 }}>{item.partNo} - {item.partName}</div>
                            <div style={{ flex: 6, textAlign: 'right' }}>
                                <InputNumber
                                    min={0}
                                    step={0.1}
                                    value={qtyMap[index] || 0}
                                    onChange={(value) => handleQtyChange(index, value)}
                                    style={{ width: '80%' }}
                                />
                            </div>
                            <div style={{ flex: 4, textAlign: 'center' }}>{item.uomsymbol}</div>
                        </div>
                    ))}
                </Col>

                {/* KANAN: RMP */}
                <Col span={12}>
                    <div style={{
                        display: 'flex',
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        background: '#f5f5f5',
                        borderBottom: '1px solid #ddd'
                    }}>
                        <div style={{ flex: 14 }}>Child Part</div>
                        <div style={{ flex: 6, textAlign: 'center' }}>Qty</div>
                        <div style={{ flex: 4, textAlign: 'center' }}>UOM</div>
                    </div>
                    {rmpItems.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderBottom: '1px dashed #eee'
                        }}>
                            <div style={{ flex: 14 }}>{item.partNo} - {item.partName}</div>
                            <div style={{ flex: 6, textAlign: 'right' }}>
                                <InputNumber
                                    min={0}
                                    step={0.1}
                                    value={qtyMapRMP[index] || 0}
                                    onChange={(value) => handleQtyChangeRMP(index, value)}
                                    style={{ width: '80%' }}
                                />
                            </div>
                            <div style={{ flex: 4, textAlign: 'center' }}>{item.uomsymbol}</div>
                        </div>
                    ))}
                </Col>
            </Row>

            <Divider style={{ marginTop: 12, marginBottom: 8 }} />

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Button
                        style={{ color: '#666666', fontWeight: 'bold' }}
                        onClick={onClose}
                        icon={<StopOutlined />}
                    >
                        CLOSE
                    </Button>
                </Space>
                <Button type="primary" onClick={handleSubmit}>Submit</Button>
            </div>
        </Modal>
    );
};

ConfirmMaterialNew.propTypes = {
    planId: PropTypes.number.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    bomComponent: PropTypes.arrayOf(PropTypes.shape({
        partNo: PropTypes.string.isRequired,
        partName: PropTypes.string.isRequired,
        uomsymbol: PropTypes.string.isRequired
    })).isRequired
};

export default ConfirmMaterialNew;
