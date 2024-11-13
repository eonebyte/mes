import React from "react";
import dayjs from 'dayjs';

// Import timezone plugin
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { fetchChannels, fetchEpg } from "../components/Planby/helpers";

import { useEpg } from "planby";

// Import theme
import { theme } from "../components/Planby/helpers/theme";

dayjs.extend(timezone);
dayjs.extend(utc);

export function useApp() {
    const [channels, setChannels] = React.useState([]);
    const [epg, setEpg] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const channelsData = React.useMemo(() => channels, [channels]);
    const epgData = React.useMemo(() => epg, [epg]);


    const todayStart = dayjs().tz("Asia/Jakarta").startOf('day').format('YYYY-MM-DDTHH:mm:ss'); // Jam 00:00:00
    const todayEnd = dayjs().tz("Asia/Jakarta").endOf('day').format('YYYY-MM-DDTHH:mm:ss'); // Jam 23:59:59
    
    // Menampilkan hasil
    console.log("Start Date:", todayStart); // Format: 2024-11-07T00:00:00
    console.log("End Date:", todayEnd); // Format: 2024-11-07T23:59:59


    const { getEpgProps, getLayoutProps } = useEpg({
        channels: channelsData,
        epg: epgData,
        dayWidth: 7200,
        sidebarWidth: 100,
        itemHeight: 80,
        isSidebar: true,
        isTimeline: true,
        isLine: true,
        startDate: todayStart,
        endDate: todayEnd,
        isBaseTimeFormat: true,
        theme,
    });

    const handleFetchResources = React.useCallback(async () => {

        setIsLoading(true);
        const epg = await fetchEpg();
        const channels = await fetchChannels();
        console.log('epg', epg);

        setEpg(epg);
        setChannels(channels);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        handleFetchResources();
    }, [handleFetchResources]);
    


    console.log(getEpgProps());


    return { getEpgProps, getLayoutProps, isLoading };
}
