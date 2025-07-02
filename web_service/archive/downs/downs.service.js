import { DateTime } from 'luxon'

class DownsService {

    async saveTimestampToRedis(server, redisKey) {
        const nowJakarta = DateTime.now().setZone("Asia/Jakarta").toFormat("yyyy-MM-dd HH:mm:ss");

        await server.redis.set(redisKey, nowJakarta, 'EX', 300); // Expire dalam 300 detik (opsional)

        console.log(`✅ Timestamp disimpan ke Redis: ${nowJakarta}`);
    }

    async getLastInject(redisClient, dbClient, a_asset_id) {
        let lastInjectTime = await redisClient.get(`lastinjecttime:${a_asset_id}`);

        if (!lastInjectTime) {
            const query = `SELECT lastinject FROM a_asset WHERE a_asset_id = $1`;
            const { rows } = await dbClient.query(query, [a_asset_id]);

            if (rows.length === 0) throw new Error("Asset tidak ditemukan");

            lastInjectTime = rows[0].lastinject;
            if (lastInjectTime) {
                await redisClient.setex(`lastinjecttime:${a_asset_id}`, 300, lastInjectTime);
            }
        }
        return lastInjectTime;
    }

    async getLastEvent(redisClient, dbClient, a_asset_id) {
        // await redisClient.del(`lastevent:${a_asset_id}`);

        let lastEventData = await redisClient.get(`lastevent:${a_asset_id}`);

        if (!lastEventData) {
            const query = `
                SELECT id, start_time, end_time, status 
                FROM a_asset_events 
                WHERE a_asset_id = $1 AND end_time IS NULL
                ORDER BY start_time DESC LIMIT 1
            `;
            const { rows } = await dbClient.query(query, [a_asset_id]);

            if (rows.length > 0) {
                let lastEvent = rows[0];
                lastEvent.start_time = DateTime.fromJSDate(new Date(lastEvent.start_time))
                    .setZone('Asia/Jakarta')
                    .toFormat("yyyy-MM-dd HH:mm:ss.SSS");

                // Simpan ke Redis dalam format JSON
                const redisValue = JSON.stringify({
                    id: lastEvent.id,
                    start_time: lastEvent.start_time,
                    end_time: lastEvent.end_time,
                    status: lastEvent.status
                });

                await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                return lastEvent;
            }
        } else {
            return JSON.parse(lastEventData); // Ambil dari Redis dan parse kembali ke objek
        }

        return null;
    }

