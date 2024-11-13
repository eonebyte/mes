/* eslint-disable react/prop-types */
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Modal, Divider } from "antd";
export default function MachineModal({
  machine,
  isModalOpen,
  handleOk,
  handleCancel,
}) {
  return (
    <div>
      <Modal
        title={`Detail Machine ${machine.machine_id}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Divider />

        <p style={{ fontSize: '16px' }}> <strong>Name:</strong> {machine.machine_name}</p>
        <p style={{ fontSize: '16px' }}><strong>No:</strong> {machine.machine_no}</p>
        <p style={{ fontSize: '16px' }}>
          <strong>Machine Status:</strong> &nbsp;
          {machine.status.green && <CheckCircleOutlined style={{ color: 'green', fontSize: '24px' }} />}&nbsp;
          {machine.status.yellow && <ExclamationCircleOutlined style={{ color: "#E9D502", fontSize: '24px' }} />}&nbsp;
          {machine.status.red && <CloseCircleOutlined style={{ color: 'red', fontSize: '24px' }} />}
        </p>
        <p style={{ fontSize: '16px' }}><strong>Timestamp:</strong> {machine.timestamp}</p>
      </Modal>
    </div>
  );
}
