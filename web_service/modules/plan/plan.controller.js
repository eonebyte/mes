import { format } from 'date-fns';
import PlanningService from './plan.service.js';

class PlanController {

    static async importPlan(request, reply) {
        try {
            const importData = request.body;

            const formatDate = (dateString) => {
                const dateObj = new Date(dateString);
                if (isNaN(dateObj.getTime())) {
                    throw new Error(`Invalid date: ${dateString}`);
                }
                const isoString = dateObj.toISOString(); // Mendapatkan string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
                const datePart = isoString.split('T')[0]; // Mengambil bagian tanggal (YYYY-MM-DD)
                const timePart = isoString.split('T')[1].substring(0, 8); // Mengambil bagian waktu (HH:mm:ss)
                return `${datePart} ${timePart}`;
            };

            const formatDateDoc = (dateString) => {
                const dateObj = new Date(dateString);
                if (isNaN(dateObj.getTime())) {
                    throw new Error(`Invalid date: ${dateString}`);
                }
                const isoString = dateObj.toISOString(); // Mendapatkan string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
                const datePart = isoString.split('T')[0]; // Mengambil bagian tanggal (YYYY-MM-DD)
                return `${datePart}`;
            };

            const mappedData = await Promise.all(importData.map(async (row, index) => {
                const user = await PlanningService.createdBy(row.col2.trim());
                if (!user || !user.length > 0) {
                    throw new Error(`User ${row.col2.trim()} not found. Data import aborted.`);
                }
                const cust_joborder = await PlanningService.custJobOrder();
                const document = await PlanningService.documentNo();
                const product = await PlanningService.getProduct(row.col10.trim());
                const asset = await PlanningService.getAsset(String(row.col1).trim());


                const user_id = Number(user[0]);
                const base_document_no = Number(document[0]); // document no terakhir
                const base_cust_joborder = Number(cust_joborder[0]); // jo id terakhir
                const document_no = (base_document_no + 1 + index).toString();
                const cust_joborder_id = base_cust_joborder + 1 + index
                const product_id = Number(product[0]);
                const asset_id = Number(asset[0]);

                return {
                    AD_CLIENT_ID: 1000000,
                    AD_ORG_ID: 1000000,
                    A_ASSET_ID: asset_id, // cari pakai rcode
                    CREATED: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                    RCODE: String(row.col1).trim(),
                    CREATEDBY: user_id,
                    CUST_JOBORDER_ID: cust_joborder_id,
                    DESC: row.col3 ? row.col3.trim() : null,
                    DOCSTATUS: row.col4.trim(),
                    DOCUMENTNO: document_no,
                    DATEDOC: formatDateDoc(row.col5),
                    STARTDATE: formatDate(row.col6),
                    ENDDATE: formatDate(row.col7),
                    ISACTIVE: row.col8.trim(),
                    ISVERIFIED: row.col9.trim(),
                    M_PRODUCT_ID: product_id,
                    PRINT_JOBORDER: 'N',
                    UPDATED: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                    UPDATEDBY: user_id,
                    QTYPLANNED: row.col11,
                    JOACTION: row.col4.trim() == 'OP' ? 'SE' : 'CO',
                    PRINT_JOBORDERLABEL: 'N',
                    A_ASSET_RUN_ID: null,
                    ISTRIAL: row.col12,
                    ISAUTODROP: 'N',
                    JOTYPE: 'I',
                };
            }));

            console.log('Mapped data:', mappedData);

            reply.send({ message: 'Data imported successfully!', data: mappedData });
        } catch (error) {
            request.log.error(error); // Gunakan request.log
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }


    static async listPlans(request, reply) {
        try {
            const job_orders = await PlanningService.getJobOrders();
            console.log('job order : ', job_orders);

        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ message: `Failed: ${error.message || error}` });
        }
    }
}

export default PlanController;
