const mysql = require('mysql2');
require('dotenv').config();

// Creamos el pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    // IMPORTANTE: Asegúrate que en tu .env diga DB_PASS o DB_PASSWORD
    // Aquí pruebo ambos por si acaso
    password: process.env.DB_PASS || process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'mendoza_rentacar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Agregamos esto para que la conexión no se cierre por inactividad
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Verificación inicial de conexión (Para que veas en consola si falló el login a la DB)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        console.log('✅ Conexión a la base de datos "mendoza_rentacar" establecida.');
        connection.release();
    }
});

module.exports = pool.promise();