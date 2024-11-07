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

export const fetchChannels = async () => {
    try {
        const resourcesRes = await axios.get('http://localhost:3000/api/machines');

        // Memastikan resources adalah array
        const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data.map(resource => ({
            uuid: resource.uuid, // ID mesin
            type: "channel",
            logo: `https://picsum.photos/200?random=${resource.machine_id}`,
            title: resource.machine_name,
            year: 2024
        })) : []; 
        return resources;
    } catch (error) {
        console.error("Error fetching data machines:", error);
    }
}

export const fetchEpg = async () => {
    try {
        const eventsRes = await axios.get('http://localhost:3000/api/machine-events');


            const events = Array.isArray(eventsRes.data) ? eventsRes.data.map(event => {

                const startDate = dayjs(event.startTime).tz("Asia/Jakarta").format('YYYY-MM-DDTHH:mm:ss');
                const endDate = dayjs(event.endTime).tz("Asia/Jakarta").format('YYYY-MM-DDTHH:mm:ss');
    
                // Menampilkan hasil waktu lokal
                console.log("Start Date data:", startDate);
                console.log("End Date data:", endDate);
                
                
                // Format waktu tanpa milidetik dan zona waktu
                return {
                    channelUuid: event.channelUuid,
                    description: 'Ut anim nisi consequat minim deserunt...',
                    id: event.eventId,
                    image: `https://picsum.photos/400?random=${event.eventId}`,
                    title: event.status,
                    since: startDate,  // Format startTime lokal
                    till: endDate     // Format endTime lokal
                };
            }).sort((a, b) => dayjs(a.since).isBefore(dayjs(b.since)) ? -1 : 1) : [];
            return events;
        } catch (error) {
            console.error("Error fetching data events:", error);
        }
}

