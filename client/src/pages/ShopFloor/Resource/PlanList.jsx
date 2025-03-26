import { Alert, Card, Col, Empty, Flex, Row, Spin } from "antd";
import ResourceLayout from "./ResourceLayout";
import { useSelector } from "react-redux";
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import { plans } from "../../../data/fetchResource";
import { fetchPlanByResource } from "../../../data/fetchs";

function PlanResource() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);


    const [loading, setLoading] = useState(true);
    const [singlePlans, setSinglePlans] = useState([]);
    const [multiplePlans, setMultiplePlans] = useState([]);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchPlanByResource(resourceId); // Pastikan mengambil `data`
                if (data && Array.isArray(data.singleTaskPlans) && Array.isArray(data.multipleTaskPlans)) {
                    setSinglePlans(data.singleTaskPlans);
                    setMultiplePlans(data.multipleTaskPlans);
                } else {
                    console.error("Fetched data is not in expected format", data);
                    setSinglePlans([]);
                    setMultiplePlans([]);
                }
            } catch (error) {
                setSinglePlans([]);  // In case of error, set an empty array
                setMultiplePlans([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resourceId]);

    console.log('this single Plans :', singlePlans);
    console.log('this multiple Plans :', multiplePlans);


    function getBackgroundColor(status, isDarkMode) {
        if (status === 'SP' || status === 'PP') {
            return isDarkMode ? '#333' : '#fff7e6'; // On Hold: terang jika mode terang, gelap jika mode gelap
        } else if (status === 'DR') {
            return isDarkMode ? '#555' : '#f0f0f0'; // Released: lebih gelap jika mode gelap
        } else if (status === 'OP') {
            return isDarkMode ? '#457b9d' : '#bae0ff'; // Ready: biru muda terang jika mode terang
        } else if (status === 'Running') {
            return isDarkMode ? '#457b9d' : '#d9f7be'; // Ready: biru muda terang jika mode terang
        }
        return '#ffffff'; // default background color
    }

    function getTextColor(isDarkMode) {
        return isDarkMode ? '#ffffff' : '#000000'; // Teks putih jika mode gelap, hitam jika terang
    }

    return (
        <ResourceLayout>
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
                : singlePlans.length === 0 && multiplePlans.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No plans available" />
                )
                    :
                    <div style={{
                        // maxHeight: '530px', overflowY: 'auto', padding: '0px 5px', paddingTop: 5, scrollbarWidth: 'thin',
                        // border: '2px solid #6666', backgroundColor: 'white', borderRadius: '3px'
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
                                Display Qty {singlePlans?.length + multiplePlans?.length || 0}
                            </p>
                        </Card>

                        {/* Single Plan Task */}
                        {singlePlans && singlePlans.filter(plan => plan.status !== 'RU').map((plan) => (

                            <Card
                                key={plan.planId}
                                title={
                                    <div
                                        onClick={() => navigate(`/resource/plan/detail?planId=${plan.planId}`,
                                            { state: { resourceId: plan.resourceId } })}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Flex align="center" justify="space-between">
                                            <div>
                                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                                    {plan.planNo}
                                                </p>
                                                <small>start at {plan.planStartTime}</small>

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
                                        <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        <div>Part No/Part Name</div>
                                        <div style={{ marginBottom: 10 }}><strong>{plan.partNo}/{plan.partName}</strong></div>
                                        <div>Part Drawing #</div>
                                        <div style={{ marginBottom: 10 }}><strong>{plan.part_drawing ? plan.part_drawing : '-'}</strong></div>
                                    </Col>
                                    <Col lg={4}>
                                        <div>Plan Qty</div>
                                        <div style={{ marginBottom: 10 }}><strong>{plan.qty}</strong></div>
                                        <div>ToGo Qty</div>
                                        <div style={{ marginBottom: 10 }}><strong>100 example</strong></div>
                                        <div>Part Model </div>
                                        <div style={{ marginBottom: 10 }}><strong>{plan.part_model ? plan.part_model : '-'}</strong></div>
                                    </Col>
                                    <Col lg={13}>

                                        <Flex align="flex-start" justify="space-between">
                                            <div>
                                                <div>Part Desc</div>
                                                <div style={{ marginBottom: 10 }}><strong>{plan.part_desc ? plan.part_desc : '-'}</strong></div>
                                                <div>Spec</div>
                                                <div style={{ marginBottom: 10 }}><strong>{plan.spec ? plan.spec : '-'}</strong></div>
                                                <div>Mold #</div>
                                                <div style={{ marginBottom: 10 }}><strong>{plan.mold ? plan.mold : '-'}</strong></div>
                                            </div>
                                            {singlePlans ? (
                                                <RemainingPlanDetail planQty={plan.qty} toGoQty={100} outputQty={100} CT={plan.cycletime} />
                                            ) : (
                                                <p>No resource found</p>
                                            )
                                            }
                                        </Flex>
                                    </Col>
                                </Row>
                            </Card>
                        ))}

                        {/* Multiple Plan Task */}
                        {multiplePlans && multiplePlans.length > 0 &&
                            multiplePlans.map((group, index) => (
                                <Card
                                    key="multiple-task"
                                    title={
                                        <div
                                            onClick={() => navigate(`/resource/plan/detail?moldId=${group.moldId}`,)}
                                            style={{ cursor: 'pointer' }}>
                                            <Flex align="center" justify="space-between">
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Family molds : {group.mold_name}</p>
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
                                            backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
                                            padding: '5px 15px',
                                            borderRadius: 3,
                                            lineHeight: 1,
                                        },
                                        body: {
                                            padding: '5px 15px',
                                            borderRadius: 3,
                                            color: getTextColor(isDarkMode),
                                        }
                                    }}
                                >
                                    <Row gutter={[16]}>
                                        {group.data.map((plan, i) => (
                                            <Col span={24} key={`${plan.planId}-${i}`} style={{ borderBottom: index !== multiplePlans.length - 1 ? '1px solid #ddd' : 'none', paddingBottom: 10, marginBottom: 10 }}>
                                                <Flex align="center" justify="space-between" style={{ backgroundColor: getBackgroundColor(plan.status, isDarkMode), paddingLeft: '5px', paddingRight: '5px' }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                                            {plan.planNo}
                                                        </p>
                                                        <small><strong>start at {plan.planStartTime}</strong></small>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '18px', fontWeight: '500', color: isDarkMode ? '#e6f7ff' : '#1677FF' }}>{plan.status}</span>
                                                    </div>
                                                </Flex>

                                                <Row gutter={[16]} style={{ marginTop: 10 }}>
                                                    <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        <div>Order No.</div>
                                                        <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                        <div>Part No/Part Name</div>
                                                        <div style={{ marginBottom: 10 }}><strong>{plan.partNo}/{plan.partName}</strong></div>
                                                        <div>Part Drawing #</div>
                                                        <div style={{ marginBottom: 10 }}><strong>{plan.part_drawing ? plan.part_drawing : '-'}</strong></div>
                                                    </Col>
                                                    <Col lg={4}>
                                                        <div>Plan Qty</div>
                                                        <div style={{ marginBottom: 10 }}><strong>{plan.qty}</strong></div>
                                                        <div>ToGo Qty</div>
                                                        <div style={{ marginBottom: 10 }}><strong>100 example</strong></div>
                                                        <div>Part Model</div>
                                                        <div style={{ marginBottom: 10 }}><strong>{plan.part_model ? plan.part_model : '-'}</strong></div>
                                                    </Col>
                                                    <Col lg={13}>
                                                        <Flex align="flex-start" justify="space-between">
                                                            <div>
                                                                <div>Part Desc</div>
                                                                <div style={{ marginBottom: 10 }}><strong>{plan.part_desc ? plan.part_desc : '-'}</strong></div>
                                                                <div>Spec</div>
                                                                <div style={{ marginBottom: 10 }}><strong>{plan.spec ? plan.spec : '-'}</strong></div>
                                                                <div>Mold #</div>
                                                                <div style={{ marginBottom: 10 }}><strong>{plan.mold ? plan.mold : '-'}</strong></div>
                                                            </div>
                                                            <RemainingPlanDetail planQty={plan.qty} toGoQty={100} outputQty={100} CT={plan.cycletime} />
                                                        </Flex>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        )
                                        )}
                                    </Row>
                                </Card>
                            ))
                        }



                    </div>
            }
        </ResourceLayout >
    );
}

export default PlanResource;