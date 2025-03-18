import AuthsModule from "./modules/auths/auths.module.js";
import GanttsModule from "./modules/gantts/gantts.module.js";
import PlanModule from "./modules/plans/plans.module.js";
import ResourcesModule from "./modules/resources/resources.module.js";


async function Main(fastify, opts) {
    fastify.register(AuthsModule);
    fastify.register(ResourcesModule);
    fastify.register(PlanModule);
    fastify.register(GanttsModule);
}

export default Main;