'use strict';

import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from '@fastify/cors';
import Main from './main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build(opts = {}) {
    const app = Fastify(opts);

    const DB_USER = process.env.DB_USER;
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_NAME = process.env.DB_NAME;
    const DB_HOST = process.env.DB_HOST;
    const REDIS_HOST = process.env.REDIS_HOST;
    const REDIS_PORT = process.env.REDIS_PORT;
    const REDIS_PASS = process.env.REDIS_PASS;



    await app.register(cors, {
        origin: true,
        credentials: true,
    });

    app.register(import('@fastify/secure-session'), {
        sessionName: 'session',
        // cookieName: 'my-session-cookie',
        key: fs.readFileSync(path.join(__dirname, 'api')),
        expiry: 24 * 60 * 60, // Default 1 day
        cookie: {
            path: '/'
            // options for setCookie, see https://github.com/app/app-cookie
        }
    })

    await app.register(await import('@fastify/postgres'), {
        connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
    });
    // Test PostgreSQL connection
    const client = await app.pg.connect();
    await client.query('SELECT NOW()');
    console.log('Connected to PostgreSQL successfully');
    client.release();

    try {
        await app.register(await import('@fastify/redis'), {
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASS,
        });
        // Tes ping Redis setelah koneksi
        const pong = await app.redis.ping();
        console.log('Redis Ping:', pong);
    } catch (err) {
        console.error('❌ Redis Connection Failed:', err);
    }

    // modules
    await app.register(formbody);
    await app.register(Main);

    return app;
}

export default build;



