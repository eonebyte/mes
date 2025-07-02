export default async (server, opts) => {
    server.get('/resource', async (request, reply) => {
        const { resourceId } = request.query;
        if (!resourceId) {
            return reply.status(400).send({ message: 'Resource ID is required' });
        }

        try {
            const resource = await server.resource.findOne(server, resourceId);
            if (resource.length === 0) {
                reply.status(404).send({ message: 'Resource not found' });
            } else {
                reply.send({ message: 'fetch successfully', data: resource });
            }
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}