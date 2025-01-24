import { Alert, Button, Card, Col, Empty, Flex, Row, Spin, Typography } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import TableChartIcon from '@mui/icons-material/TableChart';
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";
import GppBadIcon from '@mui/icons-material/GppBad';
import DatasetIcon from '@mui/icons-material/Dataset';
import ScienceIcon from '@mui/icons-material/Science';
import PolicyIcon from '@mui/icons-material/Policy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSearchParams } from "react-router-dom";
import ResourceLayout from "./ResourceLayout";
import { useEffect, useMemo, useState } from "react";
import ConfirmComplete from "../../../components/Buttons/ConfirmComplete";
import ConfirmSetup from "../../../components/Buttons/ConfirmSetup";
import ChangeCavity from "../../../components/Buttons/ChangeCavity";
import { useSelector } from "react-redux";
import { fetchPlanActive, fetchResourceById } from "../../../data/fetchs";

function ActiveResource() {

    const [searchParams] = useSearchParams();
    const resourceId = useMemo(() => Number(searchParams.get('resourceId')), [searchParams]);
    const { isDarkMode } = useSelector((state) => state.theme); // Dark mode state


    const [resource, setResource] = useState(null);
    const [plan, setPlan] = useState(null);
    const [outputQty, setOutputQty] = useState(0);
    const [defectQty, setDefectQty] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResourceAndPlan = async () => {
            setLoading(true);
            // Fetch resource data
            const fetchedResource = await fetchResourceById(resourceId);
            setResource(fetchedResource);
            // Fetch plan data
            if (fetchedResource) {
                const fetchedPlan = await fetchPlanActive(resourceId);
                setPlan(fetchedPlan);
                // Set quantities and resource status based on the fetched plan data
                if (fetchedPlan) {
                    setOutputQty(50); // Example value, adjust as needed
                    setDefectQty(5); // Example value, adjust as needed
                }
            }

            setLoading(false);
        };

        if (resourceId) {
            loadResourceAndPlan();
        }
    }, [resourceId]);

    const toGoQty = useMemo(() => plan ? plan.qty - outputQty : 0, [plan, outputQty]);
    const goodQty = useMemo(() => outputQty ? outputQty - defectQty : 0, [outputQty, defectQty]);
    console.log('plan', plan);

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
                :
                plan ?
                    <>
                        {/* BODY CONTENT */}
                        <Card
                            title={
                                <Flex align="center" justify="space-between">
                                    <p style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: isDarkMode ? '#e6f7ff' : 'inherit'
                                    }}>
                                        Single Task
                                    </p>
                                    <MoreOutlined style={{
                                        fontSize: '18px',
                                        color: isDarkMode ? '#e6f7ff' : 'inherit',
                                        cursor: 'pointer'
                                    }} />
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
                                    backgroundColor: isDarkMode ? '#2c3e50' : '#f6ffed',
                                    color: isDarkMode ? '#e6f7ff' : 'inherit',
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
                                    <Button
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
                                        onClick={ConfirmComplete}
                                    >
                                        <DoneIcon sx={{ fontSize: 18 }} />
                                        <span>COMPLETE</span>
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
                                        <TableChartIcon sx={{ fontSize: 16 }} />
                                        <span>MATERIAL</span>
                                    </Button>
                                </Col>
                            </Row>
                            <Row gutter={[16]}>
                                <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                    <div>Order No.</div>
                                    <div style={{ marginBottom: 10 }}><strong>{plan.planNo}</strong></div>
                                    <div>Part No.</div>
                                    <div style={{ marginBottom: 10 }}><strong>{plan.partNo}</strong></div>
                                    <div>Part Drawing #</div>
                                    <div style={{ marginBottom: 10 }}><strong>NULL</strong></div>
                                </Col>
                                <Col lg={4}>
                                    <div>ToGo Qty</div>
                                    <div style={{ marginBottom: 10 }}><strong>{toGoQty}</strong></div>
                                    <div>Output Qty</div>
                                    <div style={{ marginBottom: 10 }}><strong>{outputQty}</strong></div>
                                    <div>CT <small>(s)</small></div>
                                    <div style={{ marginBottom: 10 }}><strong>{plan.cycletime}</strong></div>
                                </Col>

                                <Col lg={4}>
                                    <div>Good Qty</div>
                                    <div style={{ marginBottom: 10 }}><strong>{goodQty}</strong></div>
                                    <div>Defect Qty</div>
                                    <div style={{ marginBottom: 10 }}><strong>{defectQty}</strong></div>
                                    <div>Lost Qty</div>
                                    <div style={{ marginBottom: 10 }}><strong>{plan.lost_qty}</strong></div>
                                </Col>
                                <Col lg={9}>

                                    <Flex align="flex-start" justify="space-between">
                                        <div>
                                            <div>Part Desc</div>
                                            <div style={{ marginBottom: 10 }}><strong>{plan.part_desc}</strong></div>
                                            <div>Cavity</div>
                                            <div style={{ marginBottom: 10 }}><strong>{plan.cavity}</strong></div>
                                        </div>
                                        {resource ? (
                                            <RemainingPlanDetail planQty={plan.qty} toGoQty={plan.qty - 50} outputQty={50} CT={plan.cycletime} />
                                        ) : (
                                            <p>No resource found</p>
                                        )}
                                    </Flex>
                                </Col>
                            </Row>

                            {/* Row 2 */}
                            <Row>
                                <Col lg={24} style={{ padding: 0 }}>
                                    <ChangeCavity />

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
                    </>
                    :
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Typography.Text>
                                No active plan
                            </Typography.Text>
                        }
                    />
            }
        </ResourceLayout>
    );
}
export default ActiveResource;