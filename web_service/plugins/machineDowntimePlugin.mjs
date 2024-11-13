import InjectEvent from "../modules/machine_downtime/injectEvent.mjs"
import Machines from "../modules/machine_downtime/machines.mjs";
import MachineEvents from "../modules/machine_downtime/machineEvents.mjs";


export default async function machineDowntimePlugin(fastify, opts) {
   await fastify.register(InjectEvent);
   await fastify.register(Machines);
   await fastify.register(MachineEvents);
}
