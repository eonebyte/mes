import { Alert, Card, Col, Flex, notification, Space, Spin, Tabs } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResourceLayout from "./ResourceLayout";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import InputIcon from '@mui/icons-material/Input';
import RemainingMold from "../../../components/ShopFloors/Mold/RemainingMold";
import ConfirmTeardown from "../../../components/Buttons/ConfirmTeardown";
import { fetchResourceById } from "../../../data/fetchs";

const onChange = (key) => {
    console.log(key);
};

const backendUrl = 'http://localhost:3080';
const prefix = '/api/v1';

function MoldResource() {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    const resources = useSelector((state) => state.resources);  // Get the resources from Redux store
    const resourceFromStore = Array.isArray(resources) ? resources.find(res => res.id === resourceId) : null;

    const [resource, setResource] = useState(resourceFromStore);  // Use resource from Redux initially
    const [loading, setLoading] = useState(!resourceFromStore);

    console.log('this resource :', resource);

    const loadResource = async () => {
        setLoading(true);
        try {
            const fetchedResource = await fetchResourceById(resourceId);
            setResource(fetchedResource);  // Set data resource ke state lokal
            // Dispatch data ke Redux store jika ingin menyimpan untuk penggunaan selanjutnya
            // dispatch(setResources([...resources, fetchedResource])); 
        } catch (error) {
            console.error("Error fetching resource:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resourceFromStore && resourceId) { // Jika resource belum ada di Redux dan resourceId ada
            loadResource();
        }
    }, [resourceId, navigate, dispatch]);

    useEffect(() => {
        if (resource === null && !loading) {
            navigate("/shopfloor");  // Redirect jika data resource null
        }
    }, [resource, loading, navigate]);

    console.log('this : ', resource);


    const handleTeardown = async () => {
        if (!resource.mold_id || !resource.id) {
            console.error("Resource atau Mold belum dipilih!");
            return;
        }

        setLoading(true); // Show loading spinner

        try {
            const response = await fetch(`${backendUrl}${prefix}/mold/teardown`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resourceId: resource.id
                }),
            });

            const data = await response.json();

            if (!data.success) {
                const errorMessages = Array.isArray(data.messages)
                    ? data.messages.join(', ')
                    : data.message || 'Unknown error';

                throw new Error(errorMessages);
            }
            notification.success({
                message: 'Success',
                description: 'Teardown Mold Successfully',
            });
            console.log("Setup berhasil!");
            loadResource();
        } catch (error) {
            let description = error.message;

            let items = [];

            if (description.includes(', ')) {
                items = description.split(', ');
            } else {
                items = [description]; // kalau hanya 1 error, bungkus jadi array
            }


            // Render sebagai <ul> lengkap dengan link per item
            description = (
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {items.map((item, index) => {
                        let link = null;

                        if (item.toLowerCase().includes('bom')) {
                            link = (
                                <span
                                    style={{ marginLeft: 8, color: '#1677ff', cursor: 'pointer' }}
                                    onClick={() => navigate('/material')}
                                >
                                    → Klik tombol Material
                                </span>
                            );
                        } else if (item.toLowerCase().includes('job order aktif')) {
                            link = (
                                <span
                                    style={{ marginLeft: 8, color: '#1677ff', cursor: 'pointer' }}
                                    onClick={() => navigate(`/resource?resourceId=${resource?.id}`)}
                                >
                                    → Periksa
                                </span>
                            );
                        }


                        return (
                            <li key={index}>
                                {item}
                                {link}
                            </li>
                        );
                    })}
                </ul>
            );

            notification.error({
                message: 'Error',
                description, // gunakan variabel yang sudah diolah
            });

            console.error('Error:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const moldTabData = {
        tabs: [
            {
                label: (
                    <>
                        <Flex align="center">
                            <HouseSidingIcon sx={{ fontSize: 18, marginRight: 1 }} />
                            <span>
                                MOLD
                            </span>
                        </Flex>
                    </>
                ),
                key: "1",
                children: resource?.mold_id ? (
                    <Card
                        style={{
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                            width: 300,
                            marginBottom: 16,
                            backgroundColor: isDarkMode ? '#333' : '#fff',
                            cursor: 'pointer',
                        }}
                        onClick={() => ConfirmTeardown(resource.mold_name, handleTeardown)}
                        styles={{
                            body: { padding: 10 }
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* Informasi Mold */}
                            <div>
                                {/* Mold Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, marginBottom: 10 }}>
                                    <span style={{ fontSize: '14px' }}>Mold #</span>
                                    {resource && resource.mold_name ? (
                                        <span style={{ fontSize: '16px', fontWeight: '600' }}>{resource.mold_name}</span>
                                    ) : (
                                        <span>Loading mold name...</span>
                                    )}
                                </div>

                                {/* Available life cycles */}
                                {/* <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, marginBottom: 10 }}>
                                    <span style={{ fontSize: '14px' }}>Available life cycles</span>
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>71.5%</span>
                                </div> */}

                                {/* Setup Time */}
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <span style={{ fontSize: '14px' }}>Setup Time</span>
                                    {resource && resource.setuptime ? (
                                        <span style={{ fontSize: '16px', fontWeight: '600' }}>{resource.setuptime}</span>
                                    ) : (
                                        <span>Loading mold name...</span>
                                    )}
                                </div>
                            </div>

                            {/* Remaining Mold Chart */}
                            <div style={{ marginLeft: '20px' }}>
                                <RemainingMold target={500} progress={100} />
                            </div>
                        </div>

                    </Card>
                ) : (
                    <span style={{ fontSize: '14px', color: '#888' }}>Tidak ada mold terpasang</span> // Tampilkan pesan jika mold_id kosong
                )
            },
            {
                label: (
                    <>
                        <Flex align="center">
                            <InputIcon sx={{ fontSize: 18, marginRight: 1 }} />
                            <span>
                                MOLD HISTORY
                            </span>
                        </Flex>
                    </>
                ),
                key: "2",
                children: "COMING SOON",
            },
        ],
    };

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
                <>
                    {/* BODY CONTENT */}
                    <Card
                        title={
                            <div
                                onClick={() => {
                                    if (!resource.mold_id) {
                                        navigate(`/resource/mold/setup?resourceId=${resource[0]?.id}`);
                                    }
                                }}
                                style={{
                                    cursor: resource.mold_id ? 'not-allowed' : 'pointer',
                                    opacity: resource.mold_id ? 0.5 : 1
                                }}
                            >
                                <Flex align="center" justify="flex-start">
                                    <Space>
                                        <div
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '50%',
                                                backgroundColor: isDarkMode ? '#1890ff' : '#1890ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <SwipeUpIcon sx={{ fontSize: '24px', color: isDarkMode ? '#fff' : '#fff' }} />
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: isDarkMode ? '#e6f7ff' : 'inherit'
                                        }}>
                                            Setup Mold On Resource
                                        </p>
                                    </Space>
                                </Flex>
                            </div>
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
                                backgroundColor: isDarkMode ? '#2c3e50' : '#e6f4ff  ',
                                color: isDarkMode ? '#e6f4ff' : 'inherit',
                                borderRadius: '3px 3px 0px 0px',
                            },
                            body: {
                                padding: "5px 10px",
                                borderRadius: 3,
                            }
                        }}
                    >
                        {resource ? <Tabs
                            onChange={onChange}
                            type="card"
                            items={moldTabData.tabs}
                        /> : <span>Loading mold name...</span>
                        }
                    </Card>
                </>
            }
        </ResourceLayout>
    );
}

export default MoldResource;