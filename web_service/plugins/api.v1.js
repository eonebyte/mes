import AuthsModule from "../modules/auths/auths.module.js";
import GanttsModule from "../modules/gantts/gantts.module.js";
import PlanModule from "../modules/plans/plans.module.js";
import ResourceModule from "../modules/resources/resources.module.js";


export default async function APIV1(fastify, opts) {
    fastify.register(AuthsModule);
    fastify.register(ResourceModule);
    fastify.register(PlanModule);
    fastify.register(GanttsModule);
}