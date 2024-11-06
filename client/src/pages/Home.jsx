/* eslint-disable react-hooks/rules-of-hooks */
import "../App.css";
import { Breadcrumb, Button, Flex, theme, Col, Row } from "antd";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import MachineDashboardGedungA from "../components/Machines/MachineDashboardGedungA";
import { FullscreenOutlined } from "@ant-design/icons";
import StatisticDrawer from "../components/Statistics/StatisticDrawer";
import LayoutAdmin from '../components/layouts/LayoutAdmin';

function Home() {
    const handle = useFullScreenHandle();

    const {
        // token: { colorBgContainer, borderRadiusLG },
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <>
            <LayoutAdmin>
                <Row align="middle">
                    <Col span={12}>
                        {/* <button onClick={sendMessage}>Send message</button> */}
                        <Breadcrumb
                            style={{
                                margin: "5px 0",
                            }}
                        >
                            <Breadcrumb.Item>API</Breadcrumb.Item>
                            <Breadcrumb.Item>Gedung A
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
                        // borderRadius: borderRadiusLG,
                    }}
                >
                    <FullScreen handle={handle}>
                        <MachineDashboardGedungA />
                    </FullScreen>
                </div>
            </LayoutAdmin>
        </>
    );
}

export default Home;
