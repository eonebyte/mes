export default async (server, opts) => {
    server.get('/plans', async (request, reply) => {
        try {
            const job_orders = await server.plan.findAll(server);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}