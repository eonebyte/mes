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
        const resourcesRes = await axios.get('http://localhost:3000/api/machine-downtime/machines');

        // Memastikan resources adalah array
        const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data.map(resource => ({
            machine_id: resource.id, // ID mesin
            machine_name: resource.name,
        })) : [];
        return resources;
    } catch (error) {
        console.error("Error fetching data machines:", error);
    }
}

export const fetchTasks = async () => {
    try {
        const eventsRes = await axios.get('http://localhost:3000/api/machine-downtime/machine-events');


        const events = Array.isArray(eventsRes.data) ? eventsRes.data.map(event => {

            return {
                event_id: event.eventId,
                machine_id: event.machineId,
                start_time: event.startTime,
                end_time: event.endTime,
                task_color: event.eventColor
            };
        }).sort((a, b) => dayjs(a.since).isBefore(dayjs(b.since)) ? -1 : 1) : [];
        console.log('events: ', events);
        
        return events;
    } catch (error) {
        console.error("Error fetching data events:", error);
    }
}

