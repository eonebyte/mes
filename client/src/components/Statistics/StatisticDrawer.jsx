import { useState } from "react";
import { Button, Drawer } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import StatisticChart from "./StatisticChart";
import StatisticChartRealTime from "./StatisticChartRealTime";
import { createStyles } from 'antd-style';
const useStyle = createStyles(() => ({
    'my-drawer-body': {
        background: "#f5f5f5"
    },
}))



export default function StatisticDrawer() {

    const { styles } = useStyle();
    const classNames = {
        body: styles['my-drawer-body']
    }

    const [open, setOpen] = useState(false);
    const onClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button style={{ marginLeft: 3 }} size="small" onClick={() => setOpen(true)}>
                <LineChartOutlined />
            </Button>

            <Drawer
                title="Machine Statistics"
                placement="right"
                width="100%"
                onClose={onClose}
                open={open}
                classNames={classNames}
            >
                <StatisticChart />
                <StatisticChartRealTime />
            </Drawer>
        </>
    )
}
