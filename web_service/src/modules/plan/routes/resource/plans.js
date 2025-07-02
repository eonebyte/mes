export default async (server, opts) => {
    server.get('/plans', async (request, reply) => {
        const { resourceId } = request.query;
        try {
            const job_orders = await server.plan.findByResource(server, resourceId);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}