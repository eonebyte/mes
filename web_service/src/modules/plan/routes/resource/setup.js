export default async (server, opts) => {
    server.post('/setup', async (request, reply) => {
        try {

            const { resourceId, status, productionId } = request.body;

            if (!resourceId || !status) {
                return reply.code(400).send({
                    success: false,
                    message: 'planId and status are required.',
                });
            }

            // Panggil service yang kamu buat
            const result = await server.plan.doSetup(server, parseInt(resourceId), status, parseInt(productionId));

            if (!result.success) {
                // Kalau error lainnya (tapi masih dari sisi user), bisa juga pakai 422
                return reply.code(422).send(result);
            }
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error in updatePlansStatus controller do Hold:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error.',
                error,
            });
        }
    })
}