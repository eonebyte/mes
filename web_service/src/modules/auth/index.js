import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import { join } from 'desm'
import oracleDB from '../../configs/oracle.connection.js';


class Auth {
    async getUserAndRole(server, name, pwd) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT ad_user_id FROM AD_User WHERE Name = $1 AND Password = $2 AND IsActive = 'Y'
            `;

            const result = await dbClient.query(query, [name, pwd]);

            if (result.rows && result.rows.length > 0) {

                const queryGetUserAndRole = `
                    SELECT ar.ad_role_id AS role_id, ar."name" AS role_name, au.name AS user_name
                    FROM AD_User_Roles aur
                    join ad_user au on aur.ad_user_id = au.ad_user_id
                    join ad_role ar on aur.ad_role_id = ar.ad_role_id
                    where ar.ismasterrole = 'N' and au.ad_user_id = $1
                `;

                const resultUserAndRole = await dbClient.query(queryGetUserAndRole, [result.rows[0].ad_user_id]);

                return resultUserAndRole.rows[0];
            }
            return null;
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    async getUserAndRoleOracle(name, pwd) {
        let connection;
        try {
            connection = await oracleDB.getConnection();

            // Query user
            const query = `
            SELECT ad_user_id 
            FROM AD_User 
            WHERE Name = :name 
              AND Password = :pwd 
              AND IsActive = 'Y'
        `;

            const result = await connection.execute(query, { name, pwd });

            if (result.rows && result.rows.length > 0) {
                const userId = result.rows[0][0]; // ambil ad_user_id

                // Query role
                const queryGetUserAndRole = `
                SELECT ar.ad_role_id AS role_id, 
                       ar.name AS role_name, 
                       au.name AS user_name
                FROM AD_User_Roles aur
                JOIN ad_user au ON aur.ad_user_id = au.ad_user_id
                JOIN ad_role ar ON aur.ad_role_id = ar.ad_role_id
                WHERE ar.ismasterrole = 'N' 
                  AND au.ad_user_id = :userId
            `;

                const resultUserAndRole = await connection.execute(queryGetUserAndRole, { userId });

                if (resultUserAndRole.rows && resultUserAndRole.rows.length > 0) {
                    // resultUserAndRole.rows default berupa array of arrays
                    const [role_id, role_name, user_name] = resultUserAndRole.rows[0];
                    return { role_id, role_name, user_name };
                }
            }
            return null;
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

}

async function auth(fastify, opts) {
    fastify.decorate('auth', new Auth())
    fastify.register(autoload, {
        dir: join(import.meta.url, 'routes'),
        options: {
            prefix: opts.prefix
        }
    })
}

export default fp(auth);