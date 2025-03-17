import oracleConnection from "../../configs/oracle.connection.js";


class ResourceService {
    constructor(id, name, line, status, rcode) {
        this.id = id;
        this.name = name;
        this.line = line;
        this.status = status;
        this.code = rcode
        this.image = "/src/assets/images/machine.png";
    }

    static async findAll() {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
                SELECT
                    A_ASSET_ID,
                    NAME,
                    LINENO,
                    STATUS,
                    VALUE AS RCODE
                FROM
                    A_ASSET 
                WHERE 
                    A_ASSET_GROUP_ID = 1000000
                    AND ISACTIVE = 'Y'
                ORDER BY
                    LINENO
                `;

            const result = await connection.execute(query);

            if (result.rows.length > 0) {
                return result.rows.map(row =>
                    new ResourceService(row[0], row[1], row[2], row[3], row[4])
                );
            } else {
                return [];
            }

        } catch (error) {
            console.error('Error fetching resources:', error);
            throw new Error('Failed to fetch resources');
        } finally {
            // Pastikan koneksi selalu ditutup
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }
        }
    }

    static async findOne(resourceId) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
                SELECT
                    A_ASSET_ID,
                    NAME,
                    LINENO,
                    STATUS,
                    VALUE AS RCODE
                FROM
                    A_ASSET 
                WHERE 
                    A_ASSET_GROUP_ID = 1000000
                    AND ISACTIVE = 'Y'
                    AND A_ASSET_ID = :resourceId
                ORDER BY
                    LINENO
                `;

            const result = await connection.execute(query, [resourceId]);

            if (result.rows.length > 0) {
                return result.rows.map(row =>
                    new ResourceService(row[0], row[1], row[2], row[3], row[4])
                );
            } else {
                return [];
            }

        } catch (error) {
            console.error('Error fetching resources:', error);
            throw new Error('Failed to fetch resources');
        } finally {
            // Pastikan koneksi selalu ditutup
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }
        }
    }


}

export default ResourceService;
