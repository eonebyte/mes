export default async (server, opts) => {
    server.post('/start/multiplan', async (request, reply) => {
        try {
            const { planIdArray, resourceId } = request.body;


            if (!planIdArray || !Array.isArray(planIdArray) || planIdArray.length === 0 || !resourceId) {
                console.log('tes plan id array : ', planIdArray);
                console.log('tes resource id : ', resourceId);

                return reply.code(400).send({
                    success: false,
                    messages: ['planIdArray (sebagai array) dan resourceId dibutuhkan.'],
                });
            }

            // Panggil service yang kamu buat
            const result = await server.plan.startMultiPlan(request, server, planIdArray, resourceId);

            if (!result.success) {
                const hasBomError = result.messages.some(msg => msg.includes('BOM is null'));
                if (hasBomError) {
                    return reply.code(400).send(result);
                }
                return reply.code(422).send(result);
                // ==========================================================
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