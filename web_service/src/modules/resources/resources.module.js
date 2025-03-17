import fp from 'fastify-plugin';
import ResourceController from "./resources.controller.js";
import ResourcesService from "./resources.service.js";

async function ResourceModule(server, opts) {
    server.decorate('resourcesService', new ResourcesService());

    server.get('/api/resources', ResourceController.getResources);
    server.get('/api/resource', ResourceController.getResource);
    server.post('/api/resource/log', ResourceController.insertResourceLog);
    server.post('/api/resource/log/start-downtime', ResourceController.startDowntime);
    server.post('/api/resource/log/end-downtime', ResourceController.endDowntime);
}

export default fp(ResourceModule);