import oracleConnection from "../../configs/oracle.connection.js";

class PlansService {

    constructor(no, planId, documentNo, assetId, resourceCode, userId, docStatus, dateDoc,
        startTime, completeTime, cycletime, cavity, isActive, isVerified,
        productId, partName, qty, isTrial, mold, moldName, description) {
        this.no = no;
        this.planId = planId;
        this.planNo = documentNo;
        this.resourceId = assetId;
        this.resourceCode = resourceCode;
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

    async findAll(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect(); // PostgreSQL pakai pool

            const query = `
            SELECT
                jo.cust_joborder_id,
                jo.documentno, 
                aa.a_asset_id,
                aa.value AS resource_code,
                au.name AS created_by,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                mp.cycletime,
                mp.cavity,
                jo.isactive, 
                jo.isverified,
                mp.value AS product_value,
                mp.name AS product_name,
                jo.qtyplanned, 
                jo.istrial, 
                mp2.value AS mold, 
                mp2.name AS moldname,
                jo.description
            FROM cust_joborder jo
            JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
            JOIN ad_user au ON jo.created_by = au.ad_user_id
            JOIN m_product mp ON jo.m_product_id = mp.m_product_id
            LEFT JOIN m_product mp2 ON jo.mold_id = mp2.m_product_id
            WHERE jo.datedoc >= DATE '2024-01-01' 
            AND jo.docstatus <> 'CL'
            ORDER BY jo.documentno DESC
        `;

            const result = await dbClient.query(query); // PostgreSQL pakai query()

            if (result.rows.length > 0) {
                return result.rows.map((row, index) => ({
                    no: index + 1,
                    planId: row.cust_joborder_id,
                    planNo: row.documentno,
                    resourceId: row.a_asset_id,
                    resourceCode: row.resource_code,
                    user: row.created_by,
                    status: row.docstatus,
                    dateDoc: row.datedoc,
                    planStartTime: row.startdate,
                    planCompleteTime: row.enddate,
                    cycletime: row.cycletime,
                    cavity: row.cavity,
                    isActive: row.isactive,
                    isVerified: row.isverified,
                    partNo: row.product_value,
                    partName: row.product_name,
                    qty: Math.floor(row.qtyplanned),
                    isTrial: row.istrial,
                    mold: row.mold,
                    moldName: row.moldname,
                    description: row.description
                }));
            }

            return [];
        } catch (error) {
            throw new Error(`Failed to fetch All Job Orders: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release(); // PostgreSQL pakai release() untuk pool
            }
        }
    }


    async findByResource(server, resourceId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect(); // PostgreSQL pakai pool.connect()

            const query = `
            SELECT
                jo.cust_joborder_id,
                jo.documentno, 
                aa.a_asset_id, 
                aa.value AS resource_code,
                au.name AS created_by,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                mp.cycletime,
                mp.cavity,
                jo.isactive, 
                jo.isverified,
                mp.value AS product_value,
                mp.name AS product_name,
                jo.qtyplanned, 
                jo.istrial, 
                mp2.value AS mold, 
                mp2.name AS moldname,
                mp2.m_product_id AS mold_id,
                jo.description
            FROM cust_joborder jo
            JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
            JOIN ad_user au ON jo.created_by = au.ad_user_id
            JOIN m_product mp ON jo.m_product_id = mp.m_product_id
            LEFT JOIN m_product mp2 ON jo.mold_id = mp2.m_product_id
            WHERE jo.datedoc >= DATE '2024-01-01' 
            AND jo.docstatus <> 'CL'
            AND jo.a_asset_id = $1
            ORDER BY jo.documentno DESC
        `;

            const result = await dbClient.query(query, [resourceId]); // PostgreSQL pakai query() dengan binding parameter

            if (result.rows.length > 0) {
                return result.rows.map((row, index) => ({
                    no: index + 1,
                    planId: row.cust_joborder_id,
                    planNo: row.documentno,
                    resourceId: row.a_asset_id,
                    resourceCode: row.resource_code,
                    user: row.created_by,
                    status: row.docstatus,
                    dateDoc: row.datedoc,
                    planStartTime: row.startdate,
                    planCompleteTime: row.enddate,
                    cycletime: row.cycletime,
                    cavity: row.cavity,
                    isActive: row.isactive,
                    isVerified: row.isverified,
                    partNo: row.product_value,
                    partName: row.product_name,
                    qty: Math.floor(row.qtyplanned),
                    isTrial: row.istrial,
                    mold: row.mold,
                    moldName: row.moldname,
                    mold_id: row.mold_id,
                    description: row.description
                }));
            }

            return [];
        } catch (error) {
            throw new Error(`Failed to fetch Job Orders by Resource: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release(); // PostgreSQL pakai release() untuk pool
            }
        }
    }



