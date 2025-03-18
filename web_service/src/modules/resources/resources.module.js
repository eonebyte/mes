import fp from 'fastify-plugin';
import ResourcesController from "./resources.controller.js";
import ResourcesService from "./resources.service.js";

async function ResourcesModule(server, opts) {
    server.decorate('resourcesService', new ResourcesService());

    server.get('/api/resources', ResourcesController.getResources);
    server.get('/api/resource', ResourcesController.getResource);
    server.post('/api/resource/log', ResourcesController.insertResourceEvent);
    server.post('/api/resource/log/start-downtime', ResourcesController.startDowntime);
    server.post('/api/resource/log/end-downtime', ResourcesController.endDowntime);
}

export default fp(ResourcesModule);