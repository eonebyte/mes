export default async (server, opts) => {
    server.get('/products', async (request, reply) => {
        try {
            const products = await server.plan.findInjectionProducts(server);

            if (!products || products.length === 0) {
                return reply.status(404).send({ message: 'No molds found' });
            }

            reply.send({ message: 'Fetch successfully', data: products });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    })
}