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

// Instancia nativa de Resend vinculada a tus credenciales secretas
const resend = new Resend(process.env.RESEND_API_KEY); 

// 🚨 MODO SANDBOX CONFIGURADO: Usamos 'onboarding@resend.dev' para que salgan los mails en la cuenta gratuita.
// Nota: Recordá que en modo sandbox, Resend SOLO te deja enviar correos a tu propia casilla de registro.
const EMAIL_REMITENTE_OFICIAL = 'Mendoza Rent <onboarding@resend.dev>';

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

        // Notificación Mail de nueva cotización adaptada al Sandbox
        try {
            await resend.emails.send({
                from: EMAIL_REMITENTE_OFICIAL,
                to: [process.env.TEST_EMAIL_DESTINATARIO || 'goodtripmendoza@gmail.com'], // Recordá que en Sandbox debe ser un mail autorizado tuyo
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

router.post('/invite', async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;
        console.log("📥 [INVITE] Petición entrante para creación de Staff:", { nombre, email, rol });

        if (!nombre || !email) {
            return res.status(400).json({ error: "Faltan datos obligatorios: nombre o email." });
        }

        const username = email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 100);
        const tempPass = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(tempPass, 10);
        const fechaActual = new Date(); 

        console.log(`⏳ [INVITE] Registrando en base de datos al usuario: ${username}...`);

        const querySQL = 'INSERT INTO admins (nombre, username, email, password_hash, rol, created_at) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(querySQL, [nombre, username, email, hash, rol || 'admin', fechaActual]);

        console.log("✔️ [INVITE] Fila de administrador asentada en la base de datos.");

        const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const linkActivacion = `${frontUrl}/setup-password?email=${encodeURIComponent(email)}`;

        console.log(`✉️ [INVITE] Despachando paquete de correo electrónico hacia: ${email}...`);

        try {
            await resend.emails.send({
                from: EMAIL_REMITENTE_OFICIAL, 
                to: [email], // Recordá ingresar de destinatario tu mail de admin de la cuenta de Resend para el testeo exitoso
                subject: '🔑 Invitación de Acceso - Panel Good Trip Car Rentals',
                html: `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
                        <div style="margin-bottom: 20px; font-weight: 900; font-style: italic; font-size: 20px; text-transform: uppercase; color: #1e293b;">
                            Good Trip <span style="color: #0ea5e9;">Car Rentals</span>
                        </div>
                        <h2 style="font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; margin-top: 0;">¡Hola, ${nombre}!</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Te han invitado a formar parte del equipo de gestión en el Panel de Control Operativo de Good Trip Mendoza.</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 30px;">Para completar tu registro y activar tu cuenta, hacé clic en el botón de abajo para configurar tu contraseña de seguridad definitiva:</p>
                        
                        <div style="text-align: center; margin-bottom: 30px;">
                            <a href="${linkActivacion}" style="background-color: #1e293b; color: #38bdf8; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(30,41,59,0.15);">
                                Activar Mi Cuenta
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;">
                        <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase; line-height: 1.4; margin: 0;">Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br> <a href="${linkActivacion}" style="color: #0ea5e9; text-decoration: none;">${linkActivacion}</a></p>
                    </div>
                `
            });
            console.log(`✉️ [INVITE] Mail entregado a la cola de Resend de forma exitosa.`);
        } catch (mailError) { 
            console.error("❌ [INVITE] Error aislado en plataforma Resend:", mailError.message); 
        }

        res.json({ status: 'success' });
    } catch (err) { 
        console.error("❌ [INVITE] ERROR CRÍTICO EN EL ENDPOINT:", err);
        res.status(500).json({ error: "Error interno en el servidor al procesar el alta.", detalles: err.message }); 
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: "Error al eliminar usuario" }); }
});

module.exports = router;