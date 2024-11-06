import { useState } from "react";
import PropTypes from "prop-types";
import { Layout, theme, Flex, Space, Button, Dropdown, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { MoonOutlined, SunOutlined, DashboardOutlined, SettingOutlined, DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import StatisticDrawer from "../Statistics/StatisticDrawer";
import MachineProdIcon from "../Icons/MachineProdIcon";


const { Header } = Layout;
const { Text } = Typography;

export default function HeaderDashboard({ isDarkMode, handleModeClick }) {

    const {
        // token: { colorBgContainer, colorText ='#000', backgroundColor= "green" },
        token: { colorBgContainer, colorText ='#000' },
    } = theme.useToken();
    const navigateTo = useNavigate();
    const locationPath = useLocation();
    const [selectedKeys, setSelectedKeys] = useState([locationPath.pathname]);



    const handleMenuClick = ({ key }) => {
        setSelectedKeys([key]);
        navigateTo(key);
    };

    const items = [
        {
            label: 'Overall',
            key: '/',
            icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
        },
        {
            label: 'Board for Preparing',
            key: '/boardfp',
            icon: <SettingOutlined style={{ fontSize: '18px' }} />,
        },
        {
            label: 'Production',
            key: '/production',
            icon: <MachineProdIcon isDark={isDarkMode} />,
        },
        {
            label: 'OEE Status',
            key: '/ir-oee-status',
            icon: <ExclamationCircleOutlined style={{ fontSize: '18px' }} />,
        },
        {
            label: 'Machine Downtime',
            key: '/machine-downtime',
            icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
        },
    ];

    return (
        <Header
            style={{
                display: "flex",
                maxHeight: 50,
                alignItems: "center",
                justifyContent: "space-between",
                // color: "dark",
                backgroundColor: colorBgContainer,
                // borderBottom: "5px solid #1677ff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>

            <Flex align="center">
            <img style={{ marginLeft: "15px", marginRight: "15px", }} width={80} src="/src/assets/images/logoadw.png" alt="" />
            <Space>
            <Text>Master</Text>
            <Text>Shopfloor</Text>
            <Dropdown
                menu={{
                    items,
                    selectable: true,
                    defaultSelectedKeys: selectedKeys,
                    onClick: handleMenuClick,
                }}
            >
                <Typography.Link>
                    <Space>
                        <Text strong>
                        Menus
                        </Text>
                        <DownOutlined style={{color: colorText}} />
                    </Space>
                </Typography.Link>
            </Dropdown>
            </Space>
            </Flex>

            <Flex style={{}} align="center" justify="flex-end">
                <Space style={{ marginRight: "15px" }}>
                    <Button size="small" onClick={handleModeClick}>
                        {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                    </Button>
                    <StatisticDrawer />
                </Space>

            </Flex>



        </Header>
    );
}

HeaderDashboard.propTypes = {
    isDarkMode: PropTypes.bool,
    handleModeClick: PropTypes.func,
};
