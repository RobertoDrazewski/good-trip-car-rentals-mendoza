const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const { OpenAI } = require('openai');

// Instancia de OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- CONFIGURACIÓN DE ALMACENAMIENTO (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/routes/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'mendoza-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- 1. MEJORAR DESCRIPCIÓN CON IA ---
router.post('/ai-desc', async (req, res) => {
    try {
        const { titulo, descripcion_base } = req.body;
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un guía experto de Mendoza. Escribe una reseña breve y atrapante (max 200 caracteres)." },
                { role: "user", content: `Mejora esto para ${titulo}: ${descripcion_base}` }
            ],
            temperature: 0.7
        });
        res.json({ suggestion: completion.choices[0].message.content });
    } catch (error) {
        console.error("❌ Error OpenAI:", error.message);
        res.status(500).json({ error: "IA no disponible en este momento." });
    }
});

// --- 2. GUARDAR RUTA (A TU TABLA 'routes' CON MAPS_URL) ---
router.post('/save', upload.single('imagen'), async (req, res) => {
    try {
        // Recibimos maps_url desde el body
        const { titulo, descripcion, orden, maps_url } = req.body;
        const imagen_url = req.file ? `/uploads/routes/${req.file.filename}` : null;

        if (!titulo) {
            return res.status(400).json({ error: "El título es obligatorio para guardar." });
        }

        const query = `
            INSERT INTO routes (titulo, descripcion, imagen_url, orden, maps_url) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            titulo, 
            descripcion, 
            imagen_url, 
            orden || 0, 
            maps_url || null // Se guarda el link de Google Maps
        ]);

        console.log(`✅ Nueva ruta guardada con ID: ${result.insertId} y link de Maps`);
        res.json({ status: 'success', id: result.insertId });
    } catch (error) {
        console.error("❌ Error al insertar ruta:", error.message);
        res.status(500).json({ error: "Error al guardar en la base de datos." });
    }
});

// --- 3. OBTENER TODAS LAS RUTAS (PARA EL HOME) ---
router.get('/all', async (req, res) => {
    try {
        // Traemos todos los campos incluyendo maps_url
        const [rows] = await db.query('SELECT * FROM routes ORDER BY orden ASC, id DESC');
        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener rutas:", error.message);
        res.status(500).json({ error: "Error al cargar las rutas." });
    }
});

// --- 4. ELIMINAR RUTA ---
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [check] = await db.query('SELECT id FROM routes WHERE id = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({ error: "La ruta no existe." });
        }

        const [result] = await db.query('DELETE FROM routes WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            console.log(`🗑️ Ruta ${id} eliminada correctamente`);
            return res.json({ status: 'success' });
        } else {
            return res.status(400).json({ error: "No se pudo realizar la eliminación." });
        }
    } catch (error) {
        console.error("❌ Error fatal al eliminar ruta:", error.message);
        res.status(500).json({ error: "Error interno del servidor al borrar." });
    }
});

module.exports = router;