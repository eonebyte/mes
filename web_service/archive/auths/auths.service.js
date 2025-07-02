class AuthsService {
    async getUser(server, name, pwd) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT * FROM AD_User WHERE Name = $1 AND Password = $2 AND IsActive = 'Y'
            `;

            const result = await dbClient.query(query, [name, pwd]);

            if (result.rows && result.rows.length > 0) {
                return result.rows[0];
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
}

export default AuthsService;