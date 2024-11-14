import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import Resource from '../../models/resource.mjs';

export default async function InjectEvent(fastify, opts) {

  const dbClient = await fastify.pg.connect();

  fastify.post('/api/machine-downtime/inject-event', async (request, reply) => {
    const dbClient = await fastify.pg.connect();

    try {
      const injectPromises = request.body.map(async ({ machineId }) => {
        try {
          const lastRunningTime = await Resource.getLastRunningTime(dbClient, machineId);
          await updateLastRunningTime(machineId);
          await checkAndLogEvent(machineId, lastRunningTime);
          fastify.log.info(`Machine ${machineId} diinject pada : ${new Date()}`);
        } catch (error) {
          fastify.log.error(`Error processing machine ${machineId}:`, error);
        }
      });

      await Promise.all(injectPromises);
      reply.send({ message: 'Inject data received and processed' });
    } catch (error) {
      fastify.log.error('Error in processing inject event:', error);
      reply.code(500).send({ message: 'Error processing inject event' });
    } finally {
      dbClient.release();
    }
  });


  const updateLastRunningTime = async (machineId) => {
    try {
      await Resource.updateLastRunningTime(dbClient, machineId);
      fastify.log.info(`Updated last running time for machine : ${machineId}`);
    } catch (error) {
      fastify.log.error(`Error updating last running time for machine ${machineId}:`, error);
    }
  };

  const checkAndLogEvent = async (machineId, lastRunningTime) => {
    console.log('tes machine id: ', machineId);
    console.log('tes last running: ', lastRunningTime);

    const currentTime = new Date();
    const runningThreshold = 300;
    let status;

    if (lastRunningTime && !isNaN(lastRunningTime.getTime())) {
      const downtimeDuration = (currentTime - lastRunningTime) / 1000; // in seconds
      if (downtimeDuration > runningThreshold) {
        const downtimeStartTime = lastRunningTime;
        const downtimeEndTime = currentTime;
        status = 'downtime';
        await logEvent(machineId, downtimeStartTime, downtimeEndTime, status);
      }
    }
  };

  const logEvent = async (machineId, downtimeStartTime, downtimeEndTime, status) => {
    const duration = Math.floor((downtimeEndTime - downtimeStartTime) / 1000);
    const startTime = Math.floor(downtimeStartTime.getTime() / 1000);
    const endTime = Math.floor(downtimeEndTime.getTime() / 1000);
    const eventID = uuidv4();

    try {
      const query = `
      INSERT INTO mes.machine_events 
      (machine_id, event_id, status, start_time, end_time, duration) 
      VALUES 
      ($1, $2, $3, $4, $5, $6) 
      RETURNING id
    `;

      const res = await dbClient.query(query, [machineId, eventID, status, startTime, endTime, duration]);
      if (res.rows.length > 0) {
        const eventIdInserted = res.rows[0].id;
        return eventIdInserted;
      } else {
        throw new Error('Failed to insert event: No ID returned');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat menyimpan event:', error);
      throw error;
    }
  };
}
