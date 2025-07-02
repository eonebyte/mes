import { Row, Divider, Spin } from "antd";
import LayoutDashboard from '../../components/layouts/LayoutDashboard';

import StatusButton from "../../components/Buttons/StatusButton";
// import { plans, resources } from "../../data/fetchResource";
import { useEffect, useState } from "react";
import { fetchResources } from "../../data/fetchs";
import { useDispatch, useSelector } from "react-redux";
import { setResourcesStore } from "../../states/reducers/resourceSlice";
import MachineBox from "../../components/Machines/MachineBox";
import MachineGrid from "../../components/Machines/MachineGrid";
import socket from "../../libs/socket-io/socket";


export default function DashboardResource() {
    const isGrid = useSelector((state) => state.layout.isGrid);

    const dispatch = useDispatch();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resourcesData] = await Promise.all([
                fetchResources(),
            ]);
            dispatch(setResourcesStore(resourcesData)); // Dispatch setResources
            setResources(resourcesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataWithoutLoading = async () => {
        try {
            const [resourcesData] = await Promise.all([
                fetchResources(),
            ]);
            dispatch(setResourcesStore(resourcesData)); // Dispatch setResources
            setResources(resourcesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } 
    };

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        const onConnect = () => {
            console.log('Connected:', socket.id);
        };
        const onDisconnect = () => {
            console.log('Disconnected:', socket.id);
        };

        const onRefreshFetchData = (data = {}) => {
            if (!data.status) return;
            fetchDataWithoutLoading();
        };



        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on('refreshFetchData', onRefreshFetchData);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off('refreshFetchData', onRefreshFetchData);
        };
    }, []);

    if (loading) {
        // Display a loading spinner while fetching data
        return (
            <LayoutDashboard>
                <Row justify="center" align="middle" style={{ height: '100vh' }}>
                    <Spin size="large" />
                </Row>
            </LayoutDashboard>
        );
    }

    return (
        <>
            <LayoutDashboard>
                <Row gutter={[8, 8]} style={{ maxWidth: '100%', marginTop: 5, marginBottom: 0 }}>
                    <StatusButton />
                </Row>
                <Divider style={{ margin: '5px 0px' }} />
                {/* Grid resource */}
                {isGrid ? (
                    <MachineGrid resources={resources} />
                ) : (
                    <MachineBox resources={resources} />
                )}
                {/* End Grid resource */}
            </LayoutDashboard>
        </>
    );
}

