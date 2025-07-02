import axios from 'axios';
import https from 'https';

class AuthsController {

    static async login(request, reply) {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.code(400).send({ success: false, message: 'Username and password are required' });
        }

        const authsService = request.server.authsService;
        const server = request.server;

        const user = await authsService.getUser(server, username, password);
        console.log('user: ', user);

        if (user) {
            request.session.set('user', {
                id: user.ad_user_id,
                name: user.name
            });

            return reply.send({ success: true, user: { id: user.ad_user_id, name: user.name } });
        }
        return reply.code(401).send({ success: false, message: 'Invalid credentials' });
    }

    static async loginWithIdempiere(request, reply) {
        const { username, password } = request.body;

        const authsService = request.server.authsService;
        const server = request.server;

        const user = await authsService.getUserAndRole(server, username, password);

       

        const parameters = {
            clientId: 1000003,
            roleId: user.role_id,
            organizationId: 1000003,
        };

        if (!username || !password) {
            return reply.code(400).send({ success: false, message: 'Username and password are required' });
        }

        try {
            const agent = new https.Agent({ rejectUnauthorized: false });

            const res = await axios.post(
                'https://192.168.3.6:8443/api/v1/auth/tokens',
                { userName: username, password, parameters },
                { httpsAgent: agent }
            );

            const data = res.data;

            if (!res.status || res.status !== 200) {
                console.error('Login iDempiere gagal:', data);
                return reply.code(401).send({ success: false, message: data.message || 'iDempiere login failed' });
            }

            // Simpan ke session backend
            request.session.set('user', {
                id: data.userId,
                username: username,
                token: data.token,
                refresh_token: data.refresh_token
            });

            console.log('user role: ', user.role_name);
            

            // Kirim access token ke client
            return reply.send({
                success: true,
                user: { username, id: data.userId, role_name: user.role_name, user_name: user.user_name },
                accessToken: data.token
            });

        } catch (error) {
            console.error('Login error:', error);
            return reply.code(500).send({ success: false, message: 'Server error' });
        }
    }


    static async logout(request, reply) {
        request.session.delete();
        return reply.send({ success: true, message: 'Logged out successfully' });
    }

    static async logoutWithIdempiere(request, reply) {
        // Ambil token dari session
        const user = request.session.get('user');
        if (!user || !user.token) {
            return reply.code(400).send({ success: false, message: 'No user logged in or token not found' });
        }

        try {
            const agent = new https.Agent({ rejectUnauthorized: false });

            // Kirim request logout ke iDempiere (endpoint logout harus disesuaikan)
            // Misal iDempiere punya endpoint logout seperti ini:
            // POST https://192.168.3.6:8443/api/v1/auth/logout
            await axios.post(
                'https://192.168.3.6:8443/api/v1/auth/logout',
                { token: user.token },  // sesuaikan body logout jika beda
                { httpsAgent: agent }
            );

            // Hapus session backend
            request.session.delete();

            return reply.send({ success: true, message: 'Logged out successfully' });

        } catch (error) {
            console.error('Logout iDempiere error:', error);

            // Tetap hapus session backend meskipun error logout di iDempiere
            request.session.delete();

            return reply.code(500).send({ success: false, message: 'Logout failed on iDempiere but session cleared locally' });
        }
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