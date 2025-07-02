export default async (server, opts) => {
    server.post('/setup', async (request, reply) => {
        try {
            const { resourceId, moldId } = request.body;

            // Validasi input
            if (!resourceId || !moldId) {
                return reply.status(400).send({ error: 'Resource ID dan Mold ID wajib diisi' });
            }

            const mold = await server.mold.findOne(server, moldId);
            if (!mold) {
                return reply.status(404).send({ error: 'Mold tidak ditemukan' });
            }


            await server.mold.moldSetup(
                server,
                resourceId,
                mold.m_product_id,
                mold.name
            );

            return reply.status(200).send({
                success: true,
                message: 'Mold berhasil di-setup',
            });
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