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
                    $12, 'N', 'N', 'N', 'N', 
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
}

export default ProductionsService;
