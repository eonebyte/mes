export default async (server, opts) => {
    server.get('/timelines', async (request, reply) => {
        try {
            const data = await server.resource.getTimelineData(server);
            return reply.send(data);
        } catch (error) {
            console.error('Error in /timeline endpoint:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })
}