import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import { join } from 'desm'
import oracleConnection from "../../configs/oracle.connection.js";


class Resource {
    async saveTimestampToRedis(server, redisKey) {
        const nowJakarta = DateTime.now().setZone("Asia/Jakarta").toFormat("yyyy-MM-dd HH:mm:ss");

        await server.redis.set(redisKey, nowJakarta, 'EX', 300); // Expire dalam 300 detik (opsional)

        console.log(`✅ Timestamp disimpan ke Redis: ${nowJakarta}`);
    }

    // async findAll(server) {
    //     let dbClient;
    //     try {
    //         dbClient = await server.pg.connect();

    //         const query = `
    //             SELECT
    //                 a_asset_id,
    //                 name,
    //                 line,
    //                 lineno,
    //                 status,
    //                 value as resource_code
    //             FROM
    //                 a_asset 
    //             ORDER BY
    //                 lineno
    //             `;

    //         const result = await dbClient.query(query);

    //         return result.rows.length > 0
    //             ? result.rows.map(row => ({
    //                 id: row.a_asset_id,
    //                 name: row.name,
    //                 line: row.line,
    //                 lineno: row.lineno,
    //                 status: row.status,
    //                 code: row.resource_code,
    //                 image: "/src/assets/images/machine.png" // Field tambahan untuk gambar
    //             }))
    //             : [];

    //     } catch (error) {
    //         console.error('Error fetching resources:', error);
    //         throw new Error('Failed to fetch resources');
    //     } finally {
    //         // Pastikan koneksi selalu ditutup
    //         if (dbClient) {
    //             try {
    //                 dbClient.release();
    //             } catch (closeError) {
    //                 console.error('Error closing connection:', closeError);
    //             }
    //         }
    //     }
    // }

