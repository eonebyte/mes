class Resource {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    /**
     * @param {object} dbClient - Koneksi client database
     * @returns {Array} - Daftar resource
     */
    static async getAll(dbClient) {
        try {
            const { rows } = await dbClient.query(
                'SELECT machine_id AS "machineId", machine_name AS "machineName" FROM mes.machines'
            );
            return rows.map(row => new Resource(row.machineId, row.machineName));
        } catch (error) {
            throw new Error(`Error fetching resources: ${error.message}`);
        } finally {
            // Pastikan koneksi dibebaskan setelah selesai
            dbClient.release();
        }
    }

    /**
     * Mengambil waktu terakhir mesin berjalan berdasarkan ID mesin
     * @param {object} dbClient - Koneksi client database
     * @param {int} machine_id - ID mesin yang dicari
     * @returns {Date|null} - Waktu terakhir mesin berjalan atau null jika tidak ditemukan
     */
    static async getLastRunningTime(dbClient, machine_id) {
        try {
            if (!machine_id) {
                throw new Error('Machine ID is required.');
            }

            const result = await dbClient.query(
                'SELECT last_running_time FROM mes.machines WHERE machine_id = $1',
                [machine_id]
            );

            if (result.rows.length > 0 && result.rows[0].last_running_time) {
                return new Date(result.rows[0].last_running_time);
            }
            return null;
        } catch (error) {
            throw new Error(`Error fetching last running time: ${error.message}`);
        }
    }


    /**
     * Memperbarui waktu terakhir mesin berjalan
     * @param {object} dbClient - Koneksi client database
     * @param {int} machineId - ID mesin yang akan diperbarui
     * @returns {Promise<void>}
     */
    static async updateLastRunningTime(dbClient, machineId) {
        const currentTime = new Date();
        try {
            await dbClient.query(
                'UPDATE mes.machines SET last_running_time = $1 WHERE machine_id = $2',
                [currentTime, machineId]
            );
            console.log(`Updated last running time for machine: ${machineId}`);
        } catch (error) {
            throw new Error(`Error updating last running time for machine ${machineId}: ${error.message}`);
        } finally {
            // Pastikan koneksi dibebaskan setelah selesai
            dbClient.release();
        }
    }
}

export default Resource;
