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

// USA SIEMPRE LA VARIABLE DE ENTORNO. Si no está, Resend lanzará un error claro.
const resend = new Resend(process.env.RESEND_API_KEY); 

// --- 1. GESTIÓN DE RESERVAS ---

router.post('/nueva-cotizacion', async (req, res) => {
    try {
        const { 
            auto_id, cliente_nombre, cliente_whatsapp, 
            monto_total_ars, 
            desde, fecha_inicio,
            hasta, fecha_fin 
        } = req.body;

        const f_inicio = desde || fecha_inicio;
        const f_fin = hasta || fecha_fin;

        if (!f_inicio || !f_fin) {
            return res.status(400).json({ error: "Verifica que las fechas estén seleccionadas." });
        }

        const queryDB = `
            INSERT INTO reservas 
            (auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, fecha_fin, monto_total_ars, estado) 
            VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
        `;

        const [result] = await db.query(queryDB, [
            auto_id, cliente_nombre, cliente_whatsapp, f_inicio, f_fin, monto_total_ars
        ]);

        // Notificación al administrador (Mauricio)
        try {
            await resend.emails.send({
                from: 'Mendoza Rent <onboarding@resend.dev>',
                to: ['goodtripmendoza@gmail.com'],
                subject: `🚨 NUEVA SOLICITUD - ${cliente_nombre}`,
                html: `<b>Nuevo Lead:</b> ${cliente_nombre}<br><b>WhatsApp:</b> ${cliente_whatsapp}<br><b>Monto:</b> $${monto_total_ars}`
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

// --- 3. GESTIÓN DE FLOTA ---
router.post('/autos', upload.single('imagen'), async (req, res) => {
    try {
        const { modelo, transmision, precio_base_usd, patente, color, descripcion_larga } = req.body;
        const imagen_url = req.file ? `/uploads/autos/${req.file.filename}` : null;

        const query = `
            INSERT INTO autos (modelo, patente, color, transmision, precio_base_usd, imagen_url, descripcion_larga, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Disponible')
        `;
        
        await db.query(query, [modelo, patente, color, transmision, precio_base_usd, imagen_url, descripcion_larga]);
        res.json({ status: 'success' });
    } catch (err) { 
        console.error("Error auto:", err);
        res.status(500).json({ error: "Error al crear auto" }); 
    }
});

router.delete('/autos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM autos WHERE id = ?', [id]);
        if (result.affectedRows > 0) return res.json({ status: 'success' });
        res.status(404).json({ error: "No encontrado" });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar: el auto tiene reservas activas." });
        }
        res.status(500).json({ error: "Error técnico" });
    }
});

// --- 4. TARIFAS MENSUALES ---
router.get('/precios-mensuales', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM precios_mensuales WHERE anio = 2026 ORDER BY mes ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: "Error precios" }); }
});

router.post('/update-precio-mensual', async (req, res) => {
    try {
        const { mes, anio, campo, valor } = req.body;
        // Sanitización básica del nombre del campo para evitar inyección SQL
        const allowedFields = ['precio_dia', 'cotizacion_dolar', 'cargo_aeropuerto', 'precio_sillita', 'garantia_ars', 'garantia_usd'];
        if (!allowedFields.includes(campo)) return res.status(400).json({error: "Campo no permitido"});

        const query = `INSERT INTO precios_mensuales (mes, anio, ${campo}) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ${campo} = VALUES(${campo})`;
        await db.query(query, [mes, anio, parseFloat(valor) || 0]);
        res.json({ status: 'success' });
    } catch (error) { res.status(500).json({ error: "Error update" }); }
});

// --- 5. STAFF (ADMINS) - INVITACIÓN SEGURA ---

router.post('/invite', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;

        if (!nombre || !email) {
            return res.status(400).json({ error: "Faltan datos obligatorios." });
        }

        const tempPass = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(tempPass, 10);
        const username = email.split('@')[0] + Math.floor(Math.random() * 100);

        // Guardar en DB
        await db.query(
            'INSERT INTO admins (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)', 
            [nombre, username, email, hash, rol || 'admin']
        );

        // ENVÍO DE MAIL VÍA RESEND
        try {
            await resend.emails.send({
                from: 'Mendoza Rent <onboarding@resend.dev>', 
                to: [email],
                subject: '🔑 Invitación al Panel de Control - Mendoza Rent',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-style: italic;">MENDOZA<span style="color: #eab308;">RENT</span></h1>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="color: #0f172a;">¡Hola, ${nombre}!</h2>
                            <p style="color: #64748b;">Has sido invitado como colaborador al panel administrativo de <b>Mendoza Rent Pro</b>.</p>
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #f1f5f9;">
                                <p style="margin: 0; color: #0f172a;"><strong>Usuario:</strong> ${email}</p>
                                <p style="margin: 10px 0 0 0; color: #0f172a;"><strong>Contraseña Temporal:</strong> <span style="color: #854d0e; font-weight: bold; background: #fefce8; padding: 2px 6px; border-radius: 4px;">${tempPass}</span></p>
                            </div>
                            <p style="color: #64748b; font-size: 14px;">Ingresa al panel y cambia tu contraseña lo antes posible.</p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="http://localhost:5173/login" style="background-color: #eab308; color: #0f172a; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block;">INGRESAR AL PANEL</a>
                            </div>
                        </div>
                    </div>
                `
            });
            console.log(`✅ Mail de invitación enviado a: ${email}`);
        } catch (mailError) {
            console.error("❌ Falló Resend:", mailError.message);
        }

        res.json({ status: 'success', message: 'Staff invitado correctamente' });

    } catch (err) {
        console.error("❌ Error en invite:", err);
        res.status(500).json({ error: "Error en el servidor al invitar staff" });
    }
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