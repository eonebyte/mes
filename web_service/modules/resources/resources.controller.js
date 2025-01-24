import ResourceService from "./resources.service.js";
import PlansService from "../plans/plans.service.js";
class ResourceController {

    static async getResources(request, reply) {
        try {
            const resources = await ResourceService.findAll();
            const plans = await PlansService.findAllRunning();  

            // Gabungkan data resources dan plans
            const combinedResources = resources.map(resource => {
                const relatedPlan = plans.find(plan => plan.resourceId === resource.id);
                const planNo = relatedPlan ? relatedPlan.planNo : 0;
                const planQty = relatedPlan ? relatedPlan.qty : 0;
                // const toGoQty = relatedPlan ? relatedPlan.qty - relatedPlan.output_qty : 0;
                const outPutQty = 50;  // Misalnya nilai outputQty tetap 100
                const toGoQty = relatedPlan ? relatedPlan.qty - outPutQty : 0;
                const CT = relatedPlan ? relatedPlan.cycletime : 0;

                return {
                    ...resource,
                    planNo,
                    planQty,
                    toGoQty,
                    CT,
                    outPutQty,
                };
            });

            reply.send({ message: 'fetch successfully', data: combinedResources });
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