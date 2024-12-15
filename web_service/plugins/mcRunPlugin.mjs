import McRun from "../modules/planning/mcRun.mjs"

export default async function mcRunPlugin(fastify, opts) {
    fastify.register(McRun)
}