import { useLocation, useNavigate } from "react-router-dom";
import { resources } from "../../data/fetchResource"; // Pastikan import data resource dengan benar
import LayoutDashboard from "../../components/layouts/LayoutDashboard";
import { Button, Card, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PropTypes from "prop-types";

const DetailResource = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationPath = location.pathname;
    const resourceId = location.state?.resourceId;
    const modulName = location.state?.module;

    // Cari resource berdasarkan uuid
    const resource = resources.find((res) => res.uuid === resourceId);

    // Jika resource tidak ditemukan
    if (!resource) {
        return <p>Resource not found</p>;
    }

    const handleNavigate = (m) => {
        navigate('/resource', { state: { resourceId: resource.uuid, module: m } });
    };

    return (
        <>
            <LayoutDashboard>
                <Row gutter={[5]}>
                    {/* LEFT SECTION */}
                    <Col lg={6} style={{ marginTop: 5 }}>
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
                                <Button onClick={handleNavigate("active")} color="primary" variant={locationPath === '/resource' && modulName === 'active' ? 'solid' : 'outlined'} style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                    <TouchAppIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>ACTIVE</span>
                                </Button>
                            </Col>
                            <Col span={12} style={{ paddingRight: 0 }}>
                                <Button onClick={handleNavigate("plan")} color="primary" variant={locationPath === '/resource' && modulName === 'plan' ? 'solid' : 'outlined'} style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>PLAN</span>
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={[5]} style={{ width: "100%", margin: '5px 0px' }}>
                            <Col span={12} style={{ paddingLeft: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                    <AlarmAddIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>DOWN</span>
                                </Button>
                            </Col>
                            <Col span={12} style={{ paddingRight: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                    <WavingHandIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>HELP</span>
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={[5]} style={{ width: "100%", margin: '5px 0px' }}>
                            <Col span={12} style={{ paddingLeft: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>DOC</span>
                                </Button>
                            </Col>
                            <Col span={12} style={{ paddingRight: 0 }}>
                                <Button color="primary" variant="outlined" style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                    <HouseSidingIcon sx={{ fontSize: 18 }} />
                                    <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>MOLD</span>
                                </Button>
                            </Col>
                        </Row>
                        
                        {/* BACK BUTTON */}
                        <Row>
                            <Col>
                                <Button style={{ margin: '5px 0px' }} onClick={() => window.history.back()} color="primary" variant="filled">
                                    <ArrowLeftOutlined />
                                </Button>
                            </Col>
                        </Row>
                    </Col>

                    {/* RIGHT SECTION */}
                    {children}
                </Row>


            </LayoutDashboard>
        </>
    );
};

DetailResource.propTypes = {
    children: PropTypes.node,
}

export default DetailResource;
