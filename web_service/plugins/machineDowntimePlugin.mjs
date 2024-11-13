import CreateDowntimeLog from "../modules/machine_downtime/injectEvent.mjs"
import { GetMachines, ReadDowntimeLog } from "../modules/machine_downtime/machineEvents.mjs";


export default async function machineDowntimePlugin(fastify, opts) {
   await fastify.register(CreateDowntimeLog);
   await fastify.register(GetMachines);
   await fastify.register(ReadDowntimeLog);
}
