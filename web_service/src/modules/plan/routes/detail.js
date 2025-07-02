export default async (server, opts) => {
    server.get('/detail', async (request, reply) => {
        const { planId, moldId } = request.query;
        try {
            let job_order;
            if (planId) {
                job_order = await server.plan.findDetailPlan(server, planId);
            } else {
                job_order = await server.plan.findDetailPlanWithMold(server, moldId);
            }
            const planData = job_order.length > 0 ? job_order[0] : null;
            reply.send({ message: 'fetch successfully', data: planData });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}