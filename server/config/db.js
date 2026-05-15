const mysql = require('mysql2');
require('dotenv').config();

// Verificamos si estamos apuntando a la nube leyendo el HOST del archivo .env
const isCloud = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'mendoza_rentacar',
    
    // 🔌 CONTROL DINÁMICO DE PUERTO: Si es la nube usa el puerto que le indiques (ej: 4000), si no, el 3306 nativo
    port: parseInt(process.env.DB_PORT || (isCloud ? '4000' : '3306')),
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    
    // 🛡️ CONTROL DINÁMICO DE SSL: Obligatorio para TiDB en la nube, pero deshabilitado para tu localhost
    ssl: isCloud ? { rejectUnauthorized: false } : false
});

// Verificación inicial con un log limpio para saber exactamente a dónde se conectó
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        const destino = isCloud ? 'NUBE (TiDB Cloud)' : 'LOCAL (XAMPP / Laragon)';
        console.log(`✅ Conexión establecida con éxito hacia: ${destino}`);
        connection.release();
    }
});

module.exports = pool.promise();