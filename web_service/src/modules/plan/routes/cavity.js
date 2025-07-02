export default async (server, opts) => {
    server.get('/cavity', async (request, reply) => {
        try {
            const { moldId, userId, cavity } = request.body;

            if (!moldId || !userId || !cavity) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            await server.plan.updateCavity(request.server, moldId, userId, cavity);

            return reply.code(200).send({ message: 'Cavity updated successfully' });
        } catch (error) {
            console.error('Update cavity error:', error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}