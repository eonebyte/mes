import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Select, Space } from "antd";
import PropTypes from 'prop-types';

const ConfirmMaterial = ({ visible, onClose, planId, boms, selectedBom, setSelectedBom, onSuccess, user }) => {

    const handleConfirm = async () => {
        if (!selectedBom) {
            notification.warning({
                message: 'Validation',
                description: 'Please select a BOM before confirming.',
            });
            return;
        }

        await fetch(`http://localhost:3080/api/plans/boms/${planId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId,
                bomId: selectedBom,
                userId: user.id
            }),
        })
            .then(() => {
                notification.success({
                    message: 'Status Updated Material',
                    description: 'Plan Bom Material',
                });
                onSuccess?.();
                onClose(); // Close modal
            })
            .catch(error => {
                notification.error({
                    message: 'Error',
                    description: 'Failed to update plan status.',
                });
                console.error('Error:', error);
            });
    };

    return (
        <Modal
            title="Change Material"
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Divider />
            <Select
                style={{ width: '100%' }}
                placeholder="Select BOM"
                value={selectedBom}
                onChange={setSelectedBom}
                options={boms.map(bom => ({
                    label: bom.name || bom.bomName || `BOM-${bom.id}`,
                    value: bom.pp_product_bom_id,
                }))}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button
                        color="default"
                        variant="text"
                        onClick={onClose}
                        icon={<StopOutlined />}
                        style={{
                            color: 'red',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                    >
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
                        onClick={handleConfirm}
                        icon={<CheckOutlined />}
                    >
                        OK
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

ConfirmMaterial.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    planId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    boms: PropTypes.arrayOf(PropTypes.shape({
        pp_product_bom_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        bomName: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })).isRequired,
    selectedBom: PropTypes.number,
    setSelectedBom: PropTypes.func,
    onSuccess: PropTypes.func,
    user: PropTypes.number
};


export default ConfirmMaterial;
