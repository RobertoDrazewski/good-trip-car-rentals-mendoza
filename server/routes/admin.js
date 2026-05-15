const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 0. VALIDACIÓN DE CARPETAS ---
const uploadDir = 'uploads/autos/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- CONFIGURACIÓN DE ALMACENAMIENTO (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'auto-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const resend = new Resend(process.env.RESEND_API_KEY); 

// --- 1. GESTIÓN DE RESERVAS (ACTUALIZADO CON HORAS) ---

router.post('/nueva-cotizacion', async (req, res) => {
    try {
        const { 
            auto_id, cliente_nombre, cliente_whatsapp, 
            monto_total_ars, 
            desde, hora_inicio, // Ahora recibimos las horas del BookingForm
            hasta, hora_fin,
            entrega, devolucion,
            tasa_dolar_usada
        } = req.body;

        if (!desde || !hasta) {
            return res.status(400).json({ error: "Verifica que las fechas estén seleccionadas." });
        }

        // INSERT ajustado a tu tabla real:
        const queryDB = `
            INSERT INTO reservas 
            (auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, hora_inicio, fecha_fin, hora_fin, lugar_retiro, lugar_devolucion, monto_total_ars, tasa_dolar_usada, estado_reserva, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'pendiente')
        `;

        const [result] = await db.query(queryDB, [
            auto_id, 
            cliente_nombre, 
            cliente_whatsapp, 
            desde, 
            hora_inicio || '10:00', 
            hasta, 
            hora_fin || '10:00',
            entrega || 'Ciudad',
            devolucion || 'Ciudad',
            monto_total_ars,
            tasa_dolar_usada || 0
        ]);

        // Notificación al administrador (Mauricio)
        try {
            await resend.emails.send({
                from: 'Mendoza Rent <onboarding@resend.dev>',
                to: ['goodtripmendoza@gmail.com'],
                subject: `🚨 NUEVA SOLICITUD - ${cliente_nombre}`,
                html: `
                    <h2>Nuevo Lead: ${cliente_nombre}</h2>
                    <p><b>WhatsApp:</b> ${cliente_whatsapp}</p>
                    <p><b>Vehículo ID:</b> ${auto_id}</p>
                    <p><b>Retiro:</b> ${desde} a las ${hora_inicio} hs</p>
                    <p><b>Devolución:</b> ${hasta} a las ${hora_fin} hs</p>
                    <p><b>Monto:</b> $${monto_total_ars}</p>
                `
            });
        } catch (e) { console.error("Error mail notificación:", e.message); }

        res.json({ status: 'success', id: result.insertId });
    } catch (error) {
        console.error("Error reserva:", error);
        res.status(500).json({ error: "Error al procesar reserva" });
    }
});

router.post('/cambiar-estado', async (req, res) => {
    try {
        const { id, estado } = req.body;
        // Ajustamos para que actualice la columna 'estado' de tu ENUM
        await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ status: 'success' });
    } catch (error) { res.status(500).json({ error: "Error servidor" }); }
});

router.delete('/reservas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar" }); }
});

// --- 2. DASHBOARD Y MÉTRICAS ---
router.get('/dashboard', async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT r.*, a.modelo as auto_modelo 
            FROM reservas r 
            LEFT JOIN autos a ON r.auto_id = a.id 
            ORDER BY r.id DESC
        `);
        const [autos] = await db.query('SELECT * FROM autos');
        const [settingsRows] = await db.query('SELECT * FROM settings WHERE id = 1');
        
        // Calculamos ingresos basados en tus estados de ENUM
        const ingresosAprobados = reservas
            .filter(r => r.estado === 'contratado' || r.estado === 'en_curso')
            .reduce((acc, curr) => acc + parseFloat(curr.monto_total_ars || 0), 0);

        res.json({
            autos: autos || [],
            reservas: reservas || [],
            settings: settingsRows[0] || {},
            metrics: {
                ingresosTotales: ingresosAprobados,
                totalReservas: reservas.filter(r => r.estado !== 'rechazado').length
            }
        });
    } catch (error) { res.status(500).json({ error: "Error Dashboard" }); }
});

// --- 3. GESTIÓN DE FLOTA (CON TRASMISIÓN) ---
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

// --- 4. TARIFAS Y PRECIOS ---
// (Mantenemos tu lógica de allowedFields que está perfecta)
router.post('/update-precio-mensual', async (req, res) => {
    try {
        const { mes, anio, campo, valor } = req.body;
        const allowedFields = ['precio_dia', 'cotizacion_dolar', 'cargo_aeropuerto', 'precio_sillita', 'garantia_ars', 'garantia_usd'];
        if (!allowedFields.includes(campo)) return res.status(400).json({error: "Campo no permitido"});

        const query = `INSERT INTO precios_mensuales (mes, anio, ${campo}) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ${campo} = VALUES(${campo})`;
        await db.query(query, [mes, anio, parseFloat(valor) || 0]);
        res.json({ status: 'success' });
    } catch (error) { res.status(500).json({ error: "Error update" }); }
});

// --- 5. STAFF (INVITACIONES) ---
// (Tu lógica de Resend e Invitaciones ya está impecable)

router.post('/invite', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;
        if (!nombre || !email) return res.status(400).json({ error: "Faltan datos." });

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
                html: `<h1>Hola ${nombre}</h1><p>Tu clave temporal es: <b>${tempPass}</b></p>`
            });
        } catch (mailError) { console.error("Error Resend:", mailError.message); }

        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error staff" }); }
});

router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol FROM admins');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error staff" }); }
});

module.exports = router;