// import "./styles.css";
import { Epg, Layout } from "planby";

import { Timeline, ChannelItem, ProgramItem } from "../components/Planby";
import { useApp } from "./useApp";

function MachineDonwtime() {
    const { isLoading, getEpgProps, getLayoutProps } = useApp();

    return (
        <div>
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
        </div>
    );
}

export default MachineDonwtime;
