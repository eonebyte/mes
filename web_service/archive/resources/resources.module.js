import fp from 'fastify-plugin';
import ResourcesController from "./resources.controller.js";
import ResourcesService from "./resources.service.js";

async function ResourcesModule(server, opts) {
    server.decorate('resourcesService', new ResourcesService());

    server.get('/api/resources', ResourcesController.getResources);
    server.get('/api/resources/timelines', ResourcesController.getTimelines);
    server.get('/api/resource', ResourcesController.getResource);
    server.get('/api/resources/codes', ResourcesController.getCodes);
    // server.get('/api/resource/event', ResourcesController.getResouceEvents);
}

export default fp(ResourcesModule);