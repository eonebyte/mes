export default async function (server, opts) {
    server.post('/insert', async (request, reply) => {
        const { a_asset_id, cycletime } = request.body;

        if (!a_asset_id && !cycletime) {
            return reply.status(400).send({ message: 'Asset ID and status are required' });
        }

        try {
            const result = await server.event.createResourceEvent(server, a_asset_id, cycletime);
            reply.send({ message: 'Log inserted and last running time updated', data: result });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    });
}