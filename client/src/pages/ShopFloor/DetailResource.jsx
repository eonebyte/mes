import { useLocation } from "react-router-dom";
import { resources } from "../../data/fetchResource"; // Pastikan import data resource dengan benar
import LayoutDashboard from "../../components/layouts/LayoutDashboard";
import { Button, Card, Col, Flex, Row } from "antd";
import { ArrowLeftOutlined, MoreOutlined } from "@ant-design/icons";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import TableChartIcon from '@mui/icons-material/TableChart';

const DetailResource = () => {
    const location = useLocation();

    // Parse query string untuk mendapatkan resource_uuid
    const queryParams = new URLSearchParams(location.search);
    const resourceUUID = queryParams.get("q");

    // Cari resource berdasarkan uuid
    const resource = resources.find((res) => res.uuid === resourceUUID);

    // Jika resource tidak ditemukan
    if (!resource) {
        return <p>Resource not found</p>;
    }

    return (
        <>
            <LayoutDashboard>

                <Row gutter={[5]}>
                    {/* LEFT SECTION */}
                    <Col key={resource.resource_id} lg={6} style={{ marginTop: 5 }}>
                        <Card
                            style={{
                                width: '100%',
                                border: 0,
                                borderRadius: 3,
                                backgroundColor: resource.status === 'Running'
                                    ? '#52c41a'
                                    : resource.status === 'Down'
                                        ? '#f5222d'
                                        : '#f5222d'
                            }}
                            styles={{
                                body: {
                                    padding: '5px 5px'
                                }
                            }}
                        >
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.name}</p>
                            <p style={{ marginBottom: 0, margin: 0 }}>{resource.line}</p>
                            <img src={resource.image} alt={resource.name} style={{ maxWidth: '100%' }} />
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{resource.status}</p>
                        </Card>
                        <Row gutter={[5]} style={{ width: "100%", margin: '5px 0px' }}>
                            <Col span={12} style={{ paddingLeft: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '20px 0px', borderRadius: 3 }}>
                                    <TouchAppIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>ACTIVE</span>
                                </Button>
                            </Col>
                            <Col span={12} style={{ paddingRight: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '20px 0px', borderRadius: 3 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>PLAN</span>
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={[5]} style={{ width: "100%", margin: '5px 0px' }}>
                            <Col span={12} style={{ paddingLeft: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '20px 0px', borderRadius: 3 }}>
                                    <AlarmAddIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>DOWN</span>
                                </Button>
                            </Col>
                            <Col span={12} style={{ paddingRight: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '20px 0px', borderRadius: 3 }}>
                                    <WavingHandIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>HELP</span>
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={[5]} style={{ width: "100%", margin: '5px 0px' }}>
                            <Col span={12} style={{ paddingLeft: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '20px 0px', borderRadius: 3 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>DOC</span>
                                </Button>
                            </Col>
                            <Col span={12} style={{ paddingRight: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '20px 0px', borderRadius: 3 }}>
                                    <HouseSidingIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>MOLD</span>
                                </Button>
                            </Col>
                        </Row>
                    </Col>

                    {/* RIGHT SECTION */}
                    <Col key={resource.resource_id} lg={18}>
                        <Card
                            style={{
                                border: 0,
                                borderRadius: 0,
                            }}
                            styles={{
                                body: {
                                    backgroundColor: '#f6ffed',
                                    padding: 15
                                }
                            }}
                        >
                            <Flex align="center" justify="space-between">
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Single Task</p>
                                <MoreOutlined style={{ fontSize: '18px' }} />
                            </Flex>
                        </Card>
                        <Card
                            style={{
                                border: 0,
                                borderBottom: '1px solid #9999',
                                borderRadius: 0
                            }}
                            styles={{
                                header: {
                                    backgroundColor: '#ffffff'
                                },
                                body: {
                                    padding: '5px 15px',
                                    borderRadius: 0
                                }
                            }}
                        >
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
                        </Card>

                        {/* BODY CONTENT */}
                        <Card
                            style={{
                                border: 0,
                                borderRadius: 0
                            }}
                            styles={{
                                header: {
                                    backgroundColor: '#ffffff'
                                },
                                body: {
                                    padding: '5px 15px'
                                }
                            }}
                        >
                            <Row gutter={[16]}>
                                <Col lg={8} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
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
                                <Col lg={8}>
                                    <div>Part Desc</div>
                                    <div style={{ marginBottom: 10 }}><strong>Description Product</strong></div>
                                    <div>Cavity</div>
                                    <div style={{ marginBottom: 10 }}><strong>1</strong></div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* BACK BUTTON */}
                <Button style={{ margin: '5px 0px' }} onClick={() => window.history.back()} color="primary" variant="filled">
                    <ArrowLeftOutlined />
                </Button>
            </LayoutDashboard>
        </>
    );
};

export default DetailResource;
