const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 0. VALIDACIÓN DE CARPETAS ---
const uploadDir = path.join(__dirname, '../uploads/autos/');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'auto-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const resend = new Resend(process.env.RESEND_API_KEY); 

// --- 1. GESTIÓN DE RESERVAS MAESTRA ---

// Ruta pública para recolectar las solicitudes de clientes web
router.post('/nueva-cotizacion', async (req, res) => {
    try {
        console.log("➡️ Recibiendo Lead en Backend, parseando payload...");

        // BLINDAJE EXTRACTOR: Soporta tanto los nombres del Formulario como de la BD
        const auto_id = req.body.auto_id;
        const cliente_nombre = req.body.cliente_nombre;
        const cliente_whatsapp = req.body.cliente_whatsapp;
        const fecha_inicio = req.body.fecha_inicio || req.body.desde;
        const hora_inicio = req.body.hora_inicio || '10:00:00';
        const fecha_fin = req.body.fecha_fin || req.body.hasta;
        const hora_fin = req.body.hora_fin || '10:00:00';
        const lugar_retiro = req.body.lugar_retiro || req.body.entrega || 'mendoza ciudad';
        const lugar_devolucion = req.body.lugar_devolucion || req.body.devolucion || 'mendoza ciudad';
        const monto_total_ars = parseFloat(req.body.monto_total_ars || 0);
        const tasa_dolar_usada = parseFloat(req.body.tasa_dolar_usada || req.body.cotizacion || 1400.00);
        const garantia_usd = parseFloat(req.body.garantia_usd || 300.00);
        
        // Mapeo exacto para la columna 'sillita' TINYINT(1)
        const sillita = req.body.sillita === true || req.body.sillita == 1 || String(req.body.sillita) === 'true' || String(req.body.sillita) === '1' ? 1 : 0;

        // Validación estructural inquebrantable
        if (!fecha_inicio || !fecha_fin || !auto_id || !cliente_nombre) {
            return res.status(400).json({ error: "Faltan datos obligatorios (fechas, nombre o vehículo)." });
        }

        // QUERY REPARADA: Inyecta las 15 columnas exactas de tu tabla de MySQL
        const queryDB = `
            INSERT INTO reservas 
            (auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, hora_inicio, fecha_fin, hora_fin, lugar_retiro, lugar_devolucion, monto_total_ars, tasa_dolar_usada, garantia_usd, sillita, estado_reserva, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'pendiente')
        `;

        const [result] = await db.query(queryDB, [
            auto_id, 
            cliente_nombre, 
            cliente_whatsapp, 
            fecha_inicio, 
            hora_inicio, 
            fecha_fin, 
            hora_fin,
            lugar_retiro, 
            lugar_devolucion,
            monto_total_ars, 
            tasa_dolar_usada,
            garantia_usd,
            sillita
        ]);

        console.log(`✔️ Reserva ID ${result.insertId} insertada con éxito en la Base de Datos.`);

        // Notificación Mail automatizada
        try {
            await resend.emails.send({
                from: 'Mendoza Rent <onboarding@resend.dev>',
                to: ['goodtripmendoza@gmail.com'],
                subject: `🚨 NUEVA SOLICITUD - ${cliente_nombre}`,
                html: `
                    <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #EAB308;">Nuevo Lead: ${cliente_nombre}</h2>
                        <p><b>WhatsApp:</b> ${cliente_whatsapp}</p>
                        <p><b>Vehículo ID:</b> ${auto_id}</p>
                        <p><b>Retiro:</b> ${fecha_inicio} (${hora_inicio} hs) - 📍 ${lugar_retiro}</p>
                        <p><b>Devolución:</b> ${fecha_fin} (${hora_fin} hs) - 📍 ${lugar_devolucion}</p>
                        <p><b>Sillita Bebé:</b> ${sillita === 1 ? 'Sí ✔️' : 'No ❌'}</p>
                        <p><b>Monto Estimado:</b> $${monto_total_ars.toLocaleString('es-AR')} ARS</p>
                        <hr>
                        <p style="font-size: 10px; color: #999;">Gestionar desde el panel de administración.</p>
                    </div>
                `
            });
        } catch (e) { console.error("Error enviando correo con Resend:", e.message); }

        res.json({ status: 'success', id: result.insertId });
    } catch (error) {
        console.error("❌ Error grave en endpoint nueva-cotizacion:", error);
        res.status(500).json({ error: "Error al procesar la reserva en la base de datos.", detalles: error.message });
    }
});

