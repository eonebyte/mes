'use strict';
import build from './app.js';

 const BASE_PORT = process.env.BASE_PORT;
async function startServer() {
  const opts = {
    logger: {
      level: 'info'
    },
    ajv: {
      customOptions: {
        coerceTypes: false, // Nonaktifkan konversi tipe otomatis
      },
    },
  }

  if (process.stdout.isTTY) {
    opts.logger.transport = { target: 'pino-pretty' }
  }

  const app = await build(opts)
  try {
    app.listen({ port: BASE_PORT });
    app.log.info(`Server listening at http://localhost:${BASE_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
