// productions.service.js
import { v4 as uuidv4 } from 'uuid';

class ProductionsService {

    async create(server, data) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            await dbClient.query('BEGIN');

            // 1. Ambil currentnext dari ad_sequence untuk produksi
            const seqResult = await dbClient.query(`
                SELECT currentnext, incrementno
                FROM ad_sequence
                WHERE ad_sequence_id = 1000604
                FOR UPDATE
            `);

            // FOR UPDATE adalah perintah locking(mengunci) baris hasil query di level row dalam database.Saat baris dikunci dengan FOR UPDATE, transaksi lain tidak bisa mengubah(UPDATE / DELETE) baris tersebut sampai transaksi ini selesai(COMMIT atau ROLLBACK).

            const documentNo = seqResult.rows[0].currentnext;
            const incrementNo = seqResult.rows[0].incrementno;

            // 1. Ambil m_production_id terakhir
            const lastIdResult = await dbClient.query(`
                SELECT m_production_id
                FROM m_production
                ORDER BY m_production_id DESC
                LIMIT 1
                FOR UPDATE
            `);

            let productionId = 1;  // Default starting ID jika tidak ada data sebelumnya
            if (lastIdResult.rows.length > 0) {
                productionId = parseInt(lastIdResult.rows[0].m_production_id, 10) + 1;  // Increment ID terakhir
            }



            // 2. Generate UUID untuk produksi
            const productionUU = uuidv4();

            await dbClient.query(`
                INSERT INTO m_production (
                    m_production_id, ad_client_id, ad_org_id, documentno, m_production_uu, 
                    isactive, created, createdby, updated, updatedby, 
                    name, movementdate, description, productionqty, m_product_id, 
                    m_locator_id, posted, processed, processing, iscreated, 
                    iscomplete, docstatus, cust_joborder_id, c_doctype_id, pp_product_bom_id
                ) VALUES (
                    $1, $2, $3, $4, $5, 
                    'Y', now(), $6, now(), $6, 
                    $7, $8, $9, $10, $11, 
                    $12, 'N', 'N', 'N', 'Y', 
                    'N', $13, $14, $15, $16
                )
            `, [
                productionId, // $1
                data.ad_client_id, // $2
                data.ad_org_id, // $3
                documentNo, // $4
                productionUU, // $5
                data.user_id,  // $6 (createdby)
                data.name, // $7 (name)
                data.movementdate, // $8 (movementdate)
                data.description || null, // $9 (description)
                data.qtyplanned, // $10 (productionqty)
                data.m_product_id,  // $11 (m_product_id)
                1000353, // $12 (m_locator_id)
                'DR', // $13 (posted)
                data.cust_joborder_id, // $14 (cust_joborder_id)
                1000024, // $15 (c_doctype_id)
                data.bom_id // $16 (pp_product_bom_id)
            ]);

            const lastProdLineIdResult = await dbClient.query(`
                SELECT m_productionline_id
                FROM m_productionline
                ORDER BY m_productionline_id DESC
                LIMIT 1
                FOR UPDATE
            `);

            let lastProdLineId = 1;
            if (lastProdLineIdResult.rows.length > 0) {
                lastProdLineId = parseInt(lastProdLineIdResult.rows[0].m_productionline_id, 10);
            }

            // Step 2: Insert End Prodcut to Production Line
            const endProductId = lastProdLineId + 1;
            const endProductUU = uuidv4();

            await dbClient.query(`
                INSERT INTO m_productionline (
                    m_productionline_id, ad_client_id, ad_org_id, m_productionline_uu,
                    isactive, created, createdby, updated, updatedby,
                    m_production_id, line, m_locator_id, m_product_id,
                    plannedqty, movementqty, isendproduct, sensorqty, rejectqty
                ) VALUES (
                    $1, $2, $3, $4,
                    'Y', now(), $5, now(), $5,
                    $6, $7, $8, $9,
                    $10, $11, 'Y', $12, $13
                )
            `, [
                endProductId,
                data.ad_client_id,
                data.ad_org_id,
                endProductUU,
                data.user_id,
                productionId,
                10, // line number untuk produk jadi
                data.m_locator_id || 1000353,
                data.m_product_id,
                data.qtyplanned,
                0,// 
                0, // sensorqty
                0, // sendor qty
            ]);


