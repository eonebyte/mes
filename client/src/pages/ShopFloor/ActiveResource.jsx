import { Alert, Button, Card, Col, Flex, Row, Spin } from "antd";
import { MoreOutlined } from "@ant-design/icons";
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
import { resources } from "../../data/fetchResource";
import { useLocation } from "react-router-dom";
import DetailResource from "./DetailResource";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function ActiveResource() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const location = useLocation();
    const resourceId = location.state?.resourceId;

    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);


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
                            marginTop: 5,
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
                                <div style={{ marginBottom: 10 }}><strong>O23098943-NHZ</strong></div>
                                <div>Part No.</div>
                                <div style={{ marginBottom: 10 }}><strong>CJA-3400-SHA</strong></div>
                                <div>Part Drawing #</div>
                                <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                            </Col>
                            <Col lg={4}>
                                <div>ToGo Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>1000</strong></div>
                                <div>Output Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>500</strong></div>
                                <div>CT <small>(s)</small></div>
                                <div style={{ marginBottom: 10 }}><strong>35000</strong></div>
                            </Col>

                            <Col lg={4}>
                                <div>Good Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>485</strong></div>
                                <div>Defect Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>15</strong></div>
                                <div>Lost Qty</div>
                                <div style={{ marginBottom: 10 }}><strong>0</strong></div>
                            </Col>
                            <Col lg={9}>

                                <Flex align="flex-start" justify="space-between">
                                    <div>
                                        <div>Part Desc</div>
                                        <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                        <div>Cavity</div>
                                        <div style={{ marginBottom: 10 }}><strong>1</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <RemainingProgress target={resource.plan_qty} progress={resource.progress} />
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
                </Col>
            }
        </DetailResource>
    );
}

export default ActiveResource;