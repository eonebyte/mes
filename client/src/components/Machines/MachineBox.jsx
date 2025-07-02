import { Card, Col, Flex, Row, Space } from 'antd';
import { Link } from 'react-router-dom';
import RemainingPlan from '../ShopFloors/Plan/RemainingPlan';
import RemainingTime from '../ShopFloors/RemainingTime';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

// const downtimeCategories = [
//     { category: "RUNNING", code: "RR", color: "#52c41a", label: "RUNNING", textColor: "#000000" },           // abu, teks putih
//     { category: "IDLE", code: "R", color: "#8c8c8c", label: "IDLE", textColor: "#ffffff" },           // abu, teks putih
//     { category: "OFF", code: "R0", color: "#000", label: "OFF", textColor: "#fff" },        // putih, teks hitam
//     { category: "DANDORI & PREPARE", code: "R1", color: "#fadb14", label: "DANDORI & PREPARE", textColor: "#000000" }, // kuning, teks hitam
//     { category: "BACKUP MESIN LAIN", code: "R2", color: "#cf1322", label: "BACKUP MESIN LAIN", textColor: "#ffffff" }, // abu terang
//     { category: "TROUBLE MESIN", code: "R3", color: "#f5222d", label: "TROUBLE MESIN", textColor: "#fff" }, // merah, teks putih
//     { category: "TROUBLE MOLD", code: "R4", color: "#f5222d", label: "TROUBLE MOLD", textColor: "#fff" },
//     { category: "MATERIAL", code: "R5", color: "#fa8c16", label: "MATERIAL", textColor: "#000000" },
//     { category: "NO LOADING", code: "R6", color: "#f5222d", label: "NO LOADING", textColor: "#ffffff" },
//     { category: "PACKING", code: "R7", color: "#91caff", label: "PACKING", textColor: "#000000" }, // biru, teks putih
//     { category: "TROUBLE SHOOTING", code: "R8", color: "#ffbb96", label: "TROUBLE SHOOTING", textColor: "#000000" },
//     { category: "ISTIRAHAT", code: "R9", color: "#eb2f96", label: "ISTIRAHAT", textColor: "#fff" },
//     { category: "WAITING", code: "WAIT", color: "#faad14", label: "WAITING", textColor: "#000000" },

// ];

// const getResourceDisplayInfo = (status) => {
//     const match = downtimeCategories.find(item => item.code === status);
//     return match ? { color: match.color, label: match.label, textColor: match.textColor } : { color: "#fff", label: "" };
// };

const MachineBox = ({ resources }) => {

    const [downtimeCategories, setDowntimeCategories] = useState([]);

    const getResourceDisplayInfo = (status) => {
        const match = downtimeCategories.find(item => item.code === status);
        return match ? { color: match.color, label: match.category, textColor: match.textColor } : { color: "#fff", label: "" };
    };

    const fetchDownCategories = async () => {
        try {
            const res = await fetch(`${backendUrl}${prefix}/event/categories`);

            const response = await res.json();

            if (Array.isArray(response.data)) {
                setDowntimeCategories(response.data);
            } else {
                console.warn("Unexpected data format:", response);
            }

        } catch (error) {
            console.error("Failed to fetch down categories data:", error);
        }
    };

    useEffect(() => {
        fetchDownCategories();
    }, []);


    return (
        <Row gutter={[8, 8]}>
            {resources.map((resource) => {
                const { color, textColor, label } = getResourceDisplayInfo(resource.status);

                const planQty = resource.joborder ? resource.joborder.planqty : 0;
                // const outputQty = resource.productions[0] ? resource.productions[0].productionqty : 0;
                const outputQty = 300;
                const toGoQty = planQty - outputQty;
                const CT = resource.joborder ? resource.joborder.cycletime : 0;


                return (
                    <Col key={resource.id} xs={12} sm={8} md={6} lg={4}>
                        <Link to={`/resource?resourceId=${resource.id}`} style={{ textDecoration: 'none' }}>
                            <Card
                                size="small"
                                style={{
                                    width: '100%',
                                    height: 250,
                                    border: 0,
                                    borderRadius: 3,
                                    color: textColor,
                                    backgroundColor: color,
                                }}
                                styles={{
                                    body: {
                                        padding: '5px 5px',
                                    },
                                }}
                            >
                                <Flex gap="40px" vertical>
                                    {/* CARD HEADER */}
                                    <Flex align="flex-start" justify="space-between">
                                        <Space
                                            style={{
                                                flexDirection: 'column',
                                                display: 'inline',
                                                lineHeight: '1.2',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.line} - {resource.lineno}</p>
                                            <p style={{ margin: 0 }}>{resource.code}</p>
                                        </Space>
                                        <RemainingPlan status={resource.status} planQty={planQty} outputQty={outputQty} />
                                    </Flex>

                                    {/* IMAGE */}
                                    <div style={{ textAlign: 'center' }}>
                                        <img src={resource.image} alt={resource.code} style={{ maxWidth: '100%' }} />
                                    </div>

                                    {/* CARD FOOTER */}
                                    <Flex align="flex-end" justify="space-between">
                                        <Space
                                            style={{
                                                flexDirection: 'column',
                                                display: 'inline',
                                                lineHeight: '1.2',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                                        </Space>
                                        <Space
                                            style={{
                                                flexDirection: 'column',
                                                display: 'inline',
                                                lineHeight: '1.2',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <p style={{ margin: 0 }}>
                                                <RemainingTime toGoQty={toGoQty} CT={CT} />
                                            </p>
                                        </Space>
                                    </Flex>
                                </Flex>
                            </Card>
                        </Link>
                    </Col>
                );
            })}
        </Row>
    );
};

MachineBox.propTypes = {
    resources: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            status: PropTypes.string.isRequired,
            line: PropTypes.string,
            code: PropTypes.string,
            image: PropTypes.string,
        })
    ).isRequired,
};


export default memo(MachineBox, (prevProps, nextProps) => {
    // Custom comparison supaya rerender hanya jika resources berubah
    return JSON.stringify(prevProps.resources) === JSON.stringify(nextProps.resources);
});
