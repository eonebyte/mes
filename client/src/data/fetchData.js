// import { channels } from "./channels";
// import { epg } from "./epg";

// export const fetchChannels = async () =>
//     new Promise((res) => setTimeout(() => res(channels), 400));

// export const fetchEpg = async () =>
//     new Promise((res) => setTimeout(() => res(epg), 500));

import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Menambahkan plugin timezone dan utc
dayjs.extend(timezone);
dayjs.extend(utc);

export const fetchResources = async () => {
    try {
        const resourcesRes = await axios.get('http://localhost:3080/api/resource/down/resources');

        console.log('Raw resources data:', resourcesRes.data); // 🔍 Log awal

        const resources = Array.isArray(resourcesRes.data)
            ? resourcesRes.data.map(resource => ({
                machine_id: resource.id,
                machine_name: resource.name,
            }))
            : [];

        console.log('Formatted resources:', resources); // 🔍 Log hasil format

        return resources;
    } catch (error) {
        console.error("Error fetching data machines:", error);
    }
};

export const fetchTasks = async () => {
    try {
        const eventsRes = await axios.get('http://localhost:3080/api/resources/events');

        console.log('Raw events data:', eventsRes.data); // 🔍 Log awal

        const events = Array.isArray(eventsRes.data)
            ? eventsRes.data.map(event => ({
                event_id: event.eventId,
                machine_id: event.machineId,
                start_time: event.startTime,
                end_time: event.endTime,
                task_color: event.eventColor
            })).sort((a, b) => dayjs(a.start_time).isBefore(dayjs(b.start_time)) ? -1 : 1)
            : [];

        console.log('Formatted events:', events); // 🔍 Log hasil format

        return events;
    } catch (error) {
        console.error("Error fetching data events:", error);
    }
};


