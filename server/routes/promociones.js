const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==========================================
// 1. GENERAR PROPUESTA CON IA (Sin cambios críticos, solo asegurando estabilidad)
// ==========================================
router.post('/generar-propuesta', async (req, res) => {
    // ... (Mantén tu lógica actual de generación tal cual, funciona bien)
    // Asegúrate de que el retorno final coincida con el frontend
    try {
        const { evento, descuento } = req.body;
        // ... tu lógica de generación de imagen e IA ...
        // Responde con: res.json({ descripcion: descripcionFinal, imagen_url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: "Error en servidor IA" });
    }
});

// ==========================================
// 2. NUEVO: CONSULTAR TODAS LAS PROMOCIONES ACTIVAS (Para el carrusel)
// ==========================================
router.get('/all-active', async (req, res) => {
    try {
        // Obtenemos todas las promociones que sean válidas (opcionalmente podrías filtrar por fecha)
        const [rows] = await db.query(
            `SELECT * FROM banners_promo WHERE fecha_fin >= CURDATE() ORDER BY id DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error consultando todas las promos:", error);
        res.status(500).json({ error: "Error de lectura DB." });
    }
});

// ==========================================
// 3. GUARDAR BANNER (Mantener igual, está bien)
// ==========================================
router.post('/save-promo', async (req, res) => {
    try {
        let { titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin } = req.body;
        const nombreArchivo = `promo_${Date.now()}.png`;
        const rutaDirectorio = path.join(__dirname, '../uploads/banner');
        const rutaImagenLocal = path.join(rutaDirectorio, nombreArchivo);

        if (!fs.existsSync(rutaDirectorio)) fs.mkdirSync(rutaDirectorio, { recursive: true });

        if (imagen_url.startsWith('data:image') || imagen_url.startsWith('iVBORw0Gg')) {
            const cleanBase64 = imagen_url.replace(/^data:image\/\w+;base64,/, "");
            fs.writeFileSync(rutaImagenLocal, Buffer.from(cleanBase64, 'base64'));
        } else {
            const response = await axios({ url: imagen_url, responseType: 'stream' });
            const writer = fs.createWriteStream(rutaImagenLocal);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
        }

        const dbPath = `/uploads/banner/${nombreArchivo}`;
        await db.query(
            `INSERT INTO banners_promo (titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion, dbPath, descuento, fecha_inicio, fecha_fin]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "No se pudo almacenar la promoción." });
    }
});

// ==========================================
// 4. CONSULTAR BANNER ACTIVO (Legacy, para compatibilidad)
// ==========================================
router.get('/active', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM banners_promo ORDER BY id DESC LIMIT 1`);
        res.json(rows.length > 0 ? rows[0] : null);
    } catch (error) {
        res.status(500).json({ error: "Error de lectura DB." });
    }
});

// ==========================================
// 5. ELIMINAR Y LISTAR (Mantener como los tenías)
// ==========================================
router.get('/all', async (req, res) => { /* ... */ });
router.delete('/:id', async (req, res) => { /* ... */ });

module.exports = router;