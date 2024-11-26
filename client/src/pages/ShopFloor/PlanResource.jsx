import { Alert, Card, Col, Divider, Flex, Row, Spin } from "antd";
import DetailResource from "./DetailResource";
import { useSelector } from "react-redux";
import RemainingProgress from "../../components/ShopFloors/Plan/RemainingProgress";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { resources } from "../../data/fetchResource";

function PlanResource() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);

    const resourceId = location.state?.resourceId;

    useEffect(() => {
        setTimeout(() => {
            const resourceData = resources.find((res) => res.uuid === resourceId);
            setResource(resourceData);
            setLoading(false); // Set loading to false once data is fetched
        }, 1500); // Simulate network delay
    }, [resourceId]);

    return (
        <DetailResource>
            {loading ?
                <Col
                    style={{
                        display: 'flex',
                        justifyContent: 'center', // Pusatkan secara horizontal
                        alignItems: 'center', // Pusatkan secara vertikal
                        height: '55vh', // Sesuaikan tinggi agar penuh layar atau area tertentu
                    }}
                    lg={18}
                >
                    <Spin tip="Loading...">
                        <Alert
                            style={{ width: '200px', height: '60px' }}
                            type="info"
                        />
                    </Spin>
                </Col>
                :
                <Col lg={18}>
                    <Card
                        style={{
                            border: 0,
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 3,
                        }}
                        styles={{
                            body: {
                                padding: "5px 10px",
                                borderRadius: 3,
                                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                            }
                        }}
                    >
                        <p style={{ margin: 0, fontSize: '14px' }}>Display Qty 20</p>
                    </Card>

                    {/* Plan 1 */}
                    <Card
                        title={
                            <Flex align="center" justify="space-between">
                                <div>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: isDarkMode ? '#e6f7ff' : 'inherit' }}>
                                        108
                                    </p>
                                    <small>plan to start at 2024-11-25 00:00:00</small>
                                </div>
                                <div>
                                    <span style={{ fontSize: '18px', fontWeight: '500' }}>On Hold</span>
                                </div>
                            </Flex>
                        }
                        style={{
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                            border: 0,
                            marginBottom: 10,
                            borderBottom: '1px solid #9999',
                            borderRadius: 3,
                        }}
                        styles={{
                            header: {
                                backgroundColor: '#fff7e6',
                                padding: '5px 15px',
                                borderRadius: 3,
                                lineHeight: 1
                            },
                            body: {
                                padding: '5px 15px',
                                borderRadius: 3,
                            }
                        }}
                    >
                        {/* Product 1 */}
                        <Row gutter={[16]}>
                            <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div>Order No.</div>
                                <div style={{ marginBottom: 10 }}><strong>O23098943-NHZ</strong></div>
                                <div>Part No.</div>
                                <div style={{ marginBottom: 10 }}><strong>CJA-3400-SHA</strong></div>
                                <div>Part Drawing #</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={4}>
                                <div>Plan Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>10000</strong></div>
                                <div>ToGo Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>9063</strong></div>
                                <div>Part Model </div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={13}>

                                <Flex align="flex-start" justify="space-between">
                                    <div>
                                        <div>Part Desc</div>
                                        <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                        <div>Spec</div>
                                        <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        <div>Mold #</div>
                                        <div style={{ marginBottom: 10 }}><strong>CL000010</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <RemainingProgress target={resource.plan_qty} progress={resource.progress} />
                                        <small>Remaining</small>
                                        <strong>864+16:30</strong>
                                    </div>
                                </Flex>
                            </Col>
                        </Row>
                        <Divider style={{ margin: 5 }} />
                        {/* Product 2 */}
                        <Row gutter={[16]}>
                            <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div>Order No.</div>
                                <div style={{ marginBottom: 10 }}><strong>O23098943-NHZ</strong></div>
                                <div>Part No.</div>
                                <div style={{ marginBottom: 10 }}><strong>CJA-3400-SHA</strong></div>
                                <div>Part Drawing #</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={4}>
                                <div>Plan Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>10000</strong></div>
                                <div>ToGo Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>9063</strong></div>
                                <div>Part Model </div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={13}>

                                <Flex align="flex-start" justify="space-between">
                                    <div>
                                        <div>Part Desc</div>
                                        <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                        <div>Spec</div>
                                        <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        <div>Mold #</div>
                                        <div style={{ marginBottom: 10 }}><strong>CL000010</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <RemainingProgress target={resource.plan_qty} progress={resource.progress} />
                                        <small>Remaining</small>
                                        <strong>864+16:30</strong>
                                    </div>
                                </Flex>
                            </Col>
                        </Row>
                    </Card>

                    {/* Plan 2 */}
                    <Card
                        title={
                            <Flex align="center" justify="space-between">
                                <div>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                        109
                                    </p>
                                    <small>plan to start at 2024-11-25 00:00:00</small>
                                </div>
                                <div>
                                    <span style={{ fontSize: '18px', fontWeight: '500' }}>Released</span>
                                </div>
                            </Flex>
                        }
                        style={{
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                            border: 0,
                            marginBottom: 10,
                            borderBottom: '1px solid #9999',
                            borderRadius: 3,
                        }}
                        styles={{
                            header: {
                                backgroundColor: '#f0f0f0',
                                padding: '5px 15px',
                                borderRadius: 3,
                                lineHeight: 1
                            },
                            body: {
                                padding: '5px 15px',
                                borderRadius: 3,
                            }
                        }}
                    >
                        {/* Product 1 */}
                        <Row gutter={[16]}>
                            <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div>Order No.</div>
                                <div style={{ marginBottom: 10 }}><strong>O23098943-NHZ</strong></div>
                                <div>Part No.</div>
                                <div style={{ marginBottom: 10 }}><strong>CJA-3400-SHA</strong></div>
                                <div>Part Drawing #</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={4}>
                                <div>Plan Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>10000</strong></div>
                                <div>ToGo Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>9063</strong></div>
                                <div>Part Model </div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={13}>

                                <Flex align="flex-start" justify="space-between">
                                    <div>
                                        <div>Part Desc</div>
                                        <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                        <div>Spec</div>
                                        <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        <div>Mold #</div>
                                        <div style={{ marginBottom: 10 }}><strong>CL000010</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <RemainingProgress target={resource.plan_qty} progress={resource.progress} />
                                        <small>Remaining</small>
                                        <strong>864+16:30</strong>
                                    </div>
                                </Flex>
                            </Col>
                        </Row>
                        <Divider style={{ margin: 5 }} />
                        {/* Product 2 */}
                        <Row gutter={[16]}>
                            <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div>Order No.</div>
                                <div style={{ marginBottom: 10 }}><strong>O23098943-NHZ</strong></div>
                                <div>Part No.</div>
                                <div style={{ marginBottom: 10 }}><strong>CJA-3400-SHA</strong></div>
                                <div>Part Drawing #</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={4}>
                                <div>Plan Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>10000</strong></div>
                                <div>ToGo Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>9063</strong></div>
                                <div>Part Model </div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={13}>

                                <Flex align="flex-start" justify="space-between">
                                    <div>
                                        <div>Part Desc</div>
                                        <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                        <div>Spec</div>
                                        <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        <div>Mold #</div>
                                        <div style={{ marginBottom: 10 }}><strong>CL000010</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <RemainingProgress target={resource.plan_qty} progress={resource.progress} />
                                        <small>Remaining</small>
                                        <strong>864+16:30</strong>
                                    </div>
                                </Flex>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            }
        </DetailResource>
    );
}

export default PlanResource;