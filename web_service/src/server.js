'use strict';
import build from './app.js';
import closeWithGrace from 'close-with-grace';
import dotenv from 'dotenv';

dotenv.config()



async function startServer() {


  const opts = {
    logger: {
      level: 'info'
    },

    // ajv: {
    //   customOptions: {
    //     coerceTypes: false, // Nonaktifkan konversi tipe otomatis
    //   },
    // },
  }

  if (process.stdout.isTTY) {
    opts.logger.transport = { target: 'pino-pretty' }
  }

  const port = process.env.PORT;
  const host = process.env.HOST || '127.0.0.1'

  const app = await build(opts)
  console.log(app.printRoutes())
  await app.listen({ port, host })

  closeWithGrace(async ({ err }) => {
    if (err) {
      app.log.error({ err }, 'server closing due to error')
    }
    app.log.info('shutting down gracefully')
    await app.close()
  })
}

startServer();
