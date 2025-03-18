class ResourcesController {

    static async getResources(request, reply) {
        try {
            const resources = await request.server.resourcesService.findAll(request.server);

            if (!resources || resources.length === 0) {
                return reply.status(404).send({ message: 'No resources found' });
            }

            reply.send({ message: 'Fetch successfully', data: resources });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getResource(request, reply) {
        const { resourceId } = request.query;
        if (!resourceId) {
            return reply.status(400).send({ message: 'Resource ID is required' });
        }

        try {
            const resource = await request.server.resourcesService.findOne(request.server, resourceId);
            if (resource.length === 0) {
                reply.status(404).send({ message: 'Resource not found' });
            } else {
                reply.send({ message: 'fetch successfully', data: resource });
            }
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async insertResourceEvent(request, reply) {
        const { a_asset_id } = request.body;

        if (!a_asset_id) {
            return reply.status(400).send({ message: 'Asset ID and status are required' });
        }

        try {
            const result = await request.server.resourcesService.createResourceEvent(request.server, a_asset_id);
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

export default ResourcesController;