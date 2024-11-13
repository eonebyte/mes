import { useState } from "react";
import PropTypes from "prop-types";
import { Layout, Menu, theme, Flex, Space, Button, } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import StatisticDrawer from "../../components/Statistics/StatisticDrawer";

const { Header } = Layout;

export default function HeaderAdmin({ isDarkMode, handleModeClick}) {

    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const navigateTo = useNavigate();
    const locationPath = useLocation();
    const [selectedKeys, setSelectedKeys] = useState([locationPath.pathname]);
    function getItem(label, key, children) {
        return {
            key,
            children,
            label,
        };
    }

    const menu_headers = [
        getItem("Dashboard", "/"),
        getItem("Gedung A", "/home"),
        getItem("Gedung B", "/gedung-b"),
    ];


    const handleMenuClick = ({ key }) => {
        setSelectedKeys([key]);
        navigateTo(key);
    };

    return (
        <Header
            style={{
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "dark",
                // borderBottom: "5px solid #1677ff",
            }}
        >
            {/* <div style={headerStyle} /> */}
            <div> <h1 style={{ borderBottom: "5px solid #1677ff", paddingLeft: 24, paddingRight: 24, background: colorBgContainer }}> Monitoring Machine</h1></div>
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={selectedKeys}
                onClick={handleMenuClick} // Gunakan fungsi handleMenuClick sebagai callback onClick
                style={{ borderBottom: "5px solid #1677ff", flex: 1, minWidth: 0 }}
                items={menu_headers}
            />
            <Flex style={{ borderBottom: "5px solid #1677ff" }} align="center" justify="flex-end">
                <Space style={{marginRight: "15px"}}>
                    <Button size="small" onClick={handleModeClick}>
                        {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                    </Button>
                    <StatisticDrawer />
                </Space>
            </Flex>



        </Header>
    );
}

HeaderAdmin.propTypes = {
    isDarkMode: PropTypes.bool,
    handleModeClick: PropTypes.func,
};
