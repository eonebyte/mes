import ResourceService from "./resources.service.js";
class ResourceController {


    static async getResources(request, reply) {
        try {
            const resources = await ResourceService.findAll();

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
            const resource = await ResourceService.findOne(resourceId);
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
}

export default ResourceController;