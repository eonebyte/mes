import axios from 'axios';
import https from 'https';

export default async function (server, opts) {
    server.post('/login/idempiere', async (request, reply) => {
        const { username, password } = request.body;

        const user = await server.auth.getUserAndRole(server, username, password);

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
    });
}

