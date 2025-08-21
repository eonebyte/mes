import { format, parse } from 'date-fns';
import oracleDB from '../../../configs/oracle.connection.js';
import { DateTime } from 'luxon';

export default async (server, opts) => {
    server.post('/import', async (request, reply) => {
        let connection;

        try {
            const rows = request.body;
            console.log('Received rows for import:', rows);

            if (!Array.isArray(rows) || rows.length === 0) {
                return reply.code(400).send({ message: "No data to import" });
            }

            connection = await oracleDB.openConnection();

            const numberOfRows = rows.length;


            // 2A. Kunci baris sekuens agar tidak bisa diakses proses lain, lalu baca nilainya.
            const querySeq = `
                SELECT CURRENTNEXT 
                FROM AD_Sequence 
                WHERE AD_Sequence_ID = 1000693
                FOR UPDATE
            `;
            const resultSeq = await connection.execute(querySeq, [], { outFormat: oracleDB.instanceOracleDB.OBJECT });

            const firstAvailableId = resultSeq.rows[0]?.CURRENTNEXT;
            if (!firstAvailableId) {
                // Jika error, transaksi akan otomatis di-rollback saat koneksi ditutup atau di-handle di catch.
                throw new Error("Sequence with ID 1000693 not found or could not be locked.");
            }

            // 2B. Hitung nilai sekuens baru dan SEGERA update di database.
            const newNextId = firstAvailableId + numberOfRows;

            const updateSeqQuery = `
                UPDATE AD_Sequence 
                SET CURRENTNEXT = :newNextId 
                WHERE AD_Sequence_ID = 1000693
            `;
            // autoCommit: false memastikan update ini adalah bagian dari transaksi
            await connection.execute(updateSeqQuery, { newNextId }, { autoCommit: false });

            console.log(`Booking sequence success. Start ID: ${firstAvailableId}. Reserved ${numberOfRows} IDs. New NEXTID in DB will be ${newNextId}.`);

            // 2. Ambil base DocumentNo (YYMM + ####)
            const queryDocNo = `
                SELECT TO_CHAR(SYSDATE,'YYMM') ||
                    LPAD(NVL(MAX(TO_NUMBER(SUBSTR(DocumentNo,5,4))),0) + 1, 4, '0') AS DOCNO
                FROM Cust_JobOrder
                WHERE DocumentNo LIKE TO_CHAR(SYSDATE,'YYMM') || '%'
                AND DocumentNo NOT LIKE TO_CHAR(SYSDATE,'YYMM') || '9%'
            `;
            const resultDoc = await connection.execute(queryDocNo, [], { outFormat: oracleDB.instanceOracleDB.OBJECT });
            let baseDocNo = resultDoc.rows[0]?.DOCNO;
            if (!baseDocNo) {
                throw new Error("Failed to generate DocumentNo");
            }

            function formatDateTime(dateValue) {
                if (!dateValue) return null;

                try {
                    return DateTime.fromISO(dateValue, { zone: "utc" }).toFormat("yyyy-MM-dd HH:mm:ss");
                } catch (e) {
                    return dateValue; // fallback kalau bukan ISO valid
                }
            }

            // 3. Tambahkan cust_joborder_id & documentno untuk tiap row
            const enrichedData = rows.map((row, index) => {
                const cust_joborder_id = firstAvailableId + index;

                const prefix = baseDocNo.substring(0, 4); // YYMM
                const numberPart = parseInt(baseDocNo.substring(4), 10) + index;
                const documentno = prefix + numberPart.toString().padStart(4, "0");

                return {
                    ...row,
                    cust_joborder_id,
                    documentno,
                    start: formatDateTime(row.start),
                    end: formatDateTime(row.end),
                };
            });

            // 4. Opsional simpan ke JO table

            for (const row of enrichedData) {
                await connection.execute(
                    `INSERT INTO CUST_JOBORDER (
                        AD_CLIENT_ID, AD_ORG_ID, A_ASSET_ID, CREATED, CREATEDBY, CUST_JOBORDER_ID,
                        DATEDOC, DESCRIPTION, DOCSTATUS, DOCUMENTNO, STARTDATE, ENDDATE, ISACTIVE, ISVERIFIED,
                        M_PRODUCT_ID, PRINT_JOBORDER, UPDATED, UPDATEDBY, QTYPLANNED, JOACTION, 
                        PRINT_JOBORDERLABEL, ISTRIAL, ISAUTODROP, PRINT_JOBORDERLABELAD, 
                        PRINT_JOBORDERLABEL_B6H, M_PRODUCTMOLD_ID, PRINT_JOBORDERLABEL_BBE, 
                        PRINT_JOBORDERLABEL_7183X, JOTYPE, PRINT_JOBORDERLABEL_BPA
                    )
                    VALUES (
                        :ad_client_id, :ad_org_id,
                        (SELECT A_ASSET_ID FROM A_ASSET WHERE VALUE = :mc),
                        SYSDATE, :createdby, :cust_joborder_id,
                        SYSDATE, NULL, 'DR', :documentno,
                        TO_DATE(:startdate, 'YYYY-MM-DD HH24:MI:SS'),
                        TO_DATE(:enddate, 'YYYY-MM-DD HH24:MI:SS'),
                        'Y', 'Y',
                        (SELECT M_PRODUCT_ID FROM M_PRODUCT WHERE VALUE = :partno),
                        'N', SYSDATE, :updatedby, :qtyplanned, 'CO',
                        'N', 'N', 'N', 'N', 'N',
                        :m_productmold_id, 'N', 'N', 'I', 'N'
                    )`,
                    {
                        ad_client_id: 1000000,
                        ad_org_id: 1000000,
                        mc: row.mc,
                        createdby: row.user_id,
                        cust_joborder_id: row.cust_joborder_id,
                        documentno: row.documentno,
                        startdate: row.start,
                        enddate: row.end,
                        updatedby: row.user_id,
                        qtyplanned: row.qty,
                        partno: row.partno,
                        m_productmold_id: row.moldid || null
                    },
                    { autoCommit: false }
                );
            }
            await connection.commit();



            return reply.send({
                message: "Import data processed",
                data: enrichedData,
            });
        } catch (err) {
            if (connection) {
                try { await connection.rollback(); } catch (e) { }
            }
            console.error("Import error:", err);
            return reply.code(500).send({ message: "Error import data", error: err.message });
        } finally {
            if (connection) {
                await connection.close();
            }
        }


        // try {
        //     dbClient = await server.pg.connect();
        //     const importData = request.body;

        //     await dbClient.query('BEGIN');

        //     const mappedData = await Promise.all(importData.map(async (row, index) => {

        //         try {
        //             // Pastikan semua nilai tidak undefined/null
        //             if (!row.col1 || !row.col3 || !row.col4 || !row.col5 || !row.col6) {
        //                 throw new Error(`Data tidak valid pada baris ke-${index + 1}`);
        //             }

        //             const cust_joborder = await server.plan.custJobOrderId(server);
        //             const document = await server.plan.documentNo(server);
        //             const product = await server.plan.getProduct(server, row.col6.trim());
        //             const asset = await server.plan.getAssetId(server, String(row.col1).trim());
        //             const mold = await server.plan.getMoldId(server, String(row.col9).trim());

        //             const document_no = (Number(document) + 1 + index).toString();
        //             const cust_joborder_id = Number(cust_joborder) + 1 + index;
        //             const product_id = Number(product);
        //             const asset_id = Number(asset);
        //             const mold_id = Number(mold);

        //             const formattedDateDoc = format(parse(row.col3, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') + ' 00:00:00';
        //             const formattedStartDate = format(parse(row.col4, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');
        //             const formattedEndDate = format(parse(row.col5, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');

        //             const queryGetBomId = `
        //                         SELECT pp_product_bom_id 
        //                         FROM pp_product_bom 
        //                         WHERE m_product_id = $1 AND bomtype = 'A'
        //                         LIMIT 1
        //                     `;

        //             const { rows: bomRows } = await dbClient.query(queryGetBomId, [product_id]);
        //             const bomId = bomRows.length > 0 ? bomRows[0].pp_product_bom_id : null;

        //             return {
        //                 AD_CLIENT_ID: 1000003,
        //                 AD_ORG_ID: 1000003,
        //                 A_ASSET_ID: asset_id,
        //                 CREATED: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        //                 RCODE: String(row.col1).trim(),
        //                 CREATEDBY: row.user_id,
        //                 CUST_JOBORDER_ID: cust_joborder_id,
        //                 DESCRIPTION: row.col2 ? row.col2.trim() : null,
        //                 DOCSTATUS: 'DR',
        //                 DOCUMENTNO: document_no,
        //                 DATEDOC: formattedDateDoc,
        //                 STARTDATE: formattedStartDate,
        //                 ENDDATE: formattedEndDate,
        //                 ISACTIVE: 'Y',
        //                 ISVERIFIED: 'N',
        //                 M_PRODUCT_ID: product_id,
        //                 PRINT_JOBORDER: 'N',
        //                 UPDATED: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        //                 UPDATEDBY: row.user_id,
        //                 QTYPLANNED: row.col7,
        //                 JOACTION: 'CO',
        //                 PRINT_JOBORDERLABEL: 'N',
        //                 A_ASSET_RUN_ID: null,
        //                 ISTRIAL: row.col8,
        //                 ISAUTODROP: 'N',
        //                 JOTYPE: 'I',
        //                 MOLD_ID: mold_id,
        //                 BOM_ID: bomId,
        //                 ISCURRENT: 'N',
        //             };
        //         } catch (error) {
        //             request.log.error(`Error mapping row ${index + 1}: ${error.message}`);
        //             return null; // Abaikan data yang error
        //         }
        //     }));

        //     // Loop untuk setiap data yang telah dipetakan
        //     for (let data of mappedData) {
        //         const insertQuery = `
        //                     INSERT INTO adempiere.cust_joborder (
        //                         ad_client_id, ad_org_id, a_asset_id, created, createdby, 
        //                         cust_joborder_id, datedoc, description, docstatus, documentno,
        //                         startdate, enddate, isactive, isverified, m_product_id, print_joborder, 
        //                         updated, updatedby, qtyplanned, joaction, print_joborderlabel, 
        //                         a_asset_run_id, istrial, isautodrop, jotype, mold_id, bom_id, iscurrent
        //                     ) VALUES (
        //                         $1, $2, $3, $4::TIMESTAMP, $5, 
        //                         $6, $7::TIMESTAMP, $8, $9, $10,
        //                         $11::TIMESTAMP, $12::TIMESTAMP, 
        //                         $13, $14, $15, $16, 
        //                         $17::TIMESTAMP, $18, $19, $20, $21, 
        //                         $22, $23, $24, $25, $26, $27, $28
        //                     )
        //                 `;

        //         // Parameter binds untuk query
        //         const binds = [
        //             data.AD_CLIENT_ID,
        //             data.AD_ORG_ID,
        //             data.A_ASSET_ID,
        //             data.CREATED,
        //             data.CREATEDBY,
        //             data.CUST_JOBORDER_ID,
        //             data.DATEDOC,
        //             data.DESCRIPTION || null,
        //             data.DOCSTATUS,
        //             data.DOCUMENTNO,
        //             data.STARTDATE,
        //             data.ENDDATE,
        //             data.ISACTIVE,
        //             data.ISVERIFIED,
        //             data.M_PRODUCT_ID,
        //             data.PRINT_JOBORDER,
        //             data.UPDATED,
        //             data.UPDATEDBY,
        //             data.QTYPLANNED,
        //             data.JOACTION,
        //             data.PRINT_JOBORDERLABEL,
        //             data.A_ASSET_RUN_ID || null,
        //             data.ISTRIAL,
        //             data.ISAUTODROP,
        //             data.JOTYPE,
        //             data.MOLD_ID,
        //             data.BOM_ID,
        //             data.ISCURRENT
        //         ];

        //         await dbClient.query(insertQuery, binds);

        //         const bomComponent = data.BOM_ID ? await server.plan.getBOMComponent(server, parseInt(data.BOM_ID)) : [];

        //     }

        //     await dbClient.query('COMMIT');
        //     reply.send({ message: 'Data imported and inserted successfully!', data: mappedData });
        // } catch (error) {
        //     await dbClient.query('ROLLBACK'); // Jika error, batalkan transaksi
        //     request.log.error(error); // Gunakan request.log
        //     reply.status(500).send({ message: `Failed: ${error.message || error}` });
        // } finally {
        //     // Tutup koneksi
        //     if (dbClient) {
        //         try {
        //             await dbClient.release();
        //             console.log('Connection closed.');
        //         } catch (closeErr) {
        //             console.error('Error closing connection:', closeErr);
        //         }
        //     }
        // }
    })
}