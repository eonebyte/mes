// server.js
const fastify = require('fastify')({
    logger: true
});
const cors = require('@fastify/cors');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { Server } = require('socket.io');

// Konfigurasi InfluxDB
const token = 'GDvvr1RMzHwHaQOxLa67CXEjIALC-fnZ28p5G6TNYZ5b1W3_lsDmeb1iSfYAAQdA7oUqIsfMrSnxUGupEs8mgA=='; // Ganti dengan token Anda
const org = 'eone';
const bucket = 'machine_downtime';

const client = new InfluxDB({ url: 'http://localhost:8086', token });
const queryClient = client.getQueryApi(org);
const writeApi = client.getWriteApi(org, bucket);

// Variabel untuk menyimpan waktu terakhir data diterima
let lastReceivedTime = Date.now();

fastify.register(cors, {
    origin: 'http://localhost:5173', // Ganti dengan asal yang sesuai
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// Setup Socket.IO
const io = new Server(fastify.server, {
    cors: {
        origin: 'http://localhost:5173', // Atur origin untuk Socket.IO
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
});

io.on("connection", (socket) => {
    console.log("User connected ", socket.id); // Log the socket ID of the connected user

    // Listen for "send_message" events from the connected client
    socket.on("send_message", (data) => {
        console.log("Message Received ", data); // Log the received message data

        // Emit the received message data to all connected clients
        io.emit("receive_message", data);
    });
});

// Jalankan server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server berjalan di http://localhost:3000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
