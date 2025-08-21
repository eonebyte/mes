import { Server } from "socket.io";
import fp from 'fastify-plugin';

async function socketIoService(fastify) {
  const io = new Server(fastify.server, {
    cors: { origin: "*", methods: ["GET", "POST"] }, // Allow all origins and methods
  });
  fastify.io = io;

  io.on("connection", (socket) => {

    socket.on('gantt-task-changed', (taskData) => {

      fastify.log.info(`Menerima perubahan untuk task ID: ${taskData.id} dari klien ${socket.id}`);
      socket.broadcast.emit('gantt-task-updated', taskData);
    });

    socket.on('gantt-task-save-db', (ganttData) => {
      socket.broadcast.emit('gantt-task-saved', ganttData);
    });


    socket.on("refreshServer", async (data) => {
      console.log('Menerima request refresh dari frontend, data:', data);
      console.log('server:', fastify);
      const assetEvent = await fastify.resource.getAssetEventByResourceId(fastify, data.resourceId)

      console.log('ini assetEvent:', assetEvent);

      if (data) {
        const payload = {
          status: true,
          message: "Data updated",
          data: assetEvent
        };
        io.emit("refreshFetchData", payload);
      }
    });


    // Mengambil informasi detail pengguna
    const ipServer = socket.handshake.address;;
    const userAgent = socket.request.headers['user-agent']; // User-Agent header

    console.log(`User ID connection ${socket.id}`);
    console.log(`IP-Server: ${ipServer}`);
    console.log(`User-Agent: ${userAgent}`);

    socket.on('disconnect', () => {
      console.log('User Disconnected')
    })
  });

  io.on("error", (error) => {
    console.error("Socket.IO Error:", error);
  });

}

export default fp(socketIoService);