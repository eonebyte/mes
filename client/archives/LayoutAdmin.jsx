import { useState } from "react";

import { Layout, ConfigProvider, theme, Menu } from "antd";
import PropTypes from 'prop-types';
import HeaderAdmin from "./HeaderAdmin";
import FooterAdmin from "./FooterAdmin";
import { useLocation, useNavigate } from "react-router-dom";
const { defaultAlgorithm, darkAlgorithm } = theme;
const { Content } = Layout;
function LayoutAdmin({ children }) {

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
        getItem("Idle", "/"),
        getItem("Running", "/"),
        getItem("Breakdown", "/"),
        getItem("Setup", "/"),
        getItem("FAI", "/"),
        getItem("Timeout", "/"),
        getItem("Suspend", "/"),
        getItem("Maintenance", "/"),
        getItem("Testing", "/"),
        getItem("Unknown", "/"),
        getItem("Total M/C 15", "/"),
    ];

    const handleMenuClick = ({ key }) => {
        setSelectedKeys([key]);
        navigateTo(key);
    };


    const [isDarkMode, setIsDarkMode] = useState(false);
    const handleClick = () => {
        setIsDarkMode((previousValue) => !previousValue);
    };


    return (
        <ConfigProvider theme={{
            algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}>
        <Layout style={{ minHeight: "100vh", margin: "0" }}>
            <HeaderAdmin
            isDarkMode={isDarkMode}
            handleModeClick={handleClick}
            />
               
            <Layout>
                    <Menu
                        theme=""
                        mode="horizontal"
                        defaultSelectedKeys={selectedKeys}
                        onClick={handleMenuClick} // Gunakan fungsi handleMenuClick sebagai callback onClick
                        style={{ marginTop: 2 }}
                        items={menu_headers}
                    />
                <Content
                    style={{
                        margin: "0 16px",
                    }}
                >
                    {children}
                    <FooterAdmin />
                </Content>
            </Layout>
        </Layout>
        </ConfigProvider>

    );
}

LayoutAdmin.propTypes = {
    children: PropTypes.array,
}



export default LayoutAdmin;
