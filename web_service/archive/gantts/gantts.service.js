import moment from 'moment';
import Bluebird from 'bluebird';
const { Promise } = Bluebird;

class GanttsService {
    static async findAllTasks(server) {
        let dbClient;
        try {
            dbClient = await server.pg.connect();
            const [tasksResult, baselinesResult] = await Promise.all([
                dbClient.query('select * from gantt_tasks'),
                dbClient.query('select * from gantt_baselines'),
            ]);

            const formatDates = (rows) => {
                return rows.map(row => {
                    return {
                        ...row,
                        start_date: row.start_date ? moment(row.start_date).format("YYYY-MM-DD HH:mm:ss") : null,
                        end_date: row.end_date ? moment(row.end_date).format("YYYY-MM-DD HH:mm:ss") : null,
                    };
                });
            };

            const taskData = {
                data: formatDates(tasksResult.rows),
                links: [],
                baselines: formatDates(baselinesResult.rows)
            }

            return taskData
        } catch (error) {
            console.error('Error fetching tasks and baselines:', error);
            throw new Error('Failed to fetch tasks and baselines');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    };

    static async createTask(server, payload) {
        const task = payload;
        let dbClient;

        try {
            dbClient = await server.pg.connect();

            const { rows } = await dbClient.query('SELECT MAX(sortorder) AS maxOrder FROM gantt_tasks');
            const orderIndex = (rows[0].maxOrder || 0) + 1;

            const query = `
                INSERT INTO gantt_tasks (text, start_date, duration, progress, parent, sortorder)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
            `;

            const result = await dbClient.query(query, [
                task.text, task.start_date, task.duration, task.progress, task.parent, orderIndex
            ]);

            const insertedId = result.rows[0].id;

            return res.send({ status: "inserted", id: insertedId });
        } catch (error) {
            console.error("Error inserting task:", error);
            return res.status(500).send({ status: "error", message: error.message });
        } finally {
            // Ensure the database client is released even if an error occurs
            if (dbClient) {
                dbClient.release();
            }
        }
    };

    static async updateTask(server, taskId, payload, taskTarget) {
        const task = payload;
        let dbClient;

        try {
            dbClient = await server.pg.connect();
            const query = `
                UPDATE gantt_tasks
                SET text = $1, start_date = $2, duration = $3, progress = $4, parent = $5
                WHERE id = $6
            `;
            await dbClient.query(query, [
                task.text,
                task.start_date,
                task.duration,
                task.progress,
                task.parent,
                taskId
            ]);

            if (taskTarget) {
                await PlansController.updateOrder(dbClient, taskId, taskTarget);
            }

            return { status: 'updated' };
        } catch (error) {
            console.error("Error updating task:", error);
            throw new Error('Failed to update task');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    };

    static async updateOrder(dbClient, taskId, target) {
        let nextTask = false;
        let targetOrder;

        // Tentukan apakah target merujuk ke task berikutnya
        if (target.startsWith("next:")) {
            target = target.substr("next:".length);
            nextTask = true;
        }

        // Ambil task dengan ID target
        const { rows } = await dbClient.query('SELECT * FROM gantt_tasks WHERE id = $1', [target]);

        if (rows.length === 0) {
            return; // Jika tidak ada task target, lanjutkan
        }

        targetOrder = rows[0].sortorder;
        if (nextTask) {
            targetOrder++;
        }

        // Update sortorder untuk task yang lebih besar atau sama dengan targetOrder
        await dbClient.query('UPDATE gantt_tasks SET sortorder = sortorder + 1 WHERE sortorder >= $1', [targetOrder]);

        // Set sortorder untuk task yang sedang diupdate
        await dbClient.query('UPDATE gantt_tasks SET sortorder = $1 WHERE id = $2', [targetOrder, taskId]);
    };

    static async deleteTask(server, taskId) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();
            const query = 'DELETE FROM gantt_tasks WHERE id = $1';
            const result = await dbClient.query(query, [taskId]);

            // If no rows are affected, it means the task was not found
            if (result.rowCount === 0) {
                throw new Error('Task not found');
            }

            return { status: 'deleted' };
        } catch (error) {
            console.error("Error deleting task:", error);
            throw new Error('Failed to delete task');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    };

    static async createBaseline(server, payload) {
        const baseline = payload;
        let dbClient;

        try {
            dbClient = await server.pg.connect();
            const query = `
            INSERT INTO gantt_baselines(task_id, start_date, duration, end_date)
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
            const result = await dbClient.query(query, [
                baseline.task_id,
                baseline.start_date,
                baseline.duration,
                baseline.end_date
            ]);
            const insertedId = result.rows[0].id;

            return { status: 'inserted', id: insertedId };
        } catch (error) {
            console.error("Error inserting baseline:", error);
            throw new Error('Failed to insert baseline');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    static async updateBaseline(server, baselineId, payload) {
        const baseline = payload;
        let dbClient;

        try {
            dbClient = await server.pg.connect();
            const query = `
            UPDATE gantt_baselines
            SET task_id = $1, start_date = $2, duration = $3, end_date = $4
            WHERE id = $5
        `;
            const result = await dbClient.query(query, [
                baseline.task_id,
                baseline.start_date,
                baseline.duration,
                baseline.end_date,
                baselineId
            ]);

            if (result.rowCount === 0) {
                throw new Error('Baseline not found');
            }

            return { status: 'updated' };
        } catch (error) {
            console.error("Error updating baseline:", error);
            throw new Error('Failed to update baseline');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }

    static async deleteBaseline(server, baselineId) {
        let dbClient;

        try {
            dbClient = await server.pg.connect();
            const query = 'DELETE FROM gantt_baselines WHERE id = $1';
            const result = await dbClient.query(query, [baselineId]);

            if (result.rowCount === 0) {
                throw new Error('Baseline not found');
            }

            return { status: 'deleted' };
        } catch (error) {
            console.error("Error deleting baseline:", error);
            throw new Error('Failed to delete baseline');
        } finally {
            if (dbClient) {
                dbClient.release();
            }
        }
    }


}

export default GanttsService;