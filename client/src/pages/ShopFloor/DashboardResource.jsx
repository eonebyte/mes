import { Row, Col, Card, Space, Flex, Divider } from "antd";
import LayoutDashboard from '../../components/layouts/LayoutDashboard';

import RemainingPlan from "../../components/ShopFloors/Plan/RemainingPlan";
import StatusButton from "../../components/Buttons/StatusButton";
import { resources } from "../../data/fetchResource";
import { Link } from "react-router-dom";


export default function DashboardResource() {

    return (
        <>
            <LayoutDashboard>
                <Row gutter={[8, 8]} style={{ maxWidth: '100%', marginTop: 5, marginBottom: 0 }}>
                    <StatusButton />
                </Row>
                <Divider style={{ margin: '5px 0px' }} />
                {/* Grid resource */}
                <Row gutter={[8, 8]}>
                    {resources.map((resource) => (
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
                                        backgroundColor: resource.status === 'Running'
                                            ? '#52c41a'
                                            : resource.status === 'Down'
                                                ? '#f5222d'
                                                : resource.status === 'Inspect'
                                                    ? '#a8071a'
                                                    : '#f5222d'
                                    }}
                                    styles={{
                                        body: {
                                            padding: '5px 5px'
                                        }
                                    }}

                                >
                                    <Flex gap="40px" vertical>
                                        <Flex align="flex-start" justify="space-between">
                                            <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.name}</p>
                                                <p style={{ marginBottom: 0, margin: 0 }}>{resource.line}</p> {/* Hilangkan <br /> agar lebih rapi */}
                                            </Space>
                                            <RemainingPlan
                                                status={resource.status}
                                                target={resource.plan_qty}
                                                progress={resource.progress}
                                            />
                                        </Flex>
                                        <div style={{ textAlign: 'center' }}>
                                            <img src={resource.image} alt={resource.name} style={{ maxWidth: '100%' }} />
                                        </div>
                                        <Flex align="flex-end" justify="space-between">
                                            <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.status}</p>
                                            </Space>
                                            <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                <p style={{ margin: 0 }}>14:00:00</p>
                                            </Space>
                                        </Flex>
                                    </Flex>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
                {/* End Grid resource */}
            </LayoutDashboard>
        </>
    );
}
