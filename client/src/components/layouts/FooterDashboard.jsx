import { Layout } from "antd";
const { Footer } = Layout;

export default function FooterDashboard() {
    return (
        <Footer
            style={{
                marginTop: 15,
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.2)" // Atur opasitas di sini
            }}
        >
            <small>Adyawinsa Plastics Industry ©{new Date().getFullYear()} | ICT Department</small>
        </Footer>
    );
}
