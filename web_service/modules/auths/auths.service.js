import oracleConnection from "../../configs/oracle.connection.js";

class AuthsService {
    static async getUser(name, pwd) {
        
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
                SELECT * FROM AD_User WHERE Name = :name AND Password = :pwd AND IsActive = 'Y'
            `;

            const result = await connection.execute(query, [ name, pwd ]);

            if (result.rows && result.rows.length > 0) {
                return result.rows[0];
            }
            return null;
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

export default AuthsService;