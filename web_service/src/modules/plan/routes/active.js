export default async (server, opts) => {
    server.get('/active', async (request, reply) => {
        const { resourceId } = request.query;
        try {
            const job_orders = await server.plan.findActivePlan(server, resourceId);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}