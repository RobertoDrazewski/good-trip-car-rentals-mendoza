const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); // Requerido para la generación segura de claves directas

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

// Instancia nativa de Resend vinculada a tus credenciales secretas
const resend = new Resend(process.env.RESEND_API_KEY); 

// 🚨 CONFIGURACIÓN INTEGRADA: Casilla verificada para que Mauricio reciba el entregable listo
const EMAIL_REMITENTE_OFICIAL = 'Mendoza Rent <onboarding@resend.dev>';
const EMAIL_MAURICIO_SUPERADMIN = 'goodtripmendoza@gmail.com';

// --- 1. GESTIÓN DE RESERVAS MAESTRA ---

// Ruta pública para recolectar las solicitudes de clientes web
router.post('/nueva-cotizacion', async (req, res) => {
    try {
        console.log("➡️ Recibiendo Lead en Backend, parseando payload...");

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
        
        const sillita = req.body.sillita === true || req.body.sillita == 1 || String(req.body.sillita) === 'true' || String(req.body.sillita) === '1' ? 1 : 0;

        if (!fecha_inicio || !fecha_fin || !auto_id || !cliente_nombre) {
            return res.status(400).json({ error: "Faltan datos obligatorios (fechas, nombre o vehículo)." });
        }

        const queryDB = `
            INSERT INTO reservas 
            (auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, hora_inicio, fecha_fin, hora_fin, lugar_retiro, lugar_devolucion, monto_total_ars, tasa_dolar_usada, garantia_usd, sillita, estado_reserva, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'pendiente')
        `;

        const [result] = await db.query(queryDB, [
            auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, hora_inicio, fecha_fin, hora_fin,
            lugar_retiro, lugar_devolucion, monto_total_ars, tasa_dolar_usada, garantia_usd, sillita
        ]);

        console.log(`✔️ Reserva ID ${result.insertId} insertada con éxito.`);

        try {
            await resend.emails.send({
                from: EMAIL_REMITENTE_OFICIAL,
                to: [process.env.TEST_EMAIL_DESTINATARIO || EMAIL_MAURICIO_SUPERADMIN], 
                subject: `🚨 NUEVA SOLICITUD - ${cliente_nombre}`,
                html: `
                    <div style="font-family: sans-serif; border: 1px solid #f1f5f9; padding: 25px; border-radius: 16px; max-width: 600px; color: #334155;">
                        <h2 style="color: #0ea5e9; font-style: italic; text-transform: uppercase;">Nuevo Lead: ${cliente_nombre}</h2>
                        <p style="font-size: 14px;"><b>WhatsApp:</b> ${cliente_whatsapp}</p>
                        <p style="font-size: 14px;"><b>Vehículo ID:</b> ${auto_id}</p>
                        <p style="font-size: 14px;"><b>Retiro:</b> ${fecha_inicio} (${hora_inicio} hs) - 📍 ${lugar_retiro}</p>
                        <p style="font-size: 14px;"><b>Devolución:</b> ${fecha_fin} (${hora_fin} hs) - 📍 ${lugar_devolucion}</p>
                        <p style="font-size: 14px;"><b>Sillita Bebé:</b> ${sillita === 1 ? 'Sí ✔️' : 'No ❌'}</p>
                        <p style="font-size: 16px; color: #10b981; font-weight: bold;"><b>Monto Estimado:</b> $${monto_total_ars.toLocaleString('es-AR')} ARS</p>
                        <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0;">
                        <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Gestionar desde el panel de administración de Good Trip.</p>
                    </div>
                `
            });
        } catch (e) { console.error("Error enviando correo con Resend:", e.message); }

        res.json({ status: 'success', id: result.insertId });
    } catch (error) {
        console.error("❌ Error en endpoint nueva-cotizacion:", error);
        res.status(500).json({ error: "Error al procesar la reserva." });
    }
});

router.post('/cambiar-estado', async (req, res) => {
    try {
        const { id, estado } = req.body;
        await db.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ status: 'success' });
    } catch (error) { res.status(500).json({ error: "Error al actualizar estado" }); }
});

router.post('/cambiar-estado-garantia', async (req, res) => {
    try {
        const { id, garantia_estado } = req.body;
        await db.query('UPDATE reservas SET estado_reserva = ? WHERE id = ?', [garantia_estado, id]);
        res.json({ status: 'success', message: 'Estado de garantía actualizado' });
    } catch (error) { res.status(500).json({ error: "Error al actualizar estado de garantía" }); }
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
    } catch (error) { res.status(500).json({ error: "Error cargando Dashboard" }); }
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
    } catch (err) { res.status(500).json({ error: "Error al crear auto" }); }
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
    } catch (error) { res.status(500).json({ error: "Error en el servidor al traer precios." }); }
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
    } catch (error) { res.status(500).json({ error: "Error en actualización de precios" }); }
});

