const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/generar-propuesta', async (req, res) => {
    try {
        const { evento, descuento } = req.body;
        
        if (!evento || !descuento) {
            return res.status(400).json({ error: "Datos incompletos." });
        }

        // Generación de texto
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: `Crea un copy muy corto (máximo 15 palabras) para alquiler de autos. Evento: ${evento}, Descuento: ${descuento}%.` }]
        });

        // Generación de imagen
        const image = await openai.images.generate({
            model: "dall-e-2",
            prompt: `Landscape banner for car rental, focus on ${evento}.`,
            n: 1,
            size: "1024x1024",
        });

        res.json({
            descripcion: completion.choices[0].message.content,
            imagen_url: image.data[0].url
        });
    } catch (error) { 
        console.error("Error en /generar-propuesta:", error);
        res.status(500).json({ error: "Error en la generación." }); 
    }
});

router.post('/save-promo', async (req, res) => {
    try {
        const { titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin } = req.body;

        const nombreArchivo = `promo_${Date.now()}.png`;
        const rutaDirectorio = path.join(__dirname, '../public/uploads');
        const rutaImagenLocal = path.join(rutaDirectorio, nombreArchivo);

        if (!fs.existsSync(rutaDirectorio)) fs.mkdirSync(rutaDirectorio, { recursive: true });

        const response = await axios({ url: imagen_url, responseType: 'stream' });
        const writer = fs.createWriteStream(rutaImagenLocal);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await db.query(`UPDATE banners SET activo = 0 WHERE activo = 1`);
        await db.query(`INSERT INTO banners (titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin, activo) VALUES (?, ?, ?, ?, ?, ?, 1)`, 
            [titulo, descripcion, `/uploads/${nombreArchivo}`, descuento, fecha_inicio, fecha_fin]);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error al guardar:", error);
        res.status(500).json({ error: "No se pudo guardar." });
    }
});

module.exports = router;