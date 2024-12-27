import { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import LayoutDashboard from '../../components/layouts/LayoutDashboard';


const data = [
    {
        key: '1',
        compiste: 1,
        Rline: 'A1-01 [08]',
        Rcode: 'R008',
        Mold: 'Mold A',
        MoldModel: 'Model A1',
        LifeCycles: '10',
        PartNo: 'P001',
        Revision: 'Rev 1',
        Seq: '1',
        PartModel: 'Part A',
        PartDrawing: 'Drawing A',
        Qty: 100,
        DeliveryDate: '2024-01-01',
        PlanStartTime: '2024-01-02',
        PlanCompleteTime: '2024-01-10',
        CycleTime: '5 hours',
        Cavity: 'Cavity 1',
        OrderNo: 'O001',
        MoldDesc: 'Description A',
        PartDesc: 'Part A Description',
        Testing: 'N',
    },
    {
        key: '2',
        compiste: 2,
        Rline: 'A1-01 [09]',
        Rcode: 'R009',
        Mold: 'Mold B',
        MoldModel: 'Model B1',
        LifeCycles: '20',
        PartNo: 'P002',
        Revision: 'Rev 2',
        Seq: '2',
        PartModel: 'Part B',
        PartDrawing: 'Drawing B',
        Qty: 200,
        DeliveryDate: '2024-02-01',
        PlanStartTime: '2024-02-02',
        PlanCompleteTime: '2024-02-10',
        CycleTime: '6 hours',
        Cavity: 'Cavity 2',
        OrderNo: 'O002',
        MoldDesc: 'Description B',
        PartDesc: 'Part B Description',
        Testing: 'N',
    },
    // Add more data as needed
];

const ListPlan = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
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
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

    const columns = [
        { title: 'Compiste', dataIndex: 'compiste', key: 'compiste', ...getColumnSearchProps('compiste') },
        { title: 'Rline', dataIndex: 'Rline', key: 'Rline', ...getColumnSearchProps('Rline') },
        { title: 'Rcode', dataIndex: 'Rcode', key: 'Rcode', ...getColumnSearchProps('Rcode') },
        { title: 'Mold', dataIndex: 'Mold', key: 'Mold', ...getColumnSearchProps('Mold') },
        { title: 'Mold Model', dataIndex: 'MoldModel', key: 'MoldModel', ...getColumnSearchProps('MoldModel') },
        { title: 'LifeCycles', dataIndex: 'LifeCycles', key: 'LifeCycles', ...getColumnSearchProps('LifeCycles') },
        { title: 'Part No', dataIndex: 'PartNo', key: 'PartNo', ...getColumnSearchProps('PartNo') },
        { title: 'Revision', dataIndex: 'Revision', key: 'Revision', ...getColumnSearchProps('Revision') },
        { title: 'Seq', dataIndex: 'Seq', key: 'Seq', ...getColumnSearchProps('Seq') },
        { title: 'Part Model', dataIndex: 'PartModel', key: 'PartModel', ...getColumnSearchProps('PartModel') },
        { title: 'Part Drawing', dataIndex: 'PartDrawing', key: 'PartDrawing', ...getColumnSearchProps('PartDrawing') },
        { title: 'Qty', dataIndex: 'Qty', key: 'Qty', ...getColumnSearchProps('Qty') },
        { title: 'Delivery Date', dataIndex: 'DeliveryDate', key: 'DeliveryDate', ...getColumnSearchProps('DeliveryDate') },
        { title: 'Plan Start Time', dataIndex: 'PlanStartTime', key: 'PlanStartTime', ...getColumnSearchProps('PlanStartTime') },
        { title: 'Plan Complete Time', dataIndex: 'PlanCompleteTime', key: 'PlanCompleteTime', ...getColumnSearchProps('PlanCompleteTime') },
        { title: 'Cycle Time', dataIndex: 'CycleTime', key: 'CycleTime', ...getColumnSearchProps('CycleTime') },
        { title: 'Cavity', dataIndex: 'Cavity', key: 'Cavity', ...getColumnSearchProps('Cavity') },
        { title: 'Order No', dataIndex: 'OrderNo', key: 'OrderNo', ...getColumnSearchProps('OrderNo') },
        { title: 'Mold Desc', dataIndex: 'MoldDesc', key: 'MoldDesc', ...getColumnSearchProps('MoldDesc') },
        { title: 'Part Desc', dataIndex: 'PartDesc', key: 'PartDesc', ...getColumnSearchProps('PartDesc') },
        { title: 'Testing', dataIndex: 'Testing', key: 'Testing', ...getColumnSearchProps('Testing') },
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
                <Table
                    style={{
                        marginTop: 5,
                    }}
                    sty
                    columns={columns}
                    dataSource={data}
                    scroll={{ x: "max-content" }}
                />
            </Card>
        </LayoutDashboard>
    );
};

export default ListPlan;