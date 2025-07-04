import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Divider, Select, Spin, Steps, theme } from 'antd';
import LayoutDashboard from '../../../components/layouts/LayoutDashboard';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UploadIcon from '@mui/icons-material/Upload';
import { fetchMolds, fetchResourceById } from '../../../data/fetchs';

const backendUrl = 'http://localhost:3080';
const prefix = '/api/v1';

const StepMoldSetup = () => {
    const navigate = useNavigate();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(1);
    const [selectedOption, setSelectedOption] = useState(null);
    const [molds, setMolds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);

    console.log('this : ', resource);
    



    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const moldsData = await fetchMolds();
                if (Array.isArray(moldsData)) {
                    const formattedMolds = moldsData.map(mold => ({
                        value: mold.m_product_id,
                        label: mold.name
                    }));
                    setMolds(formattedMolds);
                } else {
                    setMolds([]);
                    console.error("Fetched data is not an array");
                }
            } catch (error) {
                setMolds([]);  // In case of error, set an empty array
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        const getResource = async () => {
            if (!resourceId) return; // Cegah fetch jika ID tidak ada

            const data = await fetchResourceById(resourceId);
            setResource(data); // Set hasil ke state
            setLoading(false);
        };

        getResource();
    }, [resourceId]);

    const next = () => {
        if (selectedOption) {
            setCurrent(current + 1);
        }
    };

    const handleSelectChange = (_, option) => {
        setSelectedOption({
            id: option.value,    // Simpan ID mold
            label: option.label, // Simpan Nama mold
        });
    };


    const handleSetup = async () => {
        if (!selectedOption?.id || !resource?.id) {
            console.error("Resource atau Mold belum dipilih!");
            return;
        }

        setLoading(true); // Show loading spinner

        try {
            const response = await fetch(`${backendUrl}${prefix}/mold/setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resourceId: resource.id,
                    moldId: selectedOption.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menyimpan data!');
            }
            console.log("Setup berhasil!");
            navigate(`/resource/mold?resourceId=${resource.id}`);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const steps = [
        {
            title: 'Resource Code',
            description: resource ? resource.name : ''
        },
        {
            title: 'Mold #',
            description: current >= 2 ? selectedOption?.label : '',
            content: (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px', margin: '10px, 0px' }}>
                        <Select
                            showSearch
                            placeholder="Select a Mold"
                            onChange={handleSelectChange}
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            options={molds}
                            style={{ width: '250px', textAlign: 'left' }} />
                        <button
                            onClick={next}
                            disabled={!selectedOption}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: selectedOption ? 'pointer' : 'not-allowed',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                color: selectedOption ? 'inherit' : 'gray',
                            }}
                        >
                            <ArrowForwardIcon />
                        </button>
                    </div>
                </>
            ),
        },
        {
            title: 'Setup',
            content: (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px', margin: '10px, 0px' }}>
                        <span style={{ color: isDarkMode ? 'white' : 'black', marginRight: 15, fontSize: 18 }}>{current >= 2 ? selectedOption?.label : ''}</span>
                        <ArrowForwardIcon style={{ color: isDarkMode ? 'white' : '#000' }} />
                        <span style={{ color: isDarkMode ? 'white' : 'black', marginLeft: 15, fontSize: 18 }}>{resource ? resource.name : ''}</span>

                    </div>
                    <div style={{ lineHeight: 0, marginBottom: 15 }}>
                        <Button onClick={handleSetup} type='primary'>
                            <UploadIcon /> SETUP
                        </Button>
                    </div>
                </>
            ),
        },
    ];

    const items = steps.map((item) => ({
        key: item.title,
        title: (
            <span style={{ fontSize: '14px', color: '#8c8c8c' }}> {/* Kecilkan title */}
                {item.title}
            </span>
        ),
        description: (
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: isDarkMode ? 'white' : '#000' }}> {/* Perbesar dan bold description */}
                {item.description || ''}
            </span>
        ),
    }));
    const contentStyle = {
        lineHeight: '260px',
        textAlign: 'center',
        color: token.colorTextTertiary,
        backgroundColor: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: `1px dashed ${token.colorBorder}`,
        marginTop: 10,
    };




    return (
        <>
            <LayoutDashboard>
                {loading ? <Col
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
                </Col> :
                    <Card
                        style={{
                            marginTop: 5
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <DeveloperBoardIcon />
                            <div style={{ lineHeight: 1.2 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                                    <span>Mold Setup</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                                    <span>Mold Setup Operation</span>
                                </div>
                            </div>
                        </div>
                        <Divider style={{ margin: '10px 0px' }} />

                        <Steps current={current} items={items} />
                        <div style={contentStyle}>{steps[current].content}</div>
                        <div
                            style={{
                                marginTop: 24,
                            }}
                        >
                        </div>
                    </Card>
                }

            </LayoutDashboard>
        </>
    );
};
export default StepMoldSetup;