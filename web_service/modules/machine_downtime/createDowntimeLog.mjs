import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const influxDB = new InfluxDB({ url: 'http://localhost:8086', token: process.env.TOKEN });
const writeApi = influxDB.getWriteApi(process.env.ORG, process.env.BUCKET);

export default async function CreateDowntimeLog(fastify, opts) {
  const dbClient = await fastify.pg.connect();

  // const injectEventSimulation = async () => {
  //   const machines = [{ machineId: 1 }, { machineId: 2 }, { machineId: 3 }]; 
  //   const injectPromises = machines.map(async ({ machineId }) => {
  //     try {
  //       const lastRunningTime = await getLastRunningTime(machineId);
  //       const machineUUID = await getMachineUUID(machineId);

  //       await logInjectData(machineId);
  //       await updateLastRunningTime(machineId);

  //       await checkAndLogEvent(machineId, lastRunningTime, machineUUID);

  //       fastify.log.info(`Machine ${machineId} diinject pada : ${new Date()}`);
  //     } catch (error) {
  //       fastify.log.error(`Error processing machine ${machineId}:`, error);
  //     }
  //   });

  //   await Promise.all(injectPromises);
  // };

  // setInterval(injectEventSimulation, 5000);


  fastify.post('/api/inject-event', async (request, reply) => {
    const injectPromises = request.body.map(async ({ machineId }) => {
      try {
        const lastRunningTime = await getLastRunningTime(machineId);
        const machineUUID = await getMachineUUID(machineId);

        console.log("Last Running : " + lastRunningTime);


        await logInjectData(machineId);
        await updateLastRunningTime(machineId);

        await checkAndLogEvent(machineId, lastRunningTime, machineUUID);

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
      const result = await dbClient.query('SELECT last_running_time FROM mes.machines WHERE machine_id = $1', [machineId]);
      if (result.rows.length > 0) {
        console.log(`Last running time Machine ${machineId} : ` + result.rows[0].last_running_time);
        return new Date(result.rows[0].last_running_time);
      }
      return null;
    } catch (error) {
      fastify.log.error('Error fetching last running date:', error);
      return null;
    }
  };

  const getMachineUUID = async (machineId) => {
    try {
      const result = await dbClient.query('SELECT uuid FROM mes.machines WHERE machine_id = $1', [machineId]);
      if (result.rows.length > 0) {
        console.log(`Machine uuid ${machineId} : ` + result.rows[0].uuid);
        return result.rows[0].uuid;
      }
      return null;
    } catch (error) {
      fastify.log.error('Error fetching machine uuid:', error);
      return null;
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
    const currentTime = new Date();
    try {
      await dbClient.query('UPDATE mes.machines SET last_running_time = $1 WHERE machine_id = $2', [currentTime, machineId]);
      fastify.log.info(`Updated last running time for machine : ${machineId}`);
    } catch (error) {
      fastify.log.error(`Error updating last running time for machine ${machineId}:`, error);
    }
  };

  const checkAndLogEvent = async (machineId, lastRunningTime, mUUID) => {
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
        await logEvent(machineId, downtimeStartTime, downtimeEndTime, status, mUUID);
      }
    }
  };


  const logEvent = async (machineId, downtimeStartTime, downtimeEndTime, status, mUUID) => {
    console.log(mUUID);
    
    const duration = Math.floor((downtimeEndTime - downtimeStartTime) / 1000);
    const startTime = Math.floor(downtimeStartTime.getTime() / 1000);
    const endTime = Math.floor(downtimeEndTime.getTime() / 1000);
    const eventID = uuidv4()


    const point = new Point('machine_events')
      .tag('machine_id', machineId)
      .tag('event_id', eventID)
      .tag('channel_uuid', mUUID)
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
    } catch (error) {
      fastify.log.error(`Error logging downtime event for machine ${machineId}:`, error);
    }
  };
}
