import { Button, Col, Modal, Tooltip, Row } from 'antd';
import { useEffect, useState, memo } from 'react';
import socket from '../../libs/socket-io/socket';
import PropTypes from 'prop-types';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

// const buttons = [
//     { label: "Idle", color: "#8c8c8c", textColor: "#ffffff" },
//     { label: "Running", color: "#52c41a", textColor: "#ffffff" },
//     { label: "Stop", color: "#000", textColor: "#fff" },
//     { label: "Dandori", color: "#fadb14", textColor: "#000000" },
//     { label: "Backup", color: "#cf1322", textColor: "#ffffff" },
//     { label: "Trouble", color: "#f5222d", textColor: "#ffffff" },
//     { label: "Material", color: "#fa8c16", textColor: "#000000" },
//     { label: "Maitenance", color: "#f5222d", textColor: "#fff" },
//     { label: "Packing", color: "#91caff", textColor: "#000000" },
//     { label: "Break", color: "#eb2f96", textColor: "#ffffff" },
//     { label: "Waiting", color: "#faad14", textColor: "#000000" },
// ];

const StatusSingleButton = memo(({ button, count, onClick }) => {
    return (
        <Tooltip title={button.category}>
            <Button
                type="primary"
                onClick={() => onClick(button.category)}
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
                <span><strong>{button.category}</strong></span>
                <span
                    style={{
                        backgroundColor: button.color === '#ffffff' ? '#333' : '#fff',
                        color: button.color === '#ffffff' ? '#fff' : '#000',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}
                >
                    {count}
                </span>
            </Button>
        </Tooltip>
    );
}, (prevProps, nextProps) => {
    // Custom comparison supaya rerender hanya jika count berubah
    return prevProps.count === nextProps.count;
});

StatusSingleButton.propTypes = {
    button: PropTypes.shape({
        category: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        textColor: PropTypes.string.isRequired,
    }).isRequired,
    count: PropTypes.number,
    onClick: PropTypes.func.isRequired,
};


StatusSingleButton.displayName = "StatusSingleButton";



const StatusButton = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");

    const [buttons, setButtons] = useState([]);

    const [counts, setCounts] = useState({});



    const fetchCountEvents = async () => {
        try {
            const res = await fetch(`${backendUrl}${prefix}/resource/count/events`);
            const data = await res.json();
            setCounts(data);

        } catch (error) {
            console.error("Failed to fetch count events data:", error);
        }
    };

    const fetchDownCategories = async () => {
        try {
            const res = await fetch(`${backendUrl}${prefix}/event/categories`);

            const response = await res.json();


            if (Array.isArray(response.data)) {
                setButtons(response.data);
            } else {
                console.warn("Unexpected data format:", response);
            }

        } catch (error) {
            console.error("Failed to fetch down categories data:", error);
        }
    };


    // Fetch data dari backend
    useEffect(() => {
        fetchDownCategories();
        fetchCountEvents();
    }, []);

    useEffect(() => {
        const onConnect = () => {
            console.log('Connected:', socket.id);
        };
        const onDisconnect = () => {
            console.log('Disconnected:', socket.id);
        };

        const onRefreshFetchData = (data = {}) => {
            if (!data.status) return;
            fetchDownCategories();
            fetchCountEvents();
        };



        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on('refreshFetchData', onRefreshFetchData);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off('refreshFetchData', onRefreshFetchData);
        };
    }, []);


    const showModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);

    const getCount = (key) => counts[key] || 0;
    const totalCount = Object.values(counts).reduce((acc, val) => acc + (val || 0), 0);

    return (
        <>
            <Row gutter={[8, 8]} wrap>
                {buttons.map((button) => (
                    <Col key={button.code} flex="auto">
                        <StatusSingleButton
                            button={button}
                            count={getCount(button.code)}
                            onClick={showModal}
                        />
                    </Col>
                ))}
                <Col key="TOTAL" flex="auto">
                    <StatusSingleButton
                        button={{
                            category: `TOTAL`,
                            color: "#d9d9d9",
                            textColor: "#000000",
                        }}
                        count={totalCount}
                        onClick={showModal}
                    />
                </Col>

            </Row>

            <Modal
                title={`${modalContent} Modal`}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>Some contents for {modalContent}...</p>
            </Modal>
        </>
    );
};

export default StatusButton;
