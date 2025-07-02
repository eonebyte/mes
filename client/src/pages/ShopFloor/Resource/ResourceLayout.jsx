import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LayoutDashboard from "../../../components/layouts/LayoutDashboard";
import { Button, Card, Col, Row, Skeleton } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PropTypes from "prop-types";
import { Layout } from 'antd';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchResourceById } from "../../../data/fetchs";
import { setResourceStore } from "../../../states/reducers/resourceSlice";
const { Sider, Content } = Layout;

// const downtimeCategories = [
//     { category: "RUNNING", code: "RR", color: "#52c41a", label: "RUNNING", textColor: "#000000" },           // abu, teks putih
//     { category: "IDLE", code: "R", color: "#8c8c8c", label: "IDLE", textColor: "#ffffff" },           // abu, teks putih
//     { category: "OFF", code: "R0", color: "#000", label: "OFF", textColor: "#fff" },        // putih, teks hitam
//     { category: "DANDORI & PREPARE", code: "R1", color: "#1677ff", label: "DANDORI & PREPARE", textColor: "#000000" }, // kuning, teks hitam
//     { category: "BACKUP MESIN LAIN", code: "R2", color: "#cf1322", label: "BACKUP MESIN LAIN", textColor: "#ffffff" }, // abu terang
//     { category: "TROUBLE MESIN", code: "R3", color: "#f5222d", label: "TROUBLE MESIN", textColor: "#fff" }, // merah, teks putih
//     { category: "TROUBLE MOLD", code: "R4", color: "#f5222d", label: "TROUBLE MOLD", textColor: "#fff" },
//     { category: "MATERIAL", code: "R5", color: "#fa8c16", label: "MATERIAL", textColor: "#000000" },
//     { category: "NO LOADING", code: "R6", color: "#f5222d", label: "NO LOADING", textColor: "#ffffff" },
//     { category: "PACKING", code: "R7", color: "#91caff", label: "PACKING", textColor: "#000000" }, // biru, teks putih
//     { category: "TROUBLE SHOOTING", code: "R8", color: "#ffbb96", label: "TROUBLE SHOOTING", textColor: "#000000" },
//     { category: "ISTIRAHAT", code: "R9", color: "#eb2f96", label: "ISTIRAHAT", textColor: "#fff" },
//     { category: "WAITING", code: "WAIT", color: "#faad14", label: "WAITING", textColor: "#000000" },
// ];

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

// const getResourceDisplayInfo = (downs, status) => {
//     const match = downtimeCategories.find(item => item.code === status);
//     return match ? { color: match.color, label: match.label, textColor: match.textColor } : { color: "#fff", label: "" };
// };



const ResourceLayout = ({ children }) => {
    const dispatch = useDispatch();

    const refreshCounter = useSelector(state => state.resources.refreshCounter);

    const [downtimeCategories, setDowntimeCategories] = useState([]);

    const getResourceDisplayInfo = (status) => {
        const match = downtimeCategories.find(item => item.code === status);
        return match ? { color: match.color, label: match.category, textColor: match.textColor } : { color: "#fff", category: "" };
    };

    const fetchDownCategories = async () => {
        try {
            const res = await fetch(`${backendUrl}${prefix}/down/categories`);

            const response = await res.json();

            console.log("Response from server:", response);

            if (Array.isArray(response.data)) {
                setDowntimeCategories(response.data);
                console.log("Set buttons with data:", response.data);
            } else {
                console.warn("Unexpected data format:", response);
            }

        } catch (error) {
            console.error("Failed to fetch down categories data:", error);
        }
    };



    const navigate = useNavigate();
    const location = useLocation();
    const locationPath = location.pathname;
    const [searchParams] = useSearchParams();
    const resourceId = Number(searchParams.get("resourceId"));  // Ambil resourceId dari URL

    const resources = useSelector((state) => state.resources);  // Get the resources from Redux store
    const resourceFromStore = Array.isArray(resources) ? resources.find(res => res.id === resourceId) : null;

    const [resource, setResource] = useState(resourceFromStore);  // Use resource from Redux initially
    const [loading, setLoading] = useState(!resourceFromStore);



    const loadResource = async () => {
        setLoading(true);
        try {
            const fetchedResource = await fetchResourceById(resourceId);
            setResource(fetchedResource);  // Set data resource ke state lokal
            // Dispatch data ke Redux store jika ingin menyimpan untuk penggunaan selanjutnya
            dispatch(setResourceStore(fetchedResource));
        } catch (error) {
            console.error("Error fetching resource:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('REFRESH TRIGGERED');
        loadResource();
        fetchDownCategories();
    }, [refreshCounter]);

    useEffect(() => {
        if (!resourceFromStore && resourceId) { // Jika resource belum ada di Redux dan resourceId ada
            loadResource();
            fetchDownCategories();
        }

    }, [resourceId, navigate, dispatch]);

    // Redirect jika resource tidak ditemukan
    useEffect(() => {
        if (resource === null && !loading) {
            navigate("/shopfloor");  // Redirect jika data resource null
        }
    }, [resource, loading, navigate]);



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
                                {loading ?
                                    <Card
                                        style={{
                                            width: '100%',
                                            border: 0,
                                            borderRadius: 3,
                                        }}
                                        styles={{
                                            body: {
                                                padding: '5px 5px'
                                            }
                                        }}
                                    >
                                        <Skeleton active paragraph={{ rows: 5 }} />
                                    </Card>
                                    :

                                    <Card
                                        style={{
                                            width: '100%',
                                            border: 0,
                                            borderRadius: 3,
                                            color: 'black',
                                            backgroundColor: resource ? getResourceDisplayInfo(resource.status).color : '#fff'
                                        }}
                                        styles={{
                                            body: {
                                                padding: '5px 5px'
                                            }
                                        }}
                                    >
                                        <p style={{
                                            marginBottom: 0,
                                            fontWeight: 'bold',
                                            margin: 0,
                                            color: resource ? getResourceDisplayInfo(resource.status).textColor : '#000',
                                        }}>{resource.line} | {resource.code}</p>
                                        <p style={{
                                            marginBottom: 0,
                                            margin: 0,
                                            color: resource ? getResourceDisplayInfo(resource.status).textColor : '#000',
                                        }}>{resource.name}</p>
                                        <img src={resource.image} alt={resource.name} style={{ maxWidth: '100%' }} />
                                        <p style={{
                                            fontWeight: 'bold',
                                            margin: 0,
                                            color: resource ? getResourceDisplayInfo(resource.status).textColor : '#000',
                                        }}>
                                            {resource ? getResourceDisplayInfo(resource.status).label : ''}
                                        </p>
                                    </Card>
                                }

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
