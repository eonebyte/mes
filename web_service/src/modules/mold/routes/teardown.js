export default async (server, opts) => {
    server.post('/teardown', async (request, reply) => {
        try {
            const { resourceId } = request.body;

            // Validasi input
            if (!resourceId) {
                return reply.status(400).send({ error: 'Resource ID wajib diisi' });
            }

            const resource = await server.resource.findOne(server, resourceId);
            if (!resource) {
                return reply.status(404).send({ error: 'Resource tidak ditemukan' });
            }


            const result = await server.mold.moldTeardown(server, resourceId);

            if (!result.success) {
                // Kalau error lainnya (tapi masih dari sisi user), bisa juga pakai 422
                return reply.code(422).send(result);
            }
            return reply.code(200).send(result);
        } catch (error) {
            console.error("Error di moldSetup Controller:", error.message);

            return reply.status(500).send({
                success: false,
                error: 'Terjadi kesalahan saat setup mold',
                details: error.message,
            });
        }
    });
}