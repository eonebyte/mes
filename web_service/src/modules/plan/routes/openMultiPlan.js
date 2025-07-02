export default async (server, opts) => {
    server.post('/open/multiplan', async (request, reply) => {
        try {
            const { planIdArray, status } = request.body;

            console.log('tes plan id array : ', planIdArray);


            if (!planIdArray || !status) {
                return reply.code(400).send({
                    success: false,
                    message: 'planId and status are required.',
                });
            }

            // Panggil service yang kamu buat
            const result = await server.plan.updateMultiPlanStatusProgress(server, planIdArray, status);

            if (!result.success) {
                // Kalau error karena BOM null, berikan 400
                if (result.message.includes('BOM is null')) {
                    return reply.code(400).send(result);
                }

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