import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { resources } from "../../../data/fetchResource"; // Pastikan import data resource dengan benar
import LayoutDashboard from "../../../components/layouts/LayoutDashboard";
import { Button, Card, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PropTypes from "prop-types";
import { Layout } from 'antd';
import { useEffect } from "react";
const { Sider, Content } = Layout;


const ResourceLayout = ({ children }) => {



    const navigate = useNavigate();
    const location = useLocation();
    const locationPath = location.pathname;

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    // Cari resource berdasarkan uuid
    const resource = resources.find((res) => res.id === Number(resourceId));

    useEffect(() => {
        if (!resource) {
            navigate("/shopfloor");
        }
    }, [resource, navigate]);

    // Jika resource tidak ditemukan
    if (!resource) {
        return <p>Resource not found</p>;
    }

    return (
        <>
            <LayoutDashboard>
                <Layout
                    style={{
                        backgroundColor: 'transparent',
                    }}
                >
                    <Sider
                        width='25%'
                        style={{
                            backgroundColor: 'transparent', // Ubah background menjadi transparan
                        }}
                    >
                        <Row>
                            <Col lg={24} style={{ marginTop: 5 }}>
                                <Card
                                    style={{
                                        width: '100%',
                                        border: 0,
                                        borderRadius: 3,
                                        color: resource.status === 'Inspect'
                                            ? 'white'
                                            : 'black',
                                        backgroundColor: resource.status === 'Running'
                                            ? '#52c41a'
                                            : resource.status === 'Down'
                                                ? '#f5222d'
                                                : resource.status === 'Inspect'
                                                    ? '#a8071a'
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
                                        <Button onClick={() => navigate(`/resource?resourceId=${resource.id}`)} color="primary" variant={locationPath === '/resource' ? 'solid' : 'outlined'} style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                            <TouchAppIcon sx={{ fontSize: 18 }} />
                                            <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>ACTIVE</span>
                                        </Button>
                                    </Col>
                                    <Col span={12} style={{ paddingRight: 0 }}>
                                        <Button onClick={() => navigate(`/resource/plan?resourceId=${resource.id}`)} color="primary" variant={locationPath === '/resource/plan' || locationPath === '/resource/plan/detail' ? 'solid' : 'outlined'} style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                            <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>PLAN</span>
                                        </Button>
                                    </Col>
                                </Row>
                                <Row gutter={[5]} style={{ width: "100%", margin: '5px 0px' }}>
                                    <Col span={12} style={{ paddingLeft: 0 }}>
                                        <Button onClick={() => navigate(`/resource/down?resourceId=${resource.id}`)} color="primary" variant={locationPath === '/resource/down' ? 'solid' : 'outlined'} style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
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
                                        <Button onClick={() => navigate(`/resource/mold?resourceId=${resource.id}`)} color="primary" variant={locationPath === '/resource/mold' ? 'solid' : 'outlined'} style={{ width: '100%', padding: '18px 0px', borderRadius: 3 }}>
                                            <HouseSidingIcon sx={{ fontSize: 18 }} />
                                            <span style={{ fontSize: '18px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>MOLD</span>
                                        </Button>
                                    </Col>
                                </Row>

                                {/* BACK BUTTON */}
                                <Row>
                                    <Col>
                                        <Button style={{ margin: '5px 0px' }} onClick={() => navigate(-1)} color="primary" variant="filled">
                                            <ArrowLeftOutlined />
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Sider>
                    <Layout
                        style={{
                            padding: '0px 5px 5px 10px',
                            backgroundColor: 'transparent',
                        }}
                    >
                        <Content
                            style={{
                                margin: 0,
                                marginTop: 5,
                                minHeight: 280,
                                borderRadius: 3,
                            }}
                        >
                            {children}
                        </Content>
                    </Layout>
                </Layout>
            </LayoutDashboard>
        </>
    );
};

ResourceLayout.propTypes = {
    children: PropTypes.node,
}

export default ResourceLayout;
