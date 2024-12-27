import ProductionAchievement from "../components/Charts/ProductionAchievement";
import LayoutDashboard from "../components/layouts/LayoutDashboard";
// import MetricChart from "../components/Charts/MetricChart";
import { Row, Col, Card, Flex } from "antd";
import OEEChart from "../components/Charts/OEEChart";
import { useEffect, useState } from "react";
import OEEGauge from "../components/Charts/OEEGauge";
import StatusButton from "../components/Buttons/StatusButton";
import { useSelector } from "react-redux";

export default function OverAll() {

    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    const oeeData = [
        {
            metric: "Availability",
            values: [
                { id: 1, machine: "Machine 1", actualAvailableTime: 500, plannedAvailableTime: 600 },
                { id: 2, machine: "Machine 2", actualAvailableTime: 450, plannedAvailableTime: 600 },
                // tambahkan data untuk mesin lainnya...
            ]
        },
        {
            metric: "Performance",
            values: [
                { id: 1, machine: "Machine 1", actualProductionLine: 1000, plannedProductionLine: 1200 },
                { id: 2, machine: "Machine 2", actualProductionLine: 900, plannedProductionLine: 1000 },
                // tambahkan data untuk mesin lainnya...
            ]
        },
        {
            metric: "Quality",
            values: [
                { id: 1, machine: "Machine 1", goodQuantityProduced: 900, totalQuantityProduced: 1000 },
                { id: 2, machine: "Machine 2", goodQuantityProduced: 800, totalQuantityProduced: 900 },
                // tambahkan data untuk mesin lainnya...
            ]
        },
        {
            metric: "Utilization",
            values: [
                { id: 1, machine: "Machine 1", scheduleTime: 440, calendarTime: 480 },
                { id: 2, machine: "Machine 2", scheduleTime: 400, calendarTime: 480 },
                // tambahkan data untuk mesin lainnya...
            ]
        }
    ];

    const [metricData, setMetricData] = useState([]);

    useEffect(() => {
        const formattedData = oeeData.map(metric => {
            const formattedValues = metric.values.map(value => {

                const totalValues = metric.values.reduce((acc, value) => {
                    for (let key in value) {
                        if (typeof value[key] === 'number') {
                            acc[key] = (acc[key] || 0) + value[key];
                        }
                    }
                    return acc;
                }, {});
                let hours = 0;
                let percent = 0;

                switch (metric.metric) {
                    case "Availability":
                        hours = totalValues.actualAvailableTime;
                        percent = (totalValues.actualAvailableTime / totalValues.plannedAvailableTime) * 100;
                        break;
                    case "Performance":
                        hours = totalValues.actualProductionLine;
                        percent = (totalValues.actualProductionLine / totalValues.plannedProductionLine) * 100;
                        break;
                    case "Quality":
                        hours = totalValues.goodQuantityProduced;
                        percent = (totalValues.goodQuantityProduced / totalValues.totalQuantityProduced) * 100;
                        break;
                    case "Utilization":
                        hours = totalValues.scheduleTime;
                        percent = (totalValues.scheduleTime / totalValues.calendarTime) * 100;
                        break;
                    default:
                        break;
                }

                return { ...value, hours, percent };
            });

            return { ...metric, values: formattedValues };
        });

        setMetricData(formattedData);
    }, []);

    const gaugeValue = 0.8

    return (
        <>
            <LayoutDashboard>
                <>
                    <Row gutter={[8, 8]} style={{ maxWidth: '100%', margin: 0, marginTop: 5 }}>
                            <StatusButton />
                    </Row>
                </>
                {/* ==================================================== */}
                <Row style={{ marginTop: 5 }} gutter={[16, 8]}>
                    <Col md={17} lg={17}>
                        <Card size="small" style={{ 
                            border: 0,
                            backgroundColor: isDarkMode ? 'rgb(33, 33, 33, 0.1)' : 'rgb(255, 255, 255, 0.7)',
                            boxShadow: isDarkMode ? '0 2px 10px rgba(255, 255, 255, 0.2)' : '0 2px 10px rgba(0, 0, 0, 1)',
                             }}>
                            <Row gutter={[16, 8]}>
                                <Col span={12} style={{ 
                                    position: 'relative' }}>
                                    <h2 style={{ position: 'absolute', top: -25, left: 10 }}>OEE</h2>
                                    <OEEGauge value={gaugeValue} style={{margin: 0, padding: 0}} />
                                    </Col>
                                    <Col span={12}>
                                        <Row gutter={[8, 8]}>
                                        {metricData.map(metric => (
                                                <Col span={12} key={metric.metric}>
                                                    <Card size="small" style={{ 
                                                        backgroundColor: isDarkMode ? 'rgb(33, 33, 33, 0.1)' : 'rgb(255, 255, 255, 0.7)',
                                                        boxShadow: isDarkMode ? '0 2px 10px rgba(255, 255, 255, 0.2)' : '0 2px 10px rgba(0, 0, 0, 1)',
                                                         }}>
                                                        <Row gutter={[16, 8]}>
                                                            <Flex gap="small" align="center">
                                                                <Col span={12}>
                                                                <p style={{ margin: 0 }}>{metric.metric}</p>
                                                                <p style={{ margin: 0 }}><span style={{ fontSize: 18, fontWeight: "bold" }}>{metric.values[0]['hours']}</span> <small>Hrs</small></p>
                                                                </Col>
                                                                <Col span={12} style={{ padding: 0 }}>
                                                                <OEEChart avgMetrics={metric.values} />
                                                                </Col>
                                                            </Flex>
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col md={7} lg={7}>
                        <Card size="small" style={{ 
                            border: 0,
                            backgroundColor: isDarkMode ? 'rgb(33, 33, 33, 0.1)' : 'rgb(255, 255, 255, 0.7)',
                            boxShadow: isDarkMode ? '0 2px 10px rgba(255, 255, 255, 0.2)' : '0 2px 10px rgba(0, 0, 0, 1)',
                             }}>
                            <h3>Prodcution Achievement</h3>
                            <Row gutter={[8, 8]}>
                                <Flex gap="small" align="center">
                                <Col span={8} style={{padding: 0}}>
                                    <p style={{ margin: 0, pading: 0 }}>
                                        <small>Planned Hours</small>
                                    </p>
                                    <h2 style={{ margin: 0, pading: 0 }}>230.03</h2>
                                </Col>
                                <Col span={8} style={{padding: 0}}>
                                    <p style={{ margin: 0, pading: 0 }}>
                                        <small>Completed Hours</small>
                                    </p>
                                    <p style={{ margin: 0 }}><span style={{ fontSize: 18, fontWeight: "bold" }}>59.45</span></p> 
                                </Col>
                                <Col span={8} style={{padding: 0}}>
                                    <ProductionAchievement />
                                </Col>
                                </Flex>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </LayoutDashboard>
        </>
    );
}


