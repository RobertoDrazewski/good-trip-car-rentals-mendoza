require('dotenv').config(); // 🔥 SIEMPRE EN LA LÍNEA 1
const mysql = require('mysql2');

// 🔍 Lectura inteligente: Busca el formato estándar de tu .env o el formato nativo de Railway
const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway';
const port = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306');

const isRailway = host.includes('rlwy.net') || host.includes('railway');
const isCloud = host !== 'localhost' && host !== '127.0.0.1';

const pool = mysql.createPool({
    host: host,
    user: user,
    password: password, 
    database: database,
    port: port,
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    
    // 🛡️ CONTROL DE SSL
    ssl: isRailway ? false : (isCloud ? { rejectUnauthorized: false } : false)
});

// Verificación inicial con diagnóstico preciso
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.error(`🔍 Detalles del intento: Host [${host}], Puerto [${port}], Usuario [${user}], BD [${database}]`);
    } else {
        let destino = 'LOCAL (MacBook Air)';
        if (isRailway) {
            destino = 'NUBE (Railway)';
        } else if (isCloud) {
            destino = 'NUBE (Remota)';
        }
        
        console.log(`✅ Conexión establecida con éxito hacia: ${destino}`);
        connection.release();
    }
});

module.exports = pool.promise();