import InjectEvent from "../../modules/machine-downtime/inject.event.js"
import Machines from "../../modules/machine-downtime/machines.js";
import MachineEvents from "../../modules/machine-downtime/machine.events.js";


export default async function MachineDownModule(fastify, opts) {
   await fastify.register(InjectEvent);
   await fastify.register(Machines);
   await fastify.register(MachineEvents);
}
