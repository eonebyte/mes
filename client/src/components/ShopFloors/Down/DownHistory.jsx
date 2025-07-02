import { Card, Table, Spin, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchHistoryDown } from '../../../data/fetchs';
import { DateTime } from 'luxon';

const DownHistory = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [historyDowns, setHistoryDowns] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    const fetchData = async () => {
        if (!resourceId) {
            setHistoryDowns([]);
            return;
        }

        setLoading(true);

        try {
            const { historyDowns } = await fetchHistoryDown(resourceId);
            console.log("historyDowns", historyDowns);

            if (Array.isArray(historyDowns)) {
                setHistoryDowns(historyDowns);
            } else {
                setHistoryDowns([]);
                console.warn("Data 'historyDowns' tidak dalam format array.");
            }
        } catch (err) {
            console.error("Gagal mengambil data:", err);
            setHistoryDowns([]);
            notification.error({
                message: 'Gagal Mengambil Data',
                description: 'Terjadi kesalahan saat mengambil data history downtime.',
            });
        } finally {
            setLoading(false);
        }

    };



    useEffect(() => {
        fetchData();
    }, []);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });


    const columns = [
        {
            title: 'No',
            key: 'no',
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (value) =>
                value ? DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSS').toFormat('dd/MM/yyyy HH:mm:ss') : '-',
        },
        {
            title: 'End Time',
            dataIndex: 'end_time',
            key: 'end_time',
            render: (value) => {
                const now = DateTime.now().setZone('Asia/Jakarta');
                if (value) {
                    return DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSS').toFormat('dd/MM/yyyy HH:mm:ss');
                } else {
                    return now.toFormat('dd/MM/yyyy HH:mm:ss');
                }
            },
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (text, record) => {
                const { start_time, end_time, duration } = record;

                // Jika backend sudah menghitung duration
                if (duration) {
                    const { minutes = 0, seconds = 0, milliseconds = 0 } = duration;
                    const base = `${minutes}m ${seconds}s ${milliseconds.toFixed(0)}ms`;
                    return end_time ? base : `${base} (current)`;
                }

                // Jika perlu menghitung manual dari start_time ke waktu sekarang
                if (start_time) {
                    const start = DateTime.fromFormat(start_time, 'yyyy-MM-dd HH:mm:ss.SSS').setZone('Asia/Jakarta');
                    const end = end_time
                        ? DateTime.fromFormat(end_time, 'yyyy-MM-dd HH:mm:ss.SSS').setZone('Asia/Jakarta')
                        : DateTime.now().setZone('Asia/Jakarta');

                    const diff = end.diff(start, ['minutes', 'seconds', 'milliseconds']).toObject();
                    const minutes = Math.floor(diff.minutes || 0);
                    const seconds = Math.floor(diff.seconds || 0);
                    // const milliseconds = Math.floor(diff.milliseconds || 0);

                    // const base = `${minutes}m ${seconds}s ${milliseconds}ms`;
                    const base = `${minutes}m ${seconds}s`;
                    return end_time ? base : `${base} (current)`;
                }

                return 'N/A';
            },
        },
        {
            title: 'Reasons',
            dataIndex: 'reasons',
            key: 'reasons',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
    ];

    return (
        <Card
            title="History Down"
            style={{
                boxShadow: isDarkMode
                    ? '0 1px 4px rgba(255, 255, 255, 0.2)'
                    : '0 1px 4px rgba(0, 0, 0, 0.5)'
            }}
            styles={{
                body: {
                    padding: "10px 10px",
                }
            }}
        >
            <Spin spinning={loading} tip="Loading..." style={{ display: 'block', textAlign: 'center', padding: '30px 0' }}>
                <Table
                    dataSource={historyDowns}
                    columns={columns}
                    rowKey="id"
                    bordered
                    defaultCurrent={1}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => {
                            setPagination({ current: page, pageSize });
                        },
                    }}
                    style={{ backgroundColor: '#FFF4E6' }}
                />
            </Spin>
        </Card>
    );

};

export default DownHistory;
