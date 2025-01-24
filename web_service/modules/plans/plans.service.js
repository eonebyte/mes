import oracleConnection from "../../configs/oracle.connection.js";

class PlansService {

    constructor(no, planId, documentNo, assetId, userId, docStatus, dateDoc,
        startTime, completeTime, cycletime, cavity, isActive, isVerified,
        productId, partName, qty, isTrial, mold, moldName, description) {
        this.no = no;
        this.planId = planId;
        this.planNo = documentNo;
        this.resourceId = assetId;
        this.user = userId;
        this.status = docStatus;
        this.dateDoc = dateDoc;
        this.planStartTime = startTime;
        this.planCompleteTime = completeTime;
        this.cycletime = cycletime;
        this.cavity = cavity;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.partNo = productId;
        this.partName = partName;
        this.qty = qty;
        this.isTrial = isTrial;
        this.mold = mold;
        this.moldName = moldName;
        this.description = description;
    }

    static async findAll() {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT
                jo.CUST_JOBORDER_ID,
                jo.DOCUMENTNO, 
                aa.A_ASSET_ID, 
                au.NAME,
                jo.DOCSTATUS,
                TO_CHAR(jo.DATEDOC, 'DD-MM-YYYY HH24:MI:SS') AS DATEDOC,
                TO_CHAR(jo.STARTDATE, 'DD-MM-YYYY HH24:MI:SS') AS STARTDATE,
                TO_CHAR(jo.ENDDATE, 'DD-MM-YYYY HH24:MI:SS') AS ENDDATE,
                mp.CYCLETIME,
                mp.CAVITY,
                jo.ISACTIVE, 
                jo.ISVERIFIED,
                mp.VALUE,
                mp.NAME,
                jo.QTYPLANNED, 
                jo.ISTRIAL, 
                mp2.VALUE MOLD, 
                mp2.NAME MOLDNAME,
                jo.DESCRIPTION
            FROM
                CUST_JOBORDER jo
            JOIN 
                A_ASSET aa ON jo.A_ASSET_ID = aa.A_ASSET_ID
            JOIN 
                AD_USER au ON jo.CREATEDBY = au.AD_USER_ID
            JOIN 
                M_PRODUCT mp ON jo.M_PRODUCT_ID = mp.M_PRODUCT_ID
            LEFT JOIN 
                CUST_PRODUCT_MOLD cpm ON jo.M_PRODUCT_ID = cpm.CUST_PRODUCT_MOLD_ID
            LEFT JOIN 
                M_PRODUCT mp2 ON cpm.M_PRODUCT_ID = mp2.M_PRODUCT_ID
            WHERE
                TRUNC(DATEDOC) >= TRUNC(SYSDATE) - 3
                AND jo.DOCSTATUS <> 'CL'
            ORDER BY
                jo.DOCUMENTNO DESC
            `;

            const result = await connection.execute(query);

            if (result.rows.length > 0) {
                const jobOrders = result.rows.map((row, index) => new PlansService(
                    index + 1, row[0], row[1], row[2], row[3], row[4], row[5], row[6],
                    row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18]
                ));

                return jobOrders;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch All Job Orders: ${error}`)
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async findByResource(resourceId) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT
                jo.CUST_JOBORDER_ID,
                jo.DOCUMENTNO, 
                aa.A_ASSET_ID, 
                au.NAME,
                jo.DOCSTATUS,
                TO_CHAR(jo.DATEDOC, 'DD-MM-YYYY HH24:MI:SS') AS DATEDOC,
                TO_CHAR(jo.STARTDATE, 'DD-MM-YYYY HH24:MI:SS') AS STARTDATE,
                TO_CHAR(jo.ENDDATE, 'DD-MM-YYYY HH24:MI:SS') AS ENDDATE,
                mp.CYCLETIME,
                mp.CAVITY,
                jo.ISACTIVE, 
                jo.ISVERIFIED,
                mp.VALUE,
                mp.NAME,
                jo.QTYPLANNED, 
                jo.ISTRIAL, 
                mp2.VALUE MOLD, 
                mp2.NAME MOLDNAME,
                jo.DESCRIPTION
            FROM
                CUST_JOBORDER jo
            JOIN 
                A_ASSET aa ON jo.A_ASSET_ID = aa.A_ASSET_ID
            JOIN 
                AD_USER au ON jo.CREATEDBY = au.AD_USER_ID
            JOIN 
                M_PRODUCT mp ON jo.M_PRODUCT_ID = mp.M_PRODUCT_ID
            LEFT JOIN 
                CUST_PRODUCT_MOLD cpm ON jo.M_PRODUCT_ID = cpm.CUST_PRODUCT_MOLD_ID
            LEFT JOIN 
                M_PRODUCT mp2 ON cpm.M_PRODUCT_ID = mp2.M_PRODUCT_ID
            WHERE
                DATEDOC >= TO_DATE('2025-01-01', 'YYYY-MM-DD')
                AND jo.DOCSTATUS <> 'CL'
                AND jo.A_ASSET_ID = :resourceId
            ORDER BY
                jo.DOCUMENTNO DESC
            `;

            const result = await connection.execute(query, [resourceId]);

            if (result.rows.length > 0) {
                const jobOrders = result.rows.map((row, index) => new PlansService(
                    index + 1, row[0], row[1], row[2], row[3], row[4], row[5], row[6],
                    row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18]
                ));

                return jobOrders;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch All Job Orders: ${error}`)
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async findActivePlan(resourceId) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT
                jo.CUST_JOBORDER_ID,
                jo.DOCUMENTNO, 
                aa.A_ASSET_ID, 
                au.NAME,
                jo.DOCSTATUS,
                TO_CHAR(jo.DATEDOC, 'DD-MM-YYYY HH24:MI:SS') AS DATEDOC,
                TO_CHAR(jo.STARTDATE, 'DD-MM-YYYY HH24:MI:SS') AS STARTDATE,
                TO_CHAR(jo.ENDDATE, 'DD-MM-YYYY HH24:MI:SS') AS ENDDATE,
                mp.CYCLETIME,
                mp.CAVITY,
                jo.ISACTIVE, 
                jo.ISVERIFIED,
                mp.VALUE,
                mp.NAME,
                jo.QTYPLANNED, 
                jo.ISTRIAL, 
                mp2.VALUE MOLD, 
                mp2.NAME MOLDNAME,
                jo.DESCRIPTION
            FROM
                CUST_JOBORDER jo
            JOIN 
                A_ASSET aa ON jo.A_ASSET_ID = aa.A_ASSET_ID
            JOIN 
                AD_USER au ON jo.CREATEDBY = au.AD_USER_ID
            JOIN 
                M_PRODUCT mp ON jo.M_PRODUCT_ID = mp.M_PRODUCT_ID
            LEFT JOIN 
                CUST_PRODUCT_MOLD cpm ON jo.M_PRODUCT_ID = cpm.CUST_PRODUCT_MOLD_ID
            LEFT JOIN 
                M_PRODUCT mp2 ON cpm.M_PRODUCT_ID = mp2.M_PRODUCT_ID
            WHERE
                DATEDOC >= TO_DATE('2025-01-01', 'YYYY-MM-DD')
                AND jo.DOCSTATUS <> 'CL'
                AND jo.DOCSTATUS = 'RU'
                AND jo.A_ASSET_ID = :resourceId
            ORDER BY
                jo.DOCUMENTNO DESC
            `;

            const result = await connection.execute(query, [resourceId]);

            if (result.rows.length > 0) {
                const jobOrders = result.rows.map((row, index) => new PlansService(
                    index + 1, row[0], row[1], row[2], row[3], row[4], row[5], row[6],
                    row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18]
                ));

                return jobOrders;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch All Job Orders: ${error}`)
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    

    static async createdBy(username) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
                    SELECT AD_USER_ID FROM AD_USER WHERE NAME = :username
                `;

            const result = await connection.execute(query, [username]);

            if (result.rows && result.rows.length > 0) {
                return result.rows[0]; // Mengembalikan hasil pertama
            }


            // Jika tidak ada user ditemukan, return null atau sesuai keinginan
            return null;
        } catch (error) {
            throw new Error(`Failed to fetch create By: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async documentNo() {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT 
                DOCUMENTNO
            FROM 
                CUST_JOBORDER
            WHERE 
                CUST_JOBORDER_ID = (
                SELECT MAX(CUST_JOBORDER_ID) FROM CUST_JOBORDER
            )
            `;
            const result = await connection.execute(query);

            if (result.rows && result.rows.length > 0) {

                return result.rows[0];
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch document no: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async custJobOrderId() {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT 
                CUST_JOBORDER_ID
            FROM 
                CUST_JOBORDER
            WHERE 
                CUST_JOBORDER_ID = (
                SELECT MAX(CUST_JOBORDER_ID) FROM CUST_JOBORDER
            )
            `;
            const result = await connection.execute(query);

            if (result.rows && result.rows.length > 0) {

                return result.rows[0];
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch customer job order id: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getProduct(partno) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT M_PRODUCT_ID FROM M_PRODUCT WHERE VALUE = :partno
            `;
            const result = await connection.execute(query, [partno]);

            if (result.rows && result.rows.length > 0) {

                return result.rows[0];
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch product id: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getAsset(machineno) {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT A_ASSET_ID FROM A_ASSET WHERE VALUE = :machineno
            `;
            const result = await connection.execute(query, [machineno]);

            if (result.rows && result.rows.length > 0) {

                return result.rows[0];
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch asset id: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

export default PlansService;