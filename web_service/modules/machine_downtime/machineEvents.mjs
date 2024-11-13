import { InfluxDB, Point } from '@influxdata/influxdb-client';
import dayjs from 'dayjs';
import 'dotenv/config';

const influxDB = new InfluxDB({ url: 'http://localhost:8086', token: process.env.TOKEN });

// Fungsi plugin Fastify
export default async function MachineEvents(fastify, opts) {
  fastify.get('/api/machine-downtime/machine-events', async (request, reply) => {
    try {
      const startOfYesterday = dayjs().subtract(1, 'day').startOf('day').toISOString();
      const endOfToday = dayjs().toISOString();
      const query = `
  from(bucket: "${process.env.BUCKET}")
    |> range(start: ${startOfYesterday}, stop: ${endOfToday}) 
    |> filter(fn: (r) => r._measurement == "machine_events")
    |> filter(fn: (r) => r._field == "duration" or r._field == "start_time" or r._field == "end_time")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> keep(columns: ["event_id", "machine_id", "status", "start_time", "end_time", "duration"])
`;

      // Execute the query
      const result = await influxDB.getQueryApi(process.env.ORG).collectRows(query);

      // Check if result is empty
      if (!result.length) {
        return reply.status(404).send({ error: 'No machine events found' });
      }

      // Map and sort events by start_time
      const events = result.map(row => {
        const startTime = new Date(row.start_time * 1000);
        const endTime = new Date(row.end_time * 1000);
        const durationInSeconds = row.duration;

        const formatDuration = (duration) => {
          const days = Math.floor(duration / (24 * 3600));
          const hours = Math.floor((duration % (24 * 3600)) / 3600);
          const minutes = Math.floor((duration % 3600) / 60);
          const seconds = duration % 60;
          return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
        };

        return {
          eventId: row.event_id,
          machineId: parseInt(row.machine_id),
          status: row.status,
          startTime: startTime,
          endTime: endTime,
          startTimeLocal: startTime,
          endTimeLocal: endTime,
          startTimeLocalString: startTime.toLocaleString(), // Waktu lokal sebagai string
          endTimeLocalString: endTime.toLocaleString(), 
          duration: durationInSeconds,
          durationText: formatDuration(durationInSeconds),
          eventColor: '#FF0000',
        };
      });

      reply.send(events);
    } catch (error) {
      // Log the error and respond with a 500 status
      fastify.log.error('Error fetching machine events:', error);
      reply.status(500).send({ error: 'Failed to fetch machine events' });
    }
  });
}