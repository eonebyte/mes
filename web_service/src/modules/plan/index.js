import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import { join } from 'desm'
import axios from 'axios';
import https from 'https';
import { DateTime } from 'luxon';
import oracleDB from '../../configs/oracle.connection.js';


class Plan {
    async getQtyUsedActual(server, partId, bomId) {
        const dbClient = await server.pg.connect();
        try {
            const query = `
            SELECT
                pl.actualqtyused
            FROM
                m_productionline pl
            JOIN
                m_production p ON pl.m_production_id = p.m_production_id
            WHERE
                pl.m_product_id = $1
                AND p.pp_product_bom_id = $2
                AND pl.isendproduct = 'N'
        `;
            const result = await dbClient.query(query, [partId, bomId]);

            if (result.rows.length > 0) {
                return parseFloat(result.rows[0].actualqtyused) || 0; // Pastikan nilai default adalah 0
            }

            return 0; // Jika tidak ada data, kembalikan 0
        } catch (error) {
            throw new Error(`Failed to fetch qtyUsed for partId ${partId} and bomId ${bomId}: ${error.message}`);
        } finally {
            dbClient.release();
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
                    AND p.m_product_category_id IN (1000000, 1000010, 1000011, 1000012, 1000013, 1000030, 1000031) -- 0. Standart, 10. RM, 11. RMC, 12. RMP, 13. RMPC, 30. C Packing, 31. Print label
                ORDER BY b.line
            `;
            const result = await dbClient.query(query, [bomId]);

            // Tambahkan qtyUsed untuk setiap item
            const bomComponents = await Promise.all(
                result.rows.map(async (row, index) => {
                    const qtyUsedActual = await this.getQtyUsedActual(server, row.m_product_id, bomId); // Panggil getQtyUsed
                    return {
                        no: index + 1,
                        partId: parseInt(row.m_product_id),
                        partNo: row.part_no,
                        partName: row.part_name,
                        qtyBatch: parseFloat(row.qtybatch),
                        qtyBOM: parseFloat(row.qtybom),
                        isActive: row.isactive,
                        uomsymbol: row.uomsymbol,
                        category: row.category === 'Consumables Packing' || row.category === 'Consumables Print & Label' ? 'Packing' : row.category,
                        qtyUsedActual // Tambahkan qtyUsed ke hasil
                    };
                })
            );

            return bomComponents;
        } catch (error) {
            throw new Error(`Failed to fetch BOM Component: ${error}`);
        } finally {
            dbClient.release();
        }
    }

    async getProductions(server, joId) {
        const dbClient = await server.pg.connect();
        try {
            const query = `
               select
                    documentno as production_no,
                    p.value as partno,
                    p.name as partname,
                    m_production_id,
                    productionqty,
                    docstatus,
                    lostqty
                from
                    m_production mp
                join m_product p on mp.m_product_id = p.m_product_id
                where mp.cust_joborder_id = $1
                order by documentno
            `;
            const result = await dbClient.query(query, [joId]);

            if (result.rows.length > 0) {
                const data = result.rows.map(row => ({
                    production_no: row.production_no,
                    part_no: row.partno,
                    part_name: row.partname,
                    m_production_id: Number(row.m_production_id),
                    productionqty: Number(row.productionqty),
                    docstatus: row.docstatus,
                    lostqty: Number(row.lostqty)
                }));

                return data;
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch data productions: ${error}`);
        } finally {
            dbClient.release();
        }
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
                au.name AS createdby,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                mp.cycletime,
                mp2.cavity,
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
            JOIN ad_user au ON jo.createdby = au.ad_user_id
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
                    user: row.createdby,
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

