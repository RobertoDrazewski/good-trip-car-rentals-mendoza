const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// --- 0. CONFIGURACIÓN Y DIRECTORIOS ---
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_REMITENTE_OFICIAL = 'Mendoza Rent <onboarding@resend.dev>';
const EMAIL_MAURICIO_SUPERADMIN = 'goodtripmendoza@gmail.com';

// Verificar carpetas de subida
const uploadAutosDir = path.join(__dirname, '../uploads/autos/');
const uploadRoutesDir = path.join(__dirname, '../uploads/routes/');
[uploadAutosDir, uploadRoutesDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configuración de Multer para Autos
const storageAutos = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadAutosDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'auto-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadAutos = multer({ storage: storageAutos });

// --- 1. GESTIÓN DE TARIFAS MENSUALES (CRÍTICO) ---

// Obtener todos los precios
router.get('/precios-mensuales', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM precios_mensuales ORDER BY anio DESC, mes ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar tarifas." });
    }
});

// Actualizar o Crear Tarifa (Lógica UPSERT)
router.post('/update-precio-mensual', async (req, res) => {
    try {
        const { mes, anio, campo, valor } = req.body;
        
        // Lista blanca de campos permitidos para seguridad
        const camposPermitidos = [
            'precio_dia', 'cotizacion_dolar', 'precio_sillita', 
            'cargo_aeropuerto', 'garantia_ars', 'garantia_usd', 'precio_lavado'
        ];

        if (!camposPermitidos.includes(campo)) {
            return res.status(400).json({ error: "Campo no válido." });
        }

        const valorFinal = parseFloat(valor) || 0;

        // Requiere que la tabla tenga UNIQUE KEY (mes, anio)
        const query = `
            INSERT INTO precios_mensuales (mes, anio, \`${campo}\`) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE \`${campo}\` = ?
        `;
        
        await db.query(query, [mes, anio, valorFinal, valorFinal]);
        res.json({ status: 'success' });
    } catch (error) {
        console.error("❌ Error Update Precios:", error);
        res.status(500).json({ error: "Error al guardar tarifa." });
    }
});

// --- 2. GESTIÓN DE RESERVAS ---

router.get('/dashboard', async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT r.*, a.modelo as auto_modelo, a.patente 
            FROM reservas r 
            LEFT JOIN autos a ON r.auto_id = a.id 
            ORDER BY r.id DESC
        `);
        const [autos] = await db.query('SELECT * FROM autos');
        // Traemos la configuración más reciente para el dashboard
        const [settings] = await db.query('SELECT * FROM precios_mensuales ORDER BY id DESC LIMIT 1');
        
        const ingresosAprobados = reservas
            .filter(r => r.estado === 'contratado' || r.estado === 'confirmado')
            .reduce((acc, curr) => acc + parseFloat(curr.monto_total_ars || 0), 0);

        res.json({
            autos,
            reservas,
            settings: settings[0] || {},
            metrics: {
                ingresosTotales: ingresosAprobados,
                totalReservas: reservas.filter(r => r.estado !== 'rechazado').length
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Error en Dashboard" });
    }
});

router.post('/cambiar-estado', async (req, res) => {
    try {
        const { id, estado } = req.body;
        await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ status: 'success' });
    } catch (error) { res.status(500).json({ error: "Error de estado" }); }
});

router.delete('/reservas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar" }); }
});

// --- 3. FLOTA (AUTOS) ---

router.post('/autos', uploadAutos.single('imagen'), async (req, res) => {
    try {
        const { modelo, transmision, precio_base_usd, patente, color, descripcion_larga } = req.body;
        const imagen_url = req.file ? `/uploads/autos/${req.file.filename}` : null;

        const query = `
            INSERT INTO autos (modelo, patente, color, transmision, precio_base_usd, imagen_url, descripcion_larga, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Disponible')
        `;
        await db.query(query, [modelo, patente, color, transmision, precio_base_usd, imagen_url, descripcion_larga]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al crear auto" }); }
});

router.delete('/autos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM autos WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar auto" }); }
});

// --- 4. GESTIÓN DE STAFF ---

router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol, username FROM admins');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error al listar staff" }); }
});

router.post('/invite', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;
        const emailLimpio = String(email).trim().toLowerCase();
        const username = emailLimpio.split('@')[0] + Math.floor(100 + Math.random() * 900);
        const passwordPlana = crypto.randomBytes(4).toString('hex').toUpperCase();
        const hash = await bcrypt.hash(passwordPlana, 10);

        await db.query(
            'INSERT INTO admins (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, username, emailLimpio, hash, rol || 'admin']
        );

        // Notificar al SuperAdmin
        try {
            await resend.emails.send({
                from: EMAIL_REMITENTE_OFICIAL,
                to: [EMAIL_MAURICIO_SUPERADMIN],
                subject: `🔑 Nuevo Acceso Staff: ${nombre}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h3>Credenciales para ${nombre}</h3>
                        <p><b>Usuario:</b> ${username}</p>
                        <p><b>Password:</b> ${passwordPlana}</p>
                        <p>Envíale estos datos al colaborador.</p>
                    </div>
                `
            });
        } catch (e) { console.error("Error envío mail staff:", e.message); }

        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ error: "Error al crear usuario", details: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;