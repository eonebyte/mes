export default async (server, opts) => {
    server.get('/defects/:planId', async (request, reply) => {
        try {
            const { planId } = request.params;
            const result = await server.production.findAllDefects(server, planId);

            reply.code(200).send({ message: 'Materials saved', result });
        } catch (error) {
            console.error('Material Input Error:', error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    })
}