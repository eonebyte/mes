import { InfluxDB, Point } from '@influxdata/influxdb-client';

const token = 'GDvvr1RMzHwHaQOxLa67CXEjIALC-fnZ28p5G6TNYZ5b1W3_lsDmeb1iSfYAAQdA7oUqIsfMrSnxUGupEs8mgA=='; // Ganti dengan token Anda
const org = 'eone';
const bucket = 'machine_downtime';

const influxDB = new InfluxDB({ url: 'http://localhost:8086', token });
const writeApi = influxDB.getWriteApi(org, bucket);

export default async function DowntimeSocket(fastify, opts) {
  const clients = new Set();

  fastify.get('/websocket', { websocket: true }, (socket, req) => {
    const clientId = Date.now() + Math.random(); 
    clients.add(socket); // Menyimpan socket klien

    console.log(`Client connected: ${clientId}`);

    const interval = setInterval( async() => {
      const deviceId = generateDeviceId(); 
      const timestamp = new Date().toISOString(); 
      await saveToInfluxDB(deviceId, timestamp, clients);
    }, 60000); // 10 detik

    socket.on('message', message => {
      console.log(`Received from client ${clientId}:`, message.toString());
      
      // Mengirim balasan ke klien yang mengirim pesan
      socket.send(`hi from server (Client ID: ${clientId})`);
    });

    socket.on('close', () => {
      console.log(`Client disconnected: ${clientId}`);
      clearInterval(interval); 
      clients.delete(socket); 
    });
  });
}

function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substr(2, 9);
}

async function saveToInfluxDB(deviceId, timestamp, clients) {
  const point = new Point('downtime_events')
  .tag('device_id', deviceId)
  .floatField('value', Math.random()) // Nilai acak untuk demonstrasi
  .timestamp(new Date());

  try {
    await writeApi.writePoint(point);
    await writeApi.flush(); // Mengirim data ke InfluxDB
    console.log(`Data saved to InfluxDB: device_id = ${deviceId}, timestamp = ${timestamp}`);

    const message = JSON.stringify({ device_id: deviceId, timestamp });
    for (const client of clients) {
      client.send(message);
    }
  } catch (error) {
    console.error('Error saving data to InfluxDB:', error);
  }
}
