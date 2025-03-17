import 'dotenv/config';
import Resource from '../../models/resource.js';
import Event from '../../models/event.js';
import { injectEventSchema } from './schemas/inject.event.schema.js';

export default async function InjectEvent(fastify, opts) {
  

  fastify.post('/api/machine-downtime/inject-event', { schema: injectEventSchema } , async (request, reply) => {
    const dbClient = await fastify.pg.connect();
    try {
      const injectPromises = request.body.map(async ({ machineId }) => {
        try {
          const lastRunningTime = await Resource.getLastRunningTime(dbClient, machineId);
          await updateLastRunningTime(dbClient, machineId);
          await checkAndCreateEvent(dbClient, machineId, lastRunningTime);
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


const updateLastRunningTime = async (dbClient, machineId) => {
  try {
    await Resource.updateLastRunningTime(dbClient, machineId);
    fastify.log.info(`Updated last running time for machine : ${machineId}`);
  } catch (error) {
    fastify.log.error(`Error updating last running time for machine ${machineId}:`, error);
  }
};

const checkAndCreateEvent = async (dbClient, machineId, lastRunningTime) => {
  const currentTime = new Date();
  const runningThreshold = 300;
  let status;

  if (lastRunningTime && !isNaN(lastRunningTime.getTime())) {
    const eventDuration = (currentTime - lastRunningTime) / 1000; // in seconds
    if (eventDuration > runningThreshold) {
      const eventStartTime = lastRunningTime;
      const eventEndTime = currentTime;
      status = 'downtime';
      await createEvent(dbClient, machineId, eventStartTime, eventEndTime, status);
    }
  }
};

const createEvent = async (dbClient, machineId, eventStartTime, eventEndTime, status) => {
  try {
    await Event.create(dbClient, machineId, eventStartTime, eventEndTime, status);
  } catch (error) {
    console.error('Terjadi kesalahan saat menyimpan event:', error);
    throw error;
  }
};
}
