import { InfluxDB, Point } from '@influxdata/influxdb-client';

import 'dotenv/config';

const influxDB = new InfluxDB({ url: 'http://localhost:8086', token: process.env.TOKEN });

export async function GetMachines(fastify, opts) {
  fastify.get('/api/machines', async (request, reply) => {
    const dbClient = await fastify.pg.connect();
    try {
      const { rows } = await dbClient.query('SELECT machine_id, uuid, machine_name FROM mes.machines')
      if (rows.length > 0) {
        console.log('Berhasil fetch data semua machine');
        return reply.send(rows);
      }
      return reply.status(404).send({ error: 'No machines found' });
    } catch (error) {
      fastify.log.error('Error fetch data machine: ', error)
      return reply.status(500).send({ error: 'Internal server error' });
    } finally {
      dbClient.release();
    }
  });
}

// Fungsi plugin Fastify
export async function ReadDowntimeLog(fastify, opts) {
  fastify.get('/api/machine-events', async (request, reply) => {
    try {
      const query = `
  from(bucket: "${process.env.BUCKET}")
    |> range(start: -2d) // adjust the time range as needed
    |> filter(fn: (r) => r._measurement == "machine_events")
    |> filter(fn: (r) => r._field == "duration" or r._field == "start_time" or r._field == "end_time")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> keep(columns: ["event_id", "machine_id", "channel_uuid", "status", "start_time", "end_time", "duration"])
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
          return `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`;
        };

        return {
          eventId: row.event_id,
          channelUuid: row.channel_uuid,
          machineId: row.machine_id,
          status: row.status,
          startTime: startTime,
          endTime: endTime,
          startTimeLocal: startTime.toLocaleString(),
          endTimeLocal: endTime.toLocaleString(),
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