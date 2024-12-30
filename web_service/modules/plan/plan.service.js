import oracleConnection from "../../configs/oracle.connection.js";


class PlanService {

    constructor(documentNo, assetId, userId, docStatus, dateDoc, startTime, completeTime, isActive, isVerified, productId, qty, isTrial) {
        this.planNo = documentNo;
        this.resourceCode = assetId;
        this.user = userId;
        this.status = docStatus;
        this.dateDoc = dateDoc;
        this.planStartTime = startTime;
        this.planCompleteTime = completeTime;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.partNo = productId;
        this.qty = qty;
        this.isTrial = isTrial;
    }

    static async getJobOrders() {
        let connection;
        try {
            connection = await oracleConnection.openConnection();

            const query = `
            SELECT 
                *
            FROM 
                CUST_JOBORDER
            WHERE 
                TRUNC(DATEDOC) = TRUNC(SYSDATE)
            `;

            const result = await connection.execute(query);

            if (result.rows && result.rows.length > 0) {
                const jobOrders = result.rows.map(row => new PlanService(
                    row[0], row[1], row[2], row[3], row[4], row[5], row[6],
                    row[7], row[8], row[9], row[10], row[11]
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

    static async custJobOrder() {
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

export default PlanService;