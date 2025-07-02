const WarehousesController = {

    async historyMovement(request, reply) {
        const { planId } = request.query;

        try {
            const joMovementLines = await request.server.warehousesService.movementLines(request.server, planId);
            reply.send({ message: 'fetch successfully', data: joMovementLines });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    },

};

export default WarehousesController;
