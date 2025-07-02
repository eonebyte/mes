export default async (server, opts) => {
    server.get('/resources', async (request, reply) => {
        try {
            const resources = await server.resource.findAll(server);

            if (!resources || resources.length === 0) {
                return reply.status(404).send({ message: 'No resources found' });
            }

            reply.send({ message: 'Fetch successfully', data: resources });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}