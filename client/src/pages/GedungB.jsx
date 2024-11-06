import { Breadcrumb, theme, Row, Col, Button, Flex } from "antd";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import MachineDashboard from "../components/Machines/MachineDashboardGedungB";
import { FullscreenOutlined } from "@ant-design/icons";
import StatisticDrawer from "../components/Statistics/StatisticDrawer";
import LayoutAdmin from '../components/layouts/LayoutAdmin';

export default function GedungB() {
    const handle = useFullScreenHandle();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <>
            <LayoutAdmin>
                <Row align="middle">
                    <Col span={12}>
                        <Breadcrumb
                            style={{
                                margin: "5px 0",
                            }}
                        >
                            <Breadcrumb.Item>API</Breadcrumb.Item>
                            <Breadcrumb.Item>Gedung B
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col span={12}>
                        <Flex align="center" justify="flex-end">
                            <Button size="small" onClick={handle.enter}>
                                <FullscreenOutlined />
                            </Button>
                            <StatisticDrawer />
                        </Flex>
                    </Col>
                </Row>
                <div
                    style={{
                        padding: 5,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <FullScreen handle={handle}>
                        <MachineDashboard />
                    </FullScreen>
                </div>
            </LayoutAdmin>
        </>
    );
}
