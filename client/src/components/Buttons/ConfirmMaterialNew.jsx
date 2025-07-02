import { Button, Col, Divider, Input, Modal, Row, Space, Table, Typography } from "antd";
import { StopOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
const { Title } = Typography;

const ConfirmMaterialNew = ({ movementLines, open, onClose }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <span style={{ backgroundColor: '#ffc069' }}>{text}</span>
            ) : (text),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const lineColumns = useMemo(() => [
        {
            title: 'Line',
            dataIndex: 'line',
            key: 'line',
            ...getColumnSearchProps('line'),
        },
        {
            title: 'Part No',
            dataIndex: 'partno',
            key: 'partno',
            ...getColumnSearchProps('partno'),
        },
        {
            title: 'Part Name',
            dataIndex: 'partname',
            key: 'partname',
            ...getColumnSearchProps('partname'),
        },
        {
            title: 'From Locator',
            dataIndex: 'fromlocator',
            key: 'fromlocator',
            ...getColumnSearchProps('fromlocator'),
        },
        {
            title: 'To Locator',
            dataIndex: 'tolocator',
            key: 'tolocator',
            ...getColumnSearchProps('tolocator'),
        },
        {
            title: 'Qty',
            dataIndex: 'movementqty',
            key: 'movementqty',
        },
        {
            title: 'UOM',
            dataIndex: 'uom',
            key: 'uom',
        },
    ], [searchText, searchedColumn]);

    const columns = [
        {
            title: 'No',
            key: 'no',
            render: (_text, _record, index) => index + 1,
            width: 60,
        },
        {
            title: 'Date',
            dataIndex: 'movementdate',
            key: 'movementdate',
        },
        {
            title: 'Created By',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Document No',
            dataIndex: 'documentno',
            key: 'documentno',
        },
    ];

    const dataWithKey = movementLines.map((item, index) => ({
        key: index,
        ...item,
    }));

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={'90%'}
        >
            <Title level={4} style={{ marginTop: 0 }}>Summary Material</Title>
            <Table
                columns={[
                    {
                        title: 'No',
                        key: 'no',
                        render: (_text, _record, index) => index + 1,
                        width: 60,
                    },
                    {
                        title: 'Part No',
                        dataIndex: 'partno',
                        key: 'partno',
                        ...getColumnSearchProps('partno'),
                    },
                    {
                        title: 'Part Name',
                        dataIndex: 'partname',
                        key: 'partname',
                        ...getColumnSearchProps('partname'),
                    },
                    {
                        title: 'UOM',
                        dataIndex: 'uom',
                        key: 'uom',
                    },
                    {
                        title: 'Total Qty',
                        dataIndex: 'totalqty',
                        key: 'totalqty',
                        render: (value) => <b>{value}</b>,
                    },
                ]}
                dataSource={useMemo(() => {
                    const productMap = {};

                    movementLines.forEach((doc) => {
                        doc.lines.forEach((line) => {
                            const key = `${line.partno}_${line.uom}`;
                            if (!productMap[key]) {
                                productMap[key] = {
                                    partno: line.partno,
                                    partname: line.partname,
                                    uom: line.uom,
                                    totalqty: 0,
                                };
                            }
                            productMap[key].totalqty += line.movementqty;
                        });
                    });

                    return Object.values(productMap);
                }, [movementLines])}
                rowKey={(record) => `${record.partno}-${record.uom}`}
                pagination={false}
                bordered
                rowClassName={(_, index) => (index % 2 === 0 ? 'row-light' : 'row-dark')}
            />


            <Divider style={{ marginTop: 12, marginBottom: 8 }} />
            <Title level={4} style={{ marginTop: 0 }}>Material Log</Title>
            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        columns={columns}
                        dataSource={movementLines}
                        rowKey="documentno"
                        pagination={false}
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={lineColumns}
                                    dataSource={record.lines}
                                    rowKey={dataWithKey}
                                    pagination={false}
                                    size="small"
                                    bordered
                                    style={{ backgroundColor: '#fafafa' }}
                                    rowClassName={() => 'line-row'}
                                />
                            ),
                            rowExpandable: (record) => record.lines && record.lines.length > 0,
                        }}
                        rowClassName={(_, index) =>
                            index % 2 === 0 ? 'row-light' : 'row-dark'
                        }
                    />

                </Col>
            </Row>

            <Divider style={{ marginTop: 12, marginBottom: 8 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Button
                        style={{ color: '#666666', fontWeight: 'bold' }}
                        onClick={onClose}
                        icon={<StopOutlined />}
                    >
                        CLOSE
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

ConfirmMaterialNew.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    movementLines: PropTypes.arrayOf(PropTypes.shape({
        movementdate: PropTypes.string.isRequired,
        user: PropTypes.string.isRequired,
        documentno: PropTypes.string.isRequired,
        lines: PropTypes.arrayOf(PropTypes.shape({
            line: PropTypes.string.isRequired,
            partno: PropTypes.string.isRequired,
            partname: PropTypes.string.isRequired,
            fromlocator: PropTypes.string.isRequired,
            tolocator: PropTypes.string.isRequired,
            movementqty: PropTypes.number.isRequired,
        })).isRequired,
    })).isRequired,
};

export default ConfirmMaterialNew;
