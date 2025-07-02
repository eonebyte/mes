export default async function (server, opts) {
    server.post('/start', async (request, reply) => {
        const { resourceId, code, reason } = request.body;

        if (!resourceId || !code) {
            return reply.status(400).send({ message: 'resourceId dan code wajib diisi' });
        }

        try {

            const { rows: eventTimeCategories } = await server.pg.query(`
                SELECT value AS code, name AS category
                FROM event_category
                WHERE isactive = 'Y'
            `);

            const result = await server.event.createStarteventtime(
                server,
                resourceId,
                code,
                reason || '-'
            );
            const statusCategory = eventTimeCategories.find(item => item.code === code)?.category || "UNKNOWN";
            reply.send({ message: `Successfully record event ${statusCategory}`, data: result });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Gagal: ${error.message || error}` });
        }
    });
}