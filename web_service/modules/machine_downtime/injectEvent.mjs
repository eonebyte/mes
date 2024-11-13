import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import Resource from '../../models/resource.mjs';

const influxDB = new InfluxDB({ url: 'http://localhost:8086', token: process.env.TOKEN });
const writeApi = influxDB.getWriteApi(process.env.ORG, process.env.BUCKET);

export default async function InjectEvent(fastify, opts) {

  fastify.get('/ws', { websocket: true }, (socket, req) => {
    socket.send(JSON.stringify({ message: 'Connected to WebSocket server', timestamp: new Date() }));
    socket.on('close', () => {
      fastify.log.info('WebSocket connection closed');
    });
  });

  const broadcast = (message) => {
    fastify.websocketServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  };

  const dbClient = await fastify.pg.connect();

  // const injectEventSimulation = async () => {
  //   const machines = [{ machineId: 2 }, { machineId: 3 }];
  //   const injectPromises = machines.map(async ({ machineId }) => {
  //     try {
  //       const lastRunningTime = await getLastRunningTime(machineId);

  //       await logInjectData(machineId);
  //       await updateLastRunningTime(machineId);
  //       await checkAndLogEvent(machineId, lastRunningTime);

  //       fastify.log.info(`Machine ${machineId} injected at: ${new Date()}`);
  //     } catch (error) {
  //       fastify.log.error(`Error processing machine ${machineId}:`, error);
  //     }
  //   });

  //   await Promise.all(injectPromises);
  // };

  // setInterval(injectEventSimulation, 5000); // Injeksi data setiap 1 menit


  fastify.post('/api/machine-downtime/inject-event', async (request, reply) => {
    const injectPromises = request.body.map(async ({ machineId }) => {
      try {
        const lastRunningTime = await getLastRunningTime(machineId);

        console.log("Last Running : " + lastRunningTime);


        await logInjectData(machineId);
        await updateLastRunningTime(machineId);

        await checkAndLogEvent(machineId, lastRunningTime);

        fastify.log.info(`Machine ${machineId} diinject pada : ${new Date()}`);
      } catch (error) {
        fastify.log.error(`Error processing machine ${machineId}:`, error);
      }
    });

    await Promise.all(injectPromises);

    reply.send({ message: 'Inject data received and processed' });
  });

  const getLastRunningTime = async (machineId) => {
    try {
      const lastRunningTime = await Resource.getLastRunningTime(dbClient, machineId);

      if (lastRunningTime) {
        return lastRunningTime;
      }

      console.log(`No running time found for machine ${machineId}`);
      return null;
    } catch (error) {
      fastify.log.error('Error fetching last running date:', error);
      return null;
    } finally {
      dbClient.release();  // Pastikan dbClient selalu dibebaskan
    }
  };

  const logInjectData = async (machineId) => {
    const currentTime = new Date();

    console.log("Current Time : " + currentTime);


    const point = new Point('machine_log')
      .tag('machine_id', machineId)
      .floatField('status', 1)
      .timestamp(currentTime);
    console.log('Point to write:', point);

    try {
      await writeApi.writePoint(point);
      await writeApi.flush(); // Pastikan data tertulis
      fastify.log.info(`Simpan inject machine ${machineId} pada : ${currentTime}`);
    } catch (error) {
      fastify.log.error(`Error saving machine log for machine ${machineId}:`, error);
    }
  };


  const updateLastRunningTime = async (machineId) => {
    try {
      await Resource.updateLastRunningTime(dbClient, machineId);
      fastify.log.info(`Updated last running time for machine : ${machineId}`);
    } catch (error) {
      fastify.log.error(`Error updating last running time for machine ${machineId}:`, error);
    } finally {
      dbClient.release(); 
    }
  };

  const checkAndLogEvent = async (machineId, lastRunningTime) => {
    const currentTime = new Date();
    const runningThreshold = 300;
    let status;

    if (lastRunningTime && !isNaN(lastRunningTime.getTime())) {
      const downtimeDuration = (currentTime - lastRunningTime) / 1000; // in seconds

      console.log("Inject Duration: " + downtimeDuration);


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
    const eventID = uuidv4()


    const point = new Point('machine_events')
      .tag('machine_id', machineId)
      .tag('event_id', eventID)
      .tag('status', status)
      .floatField('start_time', startTime)
      .floatField('end_time', endTime)
      .floatField('duration', duration);

    console.log(`start: ${startTime}, endtime: ${endTime}, duration: ${duration}`);
    console.log('Point to write:', point);
    console.log('Machine UUID:', mUUID);

    try {
      await writeApi.writePoint(point);
      await writeApi.flush(); // Pastikan data tertulis
      fastify.log.info(`Successfully logged downtime event for machine ${machineId} from ${startTime} to ${endTime}`);
      broadcast({ message: { status: 'New Inject', machine_id: machineId }, timestamp: new Date() });
    } catch (error) {
      fastify.log.error(`Error logging downtime event for machine ${machineId}:`, error);
    }
  };
}
