import axios from 'axios';
import https from 'https';

export default async (server, opts) => {
    server.get('/logout/idempiere', async (request, reply) => {
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
    })
}