    async findAllOracle(server) {
        let connection;
        try {
            connection = await oracleDB.openConnection(); // PostgreSQL pakai pool

            const query = `
            SELECT
                jo.cust_joborder_id,
                jo.documentno,
                aa.a_asset_id,
                aa.lineno AS lineno,
                aa.value AS mc,
                au.ad_user_id AS user_id,
                au.name AS createdby,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                mp.cycletime,
                mp2.cavity,
                jo.isactive,
                jo.isverified,
                mp.m_product_id AS product_id,
                mp.value AS product_value,
                mp.name AS product_name,
                jo.qtyplanned,
                jo.istrial,
                mp2.m_product_id AS moldid,
                mp2.value AS moldno,
                mp2.name AS moldname,
                jo.description
            FROM cust_joborder jo
            JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
            JOIN ad_user au ON jo.createdby = au.ad_user_id
            JOIN m_product mp ON jo.m_product_id = mp.m_product_id
            LEFT JOIN m_product mp2 ON jo.m_productmold_id = mp2.m_product_id
            WHERE jo.datedoc >= DATE '2025-08-01'
            AND jo.docstatus = 'DR'
            ORDER BY jo.documentno DESC
        `;

            const result = await connection.execute(query, [], { outFormat: oracleDB.instanceOracleDB.OBJECT }); // PostgreSQL pakai query()

            if (result.rows.length > 0) {
                return result.rows.map((row, index) => ({
                    no: index + 1,
                    planId: row.CUST_JOBORDER_ID,
                    planNo: row.DOCUMENTNO,
                    resourceId: row.A_ASSET_ID,
                    MC: `${row.LINENO} [${row.MC}]`,
                    userId: row.USER_ID,
                    user: row.CREATEDBY,
                    status: row.DOCSTATUS,
                    dateDoc: row.DATEDOC,
                    planStartTime: row.STARTDATE,
                    planCompleteTime: row.ENDDATE,
                    cycletime: Math.floor(row.CYCLETIME),
                    cavity: row.CAVITY,
                    isActive: row.ISACTIVE,
                    isVerified: row.ISVERIFIED,
                    partId: row.PRODUCT_ID,
                    partNo: row.PRODUCT_VALUE,
                    partName: row.PRODUCT_NAME,
                    qty: Math.floor(row.QTYPLANNED),
                    isTrial: row.ISTRIAL,
                    moldId: row.MOLDID,
                    moldNo: row.MOLDNO,
                    moldName: row.MOLDNAME,
                    description: row.DESCRIPTION
                }));
            }

            return [];
        } catch (error) {
            throw new Error(`Failed to fetch All Job Orders: ${error}`);
        } finally {
            if (connection) {
                await connection.close();
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
                au.name AS createdby,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                CAST( mp.cycletime AS INTEGER) AS cycletime,
                mp2.cavity,
                jo.isactive, 
                jo.isverified,
                mp.value AS product_value,
                mp.name AS product_name,
                mp.description AS product_description,
                CAST(jo.qtyplanned AS INTEGER) AS qtyplanned,
                CAST(jo.togoqty AS INTEGER) AS togoqty,
                CAST(jo.outputqty AS INTEGER) AS outputqty,
                jo.istrial, 
                mp2.value AS mold, 
                mp2.name AS moldname,
                mp2.m_product_id AS mold_id,
                jo.description
            FROM cust_joborder jo
            JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
            JOIN ad_user au ON jo.createdby = au.ad_user_id
            JOIN m_product mp ON jo.m_product_id = mp.m_product_id
            LEFT JOIN m_product mp2 ON jo.mold_id = mp2.m_product_id
            WHERE jo.datedoc >= DATE '2024-01-01' 
            AND jo.docstatus <> 'CL'
            AND jo.docstatus <> 'CO'
            AND (jo.iscurrent IS NULL OR jo.iscurrent <> 'Y')
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
                user: row.createdby,
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
                partDesc: row.product_description,
                qty: Math.floor(row.qtyplanned),
                isTrial: row.istrial,
                mold: row.mold,
                moldName: row.moldname,
                mold_id: row.mold_id,
                description: row.description,
                togoqty: Math.floor(row.togoqty || 0), // Pastikan togoqty tidak null
                outputqty: Math.floor(row.outputqty || 0), // Pastikan togoqty tidak null
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
                au.name AS createdby,
                jo.docstatus,
                TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                CAST( mp.cycletime AS INTEGER) AS cycletime,
                mp2.cavity,
                jo.isactive, 
                jo.isverified,
                mp.m_product_id AS product_id,
                mp.value AS product_value,
                mp.name AS product_name,
                CAST(jo.qtyplanned AS INTEGER) AS qtyplanned,
                CAST(jo.togoqty AS INTEGER) AS togoqty,
                CAST(jo.outputqty AS INTEGER) AS outputqty,
                jo.istrial, 
                jo.mold_id AS mold_id,
                mp2.value AS mold, 
                mp2.name AS moldname,
                jo.description,
                jo.bom_id
            FROM cust_joborder jo
            JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
            JOIN ad_user au ON jo.createdby = au.ad_user_id
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
                const bomComponent = row.bom_id ? await this.getBOMComponent(server, parseInt(row.bom_id)) : [];

                // ✅ Ambil productionId berdasarkan JO ID
                const productionQuery = `
                    SELECT m_production_id 
                    FROM m_production 
                    WHERE cust_joborder_id = $1 
                    ORDER BY created DESC 
                    LIMIT 1
                `;
                const productionResult = await dbClient.query(productionQuery, [row.cust_joborder_id]);
                const productionId = productionResult.rows.length > 0 ? productionResult.rows[0].m_production_id : null;

                const productionHistories = row.cust_joborder_id ? await this.getProductions(server, parseInt(row.cust_joborder_id)) : [];

                return {
                    no: index + 1,
                    planId: row.cust_joborder_id,
                    planNo: row.documentno,
                    resourceId: row.a_asset_id,
                    createdBy: row.createdby,
                    status: row.docstatus,
                    dateDoc: row.datedoc,
                    planStartTime: row.startdate,
                    planCompleteTime: row.enddate,
                    cycletime: row.cycletime,
                    cavity: parseInt(row.cavity),
                    isActive: row.isactive,
                    isVerified: row.isverified,
                    partId: parseInt(row.product_id),
                    partNo: row.product_value,
                    partName: row.product_name,
                    qty: row.qtyplanned,
                    togoqty: row.togoqty,
                    outputqty: row.outputqty,
                    isTrial: row.istrial,
                    moldId: row.mold_id,
                    mold: row.mold,
                    moldName: row.moldname,
                    lineno: station?.lineno || null,
                    mcno: station?.value || null,
                    description: row.description,
                    resourceStatus: station?.status || null,
                    bomComponent,
                    productionId,
                    productionHistories
                }
            }));

