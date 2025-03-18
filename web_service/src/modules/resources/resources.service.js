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

    async getLastRunningTime(redisClient, dbClient, a_asset_id) {
        let lastRunningTime = await redisClient.get(`lastrunningtime:${a_asset_id}`);

        if (!lastRunningTime) {
            const query = `SELECT lastrunningtime FROM a_asset WHERE a_asset_id = $1`;
            const { rows } = await dbClient.query(query, [a_asset_id]);

            if (rows.length === 0) throw new Error("Asset tidak ditemukan");

            lastRunningTime = rows[0].lastrunningtime;
            if (lastRunningTime) {
                await redisClient.setex(`lastrunningtime:${a_asset_id}`, 300, lastRunningTime);
            }
        }
        return lastRunningTime;
    }

    async getLastEvent(redisClient, dbClient, a_asset_id) {
        let lastEvent = await redisClient.get(`lastevent:${a_asset_id}`);

        if (!lastEvent) {
            const query = `
            SELECT id, start_time, status 
            FROM a_asset_events 
            WHERE a_asset_id = $1 AND end_time IS NULL
            ORDER BY start_time DESC LIMIT 1
        `;
            const { rows } = await dbClient.query(query, [a_asset_id]);

            if (rows.length > 0) {
                lastEvent = rows[0];
                lastEvent.start_time = DateTime.fromJSDate(new Date(lastEvent.start_time))
                    .setZone('Asia/Jakarta')
                    .toFormat("yyyy-MM-dd HH:mm:ss.SSS");

                await redisClient.setex(`lastevent:${a_asset_id}`, 300, lastEvent.start_time);
            }
        }
        return lastEvent;
    }

    async createResourceEvent(server, a_asset_id, reasons = '-') {
        let dbClient;
        try {
            dbClient = await server.pg.connect();
            const redisClient = server.redis; // Ambil Redis dari Fastify instance

            //lastEvent = start_time RUNNING dan end_time nya yaitu lastRunningTime ketika ada event status DOWNTIME
            //lastRunningTime = start_time ketika ada event status DOWNTIME
            const lastRunningTime = await this.getLastRunningTime(redisClient, dbClient, a_asset_id);
            const lastEvent = await this.getLastEvent(redisClient, dbClient, a_asset_id);

            let statusMachine = 'RUNNING';
            let timeDiff = 0;

            if (lastRunningTime) {
                const now = DateTime.now().setZone('Asia/Jakarta');
                const last = DateTime.fromJSDate(new Date(lastRunningTime));

                console.log('this now :', now);
                console.log('this last :', last);


                if (now.isValid && last.isValid) {
                    timeDiff = now.diff(last, 'seconds').seconds;
                    console.log('timeDiff:', timeDiff);
                } else {
                    console.error('Error parsing date:', { now, last });
                }

                //jika selisih antara lastRunningTime s/d now > 300 maka buat DOWNTIME
                if (timeDiff > 300) {
                    statusMachine = 'DOWNTIME'

                    //Buat event DOWNTIME dan tutup event RUNNING
                    if (lastEvent.status === 'RUNNING') {
                        const insertEventQuery = `
                        INSERT INTO a_asset_events (a_asset_id, start_time, status, reasons) 
                        VALUES ($1, $2, $3, $4)
                    `;
                        await dbClient.query(insertEventQuery, [a_asset_id, now.toJSDate(), statusMachine, reasons]);

                        //Tutup event status RUNNING
                        const closeEventRunningQuery = `
                            UPDATE a_asset_events SET end_time = $1 WHERE status = 'RUNNING' AND id = $2 RETURNING lasteventtime
                        `;
                        const { rows: closeEventRunning } = await dbClient.query(closeEventRunningQuery, [now.toJSDate(), lastEvent.id]);
                        if (closeEventRunning.length > 0) {
                            const lastEvenTime = closeEventRunning[0].lasteventtime;
                            await redisClient.setex(`lastevent:${a_asset_id}`, 300, lastEvenTime);
                        }

                    } 
                }

                //Buat event RUNNING dan tutup event status DOWNTIME
                if (lastEvent.status === 'DOWNTIME') {
                    const insertRunningQuery = `
                            INSERT INTO a_asset_events (a_asset_id, start_time, status)
                            VALUES ($1, $2, $3)
                            `;
                    await dbClient.query(insertRunningQuery, [a_asset_id, now.toJSDate(), statusMachine]);

                    //Tutup event status DOWNTIME
                    const closeEventDowntimeQuery = `
                        UPDATE a_asset_events SET end_time = $1 WHERE status = 'DOWNTIME' AND id = $2 RETURNING lasteventtime
                    `;
                    const { rows: closeEventDowntime } = await dbClient.query(closeEventDowntimeQuery, [now.toJSDate(), lastEvent.id]);
                    if (closeEventDowntime.length > 0) {
                        const lastEvenTime = closeEventDowntime[0].lasteventtime;
                        await redisClient.setex(`lastevent:${a_asset_id}`, 300, lastEvenTime);
                    }
                }
            }

            const logQuery = `INSERT INTO a_asset_log (a_asset_id, status, log_time) VALUES ($1, $2, $3)`;
            await dbClient.query(logQuery, [a_asset_id, statusMachine, now.toJSDate()]);

            const updateQuery = `UPDATE a_asset SET lastrunningtime = $1, status = $2 WHERE a_asset_id = $3 RETURNING lastrunningtime`;
            const { rows: updateLastRunnngRows } = await dbClient.query(updateQuery, [now.toJSDate(), statusMachine, a_asset_id]);

            if (updateLastRunnngRows.length > 0) {
                const updateLastRunningTime = updateLastRunnngRows[0].lastrunningtime;
                console.log('Updated Last Running Time:', updateLastRunningTime);
                await redisClient.setex(`lastrunningtime:${a_asset_id}`, 300, updateLastRunningTime);
            } else {
                console.error(`❌ Error: Tidak bisa update lastrunningtime untuk asset ${a_asset_id}`);
            }

            return { success: true, message: `Log inserted with status: ${statusMachine}`, timeDiff };
        } catch (error) {
            throw new Error(`Database query failed: ${error.message}`);
        } finally {
            if (dbClient) dbClient.release();
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
