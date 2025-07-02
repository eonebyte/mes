export default async (server, opts) => {
    server.get('/cas', async (request, reply) => {
        const user = request.session.get('user');

        if (user) {
            return reply.send({ success: true, user });
        } else {
            return reply.code(401).send({ success: false, message: 'Not authenticated' });
        }
    })
}