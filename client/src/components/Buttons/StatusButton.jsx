import { Button, Col, Modal } from 'antd';
import { useState } from 'react';

const buttons = [
    { label: "Idle", content: "Idle", color: "#A9A9A9", textColor: "#000000", badgeCount: 20 }, // dark grey
    { label: "Running", content: "Running", color: "#52c41a", badgeCount: 15 },
    { label: "Breakdown", content: "Breakdown", color: "#FF0000", badgeCount: 8 },
    { label: "Setup", content: "Setup", color: "#0000FF", badgeCount: 5 },
    { label: "FAI", content: "FAI", color: "#8B0000", badgeCount: 12 },
    { label: "Timeout", content: "Timeout", color: "#FFD700", textColor: "#000000", badgeCount: 9 },
    { label: "Suspend", content: "Suspend", color: "#FFC0CB", textColor: "#000000", badgeCount: 3 }, // pink tua
    { label: "Maintenance", content: "Maintenance", color: "#adc6ff", textColor: "#000000", badgeCount: 6 }, // aqua tua
    { label: "Testing", content: "Testing", color: "#FFA500", badgeCount: 10 },
    { label: "Unknown", content: "Unknown", color: "#b37feb", badgeCount: 7 },
    { label: "Total M/C 15", content: "Total M/C 15", color: "#ffffff", textColor: "#000000", badgeCount: 15 }, // silver light
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
                            display: 'flex',
                            padding: 5,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span><strong>{button.label}</strong></span>
                        <span
                            style={{
                                backgroundColor: button.color === '#ffffff' ? '#333' : '#fff',
                                color: button.color === '#ffffff' ? '#fff' : '#000',
                                borderRadius: '50%',
                                width: '22px', // Sama dengan tinggi
                                height: '22px', // Sama dengan lebar
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                        >
                            {button.badgeCount}
                        </span>
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
