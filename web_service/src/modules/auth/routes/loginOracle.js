import axios from 'axios';
import https from 'https';
import oracleDB from '../../../configs/oracle.connection.js';

export default async function (server, opts) {
    server.post('/login/oracle', async (request, reply) => {
        let connection;
        const { username, password } = request.body;
        try {

            connection = await oracleDB.openConnection();

            const result = await connection.execute(
                'SELECT * FROM AD_User WHERE Name = :username AND Password = :password AND IsActive = \'Y\'',
                { username, password },
                { outFormat: oracleDB.instanceOracleDB.OUT_FORMAT_OBJECT }
            );


            if (result.rows.length > 0) {
                const user = result.rows[0];

                // Set session with user information
                request.session.set('user', {
                    id: user.AD_USER_ID,
                    name: user.NAME,
                });

                reply.send({ success: true, user: { id: user.AD_USER_ID, name: user.NAME } });
            } else {
                reply.code(401).send({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            server.log.error(error);
            reply.code(500).send({ success: false, message: 'Server error' });
        } finally {
            // 💡 Tutup koneksi jika berhasil dibuka
            if (connection) {
                try {
                    await connection.close();
                } catch (closeErr) {
                    server.log.error('Error closing Oracle connection:', closeErr);
                }
            }
        }
    });
}

