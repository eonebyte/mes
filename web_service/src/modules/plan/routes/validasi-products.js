// Impor helper koneksi Anda. Pastikan path ini benar.
import oracleDB from '../../../configs/oracle.connection.js';
// Impor 'oracledb' untuk mengakses konstanta bawaan seperti 'oracledb.OBJECT'.

export default async (server, opts) => {
    server.post('/validate-parts', async (request, reply) => {
        const { partnos, rows } = request.body;
        console.log('Received partnos for two-step validation:', partnos);

        if (!partnos || !Array.isArray(partnos) || partnos.length === 0) {
            return reply.code(200).send({ invalidPartNos: [] });
        }

        let connection;
        try {
            connection = await oracleDB.openConnection();
            const ORACLE_IN_CLAUSE_LIMIT = 999;

            // Ini akan menjadi "peta data" final yang dikirim ke front-end
            const finalValidationDataMap = {};
            const errors = [];

            // ✅ Validasi start & end kosong/null
            // ✅ Validasi start & end kosong/null (cukup sekali di backend)
            // ✅ Validasi start & end kosong/null
            if (rows && Array.isArray(rows)) {
                for (const row of rows) {
                    if (!row.start || !row.end) {
                        errors.push({
                            rowNo: row.no,
                            message: `Row ${row.no} - Start/End date tidak boleh kosong`
                        });
                    }
                }
            }





            for (let i = 0; i < partnos.length; i += ORACLE_IN_CLAUSE_LIMIT) {
                const batch = partnos.slice(i, i + ORACLE_IN_CLAUSE_LIMIT);

                // === LANGKAH 1: Cek apakah Part Number ada di M_PRODUCT ===
                const bindsStep1 = {};
                const placeholdersStep1 = batch.map((partno, index) => {
                    const bindName = `partno${index}`;
                    bindsStep1[bindName] = partno;
                    return `:${bindName}`;
                }).join(', ');

                const queryStep1 = `SELECT VALUE FROM M_PRODUCT WHERE VALUE IN (${placeholdersStep1})`;
                const resultStep1 = await connection.execute(
                    queryStep1,
                    bindsStep1,
                    { outFormat: oracleDB.instanceOracleDB.OBJECT }
                );

                // Ini adalah daftar partno dari batch saat ini yang ada di M_PRODUCT
                const existingPartnosInBatch = resultStep1.rows.map(p => p.VALUE);

                // Jika tidak ada partno yang lolos langkah 1, lanjut ke batch berikutnya
                if (existingPartnosInBatch.length === 0) {
                    continue;
                }

                // === LANGKAH 2: Untuk yang ada, ambil partid & moldid dari relasi ===
                const bindsStep2 = {};
                const placeholdersStep2 = existingPartnosInBatch.map((partno, index) => {
                    const bindName = `partno${index}`;
                    bindsStep2[bindName] = partno;
                    return `:${bindName}`;
                }).join(', ');

                // Query ini sekarang mengambil data yang kita butuhkan, bukan hanya VALUE
                const queryStep2 = `
                    SELECT
                        part.VALUE AS partno,
                        part.M_PRODUCT_ID AS partid,
                        mold.M_PRODUCT_ID AS moldid
                    FROM CUST_Product_MOLD cpm
                    JOIN M_PRODUCT mold ON mold.M_PRODUCT_ID = cpm.M_PRODUCT_ID
                    JOIN M_PRODUCT part ON part.M_PRODUCT_ID = cpm.M_PRODUCTMOLD_ID
                    WHERE part.VALUE IN (${placeholdersStep2})
                `;

                const resultStep2 = await connection.execute(
                    queryStep2,
                    bindsStep2,
                    { outFormat: oracleDB.instanceOracleDB.OBJECT }
                );

                // Masukkan hasil yang lolos langkah 2 ke dalam peta data final
                for (const row of resultStep2.rows) {
                    finalValidationDataMap[row.PARTNO] = {
                        partid: row.PARTID,
                        moldid: row.MOLDID
                    };
                }
            }

            // === FINAL: Kirim peta data yang sudah divalidasi dan diperkaya ===
            // Front-end akan menggunakan peta ini untuk mengisi tabelnya.
            // Partno yang tidak ada di dalam peta ini secara otomatis dianggap tidak valid.
            reply.code(200).send({ validationData: finalValidationDataMap, errors });


        } catch (error) {
            console.error('Part validation error:', error);
            reply.code(500).send({ message: 'Server error during part number validation.' });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing Oracle connection:', err);
                }
            }
        }
    });
}