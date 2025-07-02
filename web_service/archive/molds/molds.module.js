import fp from 'fastify-plugin';
import MoldsService from './molds.service.js';
import MoldsController from './molds.controller.js';

async function MoldsModule(server, opts) {
    server.decorate('moldsService', new MoldsService());

    server.get('/api/molds', MoldsController.getMolds);
    server.post('/api/molds/resource/setup', MoldsController.moldSetup);
    server.post('/api/molds/resource/teardown', MoldsController.moldTeardown);
}

export default fp(MoldsModule);