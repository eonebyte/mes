import PlansController from "./plans.controller.js"

export default async function PlansModule(server, opts) {
    server.post('/api/import-plan', PlansController.importPlan);
    server.get('/api/plans', PlansController.getPlans);
    server.get('/api/plans/plan', PlansController.getPlan);
    server.get('/api/plans/plan/active', PlansController.getActivePlan);
}