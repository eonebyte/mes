export default async function (server, opts) {
    server.get('/categories', async (request, reply) => {
        try {
            const categories = await server.event.getAllCategories(request.server);
            console.log('event category : ', categories);
            reply.send({ message: 'fetch successfully', data: categories });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    });
}