router.post('/cambiar-estado', async (req, res) => {
    try {
        const { id, estado } = req.body;
        await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ status: 'success' });
    } catch (error) { res.status(500).json({ error: "Error al actualizar estado" }); }
});

// CORREGIDO: Ruta limpia sin acentos ni caracteres unicode especiales para sincronizar con el Front
router.post('/cambiar-estado-garantia', async (req, res) => {
    try {
        const { id, garantia_estado } = req.body;
        console.log(`➡️ Actualizando garantía de reserva ID ${id} a estado: ${garantia_estado}`);
        await db.query('UPDATE reservas SET estado_reserva = ? WHERE id = ?', [garantia_estado, id]);
        res.json({ status: 'success', message: 'Estado de garantía actualizado' });
    } catch (error) { 
        console.error("❌ Error al actualizar estado de garantía:", error);
        res.status(500).json({ error: "Error al actualizar estado de garantía" }); 
    }
});

router.delete('/reservas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar" }); }
});

// --- 2. DASHBOARD ---
router.get('/dashboard', async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT r.*, a.modelo as auto_modelo, a.patente 
            FROM reservas r 
            LEFT JOIN autos a ON r.auto_id = a.id 
            ORDER BY r.id DESC
        `);
        const [autos] = await db.query('SELECT * FROM autos');
        const [settings] = await db.query('SELECT * FROM precios_mensuales ORDER BY id DESC LIMIT 1');
        
        const ingresosAprobados = reservas
            .filter(r => r.estado === 'contratado' || r.estado === 'confirmado')
            .reduce((acc, curr) => acc + parseFloat(curr.monto_total_ars || 0), 0);

        res.json({
            autos,
            reservas,
            settings: settings[0] || { precio_dia: 0, cotizacion_dolar: 1400, garantia_ars: 450000 },
            metrics: {
                ingresosTotales: ingresosAprobados,
                totalReservas: reservas.filter(r => r.estado !== 'rechazado').length
            }
        });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Error cargando Dashboard" }); 
    }
});

// --- 3. FLOTA ---
router.post('/autos', upload.single('imagen'), async (req, res) => {
    try {
        const { modelo, transmision, precio_base_usd, patente, color, descripcion_larga } = req.body;
        const imagen_url = req.file ? `/uploads/autos/${req.file.filename}` : null;

        const query = `
            INSERT INTO autos (modelo, patente, color, transmision, precio_base_usd, imagen_url, descripcion_larga, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Disponible')
        `;
        
        await db.query(query, [modelo, patente, color, transmision || 'Manual', precio_base_usd, imagen_url, descripcion_larga]);
        res.json({ status: 'success' });
    } catch (err) { 
        console.error("Error auto:", err);
        res.status(500).json({ error: "Error al crear auto" }); 
    }
});

router.delete('/autos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM autos WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar auto" }); }
});

// --- 4. PRECIOS MENSUALES ---
router.get('/precios-mensuales', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM precios_mensuales ORDER BY mes ASC');
        res.json(rows);
    } catch (error) {
        console.error("Error tarifas mensuales:", error);
        res.status(500).json({ error: "Error en el servidor al traer precios." });
    }
});

router.post('/update-precio-mensual', async (req, res) => {
    try {
        const { mes, anio, campo, valor } = req.body;
        const query = `
            INSERT INTO precios_mensuales (mes, anio, \`${campo}\`) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE \`${campo}\` = VALUES(\`${campo}\`)
        `;
        await db.query(query, [mes, anio, parseFloat(valor) || 0]);
        res.json({ status: 'success' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Error en actualización de precios" }); 
    }
});

// --- 5. GESTIÓN DE STAFF / USUARIOS ---
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol FROM admins');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error al listar usuarios" }); }
});

router.post('/invite', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;
        if (!nombre || !email) return res.status(400).json({ error: "Faltan datos obligatorios." });

        const tempPass = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(tempPass, 10);
        const username = email.split('@')[0] + Math.floor(Math.random() * 100);

        await db.query('INSERT INTO admins (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)', 
        [nombre, username, email, hash, rol || 'admin']);

        try {
            await resend.emails.send({
                from: 'Mendoza Rent <onboarding@resend.dev>', 
                to: [email],
                subject: '🔑 Invitación Staff - Mendoza Rent',
                html: `<h1>Hola ${nombre}</h1><p>Tu clave temporal de acceso es: <b>${tempPass}</b></p>`
            });
        } catch (mailError) { console.error("Error Resend:", mailError.message); }

        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al invitar personal" }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar usuario" }); }
});

module.exports = router;