import fp from 'fastify-plugin';
import ResourcesController from "./resources.controller.js";
import ResourcesService from "./resources.service.js";

async function ResourcesModule(server, opts) {
    server.decorate('resourcesService', new ResourcesService());

    server.get('/api/resources', ResourcesController.getResources);
    server.get('/api/resource', ResourcesController.getResource);
}

export default fp(ResourcesModule);