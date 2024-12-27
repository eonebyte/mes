import McRun from "../../modules/planning/mc.run.js"

export default async function McRunModule(fastify, opts) {
    fastify.register(McRun)
}