// --- 5. GESTIÓN DE STAFF / USUARIOS ---
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, email, rol FROM admins');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error al listar usuarios" }); }
});

// 🛠️ PARCHE OPERATIVO FINAL: Alta directa, generación de contraseñas de fondo y entrega limpia a Mauricio
router.post('/invite', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;
        console.log("📥 [ALTA DIRECTA] Mauricio está procesando la creación de un nuevo Staff:", { nombre, email, rol });

        if (!nombre || !email) {
            return res.status(400).json({ error: "Faltan datos obligatorios: nombre o email." });
        }

        const emailLimpio = String(email).trim().toLowerCase();
        
        // Generación automatizada de credenciales operativas listas para producción
        const username = emailLimpio.split('@')[0].toLowerCase() + Math.floor(100 + Math.random() * 900);
        const passwordPlanaGenerada = crypto.randomBytes(4).toString('hex').toUpperCase(); // Ej: B3A9E2D1
        const hash = await bcrypt.hash(passwordPlanaGenerada, 10);
        const fechaActual = new Date(); 

        console.log(`⏳ [ALTA DIRECTA] Guardando en base de datos al usuario activo: ${username}...`);

        // Insertamos el registro definitivo del empleado usando SU mail real (Evita errores de duplicado)
        const querySQL = 'INSERT INTO admins (nombre, username, email, password_hash, rol, created_at) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(querySQL, [nombre, username, emailLimpio, hash, rol || 'admin', fechaActual]);

        console.log("✔️ [ALTA DIRECTA] Fila de administrador asentada con éxito.");

        const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Despachamos la plantilla con las claves finales únicamente a la dirección de Mauricio
        try {
            await resend.emails.send({
                from: EMAIL_REMITENTE_OFICIAL, 
                to: [EMAIL_MAURICIO_SUPERADMIN], 
                subject: `🔑 Credenciales Listas — Gestión de Staff (${nombre})`,
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
                        <div style="margin-bottom: 20px; font-weight: 900; font-style: italic; font-size: 20px; text-transform: uppercase; color: #1e293b;">
                            Good Trip <span style="color: #0ea5e9;">Car Rentals</span>
                        </div>
                        <h2 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 0;">¡Hola Mauricio!</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">La cuenta para el colaborador <b>${nombre}</b> fue generada y activada directamente en el motor del sistema.</p>
                        
                        <p style="font-size: 13px; font-weight: bold; color: #0ea5e9; text-transform: uppercase; margin-top: 25px; margin-bottom: 10px;">📋 Reenvía este bloque de accesos al nuevo operador:</p>
                        
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 14px; text-align: left; font-family: monospace; font-size: 14px; line-height: 1.8; color: #0f172a;">
                            <b>Link de Acceso:</b> ${frontUrl}/login <br>
                            <b>Usuario asignado:</b> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${username}</span> <br>
                            <b>Contraseña provisoria:</b> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${passwordPlanaGenerada}</span>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;">
                        <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; line-height: 1.4; margin: 0; text-align: center;"><em>Tip: Puedes reenviar este correo directamente o copiar los datos de acceso para mandárselos de forma inmediata por WhatsApp.</em></p>
                    </div>
                `
            });
            console.log(`✉️ [ALTA DIRECTA] Credenciales enviadas de forma exitosa a la bandeja de Mauricio.`);
        } catch (mailError) { 
            console.error("❌ [ALTA DIRECTA] Falla aislada en plataforma Resend:", mailError.message); 
        }

        res.json({ status: 'success' });
    } catch (err) { 
        console.error("❌ [ALTA DIRECTA] ERROR EN EL ENDPOINT:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Ese correo electrónico ya está registrado en el staff de la empresa." });
        }
        res.status(500).json({ error: "Error interno en el servidor al procesar el alta.", detalles: err.message }); 
    }
});

// Se preserva el endpoint complete-setup intacto por estricta retrocompatibilidad
router.post('/complete-setup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Faltan datos." });
        const emailSanitizado = String(email).trim().toLowerCase();
        const [users] = await db.query('SELECT username FROM admins WHERE email = ?', [emailSanitizado]);
        if (users.length === 0) return res.status(404).json({ error: "No existe." });
        const hashDefinitivo = await bcrypt.hash(password, 10);
        await db.query('UPDATE admins SET password_hash = ? WHERE email = ?', [hashDefinitivo, emailSanitizado]);
        res.json({ status: 'success', username: users[0].username });
    } catch (error) { res.status(500).json({ error: "Error." }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar usuario" }); }
});

module.exports = router;