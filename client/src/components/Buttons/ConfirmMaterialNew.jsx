import { Button, Col, Divider, Input, InputNumber, Modal, notification, Row, Select, Space, Typography } from "antd";
import { useState } from "react";
import PropTypes from 'prop-types';
import { CheckOutlined, StopOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

const ConfirmMaterialNew = ({ planId, resourceId, boms, onSuccess, open, onClose }) => {
    const [materials, setMaterials] = useState([
        { material: null, qty: 0 }
    ]);

    const [childParts, setChildParts] = useState([
        { material: null, qty: 0 }
    ]);

    const [loading, setLoading] = useState(false);

    const handleAddRowChildParts = () => {
        setChildParts([...childParts, { material: null, qty: 0 }]);
    };

    const handleDeleteRowChildParts = (index) => {
        const newChildParts = childParts.filter((_, i) => i !== index);
        setChildParts(newChildParts);
    };

    const handleChangeChildParts = (index, value) => {
        const newChildParts = [...childParts];
        newChildParts[index].material = value;
        setChildParts(newChildParts);
    };

    const handleQtyChangeChildParts = (index, value) => {
        const newChildParts = [...childParts];
        newChildParts[index].qty = value;
        setChildParts(newChildParts);
    };

    const handleAddRow = () => {
        setMaterials([...materials, { material: null, qty: 0 }]);
    };

    const handleDeleteRow = (index) => {
        const newMaterials = materials.filter((_, i) => i !== index);
        setMaterials(newMaterials);
    };

    const handleMaterialChange = (index, value) => {
        const newMaterials = [...materials];
        newMaterials[index].material = value;
        setMaterials(newMaterials);
    };

    const handleQtyChange = (index, value) => {
        const newMaterials = [...materials];
        newMaterials[index].qty = value;
        setMaterials(newMaterials);
    };

    const handleSubmitMaterial = () => {
        setLoading(true)
        console.log("Submitted materials:", materials);
    };


    return (
        <Modal
            title="Material Information"
            open={open}
            onCancel={onClose}
            width={800}
            footer={null}
        >
            {/* RM */}
            <Divider />
            <div>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                    <Col span={10}>
                        <Text style={{ display: 'block', marginBottom: 4 }}>Raw Material</Text>
                    </Col>
                    <Col span={3}>
                        <Text style={{ display: 'block', marginBottom: 4 }}>UoM</Text>
                    </Col>
                    <Col span={7}>
                        <Text style={{ display: 'block', marginBottom: 4 }}>Qty</Text>
                    </Col>
                </Row>
                {materials.map((item, index) => (
                    <Row gutter={16} style={{ marginBottom: 12 }} key={index}>
                        <Col span={10}>
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select a material"
                                value={item.material}
                                onChange={(value) => handleMaterialChange(index, value)}
                                options={[
                                    { value: 'SETUP_MOLD', label: 'Setup Mold' },
                                    { value: 'TEARDOWN_MOLD', label: 'Teardown Mold' },
                                    { value: 'SETTINGS', label: 'Settings' },
                                ]}
                            />
                        </Col>
                        <Col span={3} style={{ textAlign: 'center' }}>
                            <Input value={'Kg'} disabled />
                        </Col>
                        <Col span={7}>
                            <InputNumber
                                min={0}
                                max={999}
                                value={item.qty}
                                onChange={(value) => handleQtyChange(index, value)}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={4} style={{ display: 'flex', alignItems: 'end' }}>
                            {index === materials.length - 1 ? (
                                <Button color="primary" variant="filled" onClick={handleAddRow}>
                                    Add
                                </Button>
                            ) : (
                                <Button color="danger" variant="filled" onClick={() => handleDeleteRow(index)}>
                                    Delete
                                </Button>
                            )}
                        </Col>
                    </Row>
                ))}
            </div>

            {/* RMP */}
            <Divider />
            <div>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                    <Col span={10}>
                        <Text style={{ display: 'block', marginBottom: 4 }}>Child Part</Text>
                    </Col>
                    <Col span={3}>
                        <Text style={{ display: 'block', marginBottom: 4 }}>UoM</Text>
                    </Col>
                    <Col span={7}>
                        <Text style={{ display: 'block', marginBottom: 4 }}>Qty</Text>
                    </Col>
                </Row>
                {childParts.map((item, index) => (
                    <Row gutter={16} style={{ marginBottom: 12 }} key={index}>
                        <Col span={10}>
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select a material"
                                value={item.material}
                                onChange={(value) => handleChangeChildParts(index, value)}
                                options={[
                                    { value: 'SETUP_MOLD', label: 'Setup Mold' },
                                    { value: 'TEARDOWN_MOLD', label: 'Teardown Mold' },
                                    { value: 'SETTINGS', label: 'Settings' },
                                ]}
                            />
                        </Col>
                        <Col span={3} style={{ textAlign: 'center' }}>
                            <Input value={'Kg'} disabled />
                        </Col>
                        <Col span={7}>
                            <InputNumber
                                min={0}
                                max={999}
                                value={item.qty}
                                onChange={(value) => handleQtyChangeChildParts(index, value)}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={4} style={{ display: 'flex', alignItems: 'end' }}>
                            {index === childParts.length - 1 ? (
                                <Button color="primary" variant="filled" onClick={handleAddRowChildParts}>
                                    Add
                                </Button>
                            ) : (
                                <Button color="danger" variant="filled" onClick={() => handleDeleteRowChildParts(index)}>
                                    Delete
                                </Button>
                            )}
                        </Col>
                    </Row>
                ))}
            </div>
            <Divider style={{ margin: 0 }} />
            <Button onClick={() => {
                handleSubmitMaterial();
            }}
                color="primary"
                variant="solid"
                style={{ marginBottom: 15, marginTop: 5 }}>Submit</Button>
            <Text style={{ display: 'block', marginBottom: 4 }}>Material Consumption Log </Text>
            <TextArea rows={4} value={'this table'} />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button
                        style={{
                            color: '#666666',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={onClose}
                        disabled={loading}
                    >
                        <StopOutlined style={{ fontSize: '18px', color: '#666666' }} />
                        CLOSE
                    </Button>
                </Space>
            </div>
        </Modal >
    );
};

ConfirmMaterialNew.propTypes = {
    planId: PropTypes.number.isRequired,
    resourceId: PropTypes.string.isRequired,
    boms: PropTypes.arrayOf(PropTypes.shape({
        pp_product_bom_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        bomName: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })).isRequired,
    onSuccess: PropTypes.func,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ConfirmMaterialNew;
