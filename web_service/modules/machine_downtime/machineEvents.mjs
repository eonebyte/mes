import 'dotenv/config';

export default async function MachineEvents(fastify, opts) {
  fastify.get('/api/machine-downtime/machine-events', async (request, reply) => {
    const dbClient = await fastify.pg.connect();
    try {
      const query = `
        SELECT
          event_id,
          machine_id,
          status,
          start_time,  -- epoch timestamp
          end_time,    -- epoch timestamp
          duration
        FROM
          mes.machine_events
        WHERE
          start_time >= extract(epoch from current_date)  -- Mulai dari 00:00 hari kemarin
          AND end_time <= extract(epoch from current_date + interval '1 day')  -- Sampai 23:59 hari ini
        ORDER BY
          start_time;
      `;
      const result = await dbClient.query(query);

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'No machine events found' });
      }

      const events = result.rows.map(row => {
        const { start_time, end_time, duration, ...rest } = row;

        const formatDuration = (duration) => {
          const days = Math.floor(duration / (24 * 3600));
          const hours = Math.floor((duration % (24 * 3600)) / 3600);
          const minutes = Math.floor((duration % 3600) / 60);
          const seconds = duration % 60;
          return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
        };

        return {
          eventId: rest.event_id,
          machineId: rest.machine_id,
          status: rest.status,
          startTime: new Date(start_time * 1000), // Convert from epoch timestamp ke Date
          endTime: new Date(end_time * 1000), // Convert from epoch timestamp ke Date
          startTimeLocal: new Date(start_time * 1000),
          endTimeLocal: new Date(end_time * 1000),
          startTimeLocalString: new Date(start_time * 1000).toLocaleString(),
          endTimeLocalString: new Date(end_time * 1000).toLocaleString(),
          duration,
          durationText: formatDuration(duration),
          eventColor: '#FF0000',
        };
      });

      reply.send(events);
    } catch (error) {
      fastify.log.error('Error fetching machine events:', error);
      reply.status(500).send({ error: 'Failed to fetch machine events' });
    } finally {
      dbClient.release(); 
    }
  });
}
