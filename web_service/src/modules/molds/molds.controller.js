class MoldsController {

    static async getMolds(request, reply) {
        try {
            const molds = await request.server.moldsService.findAll(request.server);

            if (!molds || molds.length === 0) {
                return reply.status(404).send({ message: 'No molds found' });
            }

            reply.send({ message: 'Fetch successfully', data: molds });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async moldSetup(request, reply) {
        try {
            const { resourceId, moldId } = request.body;

            // Validasi input
            if (!resourceId || !moldId) {
                return reply.status(400).send({ error: 'Resource ID dan Mold ID wajib diisi' });
            }

            const mold = await request.server.moldsService.findOne(request.server, moldId);
            if (!mold) {
                return reply.status(404).send({ error: 'Mold tidak ditemukan' });
            }


            await request.server.moldsService.moldSetup(
                request.server,
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
    }

    static async moldTeardown(request, reply) {
        try {
            const { resourceId } = request.body;

            // Validasi input
            if (!resourceId) {
                return reply.status(400).send({ error: 'Resource ID wajib diisi' });
            }

            const resource = await request.server.resourcesService.findOne(request.server, resourceId);
            if (!resource) {
                return reply.status(404).send({ error: 'Resource tidak ditemukan' });
            }


            await request.server.moldsService.moldTeardown(request.server, resourceId);

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
    }

}

export default MoldsController;