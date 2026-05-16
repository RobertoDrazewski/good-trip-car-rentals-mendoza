require('dotenv').config(); // 🔥 SIEMPRE EN LA LÍNEA 1
const mysql = require('mysql2');

// 🔍 Identificamos dinámicamente a dónde nos estamos conectando
const host = process.env.DB_HOST || 'localhost';
const isRailway = host.includes('rlwy.net');
const isCloud = host !== 'localhost' && host !== '127.0.0.1';

const pool = mysql.createPool({
    host: host,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'railway',
    
    // 🔌 PUERTO DINÁMICO: Lee el del .env (42374), si no el de Railway por defecto (3306)
    port: parseInt(process.env.DB_PORT || '3306'),
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    
    // 🛡️ CONTROL DE SSL: Railway NO requiere SSL obligatorio como TiDB.
    // Esto evita bloqueos de conexión innecesarios desde Render.
    ssl: isRailway ? false : (isCloud ? { rejectUnauthorized: false } : false)
});

// Verificación inicial con diagnóstico preciso
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        // Genera el cartel correcto de manera inteligente
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