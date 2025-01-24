import { useState } from "react";
import PropTypes from "prop-types";
import { Layout, theme, Flex, Space, Button, Dropdown, Typography, Menu, Avatar } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { MoonOutlined, SunOutlined, DashboardOutlined, SettingOutlined, DownOutlined, ExclamationCircleOutlined, HomeOutlined, DatabaseOutlined, ControlOutlined, CarryOutOutlined, FundProjectionScreenOutlined, CloudUploadOutlined, UnorderedListOutlined, MoreOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
// import StatisticDrawer from "../Statistics/StatisticDrawer";
import MachineProdIcon from "../Icons/MachineProdIcon";
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../../states/reducers/authSlice';


const { Header } = Layout;
const { Text } = Typography;
const url = 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg';

export default function HeaderDashboard({ isDarkMode, handleModeClick }) {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const handleLogout = () => {
        dispatch(logout());
    };

    const [showBox, setShowBox] = useState(false);
    const toggleBox = () => {
        setShowBox(!showBox);
    };

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
            path === '/resource/plan/detail' ||
            path === '/resource/mold' ||
            path === '/resource/mold/setup' ||
            path === '/resource/down'
        ) {
            return [
                '/shopfloor',
                '/resource',
                '/resource/plan',
                '/resource/plan/detail',
                '/resource/mold',
                '/resource/mold/setup',
                '/resource/down',
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
            children: [
                {
                    label: 'Import Plan',
                    key: '/plan/import',
                    icon: <CloudUploadOutlined />
                },
                {
                    label: 'List Plan',
                    key: '/plan/list',
                    icon: <UnorderedListOutlined />
                },
            ],
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
        {
            label: 'Resources',
            key: '/resources',
            icon: <MachineProdIcon isDark={isDarkMode} />,
        },
    ];

    const itemSubHeader = [
        {
            label: user.name,
            key: '1',
            icon: <UserOutlined />,
        },
        {
            label: 'Logout',
            key: '2',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
        },
    ];

    return (
        <>
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
                        {/* <StatisticDrawer /> */}
                        <MoreOutlined onClick={toggleBox} style={{ marginRight: '15px', fontSize: '18px' }} />
                    </Space>
                </Flex>

            </Header>
            {showBox && (
                <Flex justify="flex-end" style={{ padding: "10px", backgroundColor: colorBgContainer }}>
                    <Space>
                        <Dropdown
                            menu={{
                                items: itemSubHeader, // Pastikan "items" bukan "menu" jika Anda mengikuti spesifikasi terbaru
                            }}
                            placement="bottomRight"
                        >
                            <Space>
                                <Text>{user.name}</Text>
                                <Avatar src={<img src={url} alt="avatar" />} />
                            </Space>
                        </Dropdown>
                    </Space>
                </Flex>
            )}

        </>
    );
}

HeaderDashboard.propTypes = {
    isDarkMode: PropTypes.bool,
    handleModeClick: PropTypes.func,
};
