export default async (server, opts) => {
    server.post('/production/complete', async (request, reply) => {
        try {

            const { planId, resourceId, status, productionId, togoQty, outputQty } = request.body;

            if (!planId || !status) {
                return reply.code(400).send({
                    success: false,
                    message: 'planId and status are required.',
                });
            }

            // Panggil service yang kamu buat
            const result = await server.plan.doProductionCompleted(request, server, parseInt(planId), parseInt(resourceId), status, parseInt(productionId), parseInt(togoQty), parseInt(outputQty));

            if (!result.success) {
                // Kalau error lainnya (tapi masih dari sisi user), bisa juga pakai 422
                return reply.code(422).send(result);
            }
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error in updatePlansStatus controller:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error.',
                error,
            });
        }
    })
}