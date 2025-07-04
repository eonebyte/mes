import { Alert, Button, Card, Col, Empty, Flex, Row, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
// import { plans } from "../../../data/fetchResource";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LayoutDashboard from "../../../components/layouts/LayoutDashboard";
// import DownloadIcon from '@mui/icons-material/Download';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import ConfirmStart from "../../../components/Buttons/ConfirmStart";
// import ConfirmReleased from "../../../components/Buttons/ConfirmReleased";
import ConfirmReady from "../../../components/Buttons/ConfirmReady";
import ConfirmSetup from "../../../components/Buttons/ConfirmSetup";
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";
import { fetchDetailPlan } from "../../../data/fetchs";
// import ConfirmComplete from "../../../components/Buttons/ConfirmComplete";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { refreshResources } from "../../../states/reducers/resourceSlice";
import ConfirmMaterialNew from "../../../components/Buttons/ConfirmMaterialNew";
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ConfirmCompleteJO from "../../../components/Buttons/ConfirmCompleteJO";
import React from "react";
import ConfirmReadyMultiplePlan from "../../../components/Buttons/ConfirmReadyMultiPlan";
import ConfirmStartMultiPlan from "../../../components/Buttons/ConfirmStartMultiPlan";
// import ChangeCavity from "../../../components/Buttons/ChangeCavity";
function PlanDetail() {
    const dispatch = useDispatch();
    const [openMaterialModal, setOpenMaterialModal] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const handleOpenConfirm = () => setShowConfirm(true);
    const handleCloseConfirm = () => setShowConfirm(false);


    // const user = useSelector((state) => state.auth.user);


    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const planId = searchParams.get('planId');
    const moldId = searchParams.get('moldId');

    const [loading, setLoading] = useState(true);
    const [singlePlan, setSinglePlan] = useState({});
    const [multiplePlan, setMultiplePlan] = useState({});

    // const [isModalVisible, setIsModalVisible] = useState(false);
    const fetchData = async () => {
        setLoading(true);
        try {
            let singlePlanData;
            let multiplePlanData;

            if (planId) {
                singlePlanData = await fetchDetailPlan(planId, null);
            } else {
                multiplePlanData = await fetchDetailPlan(null, moldId);
            }

            if (singlePlanData) {
                setSinglePlan(singlePlanData);

            } else if (multiplePlanData) {
                setMultiplePlan(multiplePlanData)

            } else {
                setSinglePlan({});  // Handle unexpected data (non-array) by setting an empty array
                setMultiplePlan({});  // Handle unexpected data (non-array) by setting an empty array
            }
        } catch (error) {
            console.error("Error fetching resource:", error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (!planId && !moldId) {
            navigate("/shopfloor");
            return;
        }

        fetchData();
    }, [planId, navigate]);

    const handleSuccessOnActive = (resourceId) => {
        setShowConfirm(false);
        fetchData();
        dispatch(refreshResources());
        navigate(`/resource/plan?resourceId=${resourceId}`);
    };


    // const handleSuccess = () => {
    //     fetchData();
    //     dispatch(refreshResources());
    // };

    function getBackgroundColor(status, isDarkMode) {
        if (status === 'On Hold') {
            return isDarkMode ? '#333' : '#fff7e6'; // On Hold: terang jika mode terang, gelap jika mode gelap
        } else if (status === 'DR') {
            return isDarkMode ? '#262626' : '#f0f0f0'; // Released: lebih gelap jika mode gelap
        } else if (status === 'IP') {
            return isDarkMode ? '#0958d9' : '#bae0ff';
        } else if (status === 'HO') {
            return isDarkMode ? '#d4b106' : '#ffffb8';
        } else if (status === 'CO') {
            return isDarkMode ? '#d46b08' : '#ffe7ba';
        }
        return '#ffffff'; // default background color
    }

    function getTextColor(isDarkMode) {
        return isDarkMode ? '#ffffff' : '#1677FF'; // Teks putih jika mode gelap, hitam jika terang
    }



    return (
        <LayoutDashboard>
            {loading ?
                <Col
                    style={{
                        marginTop: 10,
                        display: 'flex',
                        justifyContent: 'center', // Pusatkan secara horizontal
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
                : singlePlan.length === 0 && multiplePlan.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No plans available" />
                )
                    :
                    <>
                        {/* Single Plan */}
                        {singlePlan && Object.keys(singlePlan).length > 0 && (
                            <>
                                <Card
                                    title={<Flex align="center" justify="space-between">
                                        <p style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: getTextColor(isDarkMode),
                                        }}>
                                            Single Task
                                        </p>

                                        <p style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: getTextColor(isDarkMode),
                                        }}>
                                            {
                                                `<${singlePlan.planNo}> ${singlePlan.status === 'DR' ? 'Draft' :
                                                    singlePlan.status === 'IP' ? 'Open' :
                                                        singlePlan.status === 'HO' ? 'On Hold' :
                                                            singlePlan.status === 'CO' ? 'Completed' :
                                                                'nan'}`
                                            }
                                        </p>

                                    </Flex>}
                                    style={{
                                        border: 0,
                                        borderRadius: 3,
                                        marginBottom: '20px', // Menambahkan margin bawah agar tidak terlalu rapat dengan konten berikutnya
                                        boxShadow: isDarkMode
                                            ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                                            : '0 1px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                                    }}
                                    styles={{
                                        header: {
                                            border: 0,
                                            backgroundColor: getBackgroundColor(singlePlan.status, isDarkMode),
                                            color: getTextColor(isDarkMode),
                                            borderRadius: '3px 3px 0px 0px',
                                        },
                                        body: {
                                            padding: "5px 10px",
                                            borderRadius: 3,
                                        }
                                    }}
                                >
                                    <Row gutter={[16]} style={{ borderBottom: '1px solid #9999', marginBottom: 5 }}>
                                        <Col lg={24} style={{ padding: 0 }}>
                                            {singlePlan.status == 'HO' && (
                                                <>
                                                    <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={() => ConfirmReady({ planId: singlePlan.planId, onSuccess: fetchData })}
                                                    >
                                                        <FactCheckIcon sx={{ fontSize: 18 }} />
                                                        <span>OPEN</span>
                                                    </Button>
                                                </>
                                            )}
                                            {singlePlan.status == 'DR' && (
                                                <>
                                                    <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={() => ConfirmReady({ planId: singlePlan.planId, onSuccess: fetchData })}
                                                    >
                                                        <FactCheckIcon sx={{ fontSize: 18 }} />
                                                        <span>OPEN</span>
                                                    </Button>
                                                </>
                                            )}
                                            {/* IP = OPEN */}
                                            {singlePlan.status == 'IP' && (
                                                <>
                                                    <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={handleOpenConfirm}
                                                    >
                                                        <SettingsIcon sx={{ fontSize: 18 }} />
                                                        <span>SETUP</span>
                                                    </Button>
                                                    <ConfirmSetup
                                                        open={showConfirm}
                                                        onClose={handleCloseConfirm}
                                                        onSuccess={() => handleSuccessOnActive(singlePlan.resourceId)}
                                                        resourceId={singlePlan.resourceId}
                                                    />
                                                    <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={() => ConfirmStart({
                                                            planId: singlePlan.planId,
                                                            navidate: navigate,
                                                            resourceId: singlePlan.resourceId
                                                        })}
                                                    >
                                                        <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                                                        <span>START</span>
                                                    </Button>
                                                    {/* <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={() => setOpenCompleteModal(true)}
                                                    >
                                                        <DoneIcon sx={{ fontSize: 18 }} />
                                                        <span>COMPLETE</span>
                                                    </Button>
                                                    <ConfirmComplete
                                                        planId={singlePlan.planId}
                                                        resourceId={singlePlan.resourceId}
                                                        open={openCompleteModal}
                                                        onClose={() => setOpenCompleteModal(false)}
                                                        onSuccess={handleSuccess}
                                                        userId={parseInt(user.id)}
                                                    /> */}
                                                </>
                                            )}
                                            {singlePlan.status == 'HO' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={() => ConfirmCompleteJO({ planId: singlePlan.planId, onSuccess: fetchData })}
                                                >
                                                    <DoneIcon sx={{ fontSize: 18 }} />
                                                    <span>COMPLETE JO</span>
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>

                                    {/* Row 1 */}
                                    <Row gutter={[16]}>
                                        <Col lg={4} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                            <div>Part No/Part Name</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.partNo}/{singlePlan.partName}</strong></div>
                                            <div>Part Desc</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.partDesc ? singlePlan.partDesc : '-'}</strong></div>
                                            {/* <div>Revision</div> */}
                                            {/* <div style={{ marginBottom: 10 }}><strong>-</strong></div> */}

                                        </Col>
                                        {/* <Col lg={4}>
                                            <div>Seq Desc</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            <div>Part Model</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            <div>Part Drawing #</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        </Col> */}

                                        <Col lg={4}>
                                            <div>Cust Order</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.planNo}</strong></div>
                                            <div>Order No.</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            {/* <div>Batch</div> */}
                                            {/* <div style={{ marginBottom: 10 }}><strong>-</strong></div> */}
                                        </Col>

                                        <Col lg={4}>
                                            <div>Plan Qty</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.qty}</strong></div>
                                            <div>ToGo Qty</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.togoqty ? singlePlan.togoqty : singlePlan.qty}</strong></div>

                                        </Col>
                                        <Col lg={8}>

                                            <Flex align="flex-start" justify="space-between">
                                                <div>
                                                    {/* <div>Project</div> */}
                                                    {/* <div style={{ marginBottom: 10 }}><strong>-</strong></div> */}
                                                    <div>Cycles</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{singlePlan.cycletime}</strong></div>
                                                    <div>Cavity</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{singlePlan.cavity}</strong></div>
                                                </div>
                                                <div>
                                                    <div>Output Per Cycle (Std / Act)</div>
                                                    <div style={{ marginBottom: 10 }}>
                                                        <strong>{(singlePlan?.outputqty && singlePlan.outputqty !== 0) ? singlePlan.outputqty : 0}</strong>
                                                    </div>
                                                </div>
                                                {singlePlan ? (
                                                    <RemainingPlanDetail planQty={singlePlan.qty} toGoQty={singlePlan.togoqty ? singlePlan.togoqty : singlePlan.qty} outputQty={singlePlan.outputqty ? singlePlan.outputqty : 0} CT={singlePlan.cycletime} />
                                                ) : (
                                                    <p>No plan found</p>
                                                )}
                                            </Flex>
                                        </Col>
                                    </Row>

                                    {/* Row 2 */}
                                    <Row>
                                        <Col lg={24} style={{ padding: 0 }}>
                                            {/* STATION */}
                                            <h1 style={{ marginTop: 0 }}>Station</h1>
                                            <Card
                                                style={{
                                                    border: 0,
                                                    width: 'fit-content',
                                                    padding: 0,
                                                    marginBottom: '20px',
                                                    boxShadow: isDarkMode
                                                        ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                                                        : '0 2px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                                                }}
                                                styles={{
                                                    body: {
                                                        padding: 0,
                                                        borderRadius: 0
                                                    }
                                                }}
                                            >
                                                <Row>
                                                    <Col>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            height: '100%',
                                                            backgroundColor: '#1677FF',
                                                            color: 'white',
                                                            borderTopLeftRadius: '8px', // Radius atas kiri
                                                            borderBottomLeftRadius: '8px' // Radius bawah kiri
                                                        }}>
                                                            <span style={{
                                                                marginLeft: 15,
                                                                marginRight: 15,
                                                                marginBottom: 0,
                                                                fontSize: 48,
                                                                marginTop: 0,
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {singlePlan.lineno}
                                                            </span>
                                                        </div>

                                                    </Col>
                                                    <Col>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'center', // Menjadikan konten center secara vertikal
                                                            height: '100%',
                                                            lineHeight: '1.2'
                                                        }}>
                                                            <strong style={{ marginRight: 50, marginLeft: 15, fontSize: 24 }}>{singlePlan.mcno}</strong>
                                                            <span style={{ marginRight: 50, marginLeft: 15, fontSize: 20 }}>{singlePlan.moldName}</span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card><Row>
                                    <Col>
                                        <Button style={{ margin: '5px 0px' }} onClick={() => navigate(-1)} color="primary" variant="filled">
                                            <ArrowLeftOutlined />
                                        </Button>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {/* Multiple Plan */}
                        {multiplePlan && Object.keys(multiplePlan).length > 0 && (
                            <>
                                <Card
                                    title={<Flex align="center" justify="space-between">
                                        <p style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: getTextColor(isDarkMode),
                                        }}>
                                            {Object.keys(singlePlan).length > 0 ? 'Single Task' : 'Multiple Task'}
                                        </p>

                                    </Flex>}
                                    style={{
                                        border: 0,
                                        borderRadius: 3,
                                        marginBottom: '20px', // Menambahkan margin bawah agar tidak terlalu rapat dengan konten berikutnya
                                        boxShadow: isDarkMode
                                            ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                                            : '0 1px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                                    }}
                                    styles={{
                                        header: {
                                            border: 0,
                                            backgroundColor: getBackgroundColor(multiplePlan.jo_status, isDarkMode),
                                            color: getTextColor(isDarkMode),
                                            borderRadius: '3px 3px 0px 0px',
                                        },
                                        body: {
                                            padding: "5px 10px",
                                            borderRadius: 3,
                                        }
                                    }}
                                >

                                    {/* Row 0 */}
                                    <Row gutter={[16]} style={{ borderBottom: '1px solid #9999', marginBottom: 5 }}>
                                        <Col lg={24} style={{ padding: 0 }}>
                                            {multiplePlan.jo_status == 'HO' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={() => ConfirmReadyMultiplePlan({ data: multiplePlan.data, onSuccess: fetchData })}
                                                >
                                                    <FactCheckIcon sx={{ fontSize: 18 }} />
                                                    <span>OPEN</span>
                                                </Button>
                                            )}
                                            {multiplePlan.jo_status == 'DR' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={() => ConfirmReadyMultiplePlan({ data: multiplePlan.data, onSuccess: fetchData })}
                                                >
                                                    <FactCheckIcon sx={{ fontSize: 18 }} />
                                                    <span>OPEN</span>
                                                </Button>
                                            )}
                                            {multiplePlan.jo_status == 'IP' && (
                                                <>
                                                    <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={handleOpenConfirm}
                                                    >
                                                        <SettingsIcon sx={{ fontSize: 18 }} />
                                                        <span>SETUP</span>
                                                    </Button>
                                                    <ConfirmSetup
                                                        open={showConfirm}
                                                        onClose={handleCloseConfirm}
                                                        onSuccess={() => handleSuccessOnActive(multiplePlan.resourceId)}
                                                        resourceId={multiplePlan.resourceId}
                                                    />
                                                    <Button
                                                        color="primary"
                                                        variant="text"
                                                        style={{
                                                            fontWeight: 600,
                                                            fontFamily: "'Roboto', Arial, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "4px 12px",
                                                        }}
                                                        onClick={() => ConfirmStartMultiPlan({
                                                            data: multiplePlan.data,
                                                            navidate: navigate,
                                                            resourceId: multiplePlan.resourceId
                                                        })}
                                                    >
                                                        <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                                                        <span>START</span>
                                                    </Button>
                                                </>
                                            )}
                                            {multiplePlan.jo_status == 'HO' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={() => ConfirmCompleteJO({ planId: multiplePlan.planId, onSuccess: fetchData })}
                                                >
                                                    <DoneIcon sx={{ fontSize: 18 }} />
                                                    <span>COMPLETE JO</span>
                                                </Button>
                                            )}
                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                                onClick={() => setOpenMaterialModal(true)}
                                            >
                                                <WarehouseIcon sx={{ fontSize: 18 }} />
                                                <span>MATERIAL</span>
                                            </Button>
                                            {openMaterialModal && (
                                                <ConfirmMaterialNew
                                                    movementLines={[]}
                                                    open={openMaterialModal}
                                                    onClose={() => setOpenMaterialModal(false)}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                    {/* === */}


                                    {/* Row 1 */}
                                    {multiplePlan.data.map((plan, index) => (
                                        <React.Fragment key={plan.planId || index}>

                                            <Row
                                                gutter={[16]}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginLeft: 1,
                                                    marginRight: 10,
                                                    marginBottom: 5
                                                }}
                                            >
                                                {/* Plan No di pojok kiri */}
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    color: getTextColor(isDarkMode),
                                                }}>
                                                    {plan.planNo}
                                                </p>

                                                {/* Plan Status di pojok kanan */}
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    color: getTextColor(isDarkMode),
                                                }}>
                                                    {plan.status}
                                                </p>
                                            </Row>

                                            <Row key={index} gutter={[16]} style={{ borderBottom: 'black solid 1px', marginBottom: 5 }}>

                                                <Col key={`${plan.planId}-${index}`} lg={4} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                                    <div>Part No/Part Name</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.partNo}/{plan.partName}</strong></div>
                                                    <div>Part Desc</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div>Cust Order</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.planNo}</strong></div>
                                                    <div>Order No.</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col>
                                                {/* <Col lg={4}>
                                                    <div>Batch</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col> */}
                                                <Col lg={4}>
                                                    <div>Plan Qty</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.qty}</strong></div>
                                                    <div>ToGo Qty</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.togoqty ? plan.togoqty : plan.qty}</strong></div>
                                                </Col><Col lg={8}>

                                                    <Flex align="flex-start" justify="space-between">
                                                        <div>
                                                            <div>Cycles</div>
                                                            <div style={{ marginBottom: 10 }}><strong>{plan.cycletime}</strong></div>
                                                            <div>Cavity</div>
                                                            <div style={{ marginBottom: 10 }}><strong>{plan.cavity ? plan.cavity : '-'}</strong></div>
                                                        </div>
                                                        <div>
                                                            <div>Output Per Cycle (Std / Act)</div>
                                                            <div style={{ marginBottom: 10 }}><strong>{plan.output ? plan.output : 0}</strong></div>
                                                        </div>
                                                        {plan ? (
                                                            <RemainingPlanDetail planQty={plan.qty} toGoQty={plan.togoqty ? plan.togoqty : plan.qty} outputQty={plan.output ? plan.output : 0} CT={plan.cycletime} />
                                                        ) : (
                                                            <p>No plan found</p>
                                                        )}
                                                    </Flex>
                                                </Col>
                                            </Row>
                                        </React.Fragment>
                                    ))}


                                    {/* Row 2 */}
                                    < Row >
                                        <Col lg={24} style={{ padding: 0 }}>
                                            {/* <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                            >
                                                <GroupWorkIcon sx={{ fontSize: 18 }} />
                                                <span>CAVITY</span>
                                            </Button>

                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                            >
                                                <GppBadIcon sx={{ fontSize: 18 }} />
                                                <span>DEFECT</span>
                                            </Button>
                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                            >
                                                <DatasetIcon sx={{ fontSize: 16 }} />
                                                <span>LOT</span>
                                            </Button>
                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                            >
                                                <ScienceIcon sx={{ fontSize: 16 }} />
                                                <span>FAI</span>
                                            </Button>
                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                            >
                                                <PolicyIcon sx={{ fontSize: 16 }} />
                                                <span>PQC</span>
                                            </Button>
                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                            >
                                                <CloudUploadIcon sx={{ fontSize: 16 }} />
                                                <span>PARAMETER</span>
                                            </Button> */}

                                            {/* STATION */}
                                            <h1 style={{ marginTop: 0 }}>Station</h1>
                                            <Card
                                                style={{
                                                    border: 0,
                                                    width: 'fit-content',
                                                    padding: 0,
                                                    marginBottom: '20px',
                                                    boxShadow: isDarkMode
                                                        ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                                                        : '0 2px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                                                }}
                                                styles={{
                                                    body: {
                                                        padding: 0,
                                                        borderRadius: 0
                                                    }
                                                }}
                                            >
                                                <Row>
                                                    <Col>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            height: '100%',
                                                            backgroundColor: '#1677FF',
                                                            color: 'white',
                                                            borderTopLeftRadius: '8px', // Radius atas kiri
                                                            borderBottomLeftRadius: '8px' // Radius bawah kiri
                                                        }}>
                                                            <span style={{
                                                                marginLeft: 15,
                                                                marginRight: 15,
                                                                marginBottom: 0,
                                                                fontSize: 48,
                                                                marginTop: 0,
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {multiplePlan.lineno}
                                                            </span>
                                                        </div>

                                                    </Col>
                                                    <Col>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'center', // Menjadikan konten center secara vertikal
                                                            height: '100%',
                                                            lineHeight: '1.2'
                                                        }}>
                                                            <strong style={{ marginRight: 50, marginLeft: 15, fontSize: 24 }}>{multiplePlan.mcno}</strong>
                                                            <span style={{ marginRight: 50, marginLeft: 15, fontSize: 20 }}>{multiplePlan.mold_name}</span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card>
                                <Row>
                                    <Col>
                                        <Button style={{ margin: '5px 0px' }} onClick={() => navigate(-1)} color="primary" variant="filled">
                                            <ArrowLeftOutlined />
                                        </Button>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </>
            }
        </LayoutDashboard >
    );
}

export default PlanDetail;