    async findActivePlan(resourceId) {
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
                await dbClient.release();
            }
        }
    }

    async findDetailPlan(server, planId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT
                    jo.cust_joborder_id,
                    jo.documentno, 
                    aa.a_asset_id, 
                    au.name AS created_by,
                    jo.docstatus,
                    TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                    TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                    TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                    mp.cycletime,
                    mp.cavity,
                    jo.isactive, 
                    jo.isverified,
                    mp.value AS product_value,
                    mp.name AS product_name,
                    CAST(jo.qtyplanned AS INTEGER) AS qtyplanned, -- Menghilangkan desimal
                    jo.istrial, 
                    mp2.value AS mold, 
                    mp2.name AS moldname,
                    jo.description
                FROM cust_joborder jo
                JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
                JOIN ad_user au ON jo.created_by = au.ad_user_id
                JOIN m_product mp ON jo.m_product_id = mp.m_product_id
                LEFT JOIN m_product mp2 ON jo.mold_id = mp2.m_product_id
                WHERE
                    jo.datedoc >= TO_DATE('2024-01-01', 'YYYY-MM-DD')
                    AND jo.docstatus <> 'CL'
                    AND jo.cust_joborder_id = $1 -- Sesuai dengan PostgreSQL, pakai parameterized query
                ORDER BY
                    jo.documentno DESC
        `;

            const result = await dbClient.query(query, [planId]);

            if (result.rows.length === 0) {
                return null;
            }

            // Ambil data station untuk setiap resourceId
            const jobOrders = await Promise.all(result.rows.map(async (row, index) => {
                const station = await this.getStation(server, parseInt(row.a_asset_id));

                return {
                    no: index + 1,
                    planId: row.cust_joborder_id,
                    planNo: row.documentno,
                    resourceId: row.a_asset_id,
                    createdBy: row.created_by,
                    status: row.docstatus,
                    dateDoc: row.datedoc,
                    planStartTime: row.startdate,
                    planCompleteTime: row.enddate,
                    cycletime: row.cycletime,
                    cavity: row.cavity,
                    isActive: row.isactive,
                    isVerified: row.isverified,
                    partNo: row.product_value,
                    partName: row.product_name,
                    qty: row.qtyplanned,
                    isTrial: row.istrial,
                    mold: row.mold,
                    moldName: row.moldname,
                    description: row.description,
                    lineno: station?.lineno || null,
                    mcno: station?.value || null,
                };
            }));

            return jobOrders;
        } catch (error) {
            throw new Error(`Failed to fetch Job Order Details: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    async getStation(server, a_asset_id) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const queryGetStation = `
                SELECT 
                    lineno,
                    value 
                FROM a_asset 
                WHERE a_asset_id = $1
            `;

            const result = await dbClient.query(queryGetStation, [a_asset_id]);

            if (result.rows.length > 0) {

                return result.rows[0];
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch asset id: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }




    async createdBy(server, username) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                    SELECT AD_USER_ID FROM AD_USER WHERE NAME = :username
                `;

            const result = await dbClient.query(query, [username]);

            if (result.rows && result.rows.length > 0) {
                return result.rows[0]; // Mengembalikan hasil pertama
            }


            // Jika tidak ada user ditemukan, return null atau sesuai keinginan
            return null;
        } catch (error) {
            throw new Error(`Failed to fetch create By: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    async documentNo(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT documentno FROM cust_joborder ORDER BY cust_joborder_id DESC LIMIT 1;
                `;
            const result = await dbClient.query(query);

            if (result.rows.length > 0) {
                return result.rows[0].documentno;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch document no: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    async custJobOrderId(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT cust_joborder_id FROM cust_joborder ORDER BY cust_joborder_id DESC LIMIT 1;
            `;
            const result = await dbClient.query(query);

            if (result.rows.length > 0) {
                return result.rows[0].cust_joborder_id;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch customer job order id: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    async getProduct(server, partno) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT m_product_id FROM m_product WHERE value = $1
            `;
            const result = await dbClient.query(query, [partno]);

            if (result.rows.length > 0) {

                return result.rows[0].m_product_id;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch product id: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    async getAssetId(server, machineno) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
            SELECT a_asset_id FROM a_asset WHERE value = $1
            `;
            const result = await dbClient.query(query, [machineno]);

            if (result.rows.length > 0) {

                return result.rows[0].a_asset_id;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch asset id: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    async getMoldId(server, moldno) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT m_product_id FROM m_product
                WHERE value = $1 AND m_product_category_id = 1000025
            `;
            const result = await dbClient.query(query, [moldno]);

            if (result.rows.length > 0) {

                return result.rows[0].m_product_id;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch asset id: ${error.message}`);
        } finally {
            if (dbClient) {
                await dbClient.release();
            }
        }
    }

    
}

export default PlansService;