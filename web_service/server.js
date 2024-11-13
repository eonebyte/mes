'use strict';

import Fastify from 'fastify';
import 'dotenv/config';
import cors from '@fastify/cors';
import FastifyWebSocket from '@fastify/websocket';
import MachineDowntimePlugin from './plugins/machineDowntimePlugin.mjs';
import WebSocketPlugin from './plugins/webSocketPlugin.mjs';

const server = Fastify();

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;

try {
  await server.register(cors, {
    origin: 'http://localhost:5173',
  });

  await server.register(import('@fastify/postgres'), {
    connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
  });

    // Test PostgreSQL connection
    const client = await server.pg.connect();
    await client.query('SELECT NOW()'); 
    console.log('Connected to PostgreSQL successfully');
    client.release(); 

  await server.register(FastifyWebSocket);
  await server.register(MachineDowntimePlugin);
  // await server.register(WebSocketPlugin);

  await server.listen({ port: 3000 });
  console.log('Server is running at http://localhost:3000');
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
