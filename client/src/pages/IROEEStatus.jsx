import { Row, Col, Card, Divider, Space, Flex } from "antd";
import LayoutDashboard from '../components/layouts/LayoutDashboard';
import { DashboardOutlined, GroupOutlined, BarChartOutlined, PlayCircleOutlined, HistoryOutlined, ScheduleOutlined, DatabaseOutlined, HourglassOutlined, AlertOutlined, PoweroffOutlined } from "@ant-design/icons";

const iconNotifStyle = (color) => ({ fontSize: '20px', marginLeft: 20, backgroundColor: color, padding: 5, borderRadius: 5 });
const rowIconNotifStyle = { marginTop: 10, marginBottom: 10 };
const marginStyleText = { margin: 0, marginLeft: 5 };
const marginFlex = { maginLeft: 10 };
const cardTextStyle = { margin: 0 };
const cardTextRightBodyStyle = { margin: 0, fontWeight: 'bold' }
const cardTextRightStyle = { margin: 0, fontSize: 18, fontWeight: 'bold' }
import { useSelector, useDispatch } from 'react-redux';

import { updateMachineStatus, deleteAllStopTimes } from '../states/reducers/machineSlice';

import DaysUtilization from "../components/IR/DayUtilization";
import WeekUtilization from "../components/IR/WeekUtilization";

