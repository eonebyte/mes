import { Row, Col, Card, Space, Flex, Divider, Spin } from "antd";
import LayoutDashboard from '../../components/layouts/LayoutDashboard';

import RemainingPlan from "../../components/ShopFloors/Plan/RemainingPlan";
import StatusButton from "../../components/Buttons/StatusButton";
// import { plans, resources } from "../../data/fetchResource";
import { Link } from "react-router-dom";
import RemainingTime from "../../components/ShopFloors/RemainingTime";
import { useEffect, useState } from "react";
import { fetchResources } from "../../data/fetchs";
import { useDispatch } from "react-redux";
import { setResourcesStore } from "../../states/reducers/resourceSlice";

const getCardBackgroundColor = (status) => {
    switch (status) {
        case 'RUNNING':
            return '#52c41a';
        case 'SM':
            return '#f5222d';
        case 'TM':
            return '#f5222d';
        case 'STG':
            return '#1677ff';
        case 'STANDBY':
            return '#fff';
        default:
            return '#f5222d'; // Default color if none match
    }
};

export default function DashboardResource() {
    const dispatch = useDispatch();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resourcesData] = await Promise.all([
                    fetchResources(),
                ]);
                dispatch(setResourcesStore(resourcesData)); // Dispatch setResources
                setResources(resourcesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch]);

    if (loading) {
        // Display a loading spinner while fetching data
        return (
            <LayoutDashboard>
                <Row justify="center" align="middle" style={{ height: '100vh' }}>
                    <Spin size="large" />
                </Row>
            </LayoutDashboard>
        );
    }

    return (
        <>
            <LayoutDashboard>
                <Row gutter={[8, 8]} style={{ maxWidth: '100%', marginTop: 5, marginBottom: 0 }}>
                    <StatusButton />
                </Row>
                <Divider style={{ margin: '5px 0px' }} />
                {/* Grid resource */}
                <Row gutter={[8, 8]}>
                    {resources.map((resource) => {
                        const bgColor = getCardBackgroundColor(resource.status);
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
                                            color: resource.status === 'Inspect'
                                                ? 'white'
                                                : 'black',
                                            backgroundColor: bgColor,
                                        }}
                                        styles={{
                                            body: {
                                                padding: '5px 5px'
                                            }
                                        }}

                                    >
                                        <Flex gap="40px" vertical>
                                            {/* CARD HEADER */}
                                            <Flex align="flex-start" justify="space-between">
                                                <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                    <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.line}</p>
                                                    <p style={{ marginBottom: 0, margin: 0 }}>{resource.code}</p> {/* Hilangkan <br /> agar lebih rapi */}
                                                </Space>
                                                <RemainingPlan
                                                    status={resource.status}
                                                    planQty={100}
                                                    outputQty={50} />
                                            </Flex>
                                            <div style={{ textAlign: 'center' }}>
                                                <img src={resource.image} alt={resource.code} style={{ maxWidth: '100%' }} />
                                            </div>
                                            {/* CARD FOOTER */}
                                            <Flex align="flex-end" justify="space-between">
                                                <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                    <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.status}</p>
                                                </Space>
                                                <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                    <p style={{ margin: 0 }}><RemainingTime toGoQty={50} CT={60} /></p>
                                                </Space>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                </Link>
                            </Col>
                        )
                    }
                    )}
                </Row>
                {/* End Grid resource */}
            </LayoutDashboard>
        </>
    );
}