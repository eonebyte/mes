export default async function (server, opts) {
    server.post('/resources', async (request, reply) => {
        try {
            const resources = await server.resource.getAll(request.server);
            console.log('get resources : ', resources);
            reply.send({ message: 'fetch successfully', data: resources });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    });
}