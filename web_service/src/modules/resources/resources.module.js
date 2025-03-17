import ResourceController from "./resources.controller.js"

async function ResourceModule(server, opts) {
    server.get('/api/resources', ResourceController.getResources);
    server.get('/api/resource', ResourceController.getResource);
}

export default ResourceModule;