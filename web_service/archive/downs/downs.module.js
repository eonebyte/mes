import fp from 'fastify-plugin';
import DownsController from './downs.controller.js';
import DownsService from './downs.service.js';

async function DownsModule(server, opts) {
    server.decorate('downsService', new DownsService());

    server.post('/api/resource/down/insert', DownsController.insertResourceEvent);
    server.post('/api/resource/down/start-insert', DownsController.startDowntime); //Manual start downtime
    server.post('/api/resource/down/end-insert', DownsController.endDowntime); //Manual end downtime
    server.get('/api/resource/downs', DownsController.getDowns);
    server.get('/api/resource/down/resources', DownsController.getResources);


}

export default fp(DownsModule);