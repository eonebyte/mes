export default async (server, opts) => {
    server.get('/movements', async (request, reply) => {
        const { planId } = request.query;

        try {
            const joMovementLines = await server.warehouse.movementLines(server, planId);
            reply.send({ message: 'fetch successfully', data: joMovementLines });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}