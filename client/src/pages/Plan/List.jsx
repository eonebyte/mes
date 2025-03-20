import { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Spin, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import LayoutDashboard from '../../components/layouts/LayoutDashboard';


const ListPlan = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3080/api/plans');
                const result = await response.json();
                if (result && result.data) {
                    setData(result.data); // Set data ke state
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Panggil fetchData untuk ambil data
    }, []);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        // onFilter: (value, record) =>
        //     record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilter: (value, record) => {
            // Pengecekan untuk nilai null atau undefined
            const text = record[dataIndex] || '';  // Jika null/undefined, ganti dengan string kosong
            return text.toString().toLowerCase().includes(value.toLowerCase());
        },
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const formatDate = (dateStr) => {
        const [datePart] = dateStr.split(' '); // ["30-12-2024"]
        const [day, month, year] = datePart.split('-'); // ["30", "12", "2024"]
        const formattedDate = new Date(`${year}-${month}-${day}`);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formatter = new Intl.DateTimeFormat('id-ID', options);
        return formatter.format(formattedDate); // Output: "30/12/2024"
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';

        try {
            const [datePart, timePart] = dateStr.split(' ');
            const [day, month, year] = datePart.split('-');
            const [hours, minutes, seconds] = timePart.split(':');
            const formattedDate = `${day}/${month}/${year}`;
            const formattedDateTime = `${formattedDate} ${hours}:${minutes}:${seconds}`;
            return formattedDateTime;
        } catch (error) {
            console.error("Error formatting date/time:", error);
            return '';  // Jika terjadi error, kembalikan string kosong
        }
    };

    const columns = [
        { title: 'No', dataIndex: 'no', key: 'no', ...getColumnSearchProps('no') },
        {
            title: 'Plan No',
            dataIndex: 'planNo',
            key: 'planNo', ...getColumnSearchProps('planNo'),
            defaultSortOrder: 'descend',
            sorter: (a, b) => {
                // Jika 'planNo' berupa angka, gunakan pembanding numerik
                if (typeof a.planNo === 'number' && typeof b.planNo === 'number') {
                    return a.planNo - b.planNo;
                }
                // Jika 'planNo' berupa string, gunakan localeCompare untuk membandingkan string
                return a.planNo.toString().localeCompare(b.planNo.toString());
            },
        },
        { title: 'Description', dataIndex: 'description', key: 'description', ...getColumnSearchProps('description') },
        { title: 'Resource code', dataIndex: 'resourceCode', key: 'resourceCode', ...getColumnSearchProps('resourceCode') },
        { title: 'Mold', dataIndex: 'moldName', key: 'moldName', ...getColumnSearchProps('moldName') },
        { title: 'Part No', dataIndex: 'partNo', key: 'partNo', ...getColumnSearchProps('partNo') },
        { title: 'Part Name', dataIndex: 'partName', key: 'partName', ...getColumnSearchProps('partName') },
        { title: 'User', dataIndex: 'user', key: 'user', ...getColumnSearchProps('user') },
        { title: 'Plan Status', dataIndex: 'status', key: 'status', ...getColumnSearchProps('status') },
        { title: 'Qty', dataIndex: 'qty', key: 'qty', ...getColumnSearchProps('qty') },
        {
            title: 'Date Doc',
            dataIndex: 'dateDoc',
            key: 'dateDoc',
            ...getColumnSearchProps('dateDoc'),
            render: (text) => formatDate(text),
        },
        {
            title: 'Start Time',
            dataIndex: 'planStartTime',
            key: 'planStartTime',
            render: (text) => formatDateTime(text),  // Terapkan formatDateTime untuk Start Time
        },
        {
            title: 'Complete Time',
            dataIndex: 'planCompleteTime',
            key: 'planCompleteTime',
            render: (text) => formatDateTime(text),  // Terapkan formatDateTime untuk Complete Time
        },
        { title: 'Cycletime', dataIndex: 'cycletime', key: 'cycletime', ...getColumnSearchProps('cycletime') },
        { title: 'Cavity', dataIndex: 'cavity', key: 'cavity', ...getColumnSearchProps('cavity') },
        { title: 'Trial', dataIndex: 'isTrial', key: 'isTrial', ...getColumnSearchProps('isTrial') },
    ];

    return (
        <LayoutDashboard>
            <Card
                style={{ marginTop: 5, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
                styles={{
                    body: {
                        padding: 5
                    }
                }}
            >
                <Spin spinning={loading}>
                    <Table
                        style={{
                            marginTop: 5,
                        }}
                        rowKey="partNo"
                        columns={columns}
                        dataSource={data}
                        scroll={{ x: "max-content" }}
                        size='small'
                    />
                </Spin>
            </Card>
        </LayoutDashboard>
    );
};

export default ListPlan;