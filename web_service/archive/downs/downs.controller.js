class DownsController {

    static async insertResourceEvent(request, reply) {
        const { a_asset_id } = request.body;

        if (!a_asset_id) {
            return reply.status(400).send({ message: 'Asset ID and status are required' });
        }

        try {
            const result = await request.server.downsService.createResourceEvent(request.server, a_asset_id);
            reply.send({ message: 'Log inserted and last running time updated', data: result });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async startDowntime(request, reply) {
        const { resourceId, code, reason } = request.body;

        if (!resourceId || !code) {
            return reply.status(400).send({ message: 'resourceId dan code wajib diisi' });
        }

        const downtimeCategories = [
            { category: "RUNNING", code: "RR" },
            { category: "IDLE", code: "R" },
            { category: "OFF", code: "R0" },
            { category: "DANDORI & PREPARE", code: "R1" },
            { category: "BACKUP MESIN LAIN", code: "R2" },
            { category: "TROUBLE MESIN", code: "R3" },
            { category: "TROUBLE MOLD", code: "R4" },
            { category: "MATERIAL", code: "R5" },
            { category: "NO LOADING", code: "R6" },
            { category: "PACKING", code: "R7" },
            { category: "TROUBLE SHOOTING", code: "R8" },
            { category: "ISTIRAHAT", code: "R9" },
        ];

        try {

            const result = await request.server.downsService.createStartDowntime(
                request.server,
                resourceId,
                code,
                reason || '-'
            );
            const statusCategory = downtimeCategories.find(item => item.code === code)?.category || "UNKNOWN";
            reply.send({ message: `Successfully record event ${statusCategory}`, data: result });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Gagal: ${error.message || error}` });
        }
    }


    static async endDowntime(request, reply) {
        const { a_asset_id } = request.body;

        if (!a_asset_id) {
            return reply.status(400).send({ message: 'Asset ID and status are required' });
        }

        try {
            const result = await request.server.resourcesService.createEndDowntime(request.server, a_asset_id);
            reply.send({ message: 'Log inserted and last running time updated', data: result });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getDowns(request, reply) {
        const { resourceId } = request.query;
        try {
            const downs = await request.server.downsService.findByResource(request.server, resourceId);
            console.log('history down : ', downs);
            reply.send({ message: 'fetch successfully', data: downs });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getResources(request, reply) {
        try {
            const resources = await request.server.resourcesService.getAll(request.server);
            console.log('get resources : ', resources);
            reply.send({ message: 'fetch successfully', data: resources });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }
}

export default DownsController;