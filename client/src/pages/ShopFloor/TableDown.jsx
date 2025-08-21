import { useEffect, useRef, useState } from 'react';
import { Table, Input, Button, Space, Tag, Spin, notification } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import LayoutDashboard from '../../components/layouts/LayoutDashboard';

const TableDown = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchInput = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:3080/api/v1/event/event/log');
                const json = await res.json();

                if (json?.data?.success) {
                    const rows = json.data.rows || [];
                    const finalData = rows.map((item, idx) => ({
                        ...item,
                        _id: item.A_ASSET_LOG_ID ?? `temp-${idx}`,
                    }));
                    setData(finalData);
                } else {
                    notification.error({ message: 'Gagal memuat data dari API' });
                }
            } catch (err) {
                console.error('Fetch error:', err);
                notification.error({ message: 'Gagal fetch data dari server' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                        onClick={() => confirm()}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            confirm({ closeDropdown: false });
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdownProps: {
            onOpenChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
    });

    const columns = [
        {
            title: 'Document No',
            dataIndex: 'DOCUMENTNO',
            key: 'DOCUMENTNO',
            ...getColumnSearchProps('DOCUMENTNO'),
        },
        {
            title: 'Part No',
            dataIndex: 'PARTNO',
            key: 'PARTNO',
            ...getColumnSearchProps('PARTNO'),
        },
        {
            title: 'Part Name',
            dataIndex: 'PARTNAME',
            key: 'PARTNAME',
            ...getColumnSearchProps('PARTNAME'),
        },
        {
            title: 'Customer',
            dataIndex: 'CUSTOMER',
            key: 'CUSTOMER',
            ...getColumnSearchProps('CUSTOMER'),
        },
        {
            title: 'Type',
            dataIndex: 'TYPE_DATA',
            key: 'TYPE_DATA',
            filters: [
                { text: 'DOWNTIME', value: 'DOWNTIME' },
                { text: 'RUNNING', value: 'RUNNING' },
            ],
            onFilter: (value, record) => record.TYPE_DATA === value,
            render: (type) => (
                <Tag color={type === 'DOWNTIME' ? 'red' : 'green'}>{type}</Tag>
            ),
        },
        {
            title: 'MC No',
            dataIndex: 'VALUE',
            key: 'VALUE',
            ...getColumnSearchProps('VALUE'),
        }, {
            title: 'Line No',
            dataIndex: 'LINENO',
            key: 'LINENO',
            ...getColumnSearchProps('LINENO'),
        },
        {
            title: 'Start Time',
            dataIndex: 'STARTDOWNTIME',
            key: 'STARTDOWNTIME',
        },
        {
            title: 'End Time',
            dataIndex: 'ENDDOWNTIME',
            key: 'ENDDOWNTIME',
        },
        {
            title: 'Duration',
            dataIndex: 'DOWNTIME_FORMAT',
            key: 'DOWNTIME_FORMAT',
        },
    ];

    return (
        <LayoutDashboard>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Spin>
        </LayoutDashboard>
    );
};

export default TableDown;
