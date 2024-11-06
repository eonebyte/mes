import DowntimeSocket from "../modules/web_socket/downtimeSocket.mjs";

export default async function webSocketPlugin(fastify, opts) {
  fastify.register(DowntimeSocket);
}

