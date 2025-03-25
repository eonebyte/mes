import { DateTime } from 'luxon'

class ResourcesService {

    async saveTimestampToRedis(server, redisKey) {
        const nowJakarta = DateTime.now().setZone("Asia/Jakarta").toFormat("yyyy-MM-dd HH:mm:ss");

        await server.redis.set(redisKey, nowJakarta, 'EX', 300); // Expire dalam 300 detik (opsional)

        console.log(`✅ Timestamp disimpan ke Redis: ${nowJakarta}`);
    }


    async findAll(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT
                    a_asset_id,
                    name,
                    lineno,
                    status,
                    value as resource_code
                FROM
                    a_asset 
                ORDER BY
                    lineno
                `;

            const result = await dbClient.query(query);

            return result.rows.length > 0
                ? result.rows.map(row => ({
                    id: row.a_asset_id,
                    name: row.name,
                    line: row.lineno,
                    status: row.status,
                    code: row.resource_code,
                    image: "/src/assets/images/machine.png" // Field tambahan untuk gambar
                }))
                : [];

        } catch (error) {
            console.error('Error fetching resources:', error);
            throw new Error('Failed to fetch resources');
        } finally {
            // Pastikan koneksi selalu ditutup
            if (dbClient) {
                try {
                    dbClient.release();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }
        }
    }

    async findOne(server, resourceId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT
                    a_asset_id,
                    name,
                    lineno,
                    status,
                    value as resource_code,
                    mold_id,
                    mold_name,
                    setuptime
                FROM
                    a_asset 
                WHERE
                    a_asset_id = $1
                LIMIT 1
                `;

            const result = await dbClient.query(query, [resourceId]);

            return result.rows.length > 0
                ? result.rows.map(row => ({
                    id: row.a_asset_id,
                    name: row.name,
                    line: row.lineno,
                    status: row.status,
                    code: row.resource_code,
                    mold_id: row.mold_id,
                    mold_name: row.mold_name,
                    setuptime: row.setuptime
                        ? new Date(row.setuptime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }).replaceAll(".", ":")
                        : null,
                    image: "/src/assets/images/machine.png"
                }))
                : [];

        } catch (error) {
            console.error('Error fetching resource by id:', error);
            throw new Error('Failed to fetch resource by id');
        } finally {
            // Pastikan koneksi selalu ditutup
            if (dbClient) {
                try {
                    dbClient.release();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }
        }
    }

}

export default ResourcesService;
