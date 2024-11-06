import CreateDowntimeLog from "../modules/machine_downtime/createDowntimeLog.mjs"
import { GetMachines, ReadDowntimeLog } from "../modules/machine_downtime/readDowntimeLog.mjs";


export default async function machineDowntimePlugin(fastify, opts) {
   await fastify.register(CreateDowntimeLog);
   await fastify.register(GetMachines);
   await fastify.register(ReadDowntimeLog);
}
