export default async (server, opts) => {
    server.post('/outputqty', async (request, reply) => {
        try {
            const { productionId, userId, outputQty } = request.body;

            if (!productionId || !userId || !outputQty) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            await server.production.updateOutputQty(request, server, productionId, userId, outputQty);

            return reply.code(200).send({ message: 'MovementQty updated successfully' });
        } catch (error) {
            console.error('Update MovementQty error:', error);
            return reply.code(500).send({ error: `Internal Server Error : ${error.message}` });
        }
    })
}