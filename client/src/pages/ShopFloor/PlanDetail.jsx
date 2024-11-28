import { Alert, Button, Card, Col, Flex, Row, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import TableChartIcon from '@mui/icons-material/TableChart';
import RemainingProgress from "../../components/ShopFloors/Plan/RemainingProgress";
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import GppBadIcon from '@mui/icons-material/GppBad';
import DatasetIcon from '@mui/icons-material/Dataset';
import ScienceIcon from '@mui/icons-material/Science';
import PolicyIcon from '@mui/icons-material/Policy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { plans } from "../../data/fetchResource";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LayoutDashboard from "../../components/layouts/LayoutDashboard";
import DownloadIcon from '@mui/icons-material/Download';
import FactCheckIcon from '@mui/icons-material/FactCheck';

function PlanDetail() {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const navigate = useNavigate();

    const location = useLocation();
    const planId = location.state?.planId;

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);


    useEffect(() => {
        setTimeout(() => {
            if (!planId) {
                navigate("/shopfloor");
            }
            const planData = plans.find((plan) => plan.id === Number(planId));
            if (planData) {
                setPlan(planData);
            }

            setLoading(false);
        }, 500);
    }, [planId, navigate]);

    function getBackgroundColor(status, isDarkMode) {
        if (status === 'On Hold') {
            return isDarkMode ? '#333' : '#fff7e6'; // On Hold: terang jika mode terang, gelap jika mode gelap
        } else if (status === 'Released') {
            return isDarkMode ? '#555' : '#f0f0f0'; // Released: lebih gelap jika mode gelap
        } else if (status === 'Ready') {
            return isDarkMode ? '#457b9d' : '#e6f4ff'; // Ready: biru muda terang jika mode terang
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
                :
                <>
                    {/* BODY CONTENT */}
                    <Card
                        title={
                            <Flex align="center" justify="space-between">
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
                                    {`<${plan.planNo}> ${plan.status}`}
                                </p>

                            </Flex>
                        }
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
                                backgroundColor: getBackgroundColor(plan.status, isDarkMode),
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
                                {plan.status == 'On Hold' && (
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
                                        <DownloadIcon sx={{ fontSize: 18 }} />
                                        <span>RELEASE</span>
                                    </Button>
                                )}
                                {plan.status == 'Released' && (
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
                                        <FactCheckIcon sx={{ fontSize: 18 }} />
                                        <span>READY</span>
                                    </Button>
                                )}
                                {plan.status == 'Ready' && (
                                    <><Button
                                        color="primary"
                                        variant="text"
                                        style={{
                                            fontWeight: 600,
                                            fontFamily: "'Roboto', Arial, sans-serif",
                                            fontSize: "12px",
                                            padding: "4px 12px",
                                        }}
                                    >
                                        <SettingsIcon sx={{ fontSize: 18 }} />
                                        <span>SETUP</span>
                                    </Button><Button
                                        color="primary"
                                        variant="text"
                                        style={{
                                            fontWeight: 600,
                                            fontFamily: "'Roboto', Arial, sans-serif",
                                            fontSize: "12px",
                                            padding: "4px 12px",
                                        }}
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
                                >
                                    <TableChartIcon sx={{ fontSize: 16 }} />
                                    <span>MATERIAL</span>
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={[16]}>
                            <Col lg={4} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div>Part No.</div>
                                <div style={{ marginBottom: 10 }}><strong>FH-54KJH-8034093</strong></div>
                                <div>Revision</div>
                                <div style={{ marginBottom: 10 }}><strong>A</strong></div>
                                <div>Project</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={4}>
                                <div>Seq Desc</div>
                                <div style={{ marginBottom: 10 }}><strong>10-AKL</strong></div>
                                <div>Part Model</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                <div>Part Drawing #</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>

                            <Col lg={4}>
                                <div>Order No.</div>
                                <div style={{ marginBottom: 10 }}><strong>02394334</strong></div>
                                <div>Cust Order</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                <div>Batch</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>

                            <Col lg={4}>
                                <div>Plan Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>10.000.000</strong></div>
                                <div>ToGo Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>9.000.000</strong></div>
                                <div>Output Per Cycle (Std / Act)</div>
                                <div style={{ marginBottom: 10 }}><strong>2/2</strong></div>
                            </Col>
                            <Col lg={8}>

                                <Flex align="flex-start" justify="space-between">
                                    <div>
                                        <div>Part Desc</div>
                                        <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                        <div>Cycles</div>
                                        <div style={{ marginBottom: 10 }}><strong>19000</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        {plan ? (
                                            <RemainingProgress target={plan.planQty} progress={plan.progress} />
                                        ) : (
                                            <p>No plan found</p>
                                        )}
                                        <small>Remaining</small>
                                        <strong>864+16:30</strong>
                                    </div>
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
                                                    1
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
                                                <strong style={{ marginRight: 50, marginLeft: 15, fontSize: 24 }}>A06</strong>
                                                <span style={{ marginRight: 50, marginLeft: 15, fontSize: 20 }}>CL00006</span>
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
            }
        </LayoutDashboard>
    );
}

export default PlanDetail;