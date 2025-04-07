import fp from 'fastify-plugin';
import PlansController from "./plans.controller.js"
import PlansService from "./plans.service.js";

async function PlansModule(server, opts) {
    server.decorate('plansService', new PlansService());

    server.post('/api/import-plan', PlansController.importPlan);
    server.post('/api/plans/status/open', PlansController.toOpen);
    server.post('/api/plans/status/event', PlansController.toEvent);
    server.get('/api/plans', PlansController.getPlans);
    server.get('/api/plans/resource/plans', PlansController.getPlansByResource);
    server.get('/api/plans/plan/active', PlansController.getActivePlan);
    server.get('/api/plans/plan/detail', PlansController.getDetailPlan);
}

export default fp(PlansModule);