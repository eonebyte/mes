export default async (server, opts) => {
    server.get('/code/colors', async (request, reply) => {
        try {
            const data = await server.resource.codeColors(server);
            return reply.send(data);
        } catch (error) {
            console.error('Error in :', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    })
}