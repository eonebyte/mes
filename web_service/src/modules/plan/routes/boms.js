export default async (server, opts) => {
    server.get('/boms', async (request, reply) => {
        const { planId } = request.query;

        try {
            const boms = await server.plan.findBoms(server, planId);
            reply.send({ message: 'fetch successfully', data: boms });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}