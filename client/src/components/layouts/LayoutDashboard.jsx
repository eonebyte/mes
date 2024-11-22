import { Layout, ConfigProvider, theme } from "antd";
import PropTypes from 'prop-types';
import HeaderDashboard from "./HeaderDashboard";
import FooterDashboard from "./FooterDashboard";
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../../states/reducers/themeSlice'; // Import action

const { defaultAlgorithm, darkAlgorithm } = theme;
const { Content } = Layout;

function LayoutDashboard({ children }) {

    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const handleClick = () => {
        dispatch(toggleDarkMode()); // Mengirimkan action untuk mengubah status tema
    };


    return (
        <ConfigProvider theme={{
            // token: {
            //     colorBgContainerHeader: '#595959',
            // },
            algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}>
            <Layout style={{ minHeight: "100vh", margin: "0"}}>
                <HeaderDashboard
                    isDarkMode={isDarkMode}
                    handleModeClick={handleClick}
                />
                <Layout style={{ backgroundImage: `url(${isDarkMode ? '/src/assets/images/bg.jpg' : '/src/assets/images/bggg3.jpeg'})`, backgroundSize: "cover" }}>
                    <Content
                        style={{
                            margin: "0 5px",
                        }}
                    >
                        {children}
                    </Content>
                    <FooterDashboard />
                </Layout>
            </Layout>
        </ConfigProvider>

    );
}

LayoutDashboard.propTypes = {
    children: PropTypes.node,
}



export default LayoutDashboard;
