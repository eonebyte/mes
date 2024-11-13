import { Button, Col, Modal } from 'antd';
import { useState } from 'react';

const buttons = [
    { label: "Idle", content: "Idle", color: "#A9A9A9", textColor: "#000000" }, // dark grey
    { label: "Running", content: "Running", color: "#52c41a" },
    { label: "Breakdown", content: "Breakdown", color: "#FF0000" },
    { label: "Setup", content: "Setup", color: "#0000FF" },
    { label: "FAI", content: "FAI", color: "#8B0000" },
    { label: "Timeout", content: "Timeout", color: "#FFD700", textColor: "#000000" },
    { label: "Suspend", content: "Suspend", color: "#FFC0CB", textColor: "#000000" }, // pink Tua
    { label: "Maintenance", content: "Maintenance", color: "#adc6ff", textColor: "#000000" }, // Aqua Tua
    { label: "Testing", content: "Testing", color: "#FFA500" },
    { label: "Unknown", content: "Unknown", color: "#b37feb" },
    { label: "Total M/C 15", content: "Total M/C 15", color: "#ffffff", textColor: "#000000" } // silver light
];
const StatusButton = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");




    const showModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            {buttons.map((button, index) => (
                <Col key={index} flex="auto">
                    <Button
                        type="primary"
                        onClick={() => showModal(button.content)}
                        style={{
                            backgroundColor: button.color,
                            borderColor: button.color,
                            color: button.textColor,
                            width: '100%',
                            margin: '4px',
                        }}
                    >
                        {button.label}
                    </Button>
                </Col>

            ))}

            <Modal title={`${modalContent} Modal`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>Some contents for {modalContent}...</p>
                <p>Some contents for {modalContent}...</p>
                <p>Some contents for {modalContent}...</p>
            </Modal>
        </>
    );
};


export default StatusButton;
