import { useState } from "react";
import {
    Button, Divider, InputNumber, Modal, Select, Space, notification, Row, Col,
    Table
} from "antd";
import {
    CheckOutlined, StopOutlined, PlusOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import PropTypes from "prop-types";

const { Option } = Select;

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const categoriesNG = [
    { category: 'Assy NG', code: 'AssyNG' },
    { category: 'Bending', code: 'Bending' },
    { category: 'Bercak', code: 'Bercak' },
    { category: 'Black Dot', code: 'BlackDot' },
    { category: 'Bubble', code: 'Bubble' },
    { category: 'Burning', code: 'Burning' },
    { category: 'Bushing Kembar', code: 'BushingKembar' },
    { category: 'Cracking', code: 'Cracking' },
    { category: 'Dented', code: 'Dented' },
    { category: 'Dial Over', code: 'DialOver' },
    { category: 'Dimension Out', code: 'DimensionOut' },
    { category: 'Dirty', code: 'Dirty' },
    { category: 'Discolor', code: 'Discolor' },
    { category: 'Doff', code: 'Doff' },
    { category: 'Ejector Mark', code: 'EjectorMark' },
    { category: 'Fitting Seret', code: 'FittingSeret' },
    { category: 'Flashing', code: 'Flashing' },
    { category: 'Flow Mark', code: 'FlowMark' },
    { category: 'Gas Mark', code: 'GasMark' },
    { category: 'Gate Bolong', code: 'GateBolong' },
    { category: 'Gate long', code: 'GateLong' },
    { category: 'Gelombang', code: 'Gelombang' },
    { category: 'Hair Line', code: 'HairLine' },
    { category: 'Hotstamp NG', code: 'HotstampNG' },
    { category: 'Kabel Rusak', code: 'KabelRusak' },
    { category: 'Keropos', code: 'Keropos' },
    { category: 'Korosi', code: 'Korosi' },
    { category: 'Lock Naik', code: 'LockNaik' },
    { category: 'Menempel', code: 'Menempel' },
    { category: 'Mixing Rh/Lh', code: 'MixingRhLh' },
    { category: 'NG DANDORI', code: 'NGDANDORI' },
    { category: 'NG SETTING', code: 'NGSETTING' },
    { category: 'No Busing', code: 'NoBusing' },
    { category: 'No Handle', code: 'NoHandle' },
    { category: 'Nonjol', code: 'Nonjol' },
    { category: 'Oily', code: 'Oily' },
    { category: 'Over Cut', code: 'OverCut' },
    { category: 'Pin Broken', code: 'PinBroken' },
    { category: 'Printing NG', code: 'PrintingNG' },
    { category: 'Salah Material', code: 'SalahMaterial' },
    { category: 'Scratch', code: 'Scratch' },
    { category: 'Shinning', code: 'Shinning' },
    { category: 'Short Mold', code: 'ShortMold' },
    { category: 'Silver', code: 'Silver' },
    { category: 'Sink Mark ', code: 'SinkMark' },
    { category: 'Step Naik', code: 'StepNaik' },
    { category: 'Transparan', code: 'Transparan' },
    { category: 'Twist / Melintir', code: 'TwistMelintir' },
    { category: 'Warna Tidak Standard', code: 'WarnaTidakStandard' },
    { category: 'Weld Line', code: 'WeldLine' },
    { category: 'White Mark', code: 'WhiteMark' },
    { category: 'Not Defined', code: 'NotDefined' }
];

const InputDefect = ({ open, onClose, onSuccess, userId, productionId, productionDefects = [] }) => {
    const [loading, setLoading] = useState(false);
    const [defects, setDefects] = useState([{ qty: null, category: null }]);


    const handleQtyChange = (index, value) => {
        const newDefects = [...defects];
        newDefects[index].qty = value;
        newDefects[index].userId = userId;
        newDefects[index].productionId = productionId;

        if (value !== null && value !== '') {
            newDefects[index].userId = userId;
            newDefects[index].productionId = productionId;
        } else {
            delete newDefects[index].userId;
            delete newDefects[index].productionId;
        }
        setDefects(newDefects);
    };

    const handleCategoryChange = (index, value) => {
        const newDefects = [...defects];
        newDefects[index].category = value;
        setDefects(newDefects);
    };

    const addDefectRow = () => {
        setDefects([...defects, { qty: null, category: null }]);
    };

    const handleSubmit = async () => {
        console.log('defects', defects);

        const isValid = defects.every(
            (d) => d.qty !== null && d.qty !== '' && d.category && d.userId
        );

        if (!isValid) {
            notification.warning({
                message: 'Validation Error',
                description: 'Semua data defect (qty, category, user) wajib diisi.',
                placement: 'topRight',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}${prefix}/production/input/defect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ defects }),
            });

            if (!response.ok) {
                throw new Error("Failed to update cavity");
            }

            notification.success({
                message: 'Success',
                description: 'Defect Qty updated successfully.',
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
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Qty',
            dataIndex: 'qty',
            key: 'qty',
            width: 100,
        },
        {
            title: 'Kategori',
            dataIndex: 'defect_category',
            key: 'defect_category',
            render: (code) => {
                const cat = categoriesNG.find(c => c.code === code);
                return cat ? cat.category : code;
            }
        }
    ];

    const deleteDefectRow = (index) => {
        const newDefects = [...defects];
        newDefects.splice(index, 1);
        setDefects(newDefects.length > 0 ? newDefects : [{ qty: null, category: null }]);
    };


    return (
        <Modal
            title="Defect Qty"
            maskClosable={false}
            open={open}
            onCancel={onClose}
            width={800}
            closable={false}
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Space>
                        <Button
                            style={{ color: "red", fontSize: "18px", fontWeight: "600", padding: "5px 10px" }}
                            onClick={onClose}
                            icon={<StopOutlined style={{ fontSize: "18px", color: "red" }} />}
                        >
                            CANCEL
                        </Button>
                        <Button
                            style={{ color: "#52c41a", fontSize: "18px", fontWeight: "600", padding: "5px 10px" }}
                            onClick={handleSubmit}
                            icon={<CheckOutlined style={{ fontSize: "24px", color: "#52c41a" }} />}
                            loading={loading}
                        >
                            OK
                        </Button>
                    </Space>
                </div>
            }
        >
            <Divider />
            {defects.map((defect, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 12 }}>
                    <Col span={7}>
                        <InputNumber
                            min={1}
                            max={20}
                            placeholder="Qty"
                            value={defect.qty}
                            onChange={(value) => handleQtyChange(index, value)}
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col span={15}>
                        <Select
                            showSearch
                            placeholder="Pilih kategori"
                            value={defect.category}
                            onChange={(value) => handleCategoryChange(index, value)}
                            style={{ width: "100%" }}
                            disabled={loading}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {categoriesNG.map(({ category, code }) => (
                                <Option key={code} value={code}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={2}>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteDefectRow(index)}
                            disabled={defects.length === 1}
                        >
                        </Button>
                    </Col>
                </Row>
            ))}
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addDefectRow}
                block
                style={{ marginTop: 12 }}
            >
            </Button>

            <Divider orientation="left">Defect yang sudah diinput</Divider>
            <Table
                columns={columns}
                dataSource={(Array.isArray(productionDefects) ? productionDefects : []).map((item, idx) => ({
                    ...item,
                    key: idx
                }))}
                pagination={false}
                size="small"
                bordered
            />
        </Modal>
    );
};

InputDefect.propTypes = {
    moldId: PropTypes.number.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    userId: PropTypes.number.isRequired,
    productionId: PropTypes.number.isRequired,
    productionDefects: PropTypes.arrayOf(
        PropTypes.shape({
            defect_category: PropTypes.string,
            qty: PropTypes.number,
        })
    ),
};

export default InputDefect;
