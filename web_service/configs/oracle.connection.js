
// oracledb version 5.5.0
import OracleDB from 'oracledb';
import 'dotenv/config'

const dbUser = process.env.DB_USER_ORACLE;
const dbPassword = process.env.DB_PASSWORD_ORACLE;
const dbName = process.env.DB_NAME_ORACLE;
const dbHost = process.env.DB_HOST_ORACLE;
const dbPort = process.env.DB_PORT_ORACLE;

async function openConnection() {
    let connection;
    try {
        // Mengatur koneksi
        connection = await OracleDB.getConnection({
            user: dbUser,
            password: dbPassword,
            connectString: `${dbHost}:${dbPort}/${dbName}`
        });
        return connection;
    } catch (err) {
        console.error('Err open connection :' + err);
        throw err;
    }
}

async function closeConnection(connection) {
    try {
        if (connection) {
            await connection.close();
        }
    } catch (err) {
        console.error('Err close connection :' + err);

        throw err; // Melempar kesalahan agar dapat ditangkap di tempat lain
    }
}

export default { openConnection, closeConnection };


