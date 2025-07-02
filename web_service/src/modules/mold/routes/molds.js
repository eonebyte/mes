export default async (server, opts) => {
    server.get('/molds', async (request, reply) => {
        try {
            const molds = await server.mold.findAll(server);

            if (!molds || molds.length === 0) {
                return reply.status(404).send({ message: 'No molds found' });
            }

            reply.send({ message: 'Fetch successfully', data: molds });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    });
}