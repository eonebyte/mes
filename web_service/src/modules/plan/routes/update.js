export default async (server, opts) => {
    server.put('/update/:planId', async (request, reply) => {
        const { planId } = request.params
        const payload = request.body;
        try {
            const update_job_orders = await server.plan.updatePlan(server, planId, payload);
            reply.send({ success: true, message: 'fetch successfully', data: update_job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}