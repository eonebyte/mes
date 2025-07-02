// productions.service.js
import axios from 'axios';
import https from 'https';
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

            let productionId = 1000000;  // Default starting ID jika tidak ada data sebelumnya
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
                0,  //plannedqty,
                0,  //movementqty 
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
                            qtyused, plannedqty, isendproduct, actualqtyused
                        ) VALUES (
                            $1, $2, $3, $4,
                            'Y', now(), $5, now(), $5,
                            $6, $7, $8, $9,
                            $10, $11, $12, $13
                        )
                    `, [
                        lineId,          // $1
                        data.ad_client_id,         // $2
                        data.ad_org_id,            // $3
                        lineUU,                    // $4
                        data.user_id,              // $5
                        productionId,              // $6
                        (index + 2) * 10,                // $7 (line number)
                        1000354, // $8 raw material
                        line.partId,         // $9
                        // line.qtyBOM * data.qtyplanned,          // $10
                        0,          // $10
                        0, //$11
                        'N',  // $12
                        0, // $13
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
        const dbClient = await server.pg.connect();
        try {
            await dbClient.query('BEGIN');

            for (const material of materials) {
                const { partId, planId, qtyUsed, userId } = material;

                console.log('Material: ', material);


                if (!partId || !planId || qtyUsed === undefined) {
                    throw new Error('Missing required fields: partId, planId, or qty.');
                }

                // Update productionline where isendproduct = 'N'
                await dbClient.query(`
                    UPDATE m_productionline
                    SET actualqtyused = $1, updated = NOW(), updatedby = $4
                    WHERE m_production_id = (
                        SELECT m_production_id
                        FROM m_production
                        WHERE cust_joborder_id = $2
                    )
                    AND m_product_id = $3
                    AND isendproduct = 'N';
                `, [qtyUsed, planId, partId, userId]);
            }

            await dbClient.query('COMMIT');
            return { success: true, message: 'Materials updated successfully.' };

        } catch (err) {
            await dbClient.query('ROLLBACK');
            throw err;
        } finally {
            dbClient.release();
        }
    }

    async insertProductionDefect(server, defects) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();
            if (!Array.isArray(defects) || defects.length === 0) {
                throw new Error('No defect data to insert');
            }

            const values = [];
            const placeholders = defects.map((d, i) => {
                const idx = i * 4;
                values.push(d.productionId, d.category, d.qty, d.userId);
                return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`;
            });


            const query = `
                INSERT INTO m_production_defect (
                    m_production_id,
                    defect_category,
                    qty,
                    created_by
                ) VALUES ${placeholders.join(', ')}
                RETURNING id
                `;

            const result = await dbClient.query(query, values);

            return result.rows;
        } catch (error) {
            console.error('Error insert production defect:', error);
            throw new Error('Failed to insert production defect');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    async findAllDefects(server, planId) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();


            /// Step 2: Ambil semua m_production_id yang punya cust_joborder_id tersebut
            const prodRes = await dbClient.query(
                `SELECT m_production_id FROM m_production WHERE cust_joborder_id = $1`,
                [planId]
            );

            const productionIds = prodRes.rows.map(row => row.m_production_id);

            if (productionIds.length === 0) {
                return []; // Tidak ada production, tidak perlu query defect
            }


            const query = `
                    select qty, defect_category from m_production_defect where m_production_id = ANY($1)
                `;

            const result = await dbClient.query(query, [productionIds]);

            return result.rows;
        } catch (error) {
            console.error('Error insert production defect:', error);
            throw new Error('Failed to insert production defect');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    async updateOutputQty(request, server, productionId, userId, outputQty) {
        const user = request.session.get('user');
        const agent = new https.Agent({ rejectUnauthorized: false });

        let dbClient;

        try {
            dbClient = await server.pg.connect();

            // 1. Ambil bom_id dari m_production
            const queryGetBomId = `
                SELECT
                    ppb.pp_product_bom_id AS bom_id
                FROM
                    M_Production pp
                JOIN pp_product_bom ppb ON pp.m_product_id = ppb.m_product_id
                WHERE M_Production_ID=$1 AND ppb.bomtype = 'A'
            `;

            const rowsBomId = await dbClient.query(queryGetBomId, [productionId]);

            if (rowsBomId.rows.length === 0) {
                throw new Error('BOM not found for this product on production');
            }
            const bomId = rowsBomId.rows[0].bom_id;


            const response = await axios.post(
                'https://192.168.3.6:8443/api/v1/processes/m_production_create', // ID 109 = CompleteProduction
                {
                    'record-id': parseInt(productionId),
                    'Recreate': "Y",
                    "ProductionQty": parseInt(outputQty),
                    "PP_Product_BOM_ID": parseInt(bomId)
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    httpsAgent: agent
                },
            );

            console.log('this is response.data:', response.data);



            const { isError } = response.data;

            console.log('isError:', isError);



            if (isError) {
                throw new Error(response.data.Message || 'Terjadi error saat create lines untuk produksi');
            }

        } catch (error) {
            console.error('Error updating production lines:', error);
            throw new Error(error.message || 'Failed to update production lines');
        } finally {
            if (dbClient) dbClient.release();
        }
    }

    async updateLostQty(server, productionId, userId, lostQty) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            // 1. Update m_production (set productionqty)
            const updateProduction = `
                UPDATE m_production
                SET lostqty = $1,
                    updated = now(),
                    updatedby = $2
                WHERE m_production_id = $3
            `;
            await dbClient.query(updateProduction, [lostQty, userId, productionId]);

        } catch (error) {
            console.error('Error updating production lines:', error);
            throw new Error('Failed to update production lines');
        } finally {
            if (dbClient) dbClient.release();
        }
    }


}

export default ProductionsService;
