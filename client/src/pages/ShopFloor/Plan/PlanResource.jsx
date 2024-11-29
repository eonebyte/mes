import { Alert, Card, Col, Empty, Flex, Row, Spin } from "antd";
import DetailResource from "../DetailResource";
import { useSelector } from "react-redux";
import RemainingPlan from "../../../components/ShopFloors/Plan/RemainingPlan";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { plans } from "../../../data/fetchResource";

function PlanResource() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);


    const [loading, setLoading] = useState(true);
    const [allPlans, setPlans] = useState([]);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');


    useEffect(() => {
        setTimeout(() => {
            const plansData = plans.filter((plan) => plan.resourceId === Number(resourceId));
            if (plansData.length > 0) {
                setPlans(plansData);
            } else {
                setPlans([]);
            }
            setLoading(false);
        }, 500);
    }, [resourceId]);

    function getBackgroundColor(status, isDarkMode) {
        if (status === 'On Hold') {
            return isDarkMode ? '#333' : '#fff7e6'; // On Hold: terang jika mode terang, gelap jika mode gelap
        } else if (status === 'Released') {
            return isDarkMode ? '#555' : '#f0f0f0'; // Released: lebih gelap jika mode gelap
        } else if (status === 'Ready') {
            return isDarkMode ? '#457b9d' : '#bae0ff'; // Ready: biru muda terang jika mode terang
        }
        return '#ffffff'; // default background color
    }

    function getTextColor(isDarkMode) {
        return isDarkMode ? '#ffffff' : '#000000'; // Teks putih jika mode gelap, hitam jika terang
    }

    return (
        <DetailResource>
            {loading ?
                <Col
                    style={{
                        marginTop: 10,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                    lg={24}
                >
                    <Spin tip="Loading...">
                        <Alert
                            style={{ width: '200px', height: '60px' }}
                            type="info"
                        />
                    </Spin>
                </Col>
                : allPlans.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No plans available" />
                )
                    :
                    <div style={{
                        maxHeight: '530px', overflowY: 'auto', padding: '0px 5px', paddingTop: 5, scrollbarWidth: 'thin',
                        border: '2px solid #6666', backgroundColor: 'white', borderRadius: '3px'
                    }}>
                        <Card
                            style={{
                                border: 0,
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
                            <p style={{ margin: 0, fontSize: '14px' }}>
                                Display Qty {allPlans.length}
                            </p>
                        </Card>




                        {/* Plan List */}
                        {allPlans && allPlans.map((plan) => (

                            <Card
                                key={plan.id}
                                title={
                                    <div onClick={() => navigate(`/resource/plan/detail?planId=${plan.id}`, { state: { resourceId: plan.resourceId } })} style={{ cursor: 'pointer' }}>
                                        <Flex align="center" justify="space-between">
                                            <div>
                                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                                    {plan.planNo}
                                                </p>
                                                <small>plan to start at {new Date(plan.startDate).toLocaleString()}</small>

                                            </div>
                                            <div>
                                                <span style={{ fontSize: '18px', fontWeight: '500', color: isDarkMode ? '#e6f7ff' : '#1677FF' }}>{plan.status}</span>
                                            </div>
                                        </Flex>
                                    </div>
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
                                        backgroundColor: getBackgroundColor(plan.status, isDarkMode),
                                        padding: '5px 15px',
                                        borderRadius: 3,
                                        lineHeight: 1
                                    },
                                    body: {
                                        padding: '5px 15px',
                                        borderRadius: 3,
                                        color: getTextColor(isDarkMode),
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
                                                {allPlans ? (
                                                    <RemainingPlan target={plan.planQty} progress={plan.progress} />
                                                ) : (
                                                    <p>No resource found</p>
                                                )}
                                                <small>Remaining</small>
                                                <strong>864+16:30</strong>
                                            </div>
                                        </Flex>
                                    </Col>
                                </Row>
                            </Card>
                        ))}


                    </div>
            }
        </DetailResource >
    );
}

export default PlanResource;