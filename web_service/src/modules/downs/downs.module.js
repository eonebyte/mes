import fp from 'fastify-plugin';
import DownsController from './downs.controller.js';
import DownsService from './downs.service.js';


async function DownsModule(server, opts) {
    server.decorate('downsService', new DownsService());

    server.post('/api/resource/down/insert', DownsController.insertResourceEvent);
    server.post('/api/resource/down/start-insert', DownsController.startDowntime); //Manual start downtime
    server.post('/api/resource/down/end-insert', DownsController.endDowntime); //Manual end downtime
}

export default fp(DownsModule);