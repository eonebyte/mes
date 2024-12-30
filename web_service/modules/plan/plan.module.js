import PlanController from "./plan.controller.js"

export default async function PlanModule(server, opts) {
    server.post('/api/import-plan', PlanController.importPlan);
    server.get('/api/list-plan', PlanController.listPlans);
}