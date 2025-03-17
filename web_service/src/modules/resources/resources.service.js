class ResourcesService {
    async findAll(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT
                    a_asset_id,
                    name,
                    lineno,
                    a_asset_status,
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
                    status: row.a_asset_status,
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
                    a_asset_status,
                    value as resource_code
                FROM
                    a_asset 
                ORDER BY
                    lineno
                `;

            const result = await dbClient.query(query, [resourceId]);

            return result.rows.length > 0
                ? result.rows.map(row => ({
                    id: row.a_asset_id,
                    name: row.name,
                    line: row.lineno,
                    status: row.a_asset_status,
                    code: row.resource_code,
                    image: "/src/assets/images/machine.png"
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

    async createLog(server, a_asset_id, reasons = '-') {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            // 1️⃣ Ambil last running time sebelum update
            const getLastRunningTimeQuery = `
            SELECT lastrunningtime, status FROM a_asset WHERE a_asset_id = $1
        `;
            const { rows } = await dbClient.query(getLastRunningTimeQuery, [a_asset_id]);

            if (rows.length === 0) {
                throw new Error("Asset tidak ditemukan");
            }

            const lastRunningTime = rows[0].lastrunningtime;
            let statusMachine = rows[0].status;
            let reasonDowntime = reasons; // Default status
            let timeDiff = 0;

            if (lastRunningTime) {

                const timeDiffQuery = `
                    SELECT EXTRACT(EPOCH FROM (NOW() AT TIME ZONE 'Asia/Jakarta' - CAST($1 AS TIMESTAMP))) AS time_diff
                `;

                const { rows: timeRows } = await dbClient.query(timeDiffQuery, [lastRunningTime]);
                timeDiff = timeRows[0].time_diff;
                console.log(`Time difference: ${timeDiff} seconds`);

                // Jika lebih dari 300 detik, masukkan downtime ke a_asset_downtime
                if (timeDiff > 300) {
                    statusMachine = 'Downtime';
                    const downtimeQuery = `
                    INSERT INTO a_asset_downtime (a_asset_id, start_time, end_time, reasons) 
                    VALUES ($1, $2, NOW() AT TIME ZONE 'Asia/Jakarta', $3)
                `;
                    await dbClient.query(downtimeQuery, [a_asset_id, lastRunningTime, reasonDowntime]);
                }
            }

            // Insert log dengan status yang sudah ditentukan
            const query = `
                WITH inserted_log AS (
                    INSERT INTO a_asset_log (a_asset_id, status, log_time) 
                    VALUES ($1, $2, NOW() AT TIME ZONE 'Asia/Jakarta')
                    RETURNING log_time
                )
                UPDATE a_asset 
                SET lastrunningtime = NOW() AT TIME ZONE 'Asia/Jakarta', status = $2
                WHERE a_asset_id = $1;
            `;

            await dbClient.query(query, [a_asset_id, statusMachine]);
            return { success: true, message: `Log inserted with status: ${statusMachine}`, timeDif: timeDiff };

        } catch (error) {
            console.error("Error in insertLogAndUpdateLastRunning:", error.message, error.stack);
            throw new Error(`Database query failed: ${error.message}`);
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

    async createStartDowntime(server, a_asset_id, reasons) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const getCurrentStatusQuery = `
            SELECT status FROM a_asset WHERE a_asset_id = $1
        `;
            const { rows } = await dbClient.query(getCurrentStatusQuery, [a_asset_id]);
            if (rows.length === 0) {
                throw new Error("Asset tidak ditemukan");
            }
            const statusMachine = rows[0].status;

            if (statusMachine === 'Downtime') {
                return { success: false, message: `Asset ${a_asset_id} sudah dalam status Downtime` };
            }

            // ✅ Insert downtime manual dengan start_time = NOW(), end_time NULL
            const downtimeQuery = `
            INSERT INTO a_asset_downtime (a_asset_id, start_time, end_time, duration, reasons) 
            VALUES ($1, NOW() AT TIME ZONE 'Asia/Jakarta', NULL, 0, $2)
        `;
            await dbClient.query(downtimeQuery, [a_asset_id, reasons]);

            // ✅ Insert log dan update status menjadi Downtime
            const query = `
            WITH inserted_log AS (
                INSERT INTO a_asset_log (a_asset_id, status, log_time) 
                VALUES ($1, 'Downtime', NOW() AT TIME ZONE 'Asia/Jakarta')
                RETURNING log_time
            )
            UPDATE a_asset 
            SET lastrunningtime = (SELECT log_time FROM inserted_log), status = 'Downtime'
            WHERE a_asset_id = $1;
        `;

            await dbClient.query(query, [a_asset_id]);

            return { success: true, message: `Downtime started for Asset ${a_asset_id}` };
        } catch (error) {
            console.error("Error in startDowntimeManual:", error);
            throw new Error("Database query failed");
        } finally {
            if (dbClient) {
                try {
                    dbClient.release();
                } catch (closeError) {
                    console.error('Error closing connection:', closeError);
                }
            }
        }
    }

    async createEndDowntime(server, a_asset_id) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const getStatusQuery = `SELECT status FROM a_asset WHERE a_asset_id = $1`;
            const { rows } = await dbClient.query(getStatusQuery, [a_asset_id]);

            if (rows.length === 0) {
                return { success: false, message: `Asset ${a_asset_id} tidak ditemukan` };
            }

            const statusMachine = rows[0].status;

            if (statusMachine !== 'Downtime') {
                return { success: false, message: `Asset ${a_asset_id} tidak sedang dalam status Downtime` };
            }

            // ✅ Update downtime terakhir yang masih berjalan (end_time NULL)
            const downtimeUpdateQuery = `
            UPDATE a_asset_downtime
            SET end_time = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE a_asset_id = $1 AND end_time IS NULL
            RETURNING start_time, end_time, duration;
        `;

            const { rows: downtimeRows } = await dbClient.query(downtimeUpdateQuery, [a_asset_id]);

            if (downtimeRows.length === 0) {
                return { success: false, message: `Tidak ditemukan downtime yang belum selesai untuk Asset ${a_asset_id}` };
            }

            // ✅ Insert log baru dengan status Running
            const query = `
            WITH inserted_log AS (
                INSERT INTO a_asset_log (a_asset_id, status, log_time) 
                VALUES ($1, 'Running', NOW() AT TIME ZONE 'Asia/Jakarta')
                RETURNING log_time
            )
            UPDATE a_asset 
            SET lastrunningtime = (SELECT log_time FROM inserted_log), status = 'Running'
            WHERE a_asset_id = $1;
        `;

            await dbClient.query(query, [a_asset_id]);

            return {
                success: true,
                message: `Downtime ended for Asset ${a_asset_id}`,
                details: downtimeRows[0] // Mengembalikan info downtime terakhir (start_time, end_time, duration)
            };
        } catch (error) {
            console.error("Error in endDowntimeManual:", error);
            throw new Error("Database query failed");
        } finally {
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
