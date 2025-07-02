// src/pages/Resource/Active/SinglePlanCard.js

import {
    Card, Col, Flex, Row, Spin, Button, Typography
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import GppBadIcon from '@mui/icons-material/GppBad';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchMovementLines, fetchProductionDefects } from "../../../data/fetchs";
import { refreshResources } from "../../../states/reducers/resourceSlice";

// Import semua komponen Modal/Dialog yang Anda butuhkan
import ConfirmSetup from "../../../components/Buttons/ConfirmSetup";
import ConfirmStartActive from "../../../components/Buttons/ConfirmStartActive";
import ConfirmHold from "../../../components/Buttons/ConfirmHold";
import ConfirmComplete from "../../../components/Buttons/ConfirmComplete";
import ConfirmMaterialNew from "../../../components/Buttons/ConfirmMaterialNew";
import InputOutput from "../../../components/Buttons/InputOutput";
import InputDefect from "../../../components/Buttons/InputDefect";
import InputLost from "../../../components/Buttons/InputLost";
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";

const SinglePlanCard = ({ plan, user, isDarkMode, onActionSuccess }) => {
    const dispatch = useDispatch();

    // State untuk modal, spesifik untuk kartu ini
    const [openSetupModal, setOpenSetupModal] = useState(false);
    const [openHoldModal, setOpenHoldModal] = useState(false);
    const [openCompleteModal, setOpenCompleteModal] = useState(false);
    const [openMaterialModal, setOpenMaterialModal] = useState(false);
    const [openOutputModal, setOpenOutputModal] = useState(false);
    const [openInputDefectModal, setOpenInputDefectModal] = useState(false);
    const [openInputLostModal, setOpenInputLostModal] = useState(false);

    // State untuk data detail yang diambil secara spesifik untuk plan ini
    const [details, setDetails] = useState({
        outputQty: 0,
        defectQty: 0,
        lostQty: 0,
        lastProductionOutput: 0,
        productionDefects: [],
        movementLines: {}
    });
    const [loadingDetails, setLoadingDetails] = useState(true);

    // Fungsi untuk memuat data detail untuk plan ini
    const loadPlanDetails = async () => {
        if (!plan?.planId) return;
        setLoadingDetails(true);
        try {
            const [defects, movements] = await Promise.all([
                fetchProductionDefects(plan.planId),
                fetchMovementLines(plan.planId)
            ]);

            const totalDefectQty = (defects || []).reduce((sum, d) => sum + parseInt(d.qty || 0), 0);

            let totalOutputQty = 0, totalLostQty = 0, lastOutput = 0;
            if (Array.isArray(plan.productionHistories) && plan.productionHistories.length > 0) {
                totalOutputQty = plan.productionHistories.reduce((sum, m) => sum + parseInt(m.productionqty || 0), 0);
                totalLostQty = plan.productionHistories.reduce((sum, m) => sum + parseInt(m.lostqty || 0), 0);
                const lastEntry = plan.productionHistories[plan.productionHistories.length - 1];
                lastOutput = parseInt(lastEntry.productionqty || 0);
            }

            setDetails({
                outputQty: totalOutputQty,
                defectQty: totalDefectQty,
                lostQty: totalLostQty,
                lastProductionOutput: lastOutput,
                productionDefects: defects || [],
                movementLines: movements || {}
            });
        } catch (error) {
            console.error(`Failed to load details for plan ${plan.planId}:`, error);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        loadPlanDetails();
    }, [plan.planId]);

    // Kalkulasi spesifik untuk kartu ini
    const { outputQty, defectQty, lostQty } = details;
    const toGoQty = useMemo(() => (plan ? plan.qty - outputQty : 0), [plan, outputQty]);
    const goodQty = useMemo(() => (outputQty - (defectQty + lostQty)), [outputQty, defectQty, lostQty]);

    // Handler ketika sebuah aksi berhasil
    const handleSuccess = () => {
        if (onActionSuccess) onActionSuccess();
    };

    const handleSuccessAndRefresh = () => {
        handleSuccess();
        dispatch(refreshResources());
    };

    return (
        <Card
            key={plan.planId}
            title={
                <Flex align="center" justify="space-between">
                    <Typography.Text strong style={{ color: isDarkMode ? '#e6f7ff' : 'inherit' }}>
                        Task: {plan.planNo}
                    </Typography.Text>
                    <MoreOutlined style={{ color: isDarkMode ? '#e6f7ff' : 'inherit', cursor: 'pointer' }} />
                </Flex>
            }
            style={{
                border: 0, borderRadius: 3, marginBottom: '20px',
                boxShadow: isDarkMode ? '0 1px 4px rgba(255, 255, 255, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.2)'
            }}
            styles={{
                header: { border: 0, backgroundColor: isDarkMode ? '#1f2a38' : '#f6ffed', borderRadius: '3px 3px 0 0', padding: '0 16px' },
                body: { padding: "10px 16px" }
            }}
            size="small"
        >
            <Spin spinning={loadingDetails} tip="Loading task details...">
                {/* --- TOP ACTIONS --- */}
                <Row gutter={[16]} style={{ borderBottom: '1px solid #e8e8e8', marginBottom: 10, paddingBottom: 5 }}>
                    <Col span={24}>
                        <Button type="text" icon={<SettingsIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenSetupModal(true)}>SETUP</Button>
                        <ConfirmSetup open={openSetupModal} onClose={() => setOpenSetupModal(false)} onSuccess={handleSuccess} resourceId={plan.resourceId} />

                        {plan.resourceStatus !== 'RR' && (
                            <Button type="text" icon={<PowerSettingsNewIcon sx={{ fontSize: 18 }} />} onClick={() => ConfirmStartActive({ planId: plan.planId, resourceId: plan.resourceId, onSuccess: handleSuccessAndRefresh })}>START</Button>
                        )}
                        <Button type="text" icon={<DoneIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenHoldModal(true)}>HOLD</Button>
                        <ConfirmHold planId={plan.planId} resourceId={plan.resourceId} open={openHoldModal} onClose={() => setOpenHoldModal(false)} onSuccess={handleSuccess} userId={user?.id} productionId={plan.productionId} lastProductionOutput={details.lastProductionOutput} togoQty={toGoQty} outputQty={outputQty} />

                        <Button type="text" icon={<DoneIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenCompleteModal(true)}>COMPLETE</Button>
                        <ConfirmComplete planId={plan.planId} resourceId={plan.resourceId} open={openCompleteModal} onClose={() => setOpenCompleteModal(false)} onSuccess={handleSuccess} userId={user?.id} productionId={plan.productionId} lastProductionOutput={details.lastProductionOutput} togoQty={toGoQty} outputQty={outputQty} />

                        <Button type="text" icon={<WarehouseIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenMaterialModal(true)}>MATERIAL</Button>
                        <ConfirmMaterialNew movementLines={details.movementLines} open={openMaterialModal} onClose={() => setOpenMaterialModal(false)} />
                    </Col>
                </Row>

                {/* --- PLAN DETAILS --- */}
                <Row gutter={[16]}>
                    <Col lg={7}>
                        <div>JO No.</div> <div style={{ marginBottom: 10 }}><strong>{plan.planNo}</strong></div>
                        <div>Part No.</div> <div style={{ marginBottom: 10 }}><strong>{plan.partNo}</strong></div>
                    </Col>
                    <Col lg={4}>
                        <div>ToGo Qty</div> <div style={{ marginBottom: 10 }}><strong>{plan.togoqty ?? toGoQty}</strong></div>
                        <div>Prod Qty</div> <div style={{ marginBottom: 10 }}><strong>{outputQty}</strong></div>
                    </Col>
                    <Col lg={4}>
                        <div>Good Qty</div> <div style={{ marginBottom: 10 }}><strong>{goodQty}</strong></div>
                        <div>Defect Qty</div> <div style={{ marginBottom: 10 }}><strong>{defectQty}</strong></div>
                    </Col>
                    <Col lg={9}>
                        <Flex align="flex-start" justify="space-between">
                            <div>
                                <div>Part Desc</div> <div style={{ marginBottom: 10 }}><strong>{plan.part_desc || '-'}</strong></div>
                                <div>Cavity</div> <div style={{ marginBottom: 10 }}><strong>{plan.cavity}</strong></div>
                            </div>
                            <RemainingPlanDetail planQty={plan.qty} toGoQty={toGoQty} outputQty={outputQty} CT={plan.cycletime} />
                        </Flex>
                    </Col>
                </Row>

                {/* --- BOTTOM ACTIONS --- */}
                <Row style={{ marginTop: 5 }}>
                    <Col span={24}>
                        <Button type="text" icon={<TaskOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenOutputModal(true)}>PRODUCTION</Button>
                        <InputOutput productionId={plan.productionId} open={openOutputModal} onClose={() => setOpenOutputModal(false)} onSuccess={handleSuccess} userId={user?.id} productionHistories={plan.productionHistories} />

                        <Button type="text" icon={<GppBadIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenInputDefectModal(true)}>DEFECT</Button>
                        <InputDefect moldId={plan.moldId} open={openInputDefectModal} onClose={() => setOpenInputDefectModal(false)} onSuccess={handleSuccess} userId={user?.id} productionId={plan.productionId} productionDefects={details.productionDefects} />

                        <Button type="text" icon={<NotListedLocationIcon sx={{ fontSize: 18 }} />} onClick={() => setOpenInputLostModal(true)}>LOST</Button>
                        <InputLost moldId={plan.moldId} open={openInputLostModal} onClose={() => setOpenInputLostModal(false)} onSuccess={handleSuccess} userId={user?.id} productionHistories={plan.productionHistories} />
                    </Col>
                </Row>

                {/* --- STATION --- */}
                <h4 style={{ marginTop: 15, marginBottom: 5 }}>Station</h4>
                <Card size="small" style={{ width: 'fit-content', boxShadow: 'none', border: `1px solid ${isDarkMode ? '#444' : '#d9d9d9'}` }}>
                    <Row wrap={false} align="middle">
                        <Col>
                            <div style={{ backgroundColor: '#1677FF', color: 'white', padding: '10px 15px', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}>
                                <span style={{ fontSize: 32, fontWeight: 'bold' }}>{plan.lineno}</span>
                            </div>
                        </Col>
                        <Col style={{ padding: '0 15px', lineHeight: '1.3' }}>
                            <strong style={{ fontSize: 20 }}>{plan.mcno}</strong><br />
                            <span style={{ fontSize: 16 }}>{plan.moldName}</span>
                        </Col>
                    </Row>
                </Card>
            </Spin>
        </Card>
    );
};

SinglePlanCard.propTypes = {
    plan: PropTypes.object.isRequired,
    user: PropTypes.object,
    isDarkMode: PropTypes.bool.isRequired,
    onActionSuccess: PropTypes.func.isRequired,
};

export default SinglePlanCard;