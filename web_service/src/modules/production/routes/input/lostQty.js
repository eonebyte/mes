export default async (server, opts) => {
    server.post('/lostqty', async (request, reply) => {
        try {
            const { productionId, userId, lostQty } = request.body;

            if (!productionId || !userId || !lostQty) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            await server.production.updateLostQty(server, productionId, userId, lostQty);

            return reply.code(200).send({ message: 'MovementQty updated successfully' });
        } catch (error) {
            console.error('Update MovementQty error:', error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    })
}