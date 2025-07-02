import fp from 'fastify-plugin';
import WarehousesService from './warehouses.services.js';
import WarehousesController from './warehouses.controller.js';

async function WarehousesModule(server, opts) {
    server.decorate('warehousesService', new WarehousesService());
    
    server.get('/api/warehouses/movement', WarehousesController.historyMovement);
}

export default fp(WarehousesModule);