import PlanningController from "./planning.controller.js"

export default async function PlanningModule(server, opts) {
    server.post('/api/import-plan', PlanningController.importPlan);
}