            return {
                resourceId,
                lineno: jobOrders[0]?.lineno || null,
                moldName: jobOrders[0]?.moldName || null,
                mcno: jobOrders[0]?.mcno || null,
                job_orders: jobOrders
            };

        } catch (error) {
            throw new Error(`Failed to fetch active job orders: ${error}`);
        } finally {
            if (dbClient) {
                dbClient.release();
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
                    au.name AS createdby,
                    jo.docstatus,
                    TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                    TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                    TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                    CAST(mp.cycletime AS INTEGER) AS cycletime,
                    mp2.cavity,
                    jo.isactive, 
                    jo.isverified,
                    mp.value AS product_value,
                    mp.name AS product_name,
                    mp.description AS product_description,
                    CAST(jo.qtyplanned AS INTEGER) AS qtyplanned, -- Menghilangkan desimal
                    CAST(jo.togoqty AS INTEGER) AS togoqty,
                    CAST(jo.outputqty AS INTEGER) AS outputqty,
                    jo.istrial, 
                    jo.mold_id AS mold_id,
                    mp2.value AS mold, 
                    mp2.name AS moldname,
                    jo.description,
                    jo.bom_id,
                    mpb.name AS BOM
                FROM cust_joborder jo
                JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
                JOIN ad_user au ON jo.createdby = au.ad_user_id
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
                    createdBy: row.createdby,
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
                    partDesc: row.product_description,
                    qty: row.qtyplanned,
                    togoqty: row.togoqty,
                    outputqty: row.outputqty,
                    isTrial: row.istrial,
                    moldId: row.mold_id,
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

    async updateCavity(server, moldId, userId, cavity) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            const query = `
            UPDATE m_product
            SET cavity = $1,
                updated = now(),
                updatedby = $2
            WHERE m_product_id = $3
        `;

            const values = [cavity, userId, moldId];

            await dbClient.query(query, values);
        } catch (error) {
            console.error('Error updating cavity:', error);
            throw new Error('Failed to update cavity');
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
                    au.name AS createdby,
                    jo.docstatus,
                    TO_CHAR(jo.datedoc, 'DD-MM-YYYY HH24:MI:SS') AS datedoc,
                    TO_CHAR(jo.startdate, 'DD-MM-YYYY HH24:MI:SS') AS startdate,
                    TO_CHAR(jo.enddate, 'DD-MM-YYYY HH24:MI:SS') AS enddate,
                    CAST(mp.cycletime AS INTEGER) AS cycletime,
                    mp.cavity,
                    jo.isactive, 
                    jo.isverified,
                    mp.value AS product_value,
                    mp.name AS product_name,
                    mp.description AS product_description,
                    CAST(jo.qtyplanned AS INTEGER) AS qtyplanned, -- Menghilangkan desimal
                    CAST(jo.togoqty AS INTEGER) AS togoqty,
                    CAST(jo.outputqty AS INTEGER) AS outputqty,
                    jo.istrial, 
                    mp2.value AS mold, 
                    mp2.name AS moldname,
                    jo.description,
                    jo.mold_id AS mold_id
                FROM cust_joborder jo
                JOIN a_asset aa ON jo.a_asset_id = aa.a_asset_id
                JOIN ad_user au ON jo.createdby = au.ad_user_id
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

                const joMovementLines = await server.warehouse.movementLines(server, row.cust_joborder_id);


                return {
                    no: index + 1,
                    planId: row.cust_joborder_id,
                    planNo: row.documentno,
                    resourceId: row.a_asset_id,
                    createdBy: row.createdby,
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
                    partDesc: row.product_description,
                    qty: row.qtyplanned,
                    togoqty: row.togoqty,
                    outputqty: row.outputqty,
                    isTrial: row.istrial,
                    mold: row.mold,
                    moldName: row.moldname,
                    description: row.description,
                    lineno: station?.lineno || null,
                    mcno: station?.value || null,
                    mold_id: row.mold_id,
                    joMovementLines: joMovementLines || [],
                };
            }));

            const groupedPlans = jobOrders.reduce((acc, job) => {
                const key = job.mold_id;
                const mold_name = job.moldName;
                const jo_status = job.status;
                const lineno = job.lineno;
                const mcno = job.mcno;
                const resourceId = job.resourceId;
                if (!acc[key]) {
                    acc[key] = {
                        moldId: key,
                        mold_name: mold_name || 'undefined',
                        jo_status: jo_status,
                        lineno: lineno,
                        mcno: mcno,
                        resourceId: resourceId,
                        data: [],
                        movementDocuments: []
                    };
                }
                acc[key].data.push(job);

                if (job.joMovementLines && job.joMovementLines.length > 0) {
                    acc[key].movementDocuments.push(...job.joMovementLines);
                }
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
            throw new Error(`Failed to fetch Job Order Details: ${error.message}`);
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

    async findOne(server, planId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                SELECT cust_joborder_id, docstatus 
                FROM 
                cust_joborder 
                where cust_joborder_id = $1
                ORDER BY cust_joborder_id DESC LIMIT 1;
            `;
            const result = await dbClient.query(query, [planId]);

            if (result.rows.length > 0) {
                return result.rows;
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

    async openJO(server, planId, confirmStatus) {
        let dbClient;
        const errors = [];

        // Peta status ke docstatus
        const statusMap = {
            OK: 'IP', //IP = Open
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

    async updateMultiPlanStatusProgress(server, planIdArray, confirmStatus) {
        let dbClient;
        const errors = [];
        const successes = [];

        // Peta status ke docstatus
        const statusMap = {
            OK: 'IP', // IP = Open
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

            for (let planId of planIdArray) {
                planId = parseInt(planId);
                if (isNaN(planId)) {
                    errors.push(`Invalid Plan ID: ${planId}`);
                    continue;
                }
                try {
                    // Ambil bom_id, mold_id, resource_id untuk planId ini
                    const joResult = await dbClient.query(`
                        SELECT bom_id, mold_id AS mold_plan_id, a_asset_id AS resource_id 
                        FROM cust_joborder 
                        WHERE cust_joborder_id = $1
                    `, [planId]);

                    const joRow = joResult.rows[0];

                    if (!joRow) {
                        errors.push(`Plan ID ${planId}: Job order not found.`);
                        continue; // skip ke planId berikutnya
                    }

                    const bomId = joRow.bom_id;
                    const moldPlan = joRow.mold_plan_id;

                    if (!bomId || bomId < 1) {
                        errors.push(`Plan ID ${planId}: BOM is missing.`);
                        continue;
                    }

                    if (!moldPlan) {
                        errors.push(`Plan ID ${planId}: Mold in job order is missing.`);
                        continue;
                    }

                    // Lakukan update status
                    await dbClient.query(`
                        UPDATE cust_joborder 
                        SET docstatus = $1  
                        WHERE cust_joborder_id = $2
                    `, [docstatus, planId]);

                    successes.push(planId);

                } catch (planError) {
                    console.error(`Error processing Plan ID ${planId}:`, planError);
                    errors.push(`Plan ID ${planId}: ${planError.message}`);
                }
            }

            // Return hasil
            if (errors.length > 0 && successes.length === 0) {
                return {
                    success: false,
                    message: 'Errors occurred while updating plans.',
                    errors: errors,
                };
            } else if (errors.length > 0) {
                return {
                    success: true,
                    message: `Some plans updated with errors.`,
                    updatedPlans: successes,
                    errors: errors,
                };
            } else {
                return {
                    success: true,
                    message: 'All plans updated successfully.',
                    updatedPlans: successes,
                };
            }

        } catch (error) {
            console.error('Fatal error:', error);
            return {
                success: false,
                message: 'Failed to update plan statuses.',
                error: error.message,
            };
        } finally {
            if (dbClient) dbClient.release();
        }
    }



    async updateJOStatusComplete(server, planId, confirmStatus) {
        let dbClient;
        const errors = [];


        // Peta status ke docstatus
        const statusMap = {
            OK: 'CO', // CO = Completed
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

    async getNextId(dbClient, seqId) {
        const query = `
            SELECT nextid(
                $1,
                'Y'
            ) AS new_id
        `;
        const { rows } = await dbClient.query(query, [seqId]);

        if (rows.length === 0 || !rows[0].new_id) {
            throw new Error(`Gagal mendapatkan ID berikutnya dari sekuens '${sequenceName}'. Pastikan sekuens ada.`);
        }

        return rows[0].new_id;
    }

    async createEvent(dbClient, resourceId, code, reason = null) {

        const getEventCategoriesQuery = `select "name" as category, value as code from event_category`;
        const { rows: eventCategories } = await dbClient.query(getEventCategoriesQuery);

        const newStatus = await eventCategories.find(item => item.code === code)?.category || "UNKNOWN";

        const getLastOpenEventQuery = `
            SELECT a_asset_event_id, starttime, endtime
            FROM a_asset_event
            WHERE a_asset_id = $1 AND endtime IS NULL
            ORDER BY starttime DESC
            LIMIT 1
        `;
        const { rows } = await dbClient.query(getLastOpenEventQuery, [resourceId]);

        let startTime = new Date();

        if (rows.length > 0) {
            const lastEvent = rows[0];
            const nowDowntime = DateTime.now().setZone('Asia/Jakarta');

            // Tutup event sebelumnya
            const closeEventQuery =
                `UPDATE a_asset_event
                    SET endtime = $1,
                    duration = EXTRACT(EPOCH FROM($1:: timestamp - starttime))
                WHERE
                    status = 'RUNNING'
                    AND a_asset_event_id = $2
                    AND a_asset_id = $3 RETURNING endtime`


            const closeResult = await dbClient.query(closeEventQuery, [nowDowntime.toJSDate(), lastEvent.a_asset_event_id, resourceId]);

            if (closeResult.rows.length === 0) {
                console.error("Gagal menutup event sebelumnya.");
            }

            startTime = closeResult.rows[0].endtime;
        }

        const newEventId = await this.getNextId(dbClient, 1001042); // sequence asset event


        const insertEventQuery = `
            INSERT INTO a_asset_event (
                a_asset_event_id, a_asset_id, starttime,
                status, reason, code
            )
            VALUES($1, $2, $3, $4, $5, $6) RETURNING a_asset_event_id, starttime`;


        const result = await dbClient.query(insertEventQuery, [
            newEventId,
            resourceId,
            startTime,
            newStatus,
            reason,
            code
        ]);

        return result.rows[0] || null;
    }


    async startPlan(server, planId, resourceId) {
        if (!planId || !resourceId) {
            return {
                success: false,
                messages: ['ID Rencana (planId) dan ID Sumber Daya (resourceId) wajib diisi.']
            };
        }

        let dbClient;

        try {
            dbClient = await server.pg.connect();
            await dbClient.query('BEGIN');

            // update jo
            const updateJoQuery = `
                UPDATE cust_joborder 
                SET iscurrent = 'Y', a_asset_id = $2 
                WHERE cust_joborder_id = $1
                RETURNING cust_joborder_id
            `;

            const { rows: updateJo } = await dbClient.query(updateJoQuery, [planId, resourceId]);
            if (updateJo.length === 0) {
                await dbClient.query('ROLLBACK');
                return {
                    success: false,
                    messages: [`Tidak ada perubahan dilakukan pada JO ini.`]
                };
            }

            await dbClient.query('COMMIT');

            return {
                success: true,
                messages: ['Job order berhasil dimulai.']
            };

        } catch (error) {
            if (dbClient) await dbClient.query('ROLLBACK');

            console.error('startPlan error:', error);

            return {
                success: false,
                messages: ['Terjadi kesalahan saat memulai job order.', error.message]
            };

        } finally {
            if (dbClient) dbClient.release();
        }
    }


    async startMultiPlan(request, server, planIdArray, resourceId) {
        const user = request.session.get('user');
        const agent = new https.Agent({
            rejectUnauthorized: false
        });
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            // =================================================================
            // FASE 0: Ambil data yang konstan di luar loop
            // =================================================================
            const assetResult = await dbClient.query(`
                SELECT mold_id, status 
                FROM a_asset 
                WHERE a_asset_id = $1
            `, [resourceId]);

            if (assetResult.rowCount === 0) {
                return { success: false, messages: ['Mesin (resource) tidak ditemukan.'] };
            }
            const resourceAsset = assetResult.rows[0];
            const moldResource = parseInt(resourceAsset.mold_id);

            if (isNaN(moldResource)) {
                return { success: false, messages: ['Mold pada mesin belum diatur.'] };
            }

            // =================================================================
            // FASE 1: Validasi semua planId terlebih dahulu
            // =================================================================
            const validationErrors = [];
            const validatedPlansData = [];

            for (const planIdStr of planIdArray) {
                const planId = parseInt(planIdStr);
                if (isNaN(planId)) {
                    validationErrors.push(`Invalid Plan ID: ${planIdStr}`);
                    continue; // Lanjut ke planId berikutnya
                }

                // Gabungkan query untuk efisiensi
                const joResult = await dbClient.query(`
                    SELECT 
                        mold_id, iscurrent, bom_id, ad_client_id, ad_org_id, 
                        createdby, documentno, qtyplanned, description, m_product_id, datedoc
                    FROM cust_joborder
                    WHERE cust_joborder_id = $1
                `, [planId]);

                if (joResult.rowCount === 0) {
                    validationErrors.push(`Job Order dengan ID ${planId} tidak ditemukan.`);
                    continue;
                }

                const planData = joResult.rows[0];
                const moldPlan = parseInt(planData.mold_id);

                // Validasi mold
                if (isNaN(moldPlan)) {
                    validationErrors.push(`Mold untuk Job Order ${planData.documentno} belum diatur.`);
                } else if (moldPlan !== moldResource) {
                    validationErrors.push(`Mold Job Order ${planData.documentno} tidak sesuai dengan mold pada mesin.`);
                }

                // Simpan data yang sudah divalidasi untuk fase eksekusi
                validatedPlansData.push({ planId, ...planData });
            }

            // =================================================================
            // FASE 2: Periksa hasil validasi
            // =================================================================
            if (validationErrors.length > 0) {
                // Kembalikan semua error validasi sekaligus tanpa menyentuh transaksi
                return {
                    success: false,
                    messages: validationErrors,
                };
            }

            // =================================================================
            // FASE 3: Eksekusi dalam satu transaksi jika semua valid
            // =================================================================
            await dbClient.query('BEGIN');

            try {
                // Update status mesin HANYA SEKALI
                await dbClient.query(
                    `UPDATE a_asset SET status = 'RUN' WHERE a_asset_id = $1`,
                    [resourceId]
                );

                // Buat event untuk mesin
                const createEventResult = await this.createEvent(dbClient, resourceId, 'RUN', 'START JOB ORDER');
                if (!createEventResult) {
                    throw new Error('Gagal membuat event untuk mesin.');
                }

                for (const plan of validatedPlansData) {
                    // Jika iscurrent adalah 'N', buat produksi dan update JO
                    if (plan.iscurrent === 'N') {
                        // Panggil API Eksternal
                        const response = await axios.post(
                            'https://192.168.3.6:8443/api/v1/models/m_production',
                            {
                                "name": `Production for JO ${plan.documentno}`,
                                "Cust_JobOrder_ID": { "id": plan.planId, "tableName": "Cust_JobOrder" },
                                "M_Locator_ID": { "id": 1000023, "tableName": "M_Locator" },
                                "M_Product_ID": { "id": parseInt(plan.m_product_id), "tableName": "M_Product" },
                                "productionQty": 0,
                            },
                            {
                                headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
                                httpsAgent: agent
                            },
                        );

                        if (response.status !== 201) {
                            // Jika API gagal, lempar error untuk memicu rollback
                            throw new Error(`Gagal membuat data produksi untuk JO ${plan.documentno}. Status: ${response.status}`);
                        }
                    }

                    // Update status job order menjadi 'Y'
                    await dbClient.query(
                        `UPDATE cust_joborder SET iscurrent = 'Y' WHERE cust_joborder_id = $1`,
                        [plan.planId]
                    );
                }

                // Jika semua berhasil, commit transaksi
                await dbClient.query('COMMIT');
                return { success: true, messages: ['Semua job order berhasil dimulai.'] };

            } catch (executionError) {
                // Jika terjadi error selama eksekusi, rollback semuanya
                await dbClient.query('ROLLBACK');
                // Kembalikan pesan error yang spesifik
                return { success: false, messages: ['Terjadi kesalahan saat eksekusi.', executionError.message] };
            }

        } catch (error) {
            // Menangkap error koneksi atau error validasi awal
            if (dbClient) {
                // Pastikan tidak ada transaksi yang menggantung
                // await dbClient.query('ROLLBACK'); // Tidak perlu jika error terjadi sebelum BEGIN
            }
            console.error('Error in startMultiPlan:', error);
            return {
                success: false,
                messages: ['Terjadi kesalahan sistem.', error.message]
            };
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    async doHold(request, server, planId, resourceId, confirmStatus, productionId, togoQty, outputQty) {

        const user = request.session.get('user');
        const agent = new https.Agent({ rejectUnauthorized: false });

        let dbClient;
        let resourceStatus;

        // Peta status ke docstatus
        const statusMap = {
            HOLD: 'HO'
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

            const assetResult = await dbClient.query(`
                SELECT mold_id, status 
                FROM a_asset 
                WHERE a_asset_id = $1
            `, [resourceId]);
            resourceStatus = assetResult.rows[0]?.status;


            if (status === 'HO') {
                // === production process
                const response = await axios.post(
                    'https://192.168.3.6:8443/api/v1/processes/m_production_process', // ID 109 = CompleteProduction
                    {
                        'record-id': parseInt(productionId),
                        'DocAction': 'CO',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            'Content-Type': 'application/json'
                        },
                        httpsAgent: agent
                    },
                );


                const { isError } = response.data;


                if (isError) {
                    return {
                        success: false,
                        messages: ['terjadi error saat post Hold', response.data],
                        error: response.data,
                    };
                }

                if (resourceStatus === 'RUN') {
                    const queryUpdateStatusAssetWaiting = `
                        UPDATE a_asset 
                        SET status = $1  
                        WHERE a_asset_id = $2
                    `;

                    const rowQueryUpdateStatusAssetWaiting = await dbClient.query(queryUpdateStatusAssetWaiting, ['WAIT', resourceId]);

                    if (rowQueryUpdateStatusAssetWaiting.rowCount === 0) {
                        await dbClient.query('ROLLBACK');
                        return {
                            success: false,
                            messages: ['Mesin tidak ditemukan berdasarkan ID.'],
                        };
                    }

                    const createEventResult = await this.createEvent(
                        dbClient,
                        resourceId,
                        'WAIT',
                        'START JOB ORDER',
                    );

                    if (!createEventResult) {
                        await dbClient.query('ROLLBACK');
                        return { success: false, messages: ['Gagal membuat event untuk mesin.'] };
                    }
                }

                const queryUpdateStatusJO = `
                            UPDATE cust_joborder
                            SET iscurrent = 'N', docstatus = $3, togoqty = $4, outputqty = $5
                            WHERE cust_joborder_id = $1 AND a_asset_id = $2
                        `;

                const row = await dbClient.query(queryUpdateStatusJO, [planId, resourceId, status, togoQty, outputQty]);

                if (row.rowCount === 0) {
                    await dbClient.query('ROLLBACK');
                    return {
                        success: false,
                        messages: ['Job order tidak ditemukan untuk mesin tersebut.'],
                    };
                }
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
                messages: ['Terjadi kesalahan saat mengubah status job order.', error.message],
                error,
            };
        } finally {
            if (dbClient) dbClient.release();
        }
    }

    async doProductionCompleted(request, server, planId, resourceId, confirmStatus, productionId, togoQty, outputQty) {

        const user = request.session.get('user');
        const agent = new https.Agent({ rejectUnauthorized: false });

        let dbClient;
        let resourceStatus;

        // Peta status ke docstatus
        const statusMap = {
            COMPLETED: 'CO',
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

            const assetResult = await dbClient.query(`
                SELECT mold_id, status 
                FROM a_asset 
                WHERE a_asset_id = $1
            `, [resourceId]);
            resourceStatus = assetResult.rows[0]?.status;

            if (status === 'CO') {
                // === production process
                const response = await axios.post(
                    'https://192.168.3.6:8443/api/v1/processes/m_production_process', // ID 109 = CompleteProduction
                    {
                        'record-id': parseInt(productionId),
                        'DocAction': 'CO',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            'Content-Type': 'application/json'
                        },
                        httpsAgent: agent
                    },
                );

                console.log('this response', response.data);

                const { isError } = response.data;

                if (isError) {
                    return {
                        success: false,
                        messages: ['terjadi error saat post completed', response.data],
                        error: response.data,
                    };
                }


                if (resourceStatus === 'RUN') {
                    const queryUpdateStatusAssetWaiting = `
                        UPDATE a_asset 
                        SET status = $1  
                        WHERE a_asset_id = $2
                    `;

                    const rowQueryUpdateStatusAssetWaiting = await dbClient.query(queryUpdateStatusAssetWaiting, ['WAIT', resourceId]);

                    if (rowQueryUpdateStatusAssetWaiting.rowCount === 0) {
                        await dbClient.query('ROLLBACK');
                        return {
                            success: false,
                            messages: ['Mesin tidak ditemukan berdasarkan ID.'],
                        };
                    }

                    const createEventResult = await this.createEvent(
                        dbClient,
                        resourceId,
                        'WAIT',
                        'START JOB ORDER',
                    );

                    if (!createEventResult) {
                        await dbClient.query('ROLLBACK');
                        return { success: false, messages: ['Gagal membuat event untuk mesin.'] };
                    }
                }

                const queryUpdateStatusJO = `
                            UPDATE cust_joborder
                            SET iscurrent = 'N', docstatus = $3, togoqty = $4, outputqty = $5
                            WHERE cust_joborder_id = $1 AND a_asset_id = $2
                        `;

                const row = await dbClient.query(queryUpdateStatusJO, [planId, resourceId, status, togoQty, outputQty]);

                if (row.rowCount === 0) {
                    await dbClient.query('ROLLBACK');
                    return {
                        success: false,
                        messages: ['Job order tidak ditemukan untuk mesin tersebut.'],
                    };
                }
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
                messages: ['Terjadi kesalahan saat mengubah status job order.', error.message],
                error,
            };
        } finally {
            if (dbClient) dbClient.release();
        }
    }

    async doSetup(server, resourceId, confirmStatus) {

        let dbClient;

        // Peta status ke docstatus
        const statusMap = {
            SETUP_MOLD: 'SM',
            TEARDOWN_MOLD: 'TM',
            SETTINGS: 'STG',
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


            const queryUpdateStatusAsset = `
                    UPDATE a_asset 
                    SET status = $1  
                    WHERE a_asset_id = $2
                `;

            const rowQueryUpdateStatusAsset = await dbClient.query(queryUpdateStatusAsset, [status, resourceId]);

            if (rowQueryUpdateStatusAsset.rowCount === 0) {
                await dbClient.query('ROLLBACK');
                return {
                    success: false,
                    messages: ['Mesin tidak ditemukan berdasarkan ID.'],
                };
            }


            // const queryUpdateIsCurrentOnly = `
            //         UPDATE cust_joborder
            //         SET iscurrent = 'Y'
            //         WHERE cust_joborder_id = $1 AND a_asset_id = $2
            //     `;

            // const row = await dbClient.query(queryUpdateIsCurrentOnly, [planId, resourceId]);

            // if (row.rowCount === 0) {
            //     await dbClient.query('ROLLBACK');
            //     return {
            //         success: false,
            //         messages: ['Job order tidak ditemukan untuk mesin tersebut.'],
            //     };
            // }

            const createEventResult = await this.createEvent(
                dbClient,
                resourceId,
                status,
                confirmStatus?.trim(),
            );

            if (!createEventResult) {
                await dbClient.query('ROLLBACK');
                return { success: false, messages: ['Gagal membuat event untuk mesin.'] };
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
                messages: ['Terjadi kesalahan saat mengubah status job order.', error.message],
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
                    updatedby = $11
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

}

async function plan(fastify, opts) {
    fastify.decorate('plan', new Plan())
    fastify.register(autoload, {
        dir: join(import.meta.url, 'routes'),
        options: {
            prefix: opts.prefix
        }
    })
}

export default fp(plan)