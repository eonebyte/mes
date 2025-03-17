import GanttsService from './gantts.service.js'

class GanttsController {

    static async getTasksAndBaselines(request, reply) {
        try {
            const tasks = await GanttsService.findAllTasks(request.server);
            return reply.send(tasks);
        } catch (error) {
            return reply.status(500).send({ message: error.message });
        }
    };

    static async newTask(request, reply) {
        try {
            const result = GanttsService.createTask(request.server, request.body)
            return reply.send(result);
        } catch (error) {
            console.error("Error in controller:", error);
            return reply.status(500).send({ status: "error", message: error.message });
        }
    };

    static async updateTask(request, reply) {
        const taskId = request.params.id;
        const taskData = request.body;
        const taskTarget = taskData.target;
        console.log('id: ',taskId);
        console.log('body: ',taskData);
        console.log('target: ',taskData);
        

        try {
            const result = await GanttsService.updateTask(request.server, taskId, taskData, taskTarget);

            return reply.send(result);
        } catch (error) {
            console.error("Error in controller:", error);
            return reply.status(500).send({ status: "error", message: error.message });
        }
    };

    static async deleteTask(request, reply) {
        const taskId = request.params.id;

        try {
            const result = await GanttsService.deleteTask(req.server, taskId);

            return reply.send(result);
        } catch (error) {
            console.error("Error in controller:", error);
            return reply.status(500).send({ status: "error", message: error.message });
        }
    };

    static async newBaseline(request, reply) {
        try {
            const result = await GanttsService.createBaseline(request.server, request.body);
            return reply.send(result);
        } catch (error) {
            console.error("Error in controller:", error);
            return reply.status(500).send({ status: "error", message: error.message });
        }
    };

    static async updateBaseline(request, reply) {
        const baselineId = request.params.id;
        const baselineData = request.body;

        try {
            const result = await GanttsService.updateBaseline(request.server, baselineId, baselineData);
            return reply.send(result);
        } catch (error) {
            console.error("Error in controller:", error);
            return reply.status(500).send({ status: "error", message: error.message });
        }
    };

    static async deleteBaseline(request, reply) {
        const baselineId = request.params.id;

        try {
            const result = await GanttsService.deleteBaseline(request.server, baselineId);
            return reply.send(result);
        } catch (error) {
            console.error("Error in controller:", error);
            return reply.status(500).send({ status: "error", message: error.message });
        }
    };
}

export default GanttsController;