export default function IROEEStatus() {

    
    const dispatch = useDispatch();
    const machines = useSelector(state => state.machines.data);

    console.log('Machines:', machines);

    const handleStatusUpdate = (id, newStatus) => {
        const stopMinutes = document.getElementById("stopMinutes").value;
        dispatch(updateMachineStatus({ id, newStatus, stopTime: newStatus === 'Stop' ? stopMinutes : null }));
    };

    const calculateUtilizationPercentage = (machine) => {
        // Waktu mulai dan waktu selesai
        const startTime = machine.work;
        const endTime = new Date("2024-05-30T16:00:00");

        const runtimeInMinutes = (endTime - startTime) / (1000 * 60);

        // Menghitung total waktu berhenti dari semua waktu berhenti dalam array
        const totalStopTimeInMinutes = machine.stopTimes.reduce((acc, stopTime) => acc + stopTime, 0);
        
        const totalRuntimeInMinutes = runtimeInMinutes - totalStopTimeInMinutes;
        const utilizationPercentage = (totalRuntimeInMinutes / runtimeInMinutes) * 100;

        return utilizationPercentage.toFixed(2); 
    }

    const clearCache = (machine) => {
        dispatch(deleteAllStopTimes({id: machine.id}));
    };

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Mengambil jam dengan format dua digit, misalnya 03, 13
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Mengambil menit dengan format dua digit, misalnya 05, 15
    const currentTime = `${hours}:${minutes}`;

    const calculateMinutesSinceStartOfDay = (machine) => {
        const startTime = new Date(machine.work);
        const current = new Date("2024-05-30T16:00:00");

        const minutesSinceStartOfWork = Math.round((current - startTime) / (1000 * 60)); // Menghitung selisih waktu dalam menit
        return minutesSinceStartOfWork;
    };

    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    return (
        <>
            <LayoutDashboard>

                {/* Start Row Dashboard and Button Notifikasi  */}
                <Row style={rowIconNotifStyle} align="middle">
                    <Col span={12} >
                        <Space>
                            <DashboardOutlined style={iconNotifStyle('')} />
                            <p style={{ margin: 0 }}>Equipment Overview | DASHBOARD</p>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <Flex justify="flex-end">
                            <GroupOutlined style={iconNotifStyle('#0958d9')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>All</p>
                                <p style={marginStyleText}>12</p>
                            </Flex>
                            <PlayCircleOutlined style={iconNotifStyle('#389e0d')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Work</p>
                                <p style={marginStyleText}>12</p>
                            </Flex>
                            <HourglassOutlined style={iconNotifStyle('#faad14')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Idle</p>
                                <p style={marginStyleText}>0</p>
                            </Flex>
                            <AlertOutlined style={iconNotifStyle('#cf1322')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Fault</p>
                                <p style={marginStyleText}>0</p>
                            </Flex>
                            <PoweroffOutlined style={iconNotifStyle('#96C6F2')} />
                            <Flex vertical align="center" style={marginFlex}>
                                <p style={marginStyleText}>Offline</p>
                                <p style={marginStyleText}>0</p>
                            </Flex>
                        </Flex>

                    </Col>
                </Row>
                {/* End Row Dashboard and Button Notifikasi  */}

                {/* Grid Machine */}
                <Row gutter={[16, 16]}>
                    {machines.map((machine) => (
                        <Col key={machine.id} xs={12} sm={8} md={6} lg={4}>
                            <button onClick={() => clearCache(machine)} style={{marginBottom: 5}}>Clear Cache</button>
                            <Card
                                size="small"
                                title={`${machine.id}#`}
                                style={{ width: '100%', border: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: `${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}` }}
                                styles={{
                                    header: {
                                        color: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        backgroundImage: `url(${machine.status === 'Running' ? '/src/assets/images/greenimg.jpg' : '/src/assets/images/redimg.jpg'})`,
                                        backgroundSize: 'cover'
                                    }
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <img src={machine.imageUrl} alt={machine.machineName} style={{ maxWidth: '100%' }} />
                                </div>
                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <DatabaseOutlined />
                                        <p style={cardTextStyle}>Modulus:</p>
                                    </Space>
                                    <p style={cardTextRightBodyStyle}>392750mdl</p>
                                </Flex>
                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <ScheduleOutlined />
                                        <p style={cardTextStyle}>Work:</p>
                                    </Space>
                                    <p style={cardTextRightBodyStyle}>
                                        {new Date(machine.work).getHours().toString().padStart(2, '0')}:
                                        {new Date(machine.work).getMinutes().toString().padStart(2, '0')}
                                    </p>

                                </Flex>
                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <HistoryOutlined />
                                        <p style={cardTextStyle}>Cycle:</p>
                                    </Space>
                                    <p style={cardTextRightBodyStyle}>{machine.cycle}</p>
                                </Flex>
                                <Divider style={{ marginTop: 10, marginBottom: 10 }} dashed />
                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <p style={cardTextStyle}>Last 24 Hrs Rate</p>
                                    </Space>
                                    <p style={cardTextRightStyle}>{calculateUtilizationPercentage(machine)}%</p>
                                </Flex>
                                <button onClick={() => handleStatusUpdate(machine.id, 'Running')}>
                                    Running
                                </button>
                                <input type="number" id="stopMinutes" name="stopMinutes" min="1" max="20" />
                                <button onClick={() => handleStatusUpdate(machine.id, 'Stop')}>
                                    Stop 
                                </button>
                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <p style={cardTextStyle}>End Time Simulation:</p>
                                    </Space>
                                    <p style={cardTextRightBodyStyle}>{new Date("2024-05-30T16:00:00").getHours().toString().padStart(2, '0')}:{new Date("2024-05-30T16:00:00").getMinutes().toString().padStart(2, '0')}</p>
                                </Flex>
                               
                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <p style={cardTextStyle}>Jumlah menit:</p>
                                    </Space>
                                    <p style={cardTextRightBodyStyle}>{calculateMinutesSinceStartOfDay(machine)}</p>
                                </Flex>

                                <Flex align="center" justify="space-between">
                                    <Space>
                                        <ScheduleOutlined />
                                        <p style={cardTextStyle}>Current Time:</p>
                                    </Space>
                                    <p style={cardTextRightBodyStyle}>{currentTime}</p>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {/* End Grid Machine */}

                <Row gutter={[8, 8]} style={{ marginTop: 15 }} align="middle">
                    <Col span={12}>
                        <Flex align="center" justify="space-between">
                            <Space>
                                <BarChartOutlined style={iconNotifStyle('#0958d9')} />
                                <p>Rate in the past 24 hours | UTILIZATION</p>
                            </Space>
                            <p>Last 24 hours</p>
                        </Flex>
                        <Card size="small" style={{ backgroundColor: `${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}` }}>
                            <DaysUtilization />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Flex align="center" justify="space-between">
                            <Space>
                                <BarChartOutlined style={iconNotifStyle('#0958d9')} />
                                <p>Rate in the past 7 days | UTILIZATION</p>
                            </Space>
                            <p>Last week</p>
                        </Flex>
                        <Card size="small" style={{ backgroundColor: `${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}` }}>
                            <WeekUtilization />
                        </Card>
                    </Col>
                </Row>
            </LayoutDashboard>
        </>
    );
}
