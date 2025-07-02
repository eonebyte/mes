export default async (server, opts) => {
    server.get('/events', async (request, reply) => {
        try {
            const data = await server.resource.countRowActiveResources(server);
            return reply.send(data);
        } catch (error) {
            console.error('Error in :', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })
}