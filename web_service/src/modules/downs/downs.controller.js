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
        const { a_asset_id } = request.body;

        if (!a_asset_id) {
            return reply.status(400).send({ message: 'Asset ID and status are required' });
        }

        try {
            const result = await request.server.resourcesService.createStartDowntime(request.server, a_asset_id);
            reply.send({ message: 'Log inserted and last running time updated', data: result });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
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
}

export default DownsController;