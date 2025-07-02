export default async function (server, opts) {
    server.get('/events', async (request, reply) => {
        const { resourceId } = request.query;
        try {
            const events = await server.event.findByResource(request.server, resourceId);
            console.log('history event : ', events);
            reply.send({ message: 'fetch successfully', data: events });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    });
}