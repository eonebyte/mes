import AuthsService from "./auths.service.js";

class AuthsController {

    static async login(request, reply) {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ success: false, message: 'Username and password are required' });
        }

        const user = await AuthsService.getUser(username, password);
        console.log('user: ', user);
        
        if (user) {
            request.session.set('user', {
                id: user[0],    
                name: user[8]
            });

            return reply.send({ success: true, user: { id: user[0], name: user[8] } });
        }
        return reply.code(401).send({ success: false, message: 'Invalid credentials' });
    }

    static async logout(request, reply) {
        request.session.delete();
        return reply.send({ success: true, message: 'Logged out successfully' });
    }

    static async checkAuthSession(request, reply) {
        const user = request.session.get('user');

        if (user) {
            return reply.send({ success: true, user });
        } else {
            return reply.code(401).send({ success: false, message: 'Not authenticated' });
        }
    }
}

export default AuthsController;