    async createResourceEvent(server, a_asset_id, reasons = '-') {
        let dbClient;
        try {
            dbClient = await server.pg.connect();
            const redisClient = server.redis; // Ambil Redis dari Fastify instance

            const lastInjectTime = await this.getLastInject(redisClient, dbClient, a_asset_id);
            const lastEvent = await this.getLastEvent(redisClient, dbClient, a_asset_id);

            console.log('lastEvent :', lastEvent);


            let statusMachine = 'RUNNING';
            let timeDiff = 0;

            if (lastInjectTime) {
                const now = DateTime.now().setZone('Asia/Jakarta');
                const last = DateTime.fromJSDate(new Date(lastInjectTime));
                console.log('this now :', now);
                console.log('this last :', last);

                if (now.isValid && last.isValid) {
                    timeDiff = now.diff(last, 'seconds').seconds;
                    console.log('timeDiff:', timeDiff);
                } else {
                    console.error('Error parsing date:', { now, last });
                }


                //LOGIC 1 : Buat DOWNTIME tutup RUNNING
                if (timeDiff > 300) {
                    const nowDowntime = DateTime.now().setZone('Asia/Jakarta');
                    console.log('nowDowntime :', nowDowntime);
                    statusMachine = 'DOWN'

                    //Buat event DOWNTIME dan tutup event RUNNING
                    if (!lastEvent) {
                        // Jika tidak ada event sebelumnya, insert DOWNTIME sebagai event pertama
                        const insertFirstEventQuery = `
                                INSERT INTO a_asset_events (a_asset_id, start_time, status, reasons) 
                                VALUES ($1, $2, 'DOWN', $3) RETURNING id, start_time
                            `;
                        const { rows: insertFirstEventDowntimeRows } = await dbClient.query(insertFirstEventQuery, [a_asset_id, nowDowntime.toJSDate(), reasons]);

                        if (insertFirstEventDowntimeRows.length > 0) {
                            const newFirstEventDowntimeId = insertFirstEventDowntimeRows[0].id;
                            const newFirstEventDowntimeStartTime = insertFirstEventDowntimeRows[0].start_time;
                            console.log('this newEventID LOGIC 1:', newFirstEventDowntimeId);

                            const redisValue = JSON.stringify({
                                id: newFirstEventDowntimeId,
                                start_time: DateTime.fromJSDate(new Date(newFirstEventDowntimeStartTime))
                                    .setZone('Asia/Jakarta')
                                    .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                                status: 'DOWNTIME'
                            });
                            await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                        }

                        console.log("🔹 Inserted first downtime event for asset:", a_asset_id);
                    } else if (statusMachine === 'DOWN' && lastEvent.status === 'RUNNING') {

                        //Tutup event status RUNNING
                        const closeEventRunningQuery = `
                                UPDATE a_asset_events SET end_time = $1 WHERE status = 'RUNNING' AND id = $2 AND a_asset_id = $3 RETURNING end_time
                            `;

                        const { rows: closeEventRunning } = await dbClient.query(closeEventRunningQuery, [nowDowntime.toJSDate(), lastEvent.id, a_asset_id]);

                        if (closeEventRunning.length > 0) {
                            const lastEvenRunningTime = closeEventRunning[0].end_time;

                            const insertEventDowntimeQuery = `
                                    INSERT INTO a_asset_events (a_asset_id, start_time, status, reasons) 
                                    VALUES ($1, $2, $3, $4) RETURNING id
                                `;
                            const { rows: insertEventDowntimeRows } = await dbClient.query(insertEventDowntimeQuery, [a_asset_id, lastEvenRunningTime, statusMachine, reasons]);

                            if (insertEventDowntimeRows.length > 0) {
                                const newEventId = insertEventDowntimeRows[0].id;
                                console.log('this newEventID LOGIC 1:', newEventId);

                                const redisValue = JSON.stringify({
                                    id: newEventId,
                                    start_time: DateTime.fromJSDate(new Date(lastEvenRunningTime))
                                        .setZone('Asia/Jakarta')
                                        .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                                    status: 'DOWNTIME'
                                });
                                await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                            }
                        }


                    }
                }

                //LOGIC 2 : Buat RUNNING tutup DOWNTIME
                if (!lastEvent) {
                    const nowRunning = DateTime.now().setZone('Asia/Jakarta');

                    // Jika tidak ada event sebelumnya, insert RUNNING sebagai event pertama
                    const insertFirstRunningEventQuery = `
                                INSERT INTO a_asset_events (a_asset_id, start_time, status, reasons) 
                                VALUES ($1, $2, 'RUNNING', $3) RETURNING id, start_time
                            `;
                    const { rows: insertFirstRunningEventRows } = await dbClient.query(insertFirstRunningEventQuery, [a_asset_id, nowRunning.toJSDate(), reasons]);

                    if (insertFirstRunningEventRows.length > 0) {
                        const newRunningEventId = insertFirstRunningEventRows[0].id;
                        const newRunningEventStartTime = insertFirstRunningEventRows[0].start_time;
                        console.log('this newEventID LOGIC 2:', newRunningEventId);

                        const redisValue = JSON.stringify({
                            id: newRunningEventId,
                            start_time: DateTime.fromJSDate(new Date(newRunningEventStartTime))
                                .setZone('Asia/Jakarta')
                                .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                            status: 'RUNNING'
                        });
                        await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                    }

                    console.log("🔹 Inserted first running event for asset:", a_asset_id);
                } else if (statusMachine === 'RUNNING' && lastEvent.status === 'DOWN') {
                    const nowRunning = DateTime.now().setZone('Asia/Jakarta');
                    //Tutup event status DOWNTIME
                    const closeEventDowntimeQuery = `
                            UPDATE a_asset_events SET end_time = $1 WHERE status = 'DOWN' AND id = $2 AND a_asset_id = $3 RETURNING end_time
                        `;
                    const { rows: closeEventDowntime } = await dbClient.query(closeEventDowntimeQuery, [nowRunning.toJSDate(), lastEvent.id, a_asset_id]);
                    if (closeEventDowntime.length > 0) {
                        const lastEvenDowntimeTime = closeEventDowntime[0].end_time;

                        const insertRunningQuery = `
                                INSERT INTO a_asset_events (a_asset_id, start_time, status, reasons)
                                VALUES ($1, $2, $3, $4) RETURNING id
                                `;
                        const { rows: insertEventRunning } = await dbClient.query(insertRunningQuery, [a_asset_id, nowRunning.toJSDate(), statusMachine, reasons]);

                        if (insertEventRunning.length > 0) {
                            const newEventId = insertEventRunning[0].id;
                            console.log('this newEventID LOGIC 2:', newEventId);

                            const redisValue = JSON.stringify({
                                id: newEventId,
                                start_time: DateTime.fromJSDate(new Date(lastEvenDowntimeTime))
                                    .setZone('Asia/Jakarta')
                                    .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                                status: 'RUNNING'
                            });
                            await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                        }
                    }
                }
            }

            //Record to a_asset_log
            const now = DateTime.now().setZone('Asia/Jakarta');
            const logQuery = `INSERT INTO a_asset_log (a_asset_id, status, log_time) VALUES ($1, $2, $3)`;
            await dbClient.query(logQuery, [a_asset_id, statusMachine, now.toJSDate()]);

            //Update LastInject 
            const updateLastInjectTimeQuery = `UPDATE a_asset SET lastinject = $1, status = $2 WHERE a_asset_id = $3 RETURNING lastinject`;
            const { rows: updateLastInjectTimeRows } = await dbClient.query(updateLastInjectTimeQuery, [now.toJSDate(), statusMachine, a_asset_id]);
            if (updateLastInjectTimeRows.length > 0 && updateLastInjectTimeRows[0].lastinject) {
                const updateLastInjectTime = updateLastInjectTimeRows[0].lastinject;
                console.log('Updated Last Running Time:', updateLastInjectTime);
                await redisClient.setex(`lastinjecttime:${a_asset_id}`, 300, updateLastInjectTime);
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


    async createStartDowntime(server, resourceId, code, reason) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            // Optional: Gunakan transaksi agar aman
            await dbClient.query('BEGIN');

            const checkResourceStatus = await server.resourcesService.findOne(server, resourceId);

            if (!checkResourceStatus || checkResourceStatus.length === 0) {
                console.error("Resource tidak ditemukan.");
                return { success: false, message: "Resource tidak ditemukan." };
            }

            const downtimeCategories = [
                { category: "RUNNING", code: "RR" },
                { category: "IDLE", code: "R" },
                { category: "OFF", code: "R0" },
                { category: "DANDORI & PREPARE", code: "R1" },
                { category: "BACKUP MESIN LAIN", code: "R2" },
                { category: "TROUBLE MESIN", code: "R3" },
                { category: "TROUBLE MOLD", code: "R4" },
                { category: "MATERIAL", code: "R5" },
                { category: "NO LOADING", code: "R6" },
                { category: "PACKING", code: "R7" },
                { category: "TROUBLE SHOOTING", code: "R8" },
                { category: "ISTIRAHAT", code: "R9" },
                { category: "SETUP MOLD", code: "SM" },
                { category: "TEARDOWN MOLD", code: "TM" },
                { category: "SETTINGS", code: "STG" },
                { category: "WAITING", code: "WAIT" },
            ];

            const currentStatus = checkResourceStatus[0].status;
            const rCode = checkResourceStatus[0].code;

            const statusCategory = downtimeCategories.find(item => item.code === currentStatus)?.category || "UNKNOWN";
            const newStatus = downtimeCategories.find(item => item.code === code)?.category || "UNKNOWN";


            // if (code === 'RR') {

            //     const changeResourceStatusAtStart = `
            //         UPDATE a_asset
            //         SET status = $1
            //         WHERE a_asset_id = $2
            //     `;

            //     await dbClient.query(changeResourceStatusAtStart, [code, resourceId]);

            //     await dbClient.query('COMMIT');
            //     return {
            //         success: true,
            //         message: `Start Plans`
            //     };
            // }

            if (currentStatus === code) {
                return {
                    success: false,
                    message: `Machine ${rCode} masih berstatus ${currentStatus} (${statusCategory})`
                };
            }



            const getLastOpenEventQuery = `
            SELECT id, start_time, end_time
            FROM a_asset_events
            WHERE a_asset_id = $1 AND end_time IS NULL
            ORDER BY start_time DESC
            LIMIT 1
        `;
            const { rows } = await dbClient.query(getLastOpenEventQuery, [resourceId]);

            let startTime = new Date();

            if (rows.length > 0 && code !== 'HO') {
                const lastEvent = rows[0];

                // Tutup event sebelumnya
                const closeEventQuery = `
                    UPDATE a_asset_events 
                    SET end_time = NOW() AT TIME ZONE 'Asia/Jakarta'
                    WHERE id = $1 AND a_asset_id = $2
                    RETURNING end_time
                `;
                const closeResult = await dbClient.query(closeEventQuery, [lastEvent.id, resourceId]);

                if (closeResult.rows.length === 0) {
                    console.error("Gagal menutup event sebelumnya.");
                }

                startTime = closeResult.rows[0].end_time;
            }

            // Insert event baru dengan start_time yang sudah ditentukan
            const insertEventQuery = `
                INSERT INTO a_asset_events (a_asset_id, start_time, status, code, reasons)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, start_time, status
            `;
            const resultEvent = await dbClient.query(insertEventQuery, [
                resourceId,
                startTime,
                newStatus,
                code,
                reason
            ]);

            if (resultEvent.rows.length === 0) {
                return { success: false, message: "Gagal menyimpan event downtime." };
            }

            if (code !== 'HO') {
                const changeResourceStatus = `
                    UPDATE a_asset
                    SET status = $1
                    WHERE a_asset_id = $2
                `;
                await dbClient.query(changeResourceStatus, [code, resourceId]);
            }


            // Simpan log waktu terakhir
            const now = DateTime.now().setZone('Asia/Jakarta');
            const insertLogQuery = `
            INSERT INTO a_asset_log (a_asset_id, status, log_time)
            VALUES ($1, $2, $3)
        `;
            await dbClient.query(insertLogQuery, [resourceId, code, now.toJSDate()]);

            // Commit transaksi
            await dbClient.query('COMMIT');

            return resultEvent.rows[0];
        } catch (error) {
            if (dbClient) await dbClient.query('ROLLBACK');
            console.error("Error in createStartDowntime:", error);
            throw new Error("Database query gagal: " + error.message);
        } finally {
            if (dbClient) {
                try {
                    dbClient.release();
                } catch (releaseError) {
                    console.error('Gagal melepaskan koneksi:', releaseError);
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

    async findByResource(server, resourceId) {
        if (!resourceId) {
            throw new Error("resourceId tidak boleh kosong.");
        }

        let dbClient;

        try {
            dbClient = await server.pg.connect();

            const query = `
            SELECT
                ae.start_time,
                ae.end_time,
                ae.duration,
                ae.reasons,
                ae.status,
                ae.code
            FROM a_asset_events ae
            WHERE ae.a_asset_id = $1
            ORDER BY ae.start_time DESC
        `;

            const { rows } = await dbClient.query(query, [resourceId]);

            const formattedRows = rows.map((row, index) => ({
                id: index + 1,
                start_time: row.start_time
                    ? DateTime.fromJSDate(new Date(row.start_time))
                        .setZone('Asia/Jakarta')
                        .toFormat('yyyy-MM-dd HH:mm:ss.SSS')
                    : null,
                end_time: row.end_time
                    ? DateTime.fromJSDate(new Date(row.end_time))
                        .setZone('Asia/Jakarta')
                        .toFormat('yyyy-MM-dd HH:mm:ss.SSS')
                    : null,
                duration: row.duration,
                reasons: row.reasons,
                status: row.status,
                code: row.code,
            }));

            return {
                success: true,
                message: 'Fetch successfully',
                rows: formattedRows
            };
        } catch (error) {
            console.error('Error in findByResource:', error);
            return {
                rows: [],
                message: 'Gagal mengambil data: ' + error.message,
                success: false,
            };
        } finally {
            if (dbClient) dbClient.release();
        }
    }
}

export default DownsService;