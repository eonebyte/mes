'use strict';

import Fastify from 'fastify';
import 'dotenv/config';
import cors from '@fastify/cors';
import APIV1 from './plugins/api.v1.js';

const server = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: false, // Nonaktifkan konversi tipe otomatis
    },
  },
});

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;

const BASE_PORT = process.env.BASE_PORT;

await server.register(cors, {
  origin: '*',
  // origin: 'http://localhost:5173',
});

await server.register(import('@fastify/postgres'), {
  connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
});

// Test PostgreSQL connection
const client = await server.pg.connect();
await client.query('SELECT NOW()');
console.log('Connected to PostgreSQL successfully');
client.release();

// plugins
await server.register(APIV1);

// start server
const startServer = async () => {
  try {
    server.listen({
      port: BASE_PORT,
      host: '0.0.0.0'
    });
    console.log('Server started successfully');
  } catch (err) {
    server.log.error(err)
    process.exit(1);
  }
}


startServer();

