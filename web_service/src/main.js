import { Socket } from "socket.io";
import AuthsModule from "../archive/auths/auths.module.js";
import DownsModule from "./modules/downs/downs.module.js";
import GanttsModule from "./modules/gantts/gantts.module.js";
import MoldsModule from "./modules/molds/molds.module.js";
import PlanModule from "./modules/plans/plans.module.js";
import ProductionsModule from "./modules/productions/productions.module.js";
import ResourcesModule from "./modules/resources/resources.module.js";
import WarehousesModule from "./modules/warehouses/warehouses.module.js";

async function Main(fastify, opts) {
    fastify.register(AuthsModule);
    fastify.register(ResourcesModule);
    fastify.register(ProductionsModule);
    fastify.register(WarehousesModule);
    fastify.register(PlanModule);
    fastify.register(DownsModule);
    fastify.register(MoldsModule);
    fastify.register(GanttsModule);
}

export default Main;