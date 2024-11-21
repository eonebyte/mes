import { Row, Col, Card, Space, Flex } from "antd";
import LayoutDashboard from '../components/layouts/LayoutDashboard';
import { DashboardOutlined, GroupOutlined, PlayCircleOutlined, HourglassOutlined, AlertOutlined, PoweroffOutlined } from "@ant-design/icons";

const iconNotifStyle = (color) => ({ fontSize: '20px', marginLeft: 20, backgroundColor: color, padding: 5, borderRadius: 5 });
const rowIconNotifStyle = { marginTop: 10, marginBottom: 10 };
const marginStyleText = { margin: 0, marginLeft: 5 };
const marginFlex = { maginLeft: 10 };
import PlanProgress from "../components/Plan/PlanProgress";

class Resource {
    constructor(resource_id, name, line, lineno, status, plan_qty, progress) {
        this.resource_id = resource_id;
        this.name = name;
        this.line = line;
        this.lineno = lineno;
        this.status = status;
        this.image = "/src/assets/images/machine.png";
        this.plan_qty = plan_qty;
        this.progress = progress;
    }
}

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

export default function ShopFloor() {


    // const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const resources = [
        new Resource(1, 'MC001', 'Line 1', 101, 'Running', 1000, 350),
        new Resource(2, 'MC002', 'Line 2', 102, 'Running', 500, 50),
        new Resource(3, 'MC003', 'Line 3', 103, 'Running', 300, 100),
        new Resource(4, 'MC004', 'Line 4', 104, 'Fault', 400, 150),
        new Resource(5, 'MC005', 'Line 5', 105, 'Running', 600, 350),
        new Resource(6, 'MC006', 'Line 6', 106, 'Running', 550, 50),
        new Resource(7, 'MC007', 'Line 7', 107, 'Running', 700, 300),
        new Resource(8, 'MC008', 'Line 8', 108, 'Running', 450, 200),
        new Resource(9, 'MC009', 'Line 9', 109, 'Running', 800, 650),
        new Resource(10, 'MC010', 'Line 10', 110, 'Running', 900, 100),
        new Resource(11, 'MC011', 'Line 11', 111, 'Idle', 1000, 700),
        new Resource(12, 'MC012', 'Line 12', 112, 'Fault', 1200, 550),
    ];


    const plans = [
        new Plan(1, 101, 'Product X', 1, 1000, 700),
        new Plan(2, 102, 'Product Y', 2, 500, 250),
    ];

    console.log(plans);

    return (
        <>
            <LayoutDashboard>
                {/* Start Row Dashboard and Button Notifikasi  */}
                <Row style={rowIconNotifStyle} align="middle">
                    <Col span={12} >
                        <Space>
                            <DashboardOutlined style={iconNotifStyle('')} />
                            <p style={{ margin: 0 }}>DASHBOARD</p>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <Flex justify="flex-end">
                            <GroupOutlined style={iconNotifStyle('#0958d9')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>All</p>
                                <p style={marginStyleText}>12</p>
                            </Flex>
                            <PlayCircleOutlined style={iconNotifStyle('#389e0d')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Work</p>
                                <p style={marginStyleText}>12</p>
                            </Flex>
                            <HourglassOutlined style={iconNotifStyle('#faad14')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Idle</p>
                                <p style={marginStyleText}>0</p>
                            </Flex>
                            <AlertOutlined style={iconNotifStyle('#cf1322')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Fault</p>
                                <p style={marginStyleText}>0</p>
                            </Flex>
                            <PoweroffOutlined style={iconNotifStyle('#96C6F2')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Offline</p>
                                <p style={marginStyleText}>0</p>
                            </Flex>
                        </Flex>

                    </Col>
                </Row>
                {/* End Row Dashboard and Button Notifikasi  */}

                {/* Grid Machine */}
                <Row gutter={[16, 16]}>
                    {resources.map((machine) => (
                        <Col key={machine.resource_id} xs={12} sm={8} md={6} lg={4}>
                            <Card
                                size="small"
                                style={{
                                    width: '100%',
                                    height: 250,
                                    border: 0,
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
                                        <PlanProgress
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
                        </Col>
                    ))}
                </Row>
                {/* End Grid Machine */}
            </LayoutDashboard>
        </>
    );
}
