import { AlertOutlined, DashboardOutlined, GroupOutlined, HourglassOutlined, PlayCircleOutlined, PoweroffOutlined } from '@ant-design/icons';
import { Col, Flex, Space } from 'antd';

const StatusButtonV1 = () => {
    const iconNotifStyle = (color) => ({ fontSize: '20px', marginLeft: 20, backgroundColor: color, padding: 5, borderRadius: 5 });
    const marginStyleText = { margin: 0, marginLeft: 5 };
    const marginFlex = { maginLeft: 10 };
    return (
        <>
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
        </>
    );
};


export default StatusButtonV1;
