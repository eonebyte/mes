import { format, parse } from 'date-fns';
import PlanningService from './plans.service.js';
import oracleConnection from "../../configs/oracle.connection.js";


class PlansController {

    static async importPlan(request, reply) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();
            const importData = request.body;

            const mappedData = await Promise.all(importData.map(async (row, index) => {
                const cust_joborder = await PlanningService.custJobOrderId();
                const document = await PlanningService.documentNo();
                const product = await PlanningService.getProduct(row.col6.trim());
                const asset = await PlanningService.getAsset(String(row.col1).trim());

                const base_document_no = Number(document[0]); // document no terakhir
                const base_cust_joborder = Number(cust_joborder[0]); // jo id terakhir
                const document_no = (base_document_no + 1 + index).toString();
                const cust_joborder_id = base_cust_joborder + 1 + index
                const product_id = Number(product[0]);
                const asset_id = Number(asset[0]);

                const formattedDateDoc = format(
                    parse(row.col3, 'dd/MM/yyyy', new Date()),
                    'yyyy-MM-dd'
                ) + ' 00:00:00';

                const formattedStartDate = format(parse(row.col4, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');
                const formattedEndDate = format(parse(row.col5, 'dd/MM/yyyy HH:mm:ss', new Date()), 'yyyy-MM-dd HH:mm:ss');

                return {
                    AD_CLIENT_ID: 1000000,
                    AD_ORG_ID: 1000000,
                    A_ASSET_ID: asset_id, // cari pakai rcode
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
                };
            }));

            // Loop untuk setiap data yang telah dipetakan
            for (let data of mappedData) {
                const insertQuery = `
            INSERT INTO PLASTIK.CUST_JOBORDER (
                AD_CLIENT_ID, AD_ORG_ID, A_ASSET_ID, CREATED, CREATEDBY, 
                CUST_JOBORDER_ID, DATEDOC, DESCRIPTION, DOCSTATUS, DOCUMENTNO,
                STARTDATE, ENDDATE, ISACTIVE, ISVERIFIED, M_PRODUCT_ID, PRINT_JOBORDER, 
                UPDATED, UPDATEDBY, QTYPLANNED, JOACTION, PRINT_JOBORDERLABEL, 
                A_ASSET_RUN_ID, ISTRIAL, ISAUTODROP, JOTYPE
            ) VALUES (
                :AD_CLIENT_ID, :AD_ORG_ID, :A_ASSET_ID, TO_DATE(:CREATED, 'YYYY-MM-DD HH24:MI:SS'), :CREATEDBY,
                :CUST_JOBORDER_ID, TO_DATE(:DATEDOC, 'YYYY-MM-DD HH24:MI:SS'), :DESCRIPTION, :DOCSTATUS, :DOCUMENTNO,
                TO_DATE(:STARTDATE, 'YYYY-MM-DD HH24:MI:SS'), TO_DATE(:ENDDATE, 'YYYY-MM-DD HH24:MI:SS'), 
                :ISACTIVE, :ISVERIFIED, :M_PRODUCT_ID, :PRINT_JOBORDER,
                TO_DATE(:UPDATED, 'YYYY-MM-DD HH24:MI:SS'), :UPDATEDBY, :QTYPLANNED, :JOACTION, :PRINT_JOBORDERLABEL, 
                :A_ASSET_RUN_ID, :ISTRIAL, :ISAUTODROP, :JOTYPE
            )
            `;

                // Parameter binds untuk query
                const binds = {
                    AD_CLIENT_ID: data.AD_CLIENT_ID,
                    AD_ORG_ID: data.AD_ORG_ID,
                    A_ASSET_ID: data.A_ASSET_ID,
                    CREATED: data.CREATED,
                    CREATEDBY: data.CREATEDBY, // Pastikan menggunakan CREATEDBY
                    CUST_JOBORDER_ID: data.CUST_JOBORDER_ID,
                    DATEDOC: data.DATEDOC,
                    DESCRIPTION: data.DESCRIPTION || null,
                    DOCSTATUS: data.DOCSTATUS,
                    DOCUMENTNO: data.DOCUMENTNO,
                    STARTDATE: data.STARTDATE,
                    ENDDATE: data.ENDDATE,
                    ISACTIVE: data.ISACTIVE,
                    ISVERIFIED: data.ISVERIFIED,
                    M_PRODUCT_ID: data.M_PRODUCT_ID,
                    PRINT_JOBORDER: data.PRINT_JOBORDER,
                    UPDATED: data.UPDATED,
                    UPDATEDBY: data.UPDATEDBY,
                    QTYPLANNED: data.QTYPLANNED,
                    JOACTION: data.JOACTION,
                    PRINT_JOBORDERLABEL: data.PRINT_JOBORDERLABEL,
                    A_ASSET_RUN_ID: data.A_ASSET_RUN_ID,
                    ISTRIAL: data.ISTRIAL,
                    ISAUTODROP: data.ISAUTODROP,
                    JOTYPE: data.JOTYPE,
                };

                await connection.execute(insertQuery, binds);
            }
            await connection.commit();

            reply.send({ message: 'Data imported and inserted successfully!', data: mappedData });
        } catch (error) {
            request.log.error(error); // Gunakan request.log
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        } finally {
            // Tutup koneksi
            if (connection) {
                try {
                    await connection.close();
                    console.log('Connection closed.');
                } catch (closeErr) {
                    console.error('Error closing connection:', closeErr);
                }
            }
        }
    }


    static async getPlans(request, reply) {
        try {
            const job_orders = await PlanningService.findAll();
            console.log('job order : ', job_orders);
            reply.send({ message: 'fetch successfully', data: job_orders });
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }

    static async getPlan(request, reply) {
        const { resourceId } = request.query;
        try {
            const job_orders = await PlanningService.findByResource(resourceId);
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
}

export default PlansController;
