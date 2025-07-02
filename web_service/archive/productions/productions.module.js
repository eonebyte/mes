import fp from 'fastify-plugin';
import ProductionsService from './productions.service.js';
import ProductionsController from './productions.controller.js';


async function ProductionsModule(server, opts) {
    server.decorate('productionsService', new ProductionsService());

    server.post('/api/productions/material-input', ProductionsController.materialInput)
    server.post('/api/productions/insert-defect', ProductionsController.createQtyDefect)
    server.get('/api/productions/:planId/defects', ProductionsController.getDefects)
    server.post('/api/productions/update-outputqty', ProductionsController.updateProductionOutputQty)
    server.post('/api/productions/update-lostqty', ProductionsController.updateProductionLostQty)
}

export default fp(ProductionsModule);