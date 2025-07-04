import { Alert, Button, Card, Col, Empty, Flex, Row, Spin, Typography } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import SettingsIcon from '@mui/icons-material/Settings';
// import DoneIcon from '@mui/icons-material/Done';
// import TableChartIcon from '@mui/icons-material/TableChart';
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";
import GppBadIcon from '@mui/icons-material/GppBad';
// import DatasetIcon from '@mui/icons-material/Dataset';
// import ScienceIcon from '@mui/icons-material/Science';
// import PolicyIcon from '@mui/icons-material/Policy';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate, useSearchParams } from "react-router-dom";
import ResourceLayout from "./ResourceLayout";
import { useEffect, useMemo, useState } from "react";
import ConfirmSetup from "../../../components/Buttons/ConfirmSetup";
// import ChangeCavity from "../../../components/Buttons/ChangeCavity";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlanActive, fetchProductionDefects, fetchResourceById } from "../../../data/fetchs";
// import ConfirmStartActive from "../../../components/Buttons/ConfirmStartActive";
import ConfirmComplete from "../../../components/Buttons/ConfirmComplete";
import { refreshResources } from "../../../states/reducers/resourceSlice";
// import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
// import GroupWorkIcon from '@mui/icons-material/GroupWork';
import InputDefect from "../../../components/Buttons/InputDefect";
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import InputOutput from "../../../components/Buttons/InputOutput";
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import InputLost from "../../../components/Buttons/InputLost";
// import ConfirmHold from "../../../components/Buttons/ConfirmHold";



