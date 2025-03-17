import fp from 'fastify-plugin';
import AuthsController from "./auths.controller.js";
import AuthsService from "./auths.service.js";

async function AuthsModule(server, opts) {
    server.decorate('authsService', new AuthsService());

    server.post('/api/auth/login', AuthsController.login);
    server.get('/api/auth/logout', AuthsController.logout);
    server.get('/api/auth/cas', AuthsController.checkAuthSession);
}

// pakai fp karna ada decorator
export default fp(AuthsModule);
