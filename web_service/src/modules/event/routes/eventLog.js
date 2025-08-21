export default async function (server, opts) {
    server.get('/event/log', async (request, reply) => {
        try {
            const events = await server.event.findEventLog();
            console.log('history event : ', events);
            reply.send({ message: 'fetch successfully', data: events });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    });
}