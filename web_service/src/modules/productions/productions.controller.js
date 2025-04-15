const ProductionsController = {
    async createProduction(request, reply) {
        try {
            const data = request.body;

            const result = await request.server.productionsService.create(request.server, data);

            return reply.code(201).send({
                success: true,
                message: 'Production created successfully',
                data: result,
            });
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({
                success: false,
                message: 'Failed to create production',
            });
        }
    },
};

export default ProductionsController;
