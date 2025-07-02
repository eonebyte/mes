export default async (server, opts) => {
    server.post('/import', async (request, reply) => {
        let dbClient;
        try {
            dbClient = await server.pg.connect();
            const importData = request.body;

            await dbClient.query('BEGIN');

            const mappedData = await Promise.all(importData.map(async (row, index) => {

                try {
                    // Pastikan semua nilai tidak undefined/null
                    if (!row.col1 || !row.col3 || !row.col4 || !row.col5 || !row.col6) {
                        throw new Error(`Data tidak valid pada baris ke-${index + 1}`);
                    }

                    const cust_joborder = await server.plan.custJobOrderId(server);
                    const document = await server.plan.documentNo(server);
                    const product = await server.plan.getProduct(server, row.col6.trim());
                    const asset = await server.plan.getAssetId(server, String(row.col1).trim());
                    const mold = await server.plan.getMoldId(server, String(row.col9).trim());

                    const document_no = (Number(document) + 1 + index).toString();
                    const cust_joborder_id = Number(cust_joborder) + 1 + index;
                    const product_id = Number(product);
                    const asset_id = Number(asset);
                    const mold_id = Number(mold);

                    const formattedDateDoc = format(parse(row.col3, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') + ' 00:00:00';
                    const formattedStartDate = format(parse(row.col4, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');
                    const formattedEndDate = format(parse(row.col5, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');

                    const queryGetBomId = `
                                SELECT pp_product_bom_id 
                                FROM pp_product_bom 
                                WHERE m_product_id = $1 AND bomtype = 'A'
                                LIMIT 1
                            `;

                    const { rows: bomRows } = await dbClient.query(queryGetBomId, [product_id]);
                    const bomId = bomRows.length > 0 ? bomRows[0].pp_product_bom_id : null;

                    return {
                        AD_CLIENT_ID: 1000003,
                        AD_ORG_ID: 1000003,
                        A_ASSET_ID: asset_id,
                        CREATED: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                        RCODE: String(row.col1).trim(),
                        CREATEDBY: row.user_id,
                        CUST_JOBORDER_ID: cust_joborder_id,
                        DESCRIPTION: row.col2 ? row.col2.trim() : null,
                        DOCSTATUS: 'DR',
                        DOCUMENTNO: document_no,
                        DATEDOC: formattedDateDoc,
                        STARTDATE: formattedStartDate,
                        ENDDATE: formattedEndDate,
                        ISACTIVE: 'Y',
                        ISVERIFIED: 'N',
                        M_PRODUCT_ID: product_id,
                        PRINT_JOBORDER: 'N',
                        UPDATED: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                        UPDATEDBY: row.user_id,
                        QTYPLANNED: row.col7,
                        JOACTION: 'CO',
                        PRINT_JOBORDERLABEL: 'N',
                        A_ASSET_RUN_ID: null,
                        ISTRIAL: row.col8,
                        ISAUTODROP: 'N',
                        JOTYPE: 'I',
                        MOLD_ID: mold_id,
                        BOM_ID: bomId,
                        ISCURRENT: 'N',
                    };
                } catch (error) {
                    request.log.error(`Error mapping row ${index + 1}: ${error.message}`);
                    return null; // Abaikan data yang error
                }
            }));

            // Loop untuk setiap data yang telah dipetakan
            for (let data of mappedData) {
                const insertQuery = `
                            INSERT INTO adempiere.cust_joborder (
                                ad_client_id, ad_org_id, a_asset_id, created, createdby, 
                                cust_joborder_id, datedoc, description, docstatus, documentno,
                                startdate, enddate, isactive, isverified, m_product_id, print_joborder, 
                                updated, updatedby, qtyplanned, joaction, print_joborderlabel, 
                                a_asset_run_id, istrial, isautodrop, jotype, mold_id, bom_id, iscurrent
                            ) VALUES (
                                $1, $2, $3, $4::TIMESTAMP, $5, 
                                $6, $7::TIMESTAMP, $8, $9, $10,
                                $11::TIMESTAMP, $12::TIMESTAMP, 
                                $13, $14, $15, $16, 
                                $17::TIMESTAMP, $18, $19, $20, $21, 
                                $22, $23, $24, $25, $26, $27, $28
                            )
                        `;

                // Parameter binds untuk query
                const binds = [
                    data.AD_CLIENT_ID,
                    data.AD_ORG_ID,
                    data.A_ASSET_ID,
                    data.CREATED,
                    data.CREATEDBY,
                    data.CUST_JOBORDER_ID,
                    data.DATEDOC,
                    data.DESCRIPTION || null,
                    data.DOCSTATUS,
                    data.DOCUMENTNO,
                    data.STARTDATE,
                    data.ENDDATE,
                    data.ISACTIVE,
                    data.ISVERIFIED,
                    data.M_PRODUCT_ID,
                    data.PRINT_JOBORDER,
                    data.UPDATED,
                    data.UPDATEDBY,
                    data.QTYPLANNED,
                    data.JOACTION,
                    data.PRINT_JOBORDERLABEL,
                    data.A_ASSET_RUN_ID || null,
                    data.ISTRIAL,
                    data.ISAUTODROP,
                    data.JOTYPE,
                    data.MOLD_ID,
                    data.BOM_ID,
                    data.ISCURRENT
                ];

                await dbClient.query(insertQuery, binds);

                const bomComponent = data.BOM_ID ? await server.plan.getBOMComponent(server, parseInt(data.BOM_ID)) : [];

            }

            await dbClient.query('COMMIT');
            reply.send({ message: 'Data imported and inserted successfully!', data: mappedData });
        } catch (error) {
            await dbClient.query('ROLLBACK'); // Jika error, batalkan transaksi
            request.log.error(error); // Gunakan request.log
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        } finally {
            // Tutup koneksi
            if (dbClient) {
                try {
                    await dbClient.release();
                    console.log('Connection closed.');
                } catch (closeErr) {
                    console.error('Error closing connection:', closeErr);
                }
            }
        }
    })
}