import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import { join } from 'desm'
import { DateTime } from 'luxon';

class Mold {
    async findOne(server, moldId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                    SELECT
                        mp.m_product_id,
                        mp."name"
                    FROM
                        m_product mp
                    WHERE
                        mp.m_product_category_id = 1000025
                        AND mp.m_product_id = $1
                `;

            const result = await dbClient.query(query, [moldId]);

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            throw new Error(`Failed to fetch All Molds: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release(); // PostgreSQL pakai release() untuk pool
            }
        }
    }

    async findAll(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                    SELECT
                        mp.m_product_id,
                        mp."name"
                    FROM
                        m_product mp
                    WHERE
                        mp.m_product_category_id = 1000025
                `;

            const result = await dbClient.query(query);

            if (result.rows.length > 0) {
                return result.rows;
            }

            return [];
        } catch (error) {
            throw new Error(`Failed to fetch All Molds: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release(); // PostgreSQL pakai release() untuk pool
            }
        }
    }

    async moldSetup(server, resourceId, moldId, moldName) {
        const nowDowntime = DateTime.now().setZone('Asia/Jakarta');
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                    UPDATE 
                        a_asset 
                    SET mold_id = $2,
                        mold_name = $3,
                        setuptime = $4
                    WHERE 
                        a_asset_id = $1
                `;

            const result = await dbClient.query(query, [resourceId, moldId, moldName, nowDowntime.toJSDate()])

            if (result.rowCount === 0) {
                throw new Error("Gagal memperbarui mold, resource tidak ditemukan atau tidak berubah.");
            }

            return {
                success: true,
                message: "Setup mold berhasil!",
                data: result.rows[0],
            };

        } catch (error) {
            console.error("Error dalam moldSetup:", error.message);
            throw new Error(`Gagal setup mold: ${error.message}`);
        } finally {
            // Pastikan koneksi database dilepas hanya jika berhasil dibuat
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    async moldTeardown(server, resourceId) {
        let dbClient;
        let errors = [];

        try {
            dbClient = await server.pg.connect();

            // Validasi apakah ada JO yang masih aktif
            const cekJO = await dbClient.query(`
                    SELECT 1
                    FROM cust_joborder
                    WHERE a_asset_id = $1
                    AND iscurrent = 'Y'
                    LIMIT 1
                `, [resourceId]);

            if (cekJO.rowCount > 0) {
                errors.push("Tidak bisa teardown mold karena masih ada Job Order aktif.");
            }

            if (errors.length === 0) {
                const update = await dbClient.query(`
                    UPDATE a_asset
                    SET mold_id = NULL,
                        mold_name = NULL
                    WHERE a_asset_id = $1
                `, [resourceId]);

                if (update.rowCount === 0) {
                    errors.push("Gagal teardown mold, resource tidak ditemukan atau tidak berubah.");
                }
            }

            return {
                success: errors.length === 0,
                messages: errors.length > 0 ? errors : ["Teardown mold berhasil!"]
            };

        } catch (error) {
            console.error("Error dalam moldTeardown:", error.message);
            errors.push(`Gagal teardown mold: ${error.message}`);
            return {
                success: false,
                messages: errors,
                error,
            };
        } finally {
            // Pastikan koneksi database dilepas hanya jika berhasil dibuat
            if (dbClient) {
                dbClient.release();
            }
        }
    }
}

async function mold(fastify, opts) {
    fastify.decorate('mold', new Mold())
    fastify.register(autoload, {
        dir: join(import.meta.url, 'routes'),
        options: {
            prefix: opts.prefix
        }
    })
}

export default fp(mold)