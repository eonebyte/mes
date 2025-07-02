import fp from 'fastify-plugin'
import autoload from '@fastify/autoload'
import { join } from 'desm'
import { DateTime } from 'luxon';

class Warehouse {

    async movementLines(server, planId) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();

            const query = `
                select
                    mv.movementdate,
                    au."name" user,
                    mv.documentno,
                    mm.line,
                    mp.value partno,
                    mp."name" partname,
                    ml.value fromlocator,
                    mlto.value tolocator,
                    mm.movementqty,
                    cu.uomsymbol
                from
                    m_movementline mm
                join m_movement mv on mm.m_movement_id = mv.m_movement_id
                join m_product mp on mm.m_product_id = mp.m_product_id
                join m_locator ml on mm.m_locator_id = ml.m_locator_id
                join m_locator mlto on mm.m_locatorto_id = mlto.m_locator_id
                join ad_user au on mv.createdby = au.ad_user_id
                join c_uom cu on mp.c_uom_id = cu.c_uom_id
                where
                    mv.cust_joborder_id = $1
                ORDER BY
                    mv.documentno, mm.line;
            `;

            const result = await dbClient.query(query, [planId]);

            const grouped = [];

            for (const row of result.rows) {
                let doc = grouped.find(d => d.documentno === row.documentno);

                if (!doc) {
                    doc = {
                        movementdate: DateTime.fromJSDate(row.movementdate)
                            .setZone('Asia/Jakarta')
                            // .toFormat('dd-MM-yyyy HH:mm:ss'),
                            .toFormat('dd-MM-yyyy'),
                        user: row.user,
                        documentno: row.documentno,
                        lines: []
                    };
                    grouped.push(doc);
                }

                doc.lines.push({
                    line: row.line,
                    partno: row.partno,
                    partname: row.partname,
                    fromlocator: row.fromlocator,
                    tolocator: row.tolocator,
                    movementqty: parseFloat(row.movementqty),
                    uom: row.uomsymbol,
                });
            }


            return grouped;
        } catch (error) {
            console.error('Error finding BOMs:', error);
            throw error;
        } finally {
            if (dbClient) dbClient.release();
        }
    }

}

async function warehouse(fastify, opts) {
    fastify.decorate('warehouse', new Warehouse())
    fastify.register(autoload, {
        dir: join(import.meta.url, 'routes'),
        options: {
            prefix: opts.prefix
        }
    })
}

export default fp(warehouse)