function ActiveResource() {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    // const [openCavityModal, setOpenCavityModal] = useState(false);
    const [openOutputModal, setOpenOutputModal] = useState(false);
    const [openInputDefectModal, setOpenInputDefectModal] = useState(false);
    const [openCompleteModal, setOpenCompleteModal] = useState(false);
    // const [openHoldModal, setOpenHoldModal] = useState(false);
    const [openInputLostModal, setOpenInputLostModal] = useState(false);

    const user = useSelector((state) => state.auth.user);

    const [searchParams] = useSearchParams();
    const resourceId = useMemo(() => Number(searchParams.get('resourceId')), [searchParams]);
    const { isDarkMode } = useSelector((state) => state.theme); // Dark mode state


    const [resource, setResource] = useState(null);
    const [plan, setPlan] = useState(null);
    const [outputQty, setOutputQty] = useState(0);
    const [defectQty, setDefectQty] = useState(0);
    const [lostQty, setLostQty] = useState(0);
    const [lastProductionOutput, setLastProductionOutput] = useState(0);  // Tambah state baru

    const [loading, setLoading] = useState(true);
    const [productionDefects, setProductionDefects] = useState([]);

    const [showConfirm, setShowConfirm] = useState(false);

    const handleOpenConfirm = () => setShowConfirm(true);
    const handleCloseConfirm = () => setShowConfirm(false);

    const loadResourceAndPlan = async () => {

        setLoading(true);
        // Fetch resource data
        const fetchedResource = await fetchResourceById(resourceId);
        setResource(fetchedResource);
        // Fetch plan data
        if (fetchedResource) {
            const fetchedPlan = await fetchPlanActive(resourceId);
            // Set quantities and resource status based on the fetched plan data
            if (fetchedPlan) {
                const fetchedProductionDefects = await fetchProductionDefects(fetchedPlan.planId);
                setProductionDefects(fetchedProductionDefects);
                let totalDefectQty = 0;
                if (Array.isArray(fetchedProductionDefects)) {
                    totalDefectQty = fetchedProductionDefects.reduce((sum, defect) => parseInt(sum) + parseInt(defect.qty), 0);
                }
                setDefectQty(totalDefectQty);
                setPlan(fetchedPlan);

                let totalOutputQty = 0;
                let totalLostQty = 0;
                let lastOutput = 0;


                if (Array.isArray(fetchedPlan.productionHistories) && fetchedPlan.productionHistories.length > 0) {
                    totalOutputQty = fetchedPlan.productionHistories.reduce((sum, mqty) => parseInt(sum) + parseInt(mqty.productionqty), 0);
                    totalLostQty = fetchedPlan.productionHistories.reduce((sum, mqty) => parseInt(sum) + parseInt(mqty.lostqty), 0);

                    // Ambil output terakhir
                    const lastEntry = fetchedPlan.productionHistories[fetchedPlan.productionHistories.length - 1];
                    lastOutput = parseInt(lastEntry.productionqty);
                }
                setOutputQty(totalOutputQty);
                setLostQty(totalLostQty);
                setLastProductionOutput(lastOutput);  // Set state baru
            }
        }

        setLoading(false);
    };

    const handleSuccess = () => {
        setShowConfirm(false);
        loadResourceAndPlan();
        dispatch(refreshResources());
        navigate(`/resource/plan?resourceId=${resourceId}`);
    };

    const handleSuccessOnActive = () => {
        setShowConfirm(false);
        loadResourceAndPlan();
        dispatch(refreshResources());
        navigate(`/resource?resourceId=${resourceId}`);
    };


    useEffect(() => {
        if (resourceId) {
            loadResourceAndPlan();
        }
    }, [resourceId]);

    const toGoQty = useMemo(() => plan ? plan.qty - outputQty : 0, [plan, outputQty]);
    const goodQty = useMemo(() => outputQty ? outputQty - (defectQty + lostQty) : 0, [outputQty, defectQty, lostQty]);

    console.log('this plan :', plan);

    return (
        <ResourceLayout>
            {loading ?
                (<Col
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
                </Col>)
                :
                (
                    <>
                        {!plan || !Array.isArray(plan.job_orders) || plan.job_orders.length === 0 ?
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<Typography.Text>No active plan</Typography.Text>}
                            /> :
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
                                                onClick={handleOpenConfirm}
                                            >
                                                <SettingsIcon sx={{ fontSize: 18 }} />
                                                <span>SETUP</span>
                                            </Button>
                                            <ConfirmSetup
                                                open={showConfirm}
                                                onClose={handleCloseConfirm}
                                                onSuccess={handleSuccessOnActive}
                                                resourceId={plan.resourceId}
                                            />
                                            {/* {plan.resourceStatus !== 'RR' && (
                                                <Button
                                                    color="primary"
                                                    variant="text"
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily: "'Roboto', Arial, sans-serif",
                                                        fontSize: "12px",
                                                        padding: "4px 12px",
                                                    }}
                                                    onClick={() => ConfirmStartActive({
                                                        planId: plan.planId,
                                                        resourceId: plan.resourceId,
                                                        onSuccess: () => {
                                                            loadResourceAndPlan();
                                                            dispatch(refreshResources());
                                                        }
                                                    })}
                                                >
                                                    <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                                                    <span>START</span>
                                                </Button>
                                            )} */}
                                            {/* <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                                onClick={() => setOpenHoldModal(true)}
                                            >
                                                <DoneIcon sx={{ fontSize: 18 }} />
                                                <span>HOLD</span>
                                            </Button>
                                            <ConfirmHold
                                                planId={parseInt(plan.planId)}
                                                resourceId={parseInt(plan.resourceId)}
                                                open={openHoldModal}
                                                onClose={() => setOpenHoldModal(false)}
                                                onSuccess={handleSuccess}
                                                userId={user ? parseInt(user.id) : null}
                                                productionId={parseInt(plan.productionId)}
                                                lastProductionOutput={parseInt(lastProductionOutput)}
                                                togoQty={parseInt(toGoQty)}
                                                outputQty={parseInt(outputQty)}
                                            />
                                            <Button
                                                color="primary"
                                                variant="text"
                                                style={{
                                                    fontWeight: 600,
                                                    fontFamily: "'Roboto', Arial, sans-serif",
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                }}
                                                onClick={() => setOpenCompleteModal(true)}
                                            >
                                                <DoneIcon sx={{ fontSize: 18 }} />
                                                <span>COMPLETE</span>
                                            </Button> */}
                                            <ConfirmComplete
                                                planId={parseInt(plan.planId)}
                                                resourceId={parseInt(plan.resourceId)}
                                                open={openCompleteModal}
                                                onClose={() => setOpenCompleteModal(false)}
                                                onSuccess={handleSuccess}
                                                userId={user ? parseInt(user.id) : null}
                                                productionId={parseInt(plan.productionId)}
                                                lastProductionOutput={parseInt(lastProductionOutput)}
                                                togoQty={parseInt(toGoQty)}
                                                outputQty={parseInt(outputQty)}
                                            />
                                        </Col>
                                    </Row>

                                    {/* Body Row */}
                                    {plan.job_orders.map((plan) => (
                                        <>
                                            <Row gutter={[16]}>
                                                <Col lg={7} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                                    <div>JO No.</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.planNo}</strong></div>
                                                    <div>Part No.</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.partNo}</strong></div>
                                                    <div>Order No.</div>
                                                    <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div>ToGo Qty</div>
                                                    <div style={{ marginBottom: 10 }}><strong>{plan.togoqty ? plan.togoqty : toGoQty}</strong></div>
                                                    <div>Production Qty</div>
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
                                                    <div style={{ marginBottom: 10 }}><strong>{lostQty}</strong></div>
                                                </Col>
                                                <Col lg={9}>

                                                    <Flex align="flex-start" justify="space-between">
                                                        <div>
                                                            <div>Part Desc</div>
                                                            <div style={{ marginBottom: 10 }}><strong>{plan.part_desc ? plan.part_desc : '-'}</strong></div>
                                                            <div>Cavity</div>
                                                            <div style={{ marginBottom: 10 }}><strong>{plan.cavity}</strong></div>
                                                            <div>Part Drawing #</div>
                                                            <div style={{ marginBottom: 10 }}><strong>-</strong></div>
                                                        </div>
                                                        {resource ? (
                                                            <RemainingPlanDetail planQty={plan.qty} toGoQty={plan.qty - outputQty} outputQty={outputQty} CT={parseInt(plan.cycletime)} />
                                                        ) : (
                                                            <p>No resource found</p>
                                                        )}
                                                    </Flex>
                                                </Col>
                                            </Row>
                                        </>
                                    ))}


                                    {/* Button Row */}
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
                                                onClick={() => setOpenOutputModal(true)}
                                            >
                                                <TaskOutlinedIcon sx={{ fontSize: 18 }} />
                                                <span>PRODUCTION</span>
                                            </Button>
                                            {openOutputModal && (
                                                <InputOutput
                                                    productionId={parseInt(plan.productionId)}
                                                    open={openOutputModal}
                                                    onClose={() => setOpenOutputModal(false)}
                                                    onSuccess={handleSuccessOnActive}
                                                    userId={user ? parseInt(user.id) : null}
                                                    productionHistories={plan.productionHistories}
                                                />
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
                                                onClick={() => setOpenInputDefectModal(true)}
                                            >
                                                <GppBadIcon sx={{ fontSize: 18 }} />
                                                <span>DEFECT</span>
                                            </Button>
                                            {openInputDefectModal && (
                                                <InputDefect
                                                    moldId={parseInt(plan.moldId)}
                                                    open={openInputDefectModal}
                                                    onClose={() => setOpenInputDefectModal(false)}
                                                    onSuccess={handleSuccessOnActive}
                                                    userId={user ? parseInt(user.id) : null}
                                                    productionId={parseInt(plan.productionId)}
                                                    productionDefects={productionDefects}
                                                />
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
                                                onClick={() => setOpenInputLostModal(true)}
                                            >
                                                <NotListedLocationIcon sx={{ fontSize: 18 }} />
                                                <span>LOST</span>
                                            </Button>
                                            {openInputLostModal && (
                                                <InputLost
                                                    moldId={plan.moldId}
                                                    open={openInputLostModal}
                                                    onClose={() => setOpenInputLostModal(false)}
                                                    onSuccess={handleSuccessOnActive}
                                                    userId={user ? parseInt(user.id) : null}
                                                    productionHistories={plan.productionHistories}
                                                />
                                            )}

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
                                                                {plan.lineno}
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
                                                            <strong style={{ marginRight: 50, marginLeft: 15, fontSize: 24 }}>{plan.mcno}</strong>
                                                            <span style={{ marginRight: 50, marginLeft: 15, fontSize: 20 }}>{plan.moldName}</span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card>
                            </>
                        }

                    </>
                )
            }


        </ResourceLayout>
    );
}

export default ActiveResource;