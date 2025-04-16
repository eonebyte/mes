const ProductionsController = {
    async materialInput(request, reply) {
        try {
            const data = request.body;

            if (!Array.isArray(data) || data.length === 0) {
                return reply.code(400).send({ message: 'Invalid material data' });
            }

            const result = await materialService.saveMaterials(request.server, data);

            reply.code(200).send({ message: 'Materials saved', result });
        } catch (error) {
            console.error('Material Input Error:', error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    },
};

export default ProductionsController;
