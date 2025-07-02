export default async (server, opts) => {
    server.post('/defect', async (request, reply) => {
        try {
            const { defects } = request.body;

            if (!Array.isArray(defects) || defects.length === 0) {
                return reply.code(400).send({ message: 'Invalid material data' });
            }

            const result = await server.production.insertProductionDefect(server, defects);

            reply.code(200).send({ message: 'Materials saved', result });
        } catch (error) {
            console.error('Material Input Error:', error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    })
}