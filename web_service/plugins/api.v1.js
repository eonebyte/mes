import PlanModule from "../modules/plan/plan.module.js";

export default async function APIV1(fastify, opts) {
    fastify.register(PlanModule);
}