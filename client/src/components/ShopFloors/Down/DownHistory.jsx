import { Card, Table } from 'antd';
import { useSelector } from 'react-redux';

const DownHistory = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const columns = [
        {
            title: 'No',
            key: 'no',
            render: (text, downtime, index) => index + 1,
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
        },
        {
            title: 'Duration (Minutes)',
            key: 'duration',
            render: (text, record) => {
                const start = new Date(record.startTime);
                const end = new Date(record.endTime);
                const duration = Math.round((end - start) / (1000 * 60)); // Durasi dalam menit
                return duration > 0 ? duration : 'N/A';
            },
        },
    ];

    const data = [
        {
            id: 1,
            startTime: '2024-12-06 08:30:00',
            endTime: '2024-12-06 09:00:00',
        },
        {
            id: 2,
            startTime: '2024-12-06 10:15:00',
            endTime: '2024-12-06 11:00:00',
        },
        {
            id: 3,
            startTime: '2024-12-06 14:00:00',
            endTime: '2024-12-06 14:45:00',
        },
    ];

    return (
        <>
            <Card
                title="History Down"
                style={{
                    boxShadow: isDarkMode
                        ? '0 1px 4px rgba(255, 255, 255, 0.2)' // Light shadow untuk dark mode
                        : '0 1px 4px rgba(0, 0, 0, 0.5)' // Shadow gelap untuk light mode
                }}
                styles={{
                    body: {
                        padding: "10px 10px",
                    }
                }}
            >
                <Table
                    dataSource={data}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    bordered
                    style={{ backgroundColor: '#FFF4E6' }} // Memberikan latar belakang dengan warna warning
                />
            </Card>
        </>
    );
};

export default DownHistory;
