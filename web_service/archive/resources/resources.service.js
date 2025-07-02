import { DateTime } from 'luxon'

class ResourcesService {

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
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            // Ambil data resources (a_asset)
            const resourcesRes = await dbClient.query(`
                SELECT a_asset_id AS id, name, value, lineno
                FROM a_asset
            `);

            // Ambil data tasks/events (a_asset_event)
            const tasksRes = await dbClient.query(`
                SELECT id, 
                       a_asset_id AS "resourceId",
                       TO_CHAR(start_time AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS "start",
                       TO_CHAR(
				        CASE 
				            WHEN end_time IS NULL THEN NOW() AT TIME ZONE 'UTC'
				            ELSE end_time AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE 'UTC'
				        END,
				        'YYYY-MM-DD HH24:MI:SS'
				    ) AS "end",
                       status,
                       code,
                       EXTRACT(EPOCH FROM (end_time - start_time)) AS duration_seconds
                FROM a_asset_events
                WHERE start_time IS NOT NULL
            `);

            // Map data resources
            const resources = resourcesRes.rows.map((row, index) => ({
                id: row.id.toString(),
                label: `${row.lineno} #${row.value}`,
                data: [],
                description: [],
                categories: {}
            }));

            function formatDuration(seconds) {
                const d = Math.floor(seconds / (24 * 3600));
                const h = Math.floor((seconds % (24 * 3600)) / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = Math.floor(seconds % 60);

                return [
                    d > 0 ? `${d}d` : '',
                    h > 0 ? `${h}h` : '',
                    m > 0 ? `${m}m` : '',
                    s > 0 && d === 0 && h === 0 ? `${s}s` : ''  // tampilkan detik hanya jika kurang dari 1 jam dan 0 hari
                ].filter(Boolean).join(' ');
            }


            for (const row of tasksRes.rows) {
                const resource = resources.find(r => r.id === row.resourceId.toString());
                if (!resource) continue;

                const code = row.code || 'RR';
                const desc = row.status || 'Unknown';
                const duration = row.duration_seconds || 0;
                const fullDesc = `${desc} (${formatDuration(duration)})`;

                // Tambahkan kategori berdasarkan code jika belum ada
                if (!resource.categories[code]) {
                    resource.categories[code] = {
                        class: `rect_${code}`,
                        tooltip_html: `<i class="fas fa-fw fa-circle tooltip_${code}"></i>`
                    };
                }

                // Tambahkan data dan deskripsi
                resource.data.push([row.start, code, row.end]);
                resource.description.push([fullDesc]);
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

    static async getAssetEventByResourceId(server, resourceIds) {
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

                const code = row.code || 'RR';
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
            const countCodes = {
                R: 0,
                RR: 0,
                ST: 0,
                TM: 0,
                R0: 0,
                R1: 0,
                R2: 0,
                R3: 0,
                R4: 0,
                R5: 0,
                R6: 0,
                R7: 0,
                R8: 0,
                R9: 0,
                M: 0,
                STG: 0,
                WAIT: 0
            };

            const { rows } = await dbClient.query(
                'SELECT code FROM a_asset_events WHERE end_time IS NULL'
            );

            // Hitung jumlah berdasarkan code
            rows.forEach(row => {
                const code = row.code;
                if (countCodes.hasOwnProperty(code)) {
                    countCodes[code]++;
                } else {
                    // Jika code belum terdaftar, tambahkan sebagai baru
                    countCodes[code] = 1;
                }
            });

            return countCodes;
        } catch (error) {
            throw new Error(`Error fetching resources: ${error.message}`);
        } finally {
            dbClient.release();
        }
    }






}

export default ResourcesService;
