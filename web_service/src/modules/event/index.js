import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import { join } from 'desm'
import { DateTime } from 'luxon';

class Event {

    async getAllCategories(server) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            const { rows } = await dbClient.query(
                `SELECT 
                    value AS code,
                    name AS category, 
                    textcolor AS "textColor", 
                    categorycolor AS color 
                FROM event_category
                WHERE isactive = 'Y'
                ORDER BY created ASC
                `
            );
            return rows.length > 0
                ? rows : [];
        } catch (error) {
            throw new Error(`Error fetching resources: ${error.message}`);
        } finally {
            if (dbClient) dbClient.release();
        }
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
                SELECT a_asset_event_id, starttime, endtime, status, code
                FROM a_asset_event 
                WHERE a_asset_id = $1 AND endtime IS NULL
                ORDER BY starttime DESC LIMIT 1
            `;
            const { rows } = await dbClient.query(query, [a_asset_id]);

            if (rows.length > 0) {
                let lastEvent = rows[0];
                lastEvent.starttime = DateTime.fromJSDate(new Date(lastEvent.starttime))
                    .setZone('Asia/Jakarta')
                    .toFormat("yyyy-MM-dd HH:mm:ss.SSS");

                // Simpan ke Redis dalam format JSON
                const redisValue = JSON.stringify({
                    a_asset_event_id: lastEvent.a_asset_event_id,
                    starttime: lastEvent.starttime,
                    endtime: lastEvent.endtime,
                    status: lastEvent.status,
                    code: lastEvent.code,
                });

                await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                return lastEvent;
            }
        } else {
            return JSON.parse(lastEventData); // Ambil dari Redis dan parse kembali ke objek
        }

        return null;
    }

    async getNextId(dbClient, seqId) {
        const query = `
            SELECT nextid(
                $1,
                'Y'
            ) AS new_id
        `;
        const { rows } = await dbClient.query(query, [seqId]);

        if (rows.length === 0 || !rows[0].new_id) {
            throw new Error(`Gagal mendapatkan ID berikutnya dari sekuens '${sequenceName}'. Pastikan sekuens ada.`);
        }

        return rows[0].new_id;
    }

    async createResourceEvent(server, a_asset_id, cycletime, reasons = '-') {
        let dbClient;
        try {
            dbClient = await server.pg.connect();
            const redisClient = server.redis; // Ambil Redis dari Fastify instance
            await dbClient.query('BEGIN');

            const lastInjectTime = await this.getLastInject(redisClient, dbClient, a_asset_id);
            const lastEvent = await this.getLastEvent(redisClient, dbClient, a_asset_id);

            let statusEvent = 'RUNNING',
                codeEvent = 'RUN',
                timeDiff = 0;

            if (lastInjectTime) {
                const now = DateTime.now().setZone('Asia/Jakarta');
                const last = DateTime.fromJSDate(new Date(lastInjectTime));

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
                    statusEvent = 'DOWN';
                    codeEvent = 'DW';

                    //Buat event DOWNTIME dan tutup event RUNNING
                    if (!lastEvent) {
                        const newEventId = await this.getNextId(dbClient, 1001042); // sequence asset event
                        // Jika tidak ada event sebelumnya, insert DOWNTIME sebagai event pertama
                        const insertFirstEvent = `
                                    INSERT INTO a_asset_event (
                                        a_asset_event_id, a_asset_id, starttime, status, reason, code
                                        ) VALUES ($1, $2, $3, 'DOWN', $4, 'DW') RETURNING a_asset_event_id, starttime`;

                        const { rows: insertFirstEventDowntimeRows } = await dbClient.query(insertFirstEvent, [newEventId, a_asset_id, nowDowntime.toJSDate(), reasons]);

                        if (insertFirstEventDowntimeRows.length > 0) {
                            const newFirstEventDowntimeId = insertFirstEventDowntimeRows[0].a_asset_event_id;
                            const newFirstEventDowntimeStartTime = insertFirstEventDowntimeRows[0].starttime;

                            const redisValue = JSON.stringify({
                                a_asset_event_id: newFirstEventDowntimeId,
                                starttime: DateTime.fromJSDate(new Date(newFirstEventDowntimeStartTime))
                                    .setZone('Asia/Jakarta')
                                    .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                                status: 'DOWN'
                            });
                            await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                        }

                    } else if (statusEvent === 'DOWN' && lastEvent.status === 'RUNNING') {
                        //Tutup event status RUNNING
                        const closeEventRunningQuery = `
                                    UPDATE a_asset_event 
                                    SET endtime = $1, duration = EXTRACT(EPOCH FROM ($1::timestamp - starttime))
                                    WHERE status = 'RUNNING' AND a_asset_event_id = $2 AND a_asset_id = $3 RETURNING endtime`;

                        const { rows: closeEventRunning } = await dbClient.query(closeEventRunningQuery, [nowDowntime.toJSDate(), lastEvent.a_asset_event_id, a_asset_id]);

                        if (closeEventRunning.length > 0) {
                            const lastEvenRunningTime = closeEventRunning[0].endtime;

                            const newEventId = await this.getNextId(dbClient, 1001042);

                            const insertEventDowntimeQuery = `
                                        INSERT INTO a_asset_event (
                                            a_asset_event_id, a_asset_id, starttime, status, reason, code
                                        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING a_asset_event_id`;

                            const { rows: insertEventDowntimeRows } = await dbClient.query(insertEventDowntimeQuery, [newEventId, a_asset_id, lastEvenRunningTime, statusEvent, reasons, codeEvent]);

                            if (insertEventDowntimeRows.length > 0) {
                                const newEventId = insertEventDowntimeRows[0].a_asset_event_id;

                                const redisValue = JSON.stringify({
                                    id: newEventId,
                                    starttime: DateTime.fromJSDate(new Date(lastEvenRunningTime))
                                        .setZone('Asia/Jakarta')
                                        .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                                    status: 'DOWN'
                                });
                                await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                            }

                        }
                    }
                }

                //LOGIC 2 : Buat RUNNING tutup DOWNTIME
                if (!lastEvent) {
                    const nowRunning = DateTime.now().setZone('Asia/Jakarta');
                    const newEventId = await this.getNextId(dbClient, 1001042);

                    // Jika tidak ada event sebelumnya, insert RUNNING sebagai event pertama
                    const insertFirstRunningEventQuery = `
                                    INSERT INTO a_asset_event (
                                        a_asset_event_id, a_asset_id, starttime, status, reason, code
                                    ) VALUES ($1, $2, $3, 'RUNNING', $4, 'RUN') RETURNING a_asset_event_id, starttime`;

                    const { rows: insertFirstRunningEventRows } = await dbClient.query(insertFirstRunningEventQuery, [newEventId, a_asset_id, nowRunning.toJSDate(), reasons]);

                    if (insertFirstRunningEventRows.length > 0) {
                        const newRunningEventId = insertFirstRunningEventRows[0].a_asset_event_id;
                        const newRunningEventStartTime = insertFirstRunningEventRows[0].starttime;

                        const redisValue = JSON.stringify({
                            a_asset_event_id: newRunningEventId,
                            starttime: DateTime.fromJSDate(new Date(newRunningEventStartTime))
                                .setZone('Asia/Jakarta')
                                .toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
                            status: 'RUNNING'
                        });
                        await redisClient.setex(`lastevent:${a_asset_id}`, 300, redisValue);
                    }

                } else if (statusEvent === 'RUNNING' && lastEvent.status !== 'RUNNING') {
                    const nowRunning = DateTime.now().setZone('Asia/Jakarta');
                    //Tutup event status DOWNTIME
                    const closeEventDowntimeQuery = `
                                UPDATE a_asset_event 
                                SET endtime = $1, duration = EXTRACT(EPOCH FROM ($1::timestamp - starttime))
                                WHERE status <> 'RUNNING' AND a_asset_event_id = $2 AND a_asset_id = $3 RETURNING endtime`;

                    const { rows: closeEventDowntime } = await dbClient.query(closeEventDowntimeQuery, [nowRunning.toJSDate(), lastEvent.a_asset_event_id, a_asset_id]);
                    if (closeEventDowntime.length > 0) {
                        const lastEvenDowntimeTime = closeEventDowntime[0].endtime;

                        const newEventId = await this.getNextId(dbClient, 1001042);

                        const insertRunningQuery = `
                                    INSERT INTO a_asset_event (
                                        a_asset_event_id, a_asset_id, starttime, status, reason, code
                                    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING a_asset_event_id`;

                        const { rows: insertEventRunning } = await dbClient.query(insertRunningQuery, [newEventId, a_asset_id, nowRunning.toJSDate(), statusEvent, reasons, codeEvent]);

                        if (insertEventRunning.length > 0) {
                            const newEventId = insertEventRunning[0].a_asset_event_id;
                            const redisValue = JSON.stringify({
                                a_asset_event_id: newEventId,
                                starttime: DateTime.fromJSDate(new Date(lastEvenDowntimeTime))
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
            const heater = 1;
            const pump = 1;

            const assetOnEvent = `
                SELECT jo.cust_joborder_id, jo.m_product_id 
                FROM cust_joborder jo
                WHERE a_asset_id = $1 AND iscurrent = 'Y'`;

            const { rows: assetOnEventRows } = await dbClient.query(assetOnEvent, [a_asset_id]);

            const logInsertQuery = `
                    INSERT INTO a_asset_log (
                    ad_client_id, ad_org_id, a_asset_log_id, a_asset_id, datetrx,
                    created, createdby, updated, updatedby, cycletime, logtype,
                    heater, pump, cust_joborder_id, m_product_id
                    ) VALUES ($1, $2, $3, $4, $5, 
                    $6,$7, $8, $9, $10, $11,
                    $12, $13, $14, $15)`;

            for (const asset of assetOnEventRows) {
                const newLogId = await this.getNextId(dbClient, 1001041); //log id

                await dbClient.query(logInsertQuery, [
                    1000003, 1000003,
                    newLogId, a_asset_id, now.toJSDate(),
                    now.toJSDate(), 100, now.toJSDate(), 100,
                    cycletime, 'CT',
                    heater, pump,
                    asset.cust_joborder_id, asset.m_product_id
                ]);
            }

            //Update LastInject 
            const updateLastInjectTimeQuery = `
                    UPDATE a_asset 
                    SET lastinject = $1, status = $2 
                    WHERE a_asset_id = $3 RETURNING lastinject`;

            const { rows: updateLastInjectTimeRows } = await dbClient.query(updateLastInjectTimeQuery, [now.toJSDate(), codeEvent, a_asset_id]);

            if (updateLastInjectTimeRows.length > 0 && updateLastInjectTimeRows[0].lastinject) {
                const updateLastInjectTime = updateLastInjectTimeRows[0].lastinject;
                await redisClient.setex(`lastinjecttime:${a_asset_id}`, 300, updateLastInjectTime);
            } else {
                console.error(`❌ Error: Tidak bisa update lastrunningtime untuk asset ${a_asset_id}`);
            }

            await dbClient.query('COMMIT');

            server.io.emit('refreshFetchData', { status: true, message: "Inject from sensor" });


            return { success: true, message: `Log inserted with status: ${statusEvent}`, timeDiff };
        } catch (error) {
            if (dbClient) {
                await dbClient.query('ROLLBACK');
            }
            console.error(`❌ Database transaction failed for Asset ${a_asset_id}:`, error);
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

            const checkResourceStatus = await server.resource.findOne(server, resourceId);

            if (!checkResourceStatus || checkResourceStatus.length === 0) {
                console.error("Resource tidak ditemukan.");
                return { success: false, message: "Resource tidak ditemukan." };
            }

            // Ambil kategori downtime dari DB
            const { rows: downtimeCategories } = await dbClient.query(`
                SELECT value AS code, name AS category 
                FROM downtime_category 
                WHERE isactive = 'Y'
            `);

            const currentStatus = checkResourceStatus[0].status;
            const rCode = checkResourceStatus[0].code;

            const statusCategory = downtimeCategories.find(item => item.code === currentStatus)?.category || "UNKNOWN";
            const newStatus = downtimeCategories.find(item => item.code === code)?.category || "UNKNOWN";


            // if (code === 'RUN') {

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
                SELECT a_asset_event_id, starttime, endtime
                FROM a_asset_event
                WHERE a_asset_id = $1 AND endtime IS NULL
                ORDER BY starttime DESC
                LIMIT 1
            `;
            const { rows } = await dbClient.query(getLastOpenEventQuery, [resourceId]);

            let startTime = new Date();

            if (rows.length > 0 && code !== 'HO') {
                const lastEvent = rows[0];

                // Tutup event sebelumnya
                const closeEventQuery = `
                        UPDATE a_asset_event 
                        SET endtime = NOW() AT TIME ZONE 'Asia/Jakarta'
                        WHERE a_asset_event_id = $1 AND a_asset_id = $2
                        RETURNING endtime
                    `;
                const closeResult = await dbClient.query(closeEventQuery, [lastEvent.a_asset_event_id, resourceId]);

                if (closeResult.rows.length === 0) {
                    console.error("Gagal menutup event sebelumnya.");
                }

                startTime = closeResult.rows[0].endtime;
            }

            // Insert event baru dengan starttime yang sudah ditentukan
            const insertEventQuery = `
                    INSERT INTO a_asset_event (a_asset_id, starttime, status, code, reason)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING a_asset_event_id, starttime, status
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

            const statusEvent = rows[0].status;

            if (statusEvent !== 'Downtime') {
                return { success: false, message: `Asset ${a_asset_id} tidak sedang dalam status Downtime` };
            }

            // ✅ Update downtime terakhir yang masih berjalan (endtime NULL)
            const downtimeUpdateQuery = `
            UPDATE a_asset_downtime
            SET endtime = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE a_asset_id = $1 AND endtime IS NULL
            RETURNING starttime, endtime, duration;
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
                details: downtimeRows[0] // Mengembalikan info downtime terakhir (starttime, endtime, duration)
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
                    ae.starttime,
                    ae.endtime,
                    ae.duration,
                    ae.reason,
                    ae.status,
                    ae.code
                FROM a_asset_event ae
                WHERE ae.a_asset_id = $1
                ORDER BY ae.starttime DESC
            `;

            const { rows } = await dbClient.query(query, [resourceId]);

            const formattedRows = rows.map((row, index) => ({
                a_asset_event_id: index + 1,
                starttime: row.starttime
                    ? DateTime.fromJSDate(new Date(row.starttime))
                        .setZone('Asia/Jakarta')
                        .toFormat('yyyy-MM-dd HH:mm:ss.SSS')
                    : null,
                endtime: row.endtime
                    ? DateTime.fromJSDate(new Date(row.endtime))
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

async function event(fastify, opts) {
    fastify.decorate('event', new Event())
    fastify.register(autoload, {
        dir: join(import.meta.url, 'routes'),
        options: {
            prefix: opts.prefix
        }
    })
}

export default fp(event)