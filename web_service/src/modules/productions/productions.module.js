import fp from 'fastify-plugin';
import ProductionsService from './productions.service.js';
import ProductionsController from './productions.controller.js';


async function ProductionsModule(server, opts) {
    server.decorate('productionsService', new ProductionsService());

    server.post('/api/productions/material-input', ProductionsController.materialInput)
}

export default fp(ProductionsModule);