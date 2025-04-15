import { Alert, Button, Card, Col, Empty, Flex, Row, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import TableChartIcon from '@mui/icons-material/TableChart';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import GppBadIcon from '@mui/icons-material/GppBad';
import DatasetIcon from '@mui/icons-material/Dataset';
import ScienceIcon from '@mui/icons-material/Science';
import PolicyIcon from '@mui/icons-material/Policy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { plans } from "../../../data/fetchResource";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LayoutDashboard from "../../../components/layouts/LayoutDashboard";
import DownloadIcon from '@mui/icons-material/Download';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import ConfirmStart from "../../../components/Buttons/ConfirmStart";
import ConfirmReleased from "../../../components/Buttons/ConfirmReleased";
import ConfirmReady from "../../../components/Buttons/ConfirmReady";
import ConfirmSetup from "../../../components/Buttons/ConfirmSetup";
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";
import { fetchDetailPlan } from "../../../data/fetchs";
import ConfirmComplete from "../../../components/Buttons/ConfirmComplete";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { refreshResources } from "../../../states/reducers/resourceSlice";
import ConfirmMaterialNew from "../../../components/Buttons/ConfirmMaterialNew";


function PlanDetail() {
    const dispatch = useDispatch();
    // const user = useSelector((state) => state.auth.user);
    const [openMaterialModal, setOpenMaterialModal] = useState(false);


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


    const handleSuccess = () => {
        fetchData();
        dispatch(refreshResources());
    };



    function getBackgroundColor(status, isDarkMode) {
        if (status === 'On Hold') {
            return isDarkMode ? '#333' : '#fff7e6'; // On Hold: terang jika mode terang, gelap jika mode gelap
        } else if (status === 'DR') {
            return isDarkMode ? '#555' : '#f0f0f0'; // Released: lebih gelap jika mode gelap
        } else if (status === 'IP') {
            return isDarkMode ? '#457b9d' : '#e6f4ff'; // Ready: biru muda terang jika mode terang
        }
        return '#ffffff'; // default background color
    }

    function getTextColor(isDarkMode) {
        return isDarkMode ? '#ffffff' : '#1677FF'; // Teks putih jika mode gelap, hitam jika terang
    }

    console.log('plan detail: ', singlePlan);

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
                                            {`<${singlePlan.planNo}> ${singlePlan.status === 'DR' ? 'Draft' : singlePlan.status === 'IP' ? 'Open' : 'nan'}`}
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
                                            {singlePlan.status == 'On Hold' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={ConfirmReleased}
                                                >
                                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                                    <span>RELEASE</span>
                                                </Button>
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
                                                        <SettingsIcon sx={{ fontSize: 18 }} />
                                                        <span>MATERIAL</span>
                                                    </Button>
                                                    {openMaterialModal && (
                                                        <ConfirmMaterialNew
                                                            bomComponent={singlePlan.bomComponent}
                                                            open={openMaterialModal}
                                                            onClose={() => setOpenMaterialModal(false)}
                                                            onSuccess={handleSuccess}
                                                        />
                                                    )}
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
                                                        onClick={() => ConfirmSetup({
                                                            planId: singlePlan.planId,
                                                            resourceId: singlePlan.resourceId,
                                                            onSuccess: () => {
                                                                fetchData();
                                                                dispatch(refreshResources());
                                                            }
                                                        })}
                                                    >
                                                        <SettingsIcon sx={{ fontSize: 18 }} />
                                                        <span>SETUP</span>
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
                                                        onClick={() => ConfirmStart({ planId: singlePlan.planId, navidate: navigate, resourceId: singlePlan.resourceId })}
                                                    >
                                                        <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                                                        <span>START</span>
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
                                                        onClick={() => ConfirmComplete({
                                                            planId: singlePlan.planId,
                                                            resourceId: singlePlan.resourceId,
                                                            onSuccess: () => {
                                                            }
                                                        })}
                                                    >
                                                        <DoneIcon sx={{ fontSize: 18 }} />
                                                        <span>COMPLETE</span>
                                                    </Button>
                                                </>
                                            )}
                                        </Col>
                                    </Row>

                                    {/* Row 1 */}
                                    <Row gutter={[16]}>
                                        <Col lg={4} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                            <div>Part No/Part Name</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.partNo}/{singlePlan.partName}</strong></div>
                                            <div>Revision</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            <div>Project</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        </Col>
                                        <Col lg={4}>
                                            <div>Seq Desc</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            <div>Part Model</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            <div>Part Drawing #</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        </Col>

                                        <Col lg={4}>
                                            <div>Order No.</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                            <div>Cust Order</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.planNo}</strong></div>
                                            <div>Batch</div>
                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                        </Col>

                                        <Col lg={4}>
                                            <div>Plan Qty</div>
                                            <div style={{ marginBottom: 10 }}><strong>{singlePlan.qty}</strong></div>
                                            <div>ToGo Qty</div>
                                            <div style={{ marginBottom: 10 }}><strong>100 example</strong></div>
                                            <div>Output Per Cycle (Std / Act)</div>
                                            <div style={{ marginBottom: 10 }}><strong>100 example</strong></div>
                                        </Col>
                                        <Col lg={8}>

                                            <Flex align="flex-start" justify="space-between">
                                                <div>
                                                    <div>Part Desc</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                    <div>Cycles</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{singlePlan.cycletime}</strong></div>
                                                </div>
                                                {singlePlan ? (
                                                    <RemainingPlanDetail planQty={singlePlan.qty} toGoQty={100} outputQty={100} CT={singlePlan.cycletime} />
                                                ) : (
                                                    <p>No plan found</p>
                                                )}
                                            </Flex>
                                        </Col>
                                    </Row>

                                    {/* Row 2 */}
                                    <Row>
                                        <Col lg={24} style={{ padding: 0 }}>
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
                                            </Button>

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
                                            {multiplePlan.jo_status == 'On Hold' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={ConfirmReleased}
                                                >
                                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                                    <span>RELEASE</span>
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
                                                    onClick={ConfirmReady}
                                                >
                                                    <FactCheckIcon sx={{ fontSize: 18 }} />
                                                    <span>OPEN</span>
                                                </Button>
                                            )}
                                            {multiplePlan.jo_status == 'OP' && (
                                                <><Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={ConfirmSetup}
                                                >
                                                    <SettingsIcon sx={{ fontSize: 18 }} />
                                                    <span>SETUP</span>
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
                                                        onClick={ConfirmStart}
                                                    >
                                                        <DoneIcon sx={{ fontSize: 18 }} />
                                                        <span>COMPLETE</span>
                                                    </Button></>
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
                                                onClick={ConfirmStart}
                                            >
                                                <TableChartIcon sx={{ fontSize: 16 }} />
                                                <span>MATERIAL</span>
                                            </Button>
                                        </Col>
                                    </Row>

                                    {/* Row 1 */}
                                    {multiplePlan.data.map((plan, index) => (
                                        <>
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
                                                    <div>Revision</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                    <div>Project</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col><Col lg={4}>
                                                    <div>Seq Desc</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                    <div>Part Model</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                    <div>Part Drawing #</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col><Col lg={4}>
                                                    <div>Order No.</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                    <div>Cust Order</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.planNo}</strong></div>
                                                    <div>Batch</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col><Col lg={4}>
                                                    <div>Plan Qty</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.qty}</strong></div>
                                                    <div>ToGo Qty</div>
                                                    <div style={{ marginBottom: 10 }}><strong>100 example</strong></div>
                                                    <div>Output Per Cycle (Std / Act)</div>
                                                    <div style={{ marginBottom: 10 }}><strong>100 example</strong></div>
                                                </Col><Col lg={8}>

                                                    <Flex align="flex-start" justify="space-between">
                                                        <div>
                                                            <div>Part Desc</div>
                                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                            <div>Cycles</div>
                                                            <div style={{ marginBottom: 10 }}><strong>{plan.cycletime}</strong></div>
                                                        </div>
                                                        {plan ? (
                                                            <RemainingPlanDetail planQty={plan.qty} toGoQty={100} outputQty={100} CT={plan.cycletime} />
                                                        ) : (
                                                            <p>No plan found</p>
                                                        )}
                                                    </Flex>
                                                </Col>
                                            </Row></>
                                    ))}


                                    {/* Row 2 */}
                                    < Row >
                                        <Col lg={24} style={{ padding: 0 }}>
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
                                            </Button>

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