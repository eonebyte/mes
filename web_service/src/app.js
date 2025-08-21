'use strict';

import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from '@fastify/cors';
import autoload from '@fastify/autoload'
import socketIoService from './plugins/socketIO.js';
import { join } from 'desm'
import fastifyStatic from '@fastify/static';



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
        // expiry: 24 * 60 * 60, // Default 1 day
        expiry: 60 * 60, // 1 Jam
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
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
    await app.register(socketIoService);

    await app.register(fastifyStatic, {
        root: join(import.meta.url, '../../client/src/assets'),
        prefix: '/src/assets/', // URL prefix untuk mengakses assets di client
        decorateReply: false
    });


    await app.register(fastifyStatic, {
        root: join(import.meta.url, '../../client/dist'), // Menyesuaikan path ke folder 'dist'
        prefix: '/', // Semua file di folder dist akan dapat diakses melalui prefix ini
    });

    app.get('/', async (request, reply) => {
        return reply.sendFile('index.html'); // Mengakses file index.html di folder dist
    });

    app.get('/plan/list', async (request, reply) => {
        return reply.sendFile('index.html'); // Mengakses file index.html di folder dist
    });

    app.register(autoload, {
        dir: join(import.meta.url, 'modules'),
        encapsulate: false,
        maxDepth: 1,
        options: {
            prefix: '/api/v1'
        }
    })
    app.setErrorHandler(async (err, request, reply) => {
        if (err.validation) {
            reply.code(403)
            return err.message
        }
        request.log.error({ err })
        reply.code(err.statusCode || 500)

        return "I'm sorry, there was an error processing your request."
    })

    app.setNotFoundHandler(async (request, reply) => {
        reply.code(404)
        return "I'm sorry, I couldn't find what you were looking for."
    })



    return app;
}

export default build;



