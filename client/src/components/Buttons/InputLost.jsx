import { useState, useEffect } from "react";
import { Button, Col, Divider, Empty, InputNumber, Modal, Row, Space, Typography, notification } from "antd";
import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import PropTypes from 'prop-types';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const { Text } = Typography;
const InputLost = ({ open, onClose, onSuccess, userId, productionHistories }) => {

    const [selectedLine, setSelectedLine] = useState(null);
    const [lostQtys, setLostQtys] = useState({});


    useEffect(() => {
        if (productionHistories && productionHistories.length > 0) {
            const initialOutputQtys = {};
            productionHistories.forEach(prod => {
                initialOutputQtys[prod.m_production_id] = prod.lostqty ?? 0;
            });
            setLostQtys(initialOutputQtys);

            const editableLine = productionHistories.find(prod => prod.docstatus !== 'CO' && prod.docstatus !== 'CL');
            setSelectedLine(editableLine); // hanya line yang bisa diubah
        }
    }, [productionHistories]);



    const handleQtyChange = (value, hProdId) => {
        console.log("Changing:", hProdId, "to", value);
        const prod = productionHistories.find(prod => prod.m_production_id === hProdId);
        if (prod && prod.docstatus !== 'CO') {
            setLostQtys(prev => ({
                ...prev,
                [hProdId]: value
            }));
        }
    };


    const handleSubmit = async () => {
        if (!selectedLine) return;

        console.log("selectedLine", lostQtys[selectedLine.m_production_id]);


        try {
            const response = await fetch(`${backendUrl}${prefix}/production/input/lostqty`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productionId: selectedLine.m_production_id,
                    userId,
                    lostQty: parseInt(lostQtys[selectedLine.m_production_id])
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update cavity");
            }

            notification.success({
                message: 'Success',
                description: 'Lost Qty updated successfully.',
                placement: 'topRight',
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Error',
                description: 'Failed to update cavity.',
                placement: 'topRight',
            });
        }
    };


    return (
        <Modal
            title="Lost Qty"
            maskClosable={false}
            open={open}
            onCancel={onClose}
            width={800}
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
            {productionHistories ? (
                <Row gutter={8} style={{ marginBottom: 12 }}>
                    <Col span={2}>No</Col>
                    <Col span={10}>Production No</Col>
                    <Col span={12}>Qty</Col>
                </Row>
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            {productionHistories?.map((prod, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 12 }}>
                    <Col span={2}>
                        <Text>
                            {index + 1}.
                        </Text>
                    </Col>
                    <Col span={10}>
                        <Text>
                            {prod.production_no}
                        </Text>
                    </Col>
                    <Col span={12}>
                        <InputNumber
                            min={0}
                            max={10000}
                            placeholder="Qty"
                            value={parseInt(lostQtys[prod.m_production_id]) || 0}
                            disabled={prod.docstatus === 'CO' || prod.docstatus === 'CL'} // <-- ini bagian penting
                            onChange={(value) => handleQtyChange(value, prod.m_production_id)}
                            style={{ width: "100%" }}
                        />
                    </Col>
                </Row>
            ))}
            <Divider />
        </Modal>
    );
};
InputLost.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    userId: PropTypes.number.isRequired,
    productionHistories: PropTypes.arrayOf(
        PropTypes.shape({
            m_production_id: PropTypes.number.isRequired,
            productionqty: PropTypes.number,
            docstatus: PropTypes.string,
            lostqty: PropTypes.number,
        })
    ).isRequired,
};

export default InputLost;
