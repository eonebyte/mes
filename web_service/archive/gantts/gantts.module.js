import GanttsController from "./gantts.controller.js";

async function GanttsModule(server, opts) {
    // Task
    server.get('/api/tasks', GanttsController.getTasksAndBaselines);
    server.post('/api/task', GanttsController.newTask);
    server.put('/api/task/:id', GanttsController.updateTask);
    server.delete('/api/task/:id', GanttsController.deleteTask);
    // Baseline
    server.post('/api/baseline', GanttsController.newBaseline);
    server.put('/api/baseline/:id', GanttsController.updateBaseline);
    server.delete('/api/baseline/:id', GanttsController.deleteBaseline);
}

export default GanttsModule;