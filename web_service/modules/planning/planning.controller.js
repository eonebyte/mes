class PlanningController {

    async importPlan(request, reply) {
        try {
            const importData = request.body; 

            console.log('Received data:', importData);

            reply.send({ message: 'Data imported successfully!' });
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Failed to process data.' });
        }
    }

}

export default new PlanningController();