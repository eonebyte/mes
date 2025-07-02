import { Col, Flex, Row, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { fetchProductionDefects } from "../../../data/fetchs";
import RemainingPlanDetail from "../../../components/ShopFloors/Plan/RemainingPlanDetail";

const PlanDetailRow = ({ plan, resource }) => {
    const [details, setDetails] = useState({ outputQty: 0, defectQty: 0, lostQty: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetails = async () => {
            if (!plan?.planId) return;
            setLoading(true);
            try {
                const defects = await fetchProductionDefects(plan.planId);
                const totalDefectQty = (defects || []).reduce((sum, d) => sum + (parseInt(d.qty, 10) || 0), 0);
                
                let totalOutputQty = 0;
                let totalLostQty = 0;
                if (Array.isArray(plan.productionHistories) && plan.productionHistories.length > 0) {
                    totalOutputQty = plan.productionHistories.reduce((sum, m) => sum + (parseInt(m.productionqty, 10) || 0), 0);
                    totalLostQty = plan.productionHistories.reduce((sum, m) => sum + (parseInt(m.lostqty, 10) || 0), 0);
                }

                setDetails({
                    outputQty: totalOutputQty,
                    defectQty: totalDefectQty,
                    lostQty: totalLostQty
                });
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, [plan]);

    const { outputQty, defectQty, lostQty } = details;
    const toGoQty = useMemo(() => (plan.qty - outputQty), [plan.qty, outputQty]);
    const goodQty = useMemo(() => (outputQty - (defectQty + lostQty)), [outputQty, defectQty, lostQty]);

    if (loading) {
        return <Row justify="center" align="middle" style={{ minHeight: '100px' }}><Spin /></Row>;
    }

    return (
        <Row gutter={[16]} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Col lg={7}>
                <div>JO No.</div><div style={{ marginBottom: 10 }}><strong>{plan.planNo}</strong></div>
                <div>Part No.</div><div><strong>{plan.partNo}</strong></div>
            </Col>
            <Col lg={4}>
                <div>ToGo Qty</div><div style={{ marginBottom: 10 }}><strong>{toGoQty}</strong></div>
                <div>Prod. Qty</div><div><strong>{outputQty}</strong></div>
                <div>CT (s)</div><div><strong>{plan.cycletime}</strong></div>
            </Col>
            <Col lg={4}>
                <div>Good Qty</div><div style={{ marginBottom: 10 }}><strong>{goodQty}</strong></div>
                <div>Defect Qty</div><div style={{ marginBottom: 10 }}><strong>{defectQty}</strong></div>
                <div>Lost Qty</div><div><strong>{lostQty}</strong></div>
            </Col>
            <Col lg={9}>
                <Flex align="flex-start" justify="space-between">
                    <div>
                        <div>Part Desc</div><div style={{ marginBottom: 10 }}><strong>{plan.part_desc || '-'}</strong></div>
                        <div>Cavity</div><div><strong>{plan.cavity}</strong></div>
                    </div>
                    {resource ? (
                        <RemainingPlanDetail planQty={plan.qty} toGoQty={toGoQty} outputQty={outputQty} CT={parseInt(plan.cycletime)} />
                    ) : (
                        <p>No resource found</p>
                    )}
                </Flex>
            </Col>
        </Row>
    );
};

export default PlanDetailRow;