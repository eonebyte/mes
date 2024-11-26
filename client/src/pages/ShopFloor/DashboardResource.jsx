import { Row, Col, Card, Space, Flex, Divider } from "antd";
import LayoutDashboard from '../../components/layouts/LayoutDashboard';

import RemainingProgress from "../../components/ShopFloors/Plan/RemainingProgress";
import StatusButton from "../../components/Buttons/StatusButton";
import { resources } from "../../data/fetchResource";
import { Link } from "react-router-dom";


class Plan {
    constructor(plan_id, product_id, product_name, resource_id, plan_qty, progress) {
        this.plan_id = plan_id;
        this.product_id = product_id;
        this.product_name = product_name;
        this.resource_id = resource_id;
        this.plan_qty = plan_qty;
        this.progress = progress;
    }

    calculateProgressPercentage() {
        return (this.progress / this.plan_qty) * 100;
    }
}

export default function DashboardResource() {


    // const isDarkMode = useSelector(state => state.theme.isDarkMode);

    const plans = [
        new Plan(1, 101, 'Product X', 1, 1000, 700),
        new Plan(2, 102, 'Product Y', 2, 500, 250),
    ];

    console.log(plans);

    return (
        <>
            <LayoutDashboard>
                <Row gutter={[8, 8]} style={{ maxWidth: '100%', marginTop: 5, marginBottom: 0 }}>
                    <StatusButton />
                </Row>
                <Divider style={{ margin: '5px 0px' }} />
                {/* Grid Machine */}
                <Row gutter={[8, 8]}>
                    {resources.map((machine) => (
                        <Col key={machine.resource_id} xs={12} sm={8} md={6} lg={4}>
                            <Link to={{ pathname: '/resource', state: { resourceId: machine.uuid, module: 'active' } }} style={{ textDecoration: 'none' }}>
                                <Card
                                    size="small"
                                    style={{
                                        width: '100%',
                                        height: 250,
                                        border: 0,
                                        borderRadius: 3,
                                        backgroundColor: machine.status === 'Running'
                                            ? '#52c41a'
                                            : machine.status === 'Down'
                                                ? '#f5222d'
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
                                                <p style={{ fontWeight: 'bold', margin: 0 }}>{machine.name}</p>
                                                <p style={{ marginBottom: 0, margin: 0 }}>{machine.line}</p> {/* Hilangkan <br /> agar lebih rapi */}
                                            </Space>
                                            <RemainingProgress
                                                target={machine.plan_qty}
                                                progress={machine.progress}
                                            />
                                        </Flex>
                                        <div style={{ textAlign: 'center' }}>
                                            <img src={machine.image} alt={machine.name} style={{ maxWidth: '100%' }} />
                                        </div>
                                        <Flex align="flex-end" justify="space-between">
                                            <Space style={{ flexDirection: 'column', display: 'inline', lineHeight: '1.2', alignItems: 'flex-start' }}>
                                                <p style={{ fontWeight: 'bold', margin: 0 }}>{machine.status}</p>
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
                {/* End Grid Machine */}
            </LayoutDashboard>
        </>
    );
}
