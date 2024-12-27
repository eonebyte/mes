import DowntimeSocket from "../../modules/web-socket/downtime.socket.js";

export default async function WebSocketModule(fastify, opts) {
  fastify.register(DowntimeSocket);
}

