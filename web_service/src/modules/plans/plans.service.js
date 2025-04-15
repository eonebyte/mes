import { format, parse } from 'date-fns';

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
                au.ad_user_id AS user_id,
                au.name AS created_by,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                mp.cycletime,
                mp.cavity,
                jo.isactive, 
                jo.isverified,
                mp.m_product_id AS product_id,
                mp.value AS product_value,
                mp.name AS product_name,
                jo.qtyplanned, 
                jo.istrial,
                mp2.m_product_id AS moldid, 
                mp2.value AS mold, 
                mp2.name AS moldname,
                jo.description,
                jo.bom_id,
                mpb.name AS BOM
            FROM cust_joborder jo
            JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
            JOIN ad_user au ON jo.created_by = au.ad_user_id
            JOIN m_product mp ON jo.m_product_id = mp.m_product_id
            LEFT JOIN pp_product_bom mpb ON jo.bom_id = mpb.pp_product_bom_id
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
                    resourceId: parseInt(row.a_asset_id),
                    resourceCode: row.resource_code,
                    userId: row.user_id,
                    user: row.created_by,
                    status: row.docstatus,
                    dateDoc: row.datedoc,
                    planStartTime: row.startdate,
                    planCompleteTime: row.enddate,
                    cycletime: Math.floor(row.cycletime),
                    cavity: row.cavity,
                    isActive: row.isactive,
                    isVerified: row.isverified,
                    partId: parseInt(row.product_id),
                    partNo: row.product_value,
                    partName: row.product_name,
                    qty: Math.floor(row.qtyplanned),
                    isTrial: row.istrial,
                    moldId: parseInt(row.moldid),
                    mold: row.mold,
                    moldName: row.moldname,
                    description: row.description,
                    bomId: parseInt(row.bom_id),
                    bomName: row.bom,
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

    async findInjectionProducts(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            // 1000017 = FG Injection
            const query = `
                SELECT
                    mp.m_product_id,
                    mp.value AS partNo,
                    mp."name" AS partName
                FROM
                    m_product mp
                WHERE
                    mp.m_product_category_id = 1000017
            `;

            const result = await dbClient.query(query);

            if (result.rows.length > 0) {
                return result.rows;
            }

            return [];
        } catch (error) {
            throw new Error(`Failed to fetch Injection Products: ${error}`);
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
            AND jo.iscurrent <> 'Y'
            AND jo.a_asset_id = $1
            ORDER BY jo.documentno DESC
        `;

            const result = await dbClient.query(query, [resourceId]); // PostgreSQL pakai query() dengan binding parameter

            const jobOrders = result.rows.map((row, index) => ({
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
                cycletime: Math.floor(row.cycletime),
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

            // Mengelompokkan berdasarkan mold_id
            const groupedPlans = jobOrders.reduce((acc, job) => {
                const key = job.mold_id;
                const mold_name = job.moldName;
                if (!acc[key]) {
                    acc[key] = {
                        moldId: key,
                        mold_name: mold_name || 'undefined',
                        data: []
                    };
                }
                acc[key].data.push(job);
                return acc;
            }, {});

            const singleTaskPlans = [];
            const multipleTaskPlans = [];

            Object.values(groupedPlans).forEach((group) => {
                if (group.data.length > 1) {
                    multipleTaskPlans.push(group);
                } else {
                    singleTaskPlans.push(...group.data);
                }
            });

            return {
                singleTaskPlans,
                multipleTaskPlans
            };
        } catch (error) {
            throw new Error(`Failed to fetch Job Orders by Resource: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release(); // PostgreSQL pakai release() untuk pool
            }
        }
    }

    async findActivePlan(server, resourceId) {
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
                CAST(jo.qtyplanned AS INTEGER) AS qtyplanned,
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
                jo.datedoc >= TO_DATE('2025-01-01', 'YYYY-MM-DD')
                AND jo.iscurrent = 'Y'
                AND jo.docstatus NOT IN ('DR', 'CL')
                AND jo.a_asset_id = $1
            ORDER BY
                jo.documentno DESC
        `;

            const result = await dbClient.query(query, [resourceId]);

            if (result.rows.length === 0) {
                return null;
            }

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
                    resourceStatus: station?.status || null
                }
            }));

            return jobOrders;
        } catch (error) {
            throw new Error(`Failed to fetch active job orders: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    async getBOMComponent(server, bomId) {
        const dbClient = await server.pg.connect();
        try {
            const query = `
            SELECT
                p.m_product_id,
                p.value AS part_no,
                p.name AS part_name,
                b.qtybatch,
                b.qtybom,
                b.isactive,
                u.uomsymbol,
                mpc.value AS category
            FROM pp_product_bomline b
            JOIN c_uom u ON b.c_uom_id = u.c_uom_id
            JOIN m_product p ON b.m_product_id = p.m_product_id
            JOIN m_product_category mpc ON p.m_product_category_id = mpc.m_product_category_id
            WHERE 
                b.pp_product_bom_id = $1
                AND p.m_product_category_id IN (1000010, 1000011, 1000012, 1000013)
            ORDER BY b.line
        `;
            const result = await dbClient.query(query, [bomId]);
            return result.rows.map((row, index) => ({
                no: index + 1,
                partId: parseInt(row.m_product_id),
                partNo: row.part_no,
                partName: row.part_name,
                qtyBatch: parseFloat(row.qtybatch),
                qtyBOM: parseFloat(row.qtybom),
                isActive: row.isactive,
                uomsymbol: row.uomsymbol,
                category: row.category
            }));
        } catch (error) {
            throw new Error(`Failed to fetch BOM Component: ${error}`);
        } finally {
            dbClient.release();
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
                    jo.description,
                    jo.bom_id,
                    mpb.name AS BOM
                FROM cust_joborder jo
                JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
                JOIN ad_user au ON jo.created_by = au.ad_user_id
                JOIN m_product mp ON jo.m_product_id = mp.m_product_id
                LEFT JOIN pp_product_bom mpb ON jo.bom_id = mpb.pp_product_bom_id
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
                const bomComponent = row.bom_id ? await this.getBOMComponent(server, parseInt(row.bom_id)) : [];


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
                    bomId: parseInt(row.bom_id),
                    bom: row.bom,
                    resourceStatus: station?.status || null,
                    bomComponent
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

    async findDetailPlanWithMold(server, moldId) {
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
                    jo.description,
                    jo.mold_id AS mold_id
                FROM cust_joborder jo
                JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
                JOIN ad_user au ON jo.created_by = au.ad_user_id
                JOIN m_product mp ON jo.m_product_id = mp.m_product_id
                LEFT JOIN m_product mp2 ON jo.mold_id = mp2.m_product_id
                WHERE
                    jo.datedoc >= TO_DATE('2024-01-01', 'YYYY-MM-DD')
                    AND jo.docstatus <> 'CL'
                    AND mp2.m_product_id = $1
                ORDER BY
                    jo.documentno DESC
        `;

            const result = await dbClient.query(query, [moldId]);

            if (result.rows.length === 0) {
                return null;
            }

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
                    mold_id: row.mold_id
                };
            }));

            const groupedPlans = jobOrders.reduce((acc, job) => {
                const key = job.mold_id;
                const mold_name = job.moldName;
                const jo_status = job.status;
                const lineno = job.lineno;
                const mcno = job.mcno;
                if (!acc[key]) {
                    acc[key] = {
                        moldId: key,
                        mold_name: mold_name || 'undefined',
                        jo_status: jo_status,
                        lineno: lineno,
                        mcno: mcno,
                        data: []
                    };
                }
                acc[key].data.push(job);
                return acc;
            }, {});

            const multipleTaskPlans = [];

            Object.values(groupedPlans).forEach((group) => {
                if (group.data.length > 1) {
                    multipleTaskPlans.push(group);
                }
            });

            return multipleTaskPlans;
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
                    value,
                    status 
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

    async updateJOStatusComplete(server, planId, confirmStatus) {
        let dbClient;
        const errors = [];

        // Peta status ke docstatus
        const statusMap = {
            OK: 'IP', //CO = complete
        };


        const docstatus = statusMap[confirmStatus];

        if (!docstatus) {
            return {
                success: false,
                message: 'Invalid confirm status provided.',
            };
        }

        try {
            dbClient = await server.pg.connect();

            // ✅ Ambil bom_id, mold_id (plan), resource_id (a_asset_id)
            const joResult = await dbClient.query(`
            SELECT bom_id, mold_id AS mold_plan_id, a_asset_id AS resource_id 
            FROM cust_joborder 
            WHERE cust_joborder_id = $1
        `, [planId]);

            const joRow = joResult.rows[0];

            if (!joRow) {
                return {
                    success: false,
                    message: 'Job order not found.',
                };
            }

            const bomId = joRow.bom_id;
            const moldPlan = joRow.mold_plan_id;

            if (!bomId || bomId < 1) {
                errors.push('BOM is missing.');
            }

            // ✅ Cek mold mismatch
            if (!moldPlan) {
                errors.push('Mold in job order is missing.');
            }

            // ✅ Kalau ada error, langsung kembalikan semua error
            if (errors.length > 0) {
                return {
                    success: false,
                    message: 'Validation failed.',
                    errors: errors, // semua error dikembalikan di sini
                };
            }

            // ✅ Semua valid → update status
            await dbClient.query(`
                UPDATE cust_joborder 
                SET docstatus = $1  
                WHERE cust_joborder_id = $2
            `, [docstatus, planId]);

            return {
                success: true,
                message: `Job order status updated to '${docstatus}' successfully.`,
            };

        } catch (error) {
            console.error('Error updating job order status:', error);
            return {
                success: false,
                message: 'Failed to update job order status.',
                error,
            };
        } finally {
            if (dbClient) dbClient.release();
        }
    }

    async updateJOActiveOnMachine(server, planId, resourceId, confirmStatus) {
        let dbClient;

        // Peta status ke docstatus
        const statusMap = {
            START: 'RUNNING',
            STOP: 'STANDBY',
            SETUP_MOLD: 'SM',
            TEARDOWN_MOLD: 'TM',
            SETTINGS: 'STG',
            // dst...
        };


        const status = statusMap[confirmStatus?.trim()];

        if (!status) {
            return {
                success: false,
                messages: ['Invalid confirm status provided.'],
            };
        }

        try {
            dbClient = await server.pg.connect();
            await dbClient.query('BEGIN');

            const errors = [];

            // Ambil mold_id dari cust_joborder
            const joResult = await dbClient.query(`
                SELECT mold_id 
                FROM cust_joborder 
                WHERE cust_joborder_id = $1
            `, [planId]);
            const moldPlan = parseInt(joResult.rows[0]?.mold_id);

            // Ambil mold_id dari a_asset
            const assetResult = await dbClient.query(`
                SELECT mold_id 
                FROM a_asset 
                WHERE a_asset_id = $1
            `, [resourceId]);
            const moldResource = parseInt(assetResult.rows[0]?.mold_id);

            // Validasi mold
            if (!moldPlan) {
                errors.push('Mold pada job order belum diatur');
            }
            if (!moldResource) {
                errors.push('Mold pada mesin belum diatur');
            }
            if (moldPlan && moldResource && moldPlan !== moldResource) {
                errors.push('Mold job order tidak sesuai dengan mold pada mesin');
            }

            console.log('DEBUG:', {
                moldPlan,
                moldResource,
                typeofMoldPlan: typeof moldPlan,
                typeofMoldResource: typeof moldResource,
            });


            if (errors.length > 0) {
                await dbClient.query('ROLLBACK');
                return {
                    success: false,
                    messages: errors,
                };
            }

            const queryUpdateStatusAsset = `
                UPDATE a_asset 
                SET status = $1  
                WHERE a_asset_id = $2
            `;

            const rowRueryUpdateStatusAsset = await dbClient.query(queryUpdateStatusAsset, [status, resourceId]);

            if (rowRueryUpdateStatusAsset.rowCount === 0) {
                await dbClient.query('ROLLBACK');
                return {
                    success: false,
                    messages: ['Mesin tidak ditemukan berdasarkan ID.'],
                };
            }

            const queryUpdateStatusJO = `
                UPDATE cust_joborder
                SET iscurrent = 'Y' 
                WHERE cust_joborder_id = $1 AND a_asset_id = $2
            `;

            const rowQueryUpdateStatusJO = await dbClient.query(queryUpdateStatusJO, [planId, resourceId]);

            if (rowQueryUpdateStatusJO.rowCount === 0) {
                await dbClient.query('ROLLBACK');
                return {
                    success: false,
                    messages: ['Job order tidak ditemukan untuk mesin tersebut.'],
                };
            }

            await dbClient.query('COMMIT');

            return {
                success: true,
                messages: [`Job order status updated to '${status}' successfully.`],
            };

        } catch (error) {
            console.error('Error updating job order status:', error);
            return {
                success: false,
                messages: ['Terjadi kesalahan saat mengubah status job order.'],
                error,
            };
        } finally {
            if (dbClient) dbClient.release();
        }
    }


    async findBoms(server, planId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
            SELECT
                ppb.pp_product_bom_id,
                ppb."name"
            FROM
                cust_joborder jo
            JOIN
                pp_product_bom ppb ON jo.m_product_id = ppb.m_product_id
            WHERE
                cust_joborder_id = $1
        `;

            const result = await dbClient.query(query, [planId]);

            // Konversi id jadi integer/number
            const parsedRows = result.rows.map(row => ({
                pp_product_bom_id: parseInt(row.pp_product_bom_id, 10),
                name: row.name
            }));

            return parsedRows;
        } catch (error) {
            console.error('Error finding BOMs:', error);
            throw error;
        } finally {
            if (dbClient) dbClient.release();
        }
    }


    async updatePlan(server, planId, payload) {
        let dbClient;

        try {
            dbClient = await server.pg.connect(); // asumsi pakai fastify-postgres plugin

            const {
                resourceId,
                moldId,
                partId,
                qty,
                description,
                dateDoc,
                planStartTime,
                planCompleteTime,
                isTrial,
                userId // pastikan ini ikut dikirim dari frontend
            } = payload;

            console.log('Payload diterima:', payload); // 👈 Log semua data masuk

            let formattedDateDoc = null;
            let formattedStartDate = null;
            let formattedEndDate = null;

            // 🔍 Safe Parse + Log Error
            if (dateDoc) {
                try {
                    const parsed = parse(dateDoc, 'dd-MM-yyyy HH:mm:ss', new Date());
                    formattedDateDoc = format(parsed, 'yyyy-MM-dd') + ' 00:00:00';
                } catch (err) {
                    console.error('Format dateDoc invalid:', dateDoc, err.message);
                }
            }

            if (planStartTime) {
                try {
                    const parsed = parse(planStartTime, 'dd-MM-yyyy HH:mm:ss', new Date());
                    formattedStartDate = format(parsed, 'yyyy-MM-dd HH:mm:ss');
                } catch (err) {
                    console.error('Format planStartTime invalid:', planStartTime, err.message);
                }
            }

            if (planCompleteTime) {
                try {
                    const parsed = parse(planCompleteTime, 'dd-MM-yyyy HH:mm:ss', new Date());
                    formattedEndDate = format(parsed, 'yyyy-MM-dd HH:mm:ss');
                } catch (err) {
                    console.error('Format planCompleteTime invalid:', planCompleteTime, err.message);
                }
            }

            const queryGetBomId = `
                SELECT pp_product_bom_id 
                FROM pp_product_bom 
                WHERE m_product_id = $1 AND bomtype = 'A'
                LIMIT 1
            `;

            const { rows: bomRows } = await dbClient.query(queryGetBomId, [partId]);
            const bomId = bomRows.length > 0 ? bomRows[0].pp_product_bom_id : null;
            const result = await dbClient.query(
                `
                UPDATE cust_joborder
                SET
                    description = $1,
                    a_asset_id = $2,
                    mold_id = $3,
                    m_product_id = $4,
                    qtyplanned = $5,
                    datedoc = $6,
                    startdate = $7,
                    enddate = $8,
                    istrial = $9,
                    bom_id = $10,
                    updated = now(),
                    updated_by = $11
                WHERE cust_joborder_id = $12
                RETURNING *
                `,
                [
                    description,
                    resourceId,
                    moldId,
                    partId,
                    qty,
                    formattedDateDoc,
                    formattedStartDate,
                    formattedEndDate,
                    isTrial,
                    bomId,
                    userId,
                    planId
                ]
            );

            return result.rows[0]; // return row yang berhasil di-update
        } catch (error) {
            throw error;
        } finally {
            if (dbClient) dbClient.release();
        }
    }

    // async updateBomsPlan(server, planId, payload) {
    //     let dbClient;

    //     try {
    //         dbClient = await server.pg.connect(); // asumsi pakai fastify-postgres plugin

    //         const {
    //             bomId,
    //             userId
    //         } = payload;

    //         const result = await dbClient.query(
    //             `
    //             UPDATE cust_joborder
    //             SET
    //                 bom_id = $1,
    //                 updated = now(),
    //                 updated_by = $2
    //             WHERE cust_joborder_id = $3
    //             RETURNING *
    //             `,
    //             [
    //                 bomId,
    //                 userId,
    //                 planId
    //             ]
    //         );

    //         return result.rows[0]; // return row yang berhasil di-update
    //     } catch (error) {
    //         throw error;
    //     } finally {
    //         if (dbClient) dbClient.release();
    //     }
    // }




}

export default PlansService;