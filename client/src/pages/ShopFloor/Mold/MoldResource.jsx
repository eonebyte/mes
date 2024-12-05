import { Alert, Card, Col, Flex, Space, Spin, Tabs } from "antd";
import { resources } from "../../../data/fetchResource";
import { useNavigate, useSearchParams } from "react-router-dom";
import DetailResource from "../DetailResource";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import InputIcon from '@mui/icons-material/Input';
import RemainingMold from "../../../components/ShopFloors/Mold/RemainingMold";
import ConfirmTeardown from "../../../components/Buttons/ConfirmTeardown";

const onChange = (key) => {
    console.log(key);
};

function MoldResource() {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);

    console.log(resource);



    useEffect(() => {
        setTimeout(() => {
            const resourceData = resources.find((res) => res.id === Number(resourceId));
            setResource(resourceData);
            setLoading(false);
        }, 500);
    }, [resourceId]);

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
                children: (
                    <Card
                        style={{
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                            width: 300,
                            marginBottom: 16,
                            backgroundColor: isDarkMode ? '#333' : '#fff',
                            cursor: 'pointer',
                        }}
                        onClick={() => ConfirmTeardown('CL000006')}
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
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>CL000006</span>
                                </div>

                                {/* Available life cycles */}
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, marginBottom: 10 }}>
                                    <span style={{ fontSize: '14px' }}>Available life cycles</span>
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>71.5%</span>
                                </div>

                                {/* Setup Time */}
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <span style={{ fontSize: '14px' }}>Setup Time</span>
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>2024-11-13 00:42:55</span>
                                </div>
                            </div>

                            {/* Remaining Mold Chart */}
                            <div style={{ marginLeft: '20px' }}>
                                <RemainingMold target={500} progress={100} />
                            </div>
                        </div>

                    </Card>
                )
            },
            {
                label: (
                    <>
                        <Flex align="center">
                            <InputIcon sx={{ fontSize: 18, marginRight: 1 }} />
                            <span>
                                MOLD
                            </span>
                        </Flex>
                    </>
                ),
                key: "2",
                children: "This tab contains detailed information about the mold.",
            },
        ],
    };

    return (
        <DetailResource>
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
                            <div onClick={() => navigate(`/resource/mold/setup?resourceId=${resource.id}`)} style={{ cursor: 'pointer' }}>
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
                        <Tabs
                            onChange={onChange}
                            type="card"
                            items={moldTabData.tabs}
                        />
                    </Card>
                </>
            }
        </DetailResource>
    );
}

export default MoldResource;