            // 3. Insert ke m_production_line secara paralel menggunakan Promise.all
            if (Array.isArray(data.lines) && data.lines.length > 0) {
                await Promise.all(data.lines.map(async (line, index) => {

                    const lineId = endProductId + index + 1; // Contoh ID unik per baris, bisa disesuaikan
                    const lineUU = uuidv4();

                    return dbClient.query(`
                        INSERT INTO m_productionline (
                            m_productionline_id, ad_client_id, ad_org_id, m_productionline_uu,
                            isactive, created, createdby, updated, updatedby,
                            m_production_id, line, m_locator_id, m_product_id,
                            qtyused, plannedqty, isendproduct
                        ) VALUES (
                            $1, $2, $3, $4,
                            'Y', now(), $5, now(), $5,
                            $6, $7, $8, $9,
                            $10, $11, $12
                        )
                    `, [
                        lineId,          // $1
                        data.ad_client_id,         // $2
                        data.ad_org_id,            // $3
                        lineUU,                    // $4
                        data.user_id,              // $5
                        productionId,              // $6
                        (index + 1) * 10,                // $7 (line number)
                        1000354, // $8 raw material
                        line.partId,         // $9
                        0,          // $10
                        data.qtyplanned, //$11
                        'N'  // $12
                    ]);
                }));
            }



            // 4. Update sequence
            await dbClient.query(`
                UPDATE ad_sequence
                SET currentnext = currentnext + $1
                WHERE ad_sequence_id = 1000604
            `, [incrementNo]);

            await dbClient.query('COMMIT');

            return { success: true, m_production_id: productionId, m_production_uu: productionUU };
        } catch (err) {
            await dbClient.query('ROLLBACK');
            throw err;
        } finally {
            dbClient.release();
        }
    }

    async saveMaterials(server, materials) {
        const dbClient = await server.db.connect();
        try {
            await dbClient.query('BEGIN');

            const inserted = [];

            for (const material of materials) {
                const { partId, planId, qty } = material;

                if (!partId || !planId || qty === undefined) {
                    throw new Error('Missing required fields: partId, planId, or qty.');
                }

                const lineUU = uuidv4();

                const res = await dbClient.query(`
                    INSERT INTO m_productionline (
                        m_productionline_id,
                        ad_client_id,
                        ad_org_id,
                        m_productionline_uu,
                        isactive,
                        created,
                        createdby,
                        updated,
                        updatedby,
                        m_production_id,
                        line,
                        m_locator_id,
                        m_product_id,
                        movementqty,
                        isendproduct
                    )
                    VALUES (
                        (SELECT COALESCE(MAX(m_productionline_id), 0) + 1 FROM m_productionline),
                        1000000, -- Replace with actual client_id
                        1000000, -- Replace with actual org_id
                        $1, 
                        'Y', 
                        NOW(),
                        100,      -- Replace with actual user_id
                        NOW(), 
                        100, 
                        $2, $3, $4, $5, $6, 
                        'N'
                    )
                    RETURNING *;
                `, [
                    lineUU,
                    material.m_production_id, // Ambil m_production_id sesuai data yang diterima
                    10, // line number, bisa disesuaikan
                    material.m_locator_id || 1000019, // default locator jika kosong
                    partId, // Gunakan partId dari bomComponent
                    qty // Gunakan qtyBOM sebagai qty
                ]);

                inserted.push(res.rows[0]);
            }

            await dbClient.query('COMMIT');
            return inserted;

        } catch (err) {
            await dbClient.query('ROLLBACK');
            throw err;
        } finally {
            dbClient.release();
        }
    }
}

export default ProductionsService;
