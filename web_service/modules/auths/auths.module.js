import AuthsController from "./auths.controller.js";

export default async function AuthsModule(server, opts) {
    server.post('/api/auth/login', AuthsController.login);
    server.get('/api/auth/logout', AuthsController.logout);
    server.get('/api/auth/cas', AuthsController.checkAuthSession);
}