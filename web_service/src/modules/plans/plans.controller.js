import { format, parse } from 'date-fns';

class PlansController {

    static async importPlan(request, reply) {
        let dbClient;
        try {
            dbClient = await request.server.pg.connect();
            const importData = request.body;

            await dbClient.query('BEGIN');

            const mappedData = await Promise.all(importData.map(async (row, index) => {

                try {
                    // Pastikan semua nilai tidak undefined/null
                    if (!row.col1 || !row.col3 || !row.col4 || !row.col5 || !row.col6) {
                        throw new Error(`Data tidak valid pada baris ke-${index + 1}`);
                    }

                    const cust_joborder = await request.server.plansService.custJobOrderId(request.server);
                    const document = await request.server.plansService.documentNo(request.server);
                    const product = await request.server.plansService.getProduct(request.server, row.col6.trim());
                    const asset = await request.server.plansService.getAssetId(request.server, String(row.col1).trim());
                    const mold = await request.server.plansService.getMoldId(request.server, String(row.col9).trim());

                    const document_no = (Number(document) + 1 + index).toString();
                    const cust_joborder_id = Number(cust_joborder) + 1 + index;
                    const product_id = Number(product);
                    const asset_id = Number(asset);
                    const mold_id = Number(mold);

                    const formattedDateDoc = format(parse(row.col3, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') + ' 00:00:00';
                    const formattedStartDate = format(parse(row.col4, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');
                    const formattedEndDate = format(parse(row.col5, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');

                    return {
                        AD_CLIENT_ID: 1000000,
                        AD_ORG_ID: 1000000,
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
                        MOLD_ID: mold_id
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
                        ad_client_id, ad_org_id, a_asset_id, created, created_by, 
                        cust_joborder_id, datedoc, description, docstatus, documentno,
                        startdate, enddate, isactive, isverified, m_product_id, print_joborder, 
                        updated, updated_by, qtyplanned, joaction, print_joborderlabel, 
                        a_asset_run_id, istrial, isautodrop, jotype, mold_id
                    ) VALUES (
                        $1, $2, $3, $4::TIMESTAMP, $5, 
                        $6, $7::TIMESTAMP, $8, $9, $10,
                        $11::TIMESTAMP, $12::TIMESTAMP, 
                        $13, $14, $15, $16, 
                        $17::TIMESTAMP, $18, $19, $20, $21, 
                        $22, $23, $24, $25, $26
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
                    data.MOLD_ID
                ];

                await dbClient.query(insertQuery, binds);
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
    }


    static async getPlans(request, reply) {
        try {
            const job_orders = await request.server.plansService.findAll(request.server);
            console.log('job order : ', job_orders);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getPlansByResource(request, reply) {
        const { resourceId } = request.query;
        try {
            const job_orders = await request.server.plansService.findByResource(request.server, resourceId);
            console.log('job order : ', job_orders);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getActivePlan(request, reply) {
        const { resourceId } = request.query;
        try {
            const job_orders = await PlanningService.findActivePlan(resourceId);
            console.log('job order : ', job_orders);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getDetailPlan(request, reply) {
        const { planId, moldId } = request.query;
        try {
            let job_order;
            if (planId) {
                job_order = await request.server.plansService.findDetailPlan(request.server, planId);
            } else {
                job_order = await request.server.plansService.findDetailPlanWithMold(request.server, moldId);
            }
            const planData = job_order.length > 0 ? job_order[0] : null;
            reply.send({ message: 'fetch successfully', data: planData });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }
}

export default PlansController;
