import PlanningModule from "../modules/planning/planning.module.js";

export default async function APIV1(fastify, opts) {
    fastify.register(PlanningModule);
}