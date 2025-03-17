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
}

export default AuthsService;