import ResourceController from "./resources.controller.js"

export default async function ResourceModule(server, opts) {
    server.get('/api/resources', ResourceController.getResources);
    server.get('/api/resource', ResourceController.getResource);
}