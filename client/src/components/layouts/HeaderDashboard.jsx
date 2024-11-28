import { useState } from "react";
import PropTypes from "prop-types";
import { Layout, theme, Flex, Space, Button, Dropdown, Typography, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { MoonOutlined, SunOutlined, DashboardOutlined, SettingOutlined, DownOutlined, ExclamationCircleOutlined, HomeOutlined, DatabaseOutlined, ControlOutlined, CarryOutOutlined, FundProjectionScreenOutlined } from "@ant-design/icons";
import StatisticDrawer from "../Statistics/StatisticDrawer";
import MachineProdIcon from "../Icons/MachineProdIcon";

const { Header } = Layout;
const { Text } = Typography;

export default function HeaderDashboard({ isDarkMode, handleModeClick }) {

    const {
        // token: { colorBgContainer, colorText ='#000', backgroundColor= "green" },
        token: { colorBgContainer, colorText = '#000' },
    } = theme.useToken();
    const navigateTo = useNavigate();
    const locationPath = useLocation();
    
    const [selectedKeys, setSelectedKeys] = useState(() => {
        const path = locationPath.pathname;
        if (path === '/shopfloor' || 
            path === '/resource' || 
            path === '/resource/plan' ||
            path === '/resource/plan/detail') {
            return [
                '/shopfloor', 
                '/resource', 
                '/resource/plan',
                '/resource/plan/detail'
            ];
        }
        return [path]; 
    });

    const handleMenuClick = ({ key }) => {
        setSelectedKeys([key]);
        navigateTo(key);
    };

    const itemMenus = [
        {
            label: 'HOME',
            key: '/home',
            icon: <HomeOutlined />,
        },
        {
            label: 'MASTER',
            key: '/master',
            icon: <DatabaseOutlined />,
        },
        {
            label: 'SHOPFLOOR',
            key: '/shopfloor',
            icon: <ControlOutlined />,
        },
        {
            label: 'PLAN',
            key: '/plan',
            icon: <CarryOutOutlined />,
        },
        {
            label: 'REPORT',
            key: '/report',
            icon: <FundProjectionScreenOutlined />,
        },
    ];

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
                boxShadow: "0 2px 4px rgba(0,0,0,0.16)",
                zIndex: 10
            }}>

            <Flex align="center">
                <img style={{ marginLeft: "15px", marginRight: "15px", }} width={80} src="/src/assets/images/logoadw.png" alt="" />
                <Space>
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
                                <DownOutlined style={{ color: colorText }} />
                            </Space>
                        </Typography.Link>
                    </Dropdown>
                </Space>
            </Flex>

            <Flex align="center">
                <Menu
                    onClick={handleMenuClick}
                    selectedKeys={selectedKeys}
                    mode="horizontal"
                    items={itemMenus}
                    style={{
                        fontSize: '16px', // Adjust font size to make the menu look more professional
                        boxShadow: 'none', // Removes box shadow for a clean look
                        alignItems: 'center',
                        lineHeight: '50px', // Center the text vertically inside the item
                        borderBottom: 0
                    }}
                />
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
