const ProductionsController = {
    async materialInput(request, reply) {
        try {
            const data = request.body;

            if (!Array.isArray(data) || data.length === 0) {
                return reply.code(400).send({ message: 'Invalid material data' });
            }

            const result = await request.server.productionsService.saveMaterials(request.server, data);

            reply.code(200).send({ message: 'Materials saved', result });
        } catch (error) {
            console.error('Material Input Error:', error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    },

    async createQtyDefect(request, reply) {
        try {
            const { defects } = request.body;

            if (!Array.isArray(defects) || defects.length === 0) {
                return reply.code(400).send({ message: 'Invalid material data' });
            }

            const result = await request.server.productionsService.insertProductionDefect(request.server, defects);

            reply.code(200).send({ message: 'Materials saved', result });
        } catch (error) {
            console.error('Material Input Error:', error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    },


    async updateProductionOutputQty(request, reply) {
        try {
            const { productionId, userId, outputQty } = request.body;

            if (!productionId || !userId || !outputQty) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            await request.server.productionsService.updateOutputQty(request, request.server, productionId, userId, outputQty);

            return reply.code(200).send({ message: 'MovementQty updated successfully' });
        } catch (error) {
            console.error('Update MovementQty error:', error);
            return reply.code(500).send({ error: `Internal Server Error : ${error.message}` });
        }
    },

    async updateProductionLostQty(request, reply) {
        try {
            const { productionId, userId, lostQty } = request.body;

            if (!productionId || !userId || !lostQty) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }

            await request.server.productionsService.updateLostQty(request.server, productionId, userId, lostQty);

            return reply.code(200).send({ message: 'MovementQty updated successfully' });
        } catch (error) {
            console.error('Update MovementQty error:', error);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    },


    async getDefects(request, reply) {
        try {
            const { planId } = request.params;
            const result = await request.server.productionsService.findAllDefects(request.server, planId);

            reply.code(200).send({ message: 'Materials saved', result });
        } catch (error) {
            console.error('Material Input Error:', error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    },
};

export default ProductionsController;
