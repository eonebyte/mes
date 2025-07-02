import fp from 'fastify-plugin';
import PlansController from "./plans.controller.js"
import PlansService from "./plans.service.js";

async function PlansModule(server, opts) {
    server.decorate('plansService', new PlansService());

    const baseUrl = '/api/plans';

    server.post(`${baseUrl}/import-plan`, PlansController.importPlan);
    server.post(`${baseUrl}/status/open`, PlansController.planOpen);
    server.post(`${baseUrl}/status/open-multiplan`, PlansController.multiPlanOpen);
    server.post(`${baseUrl}/status/completed`, PlansController.joDocComplete);
    server.post(`${baseUrl}/status/start`, PlansController.joStart);
    server.post(`${baseUrl}/status/event-setup`, PlansController.joSetup);
    server.post(`${baseUrl}/status/event-hold`, PlansController.joHold);
    server.post(`${baseUrl}/status/event-completed`, PlansController.joProdCompleted);
    server.get(`${baseUrl}`, PlansController.getPlans);
    server.put(`${baseUrl}/:planId`, PlansController.updatePlans);
    // server.put(`${baseUrl}/boms/:planId`, PlansController.updateBomsPlans);
    server.get(`${baseUrl}/boms`, PlansController.getBoms);
    server.get(`${baseUrl}/products`, PlansController.getProducts);
    server.get(`${baseUrl}/resource/plans`, PlansController.getPlansByResource);
    server.get(`${baseUrl}/plan/active`, PlansController.getActivePlan);
    server.get(`${baseUrl}/plan/detail`, PlansController.getDetailPlan);
    server.post(`${baseUrl}/plan/cavity`, PlansController.setCavity);


}

export default fp(PlansModule);