    async findAll(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            // 1. Ambil semua asset
            const assetQuery = `
                    SELECT
                        a_asset_id,
                        name,
                        line,
                        lineno,
                        status,
                        value as resource_code
                    FROM
                        a_asset 
                    ORDER BY
                        lineno
                `;
            const { rows: assets } = await dbClient.query(assetQuery);

            // 2. Loop per asset, ambil job order dan production-nya
            const enrichedAssets = [];

            for (const asset of assets) {
                // Ambil job order yang iscurrent = 'Y' berdasarkan a_asset_id
                const jobOrderQuery = `
                        SELECT jo.cust_joborder_id, jo.qtyplanned, mp.cycletime
                        FROM
                            cust_joborder jo
                        join m_product mp on jo.m_product_id = mp.m_product_id
                        WHERE iscurrent = 'Y' AND a_asset_id = $1       
                    `;
                const { rows: jobOrderRows } = await dbClient.query(jobOrderQuery, [asset.a_asset_id]);

                let jobOrder = null;
                let productions = [];

                if (jobOrderRows.length > 0) {
                    const { cust_joborder_id, qtyplanned, cycletime } = jobOrderRows[0];
                    jobOrder = {
                        cust_joborder_id,
                        planqty: Number(qtyplanned),
                        cycletime: Number(cycletime),
                    };

                    // Ambil productions berdasarkan cust_joborder_id dengan docstatus != 'CO'
                    const productionQuery = `
                            SELECT
                                documentno as production_no,
                                m_production_id,
                                productionqty,
                                docstatus,
                                lostqty
                            FROM
                                m_production
                            WHERE cust_joborder_id = $1
                              AND docstatus != 'CO'
                        `;
                    const { rows: productionRows } = await dbClient.query(productionQuery, [cust_joborder_id]);

                    productions = productionRows.map(p => ({
                        production_no: p.production_no,
                        m_production_id: Number(p.m_production_id),
                        productionqty: Number(p.productionqty),
                        docstatus: p.docstatus,
                        lostqty: Number(p.lostqty)
                    }));
                }

                enrichedAssets.push({
                    id: asset.a_asset_id,
                    name: asset.name,
                    line: asset.line,
                    lineno: asset.lineno,
                    status: asset.status,
                    code: asset.resource_code,
                    image: "/src/assets/images/machine.png",
                    joborder: jobOrder ? jobOrder : null, // Ambil hanya satu job order
                    productions: productions ? productions : null // Ambil hanya satu production
                });
            }

            return enrichedAssets;

        } catch (error) {
            console.error('Error fetching resources:', error);
            throw new Error('Failed to fetch resources');
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

    async getAll(server) {
        const dbClient = await server.pg.connect();
        try {
            const { rows } = await dbClient.query(
                'SELECT a_asset_id AS "machineId", name AS "machineName" FROM a_asset'
            );
            return rows.length > 0
                ? rows.map(row => {
                    return {
                        id: row.machineId,
                        name: row.machineName,
                    }
                }) : [];
        } catch (error) {
            throw new Error(`Error fetching resources: ${error.message}`);
        }
    }

    async getResourceEvents(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT
                    id as event_id,
                    a_asset_id as machine_id,
                    status,
                    start_time,
                    end_time,
                    duration
                FROM
                    a_asset_events
                WHERE
                    extract(epoch from start_time) >= extract(epoch from current_date)
                    AND extract(epoch from end_time) < extract(epoch from current_date + interval '1 day')
                ORDER BY start_time
            `;

            const result = await dbClient.query(query);

            // Fungsi util untuk durasi
            const formatDuration = (duration) => {
                const days = Math.floor(duration / (24 * 3600));
                const hours = Math.floor((duration % (24 * 3600)) / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                const seconds = duration % 60;
                return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
            };

            const events = result.rows.map(row => {
                const { start_time, end_time, duration, ...rest } = row;

                const start = new Date(start_time * 1000);
                const end = new Date(end_time * 1000);

                return {
                    eventId: rest.event_id,
                    machineId: rest.machine_id,
                    status: rest.status,
                    startTime: start,
                    endTime: end,
                    startTimeLocal: start,
                    endTimeLocal: end,
                    startTimeLocalString: start.toLocaleString(),
                    endTimeLocalString: end.toLocaleString(),
                    duration,
                    durationText: formatDuration(duration),
                    eventColor: '#FF0000',
                };
            });

            return events;

        } catch (error) {
            server.log.error('Error fetching machine events:', error);
            // Biarkan controller tangani error, jadi cukup lempar atau return null
            throw error;
        } finally {
            if (dbClient) dbClient.release();
        }
    }

    async getTimelineData(server) {
        let connection;

        try {
            connection = await oracleConnection.openConnection();

            // Ambil data resources (a_asset)
            const resourcesResQuery = `
                SELECT A_ASSET_ID, NAME, VALUE, LINENO
                FROM A_ASSET
                WHERE 
                    A_ASSET_GROUP_ID = 1000000
                    AND ISACTIVE = 'Y'
            `;

            // Ambil data tasks/events (a_asset_event)
            const tasksResQuery = `
            SELECT 
                ad.ADW_DOWNTIME_ID AS "a_asset_event_id",
                ad.A_ASSET_LOG_ID,
                ad.A_ASSET_ID,
                TO_CHAR(CAST(FROM_TZ(CAST(starttime AS TIMESTAMP), 'Asia/Jakarta') AT TIME ZONE 'UTC' AS DATE), 'YYYY-MM-DD HH24:MI:SS') AS STARTTIME,
                TO_CHAR(
                    FROM_TZ(CAST(ad.endtime AS TIMESTAMP), 'Asia/Jakarta') AT TIME ZONE 'UTC',
                    'YYYY-MM-DD HH24:MI:SS'
                ) AS ENDTIME,
                CASE
                    WHEN ad.ADW_OEEDT_ID IS NULL THEN 'UNKNOW'
                    ELSE TO_CHAR(ao.NAME)
                END AS STATUS,
                ad.ADW_DOWNTIME_ID,
                CASE
                    WHEN ad.ADW_OEEDT_ID IS NULL THEN 'UNKNOW'
                    ELSE TO_CHAR(ao.DTCLASS)
                END AS CODE,
                ((NVL(endtime, SYSDATE) - starttime) * 86400) AS DURATION_SECONDS
            FROM ADW_DOWNTIME ad
            LEFT JOIN ADW_OEEDT ao ON ad.ADW_OEEDT_ID = ao.ADW_OEEDT_ID
            /* PENTING: Tambahkan filter waktu di sini agar lebih efisien */
            /* WHERE ad.starttime > (SYSDATE - 1) */ 
        `;

            const [resourcesResult, tasksResult] = await Promise.all([
                connection.execute(resourcesResQuery, [], {
                    outFormat: oracleConnection.instanceOracleDB.OUT_FORMAT_OBJECT,
                }),
                connection.execute(tasksResQuery, [], {
                    outFormat: oracleConnection.instanceOracleDB.OUT_FORMAT_OBJECT,
                })
            ]);

            // --- PERBAIKAN TOTAL DIMULAI DI SINI ---

            // FIX 1: Definisikan variabel waktu dan helper yang hilang
            // Menggunakan waktu Jakarta (WIB/GMT+7)
            const now = new Date();
            const todayAt730 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0);

            // Konversi ke UTC untuk konsistensi. Chart library biasanya bekerja dengan UTC.
            const chartStartTimeUTC = todayAt730;
            const chartEndTimeUTC = now;

            const formatUTCDateString = (date) => {
                if (!date || !(date instanceof Date)) return null;
                return date.toISOString().slice(0, 19).replace('T', ' ');
            };

            // FIX 2: Inisialisasi 'events: []' bukan 'data: []' dan 'description: []'
            const resources = resourcesResult.rows.map(row => ({
                a_asset_id: row.A_ASSET_ID.toString(),
                label: `${row.LINENO ?? ''} #${row.VALUE ?? '-'}`,
                events: [], // Ini adalah perbaikan utamanya
                categories: {}
            }));

            const formatDuration = (seconds) => {
                if (seconds === null || seconds === undefined) return '';
                const d = Math.floor(seconds / (24 * 3600));
                const h = Math.floor((seconds % (24 * 3600)) / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = Math.floor(seconds % 60);

                return [
                    d > 0 ? `${d}d` : '',
                    h > 0 ? `${h}h` : '',
                    m > 0 ? `${m}m` : '',
                    s > 0 && d === 0 && h === 0 ? `${s}s` : ''
                ].filter(Boolean).join(' ');
            };

            // Langkah 1: Kumpulkan semua event downtime ke resource yang sesuai
            for (const row of tasksResult.rows) {
                const resource = resources.find(r => r.a_asset_id === row.A_ASSET_ID.toString());
                if (!resource) continue; // Lewati jika event tidak memiliki resource yang cocok

                const hasDowntimeType = row.CODE !== 'UNKNOW';
                const code = hasDowntimeType ? row.CODE.replace(/\s+/g, '_') : 'UNKNOW';
                const desc = hasDowntimeType ? row.STATUS : 'UNKNOW';
                const downtimeId = row.ADW_DOWNTIME_ID || 0;
                const duration = row.DURATION_SECONDS || 0;
                const fullDesc = `${desc} ${downtimeId} <br /> (${formatDuration(duration)})`;

                // Sekarang 'resource.events' sudah ada (berupa array kosong) dan bisa di-push
                resource.events.push({
                    start: row.STARTTIME,
                    end: row.ENDTIME,
                    code: code,
                    description: fullDesc
                });
            }

            // Langkah 2: Loop setiap resource untuk mengisi celah dengan status 'RUN'
            for (const resource of resources) {
                // Urutkan event berdasarkan waktu mulai. Ini SANGAT PENTING!
                resource.events.sort((a, b) => new Date(a.start) - new Date(b.start));

                const filledEvents = [];
                // Tentukan kategori untuk Running
                resource.categories['Running'] = {
                    class: `rect_Running`, // Anda perlu menambahkan CSS untuk kelas ini (warna hijau)
                    tooltip_html: `<i class="fas fa-fw fa-circle tooltip_Running"></i>`
                };

                // Mulai tracking dari awal waktu chart
                let lastEventEndTime = formatUTCDateString(chartStartTimeUTC);

                if (resource.events.length === 0) {
                    // Jika tidak ada event sama sekali, berarti Running sepanjang waktu
                    filledEvents.push({
                        start: lastEventEndTime,
                        end: formatUTCDateString(chartEndTimeUTC),
                        code: 'Running',
                        description: 'Running'
                    });
                } else {
                    for (const event of resource.events) {
                        const currentEventStartTime = new Date(event.start);

                        // Cek celah antara event terakhir dan event saat ini
                        if (currentEventStartTime > new Date(lastEventEndTime)) {
                            filledEvents.push({
                                start: lastEventEndTime,
                                end: event.start,
                                code: 'Running',
                                description: 'Running'
                            });
                        }

                        // Tambahkan event downtime itu sendiri
                        filledEvents.push(event);

                        // Update waktu akhir event terakhir, pastikan tidak null
                        lastEventEndTime = event.end || event.start;
                    }

                    // Cek celah setelah event terakhir hingga waktu sekarang
                    if (new Date(lastEventEndTime) < chartEndTimeUTC) {
                        filledEvents.push({
                            start: lastEventEndTime,
                            end: formatUTCDateString(chartEndTimeUTC),
                            code: 'Running',
                            description: 'Running'
                        });
                    }
                }

                // Ganti data event lama dengan yang sudah diisi
                resource.events = filledEvents;
            }

            // Langkah 3: Bangun dataset final dalam format yang dibutuhkan frontend
            const dataset = resources.map(resource => {
                // Buat kategori untuk semua downtime event yang ada di dalam events
                resource.events.forEach(event => {
                    if (event.code !== 'Running' && !resource.categories[event.code]) {
                        resource.categories[event.code] = {
                            class: `rect_${event.code}`,
                            tooltip_html: `<i class="fas fa-fw fa-circle tooltip_${event.code}"></i>`
                        };
                    }
                });

                return {
                    resourceId: resource.a_asset_id,
                    measure: resource.label,
                    measure_url: `/shopfloor/timeline/detail?resourceId=${resource.a_asset_id}`,
                    categories: resource.categories,
                    // Ubah kembali ke format array [start, code, end] dan array description
                    data: resource.events.map(e => [e.start, e.code, e.end]),
                    description: resource.events.map(e => e.description)
                };
            });

            return { dataset };

        } catch (error) {
            console.error('Error fetching timeline data:', error);
            throw new Error('Gagal mengambil data timeline');
        } finally {
            if (connection) {
                await connection.close(); // pastikan close adalah async
            }
        }
    }

    async getAssetEventByResourceId(server, resourceIds) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            if (!Array.isArray(resourceIds)) {
                resourceIds = [resourceIds];
            }

            // Ambil data resources (a_asset)
            const resourcesRes = await dbClient.query(`
                    SELECT a_asset_id AS id, name, value
                    FROM a_asset WHERE a_asset_id = ANY($1)
                `, [resourceIds]);


            // Ambil data tasks/events (a_asset_event)
            const tasksRes = await dbClient.query(`
                    SELECT id, 
                        a_asset_id AS "resourceId",
                        TO_CHAR(start_time AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS "start",
                        TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS "end",
                        status,
                        code
                    FROM a_asset_events
                    WHERE a_asset_id = ANY($1) and start_time IS NOT NULL AND end_time IS NULL
                    ORDER BY start_time DESC
                    LIMIT 1
                `, [resourceIds]);

            // Map data resources
            const resources = resourcesRes.rows.map((row, index) => ({
                id: row.id.toString(),
                label: `Resource #${row.value}`,
                data: [],
                description: [],
                categories: {}
            }));


            for (const row of tasksRes.rows) {
                const resource = resources.find(r => r.id === row.resourceId.toString());
                if (!resource) continue;

                const code = row.code || 'RUN';
                const desc = row.status || 'Unknown';

                // Tambahkan kategori berdasarkan code jika belum ada
                if (!resource.categories[code]) {
                    resource.categories[code] = {
                        class: `rect_${code}`,
                        tooltip_html: `<i class="fas fa-fw fa-circle tooltip_${code}"></i>`
                    };
                }

                // Tambahkan data dan deskripsi
                resource.data.push([row.start, code, row.end]);
                resource.description.push([desc]);
            }


            // Gabungkan data ke dalam format yang diinginkan
            const dataset = resources.map(resource => ({
                resourceId: resource.id,
                measure: resource.label,
                categories: resource.categories, // Kategori hanya berisi status yang ditemukan
                data: resource.data,
                description: resource.description
            }));

            return { dataset };

        } catch (error) {
            console.error('Error fetching timeline data:', error);
            throw new Error('Gagal mengambil data timeline');
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

    async countRowActiveResources(server) {
        const dbClient = await server.pg.connect();
        try {
            // Inisialisasi semua code ke 0

            // Step 1: Ambil semua code aktif dari event_category
            const { rows: categoryRows } = await dbClient.query(
                `SELECT value AS code 
             FROM event_category 
             WHERE isactive = 'Y'`
            );

            // Step 2: Inisialisasi countCodes dari hasil query
            const countCodes = {};
            for (const row of categoryRows) {
                countCodes[row.code] = 0;
            }

            // Step 3: Ambil semua asset_events yang aktif (end_time IS NULL)
            const { rows } = await dbClient.query(
                'SELECT code FROM a_asset_event WHERE endtime IS NULL'
            );

            // Step 4: Hitung jumlah masing-masing code
            rows.forEach(row => {
                const code = row.code;
                if (countCodes.hasOwnProperty(code)) {
                    countCodes[code]++;
                }
            });

            return countCodes;
        } catch (error) {
            throw new Error(`Error fetching resources: ${error.message}`);
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

    async codeColors(server) {
        const dbClient = await server.pg.connect();
        try {
            // Inisialisasi semua code ke 0

            // Step 1: Ambil semua code aktif dari event_category
            const { rows: categoryRows } = await dbClient.query(
                `SELECT value AS code, categorycolor AS color
             FROM event_category 
             WHERE isactive = 'Y'`
            );

            // Step 2: Inisialisasi countCodes dari hasil query
            const codeColors = {};
            for (const row of categoryRows) {
                codeColors[row.code] = row.color;
            }


            return codeColors;
        } catch (error) {
            throw new Error(`Error fetching resources: ${error.message}`);
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

async function resource(fastify, opts) {
    fastify.decorate('resource', new Resource())
    fastify.register(autoload, {
        dir: join(import.meta.url, 'routes'),
        options: {
            prefix: opts.prefix
        }
    })
}

export default fp(resource)