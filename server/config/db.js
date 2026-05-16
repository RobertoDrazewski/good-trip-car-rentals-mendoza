require('dotenv').config(); // 🔥 SIEMPRE EN LA LÍNEA 1, antes de cualquier otra lógica
const mysql = require('mysql2');

// Ahora sí process.env.DB_HOST tiene el valor de la nube al evaluar esta línea
const isCloud = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '', 
    database: process.env.DB_NAME || 'mendoza_rentacar',
    
    // 🔌 CONTROL DINÁMICO DE PUERTO
    port: parseInt(process.env.DB_PORT || (isCloud ? '4000' : '3306')),
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    
    // 🛡️ CONTROL DINÁMICO DE SSL
    ssl: isCloud ? { rejectUnauthorized: false } : false
});

// Verificación inicial con un log limpio
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