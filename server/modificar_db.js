require('dotenv').config();
const db = require('./config/db');

async function actualizarTabla() {
    try {
        console.log("Conectando a Railway...");
        // Comando SQL para agregar la columna 'descuento'
        await db.query(`ALTER TABLE banners_promo ADD COLUMN descuento VARCHAR(10) DEFAULT '0' AFTER imagen_url;`);
        
        console.log("✅ ¡Éxito! Columna 'descuento' agregada a la tabla banners_promo en Railway.");
    } catch (error) {
        // Si arroja error 1060 es porque la columna ya existe, lo cual también es bueno
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("✅ La columna 'descuento' ya existe. Todo listo.");
        } else {
            console.error("❌ Error de SQL:", error.message);
        }
    } finally {
        process.exit();
    }
}

actualizarTabla();