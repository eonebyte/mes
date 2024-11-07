import { Epg, Layout } from "planby";
import { Timeline, ChannelItem, ProgramItem } from "../components/Planby";
import { useApp } from "../utils/useApp";
import LayoutDashboard from "../components/layouts/LayoutDashboard";
import { Row } from "antd";
import StatusButton from "../components/Buttons/StatusButton";

function MachineDowntime() {
    const { isLoading, getEpgProps, getLayoutProps } = useApp();

    return (
        <LayoutDashboard>
            <Row gutter={[8, 8]} style={{ maxWidth: '100%', margin: 0, marginTop: 5 }}>
                <StatusButton />
            </Row>
            <div style={{ height: "80vh", width: "100%" }}>
                <Epg isLoading={isLoading} {...getEpgProps()}>
                    <Layout
                        {...getLayoutProps()}
                        renderTimeline={(props) => <Timeline {...props} />}
                        renderProgram={({ program, ...rest }) => (
                            <ProgramItem key={program.data.id} program={program} {...rest} />
                        )}
                        renderChannel={({ channel }) => (
                            <ChannelItem key={channel.uuid} channel={channel} />
                        )}
                    />
                </Epg>
            </div>
        </LayoutDashboard>
    );
}

export default MachineDowntime;
