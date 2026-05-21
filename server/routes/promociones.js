const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración de OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==========================================
// 1. GENERAR PROPUESTA CON IA
// ==========================================
router.post('/generar-propuesta', async (req, res) => {
    try {
        const { evento, descuento } = req.body;
        if (!evento || !descuento) return res.status(400).json({ error: "Datos incompletos." });

        let descripcionFinal = "";
        let imageUrl = "";

        // 1A. GENERACIÓN DEL COPY COMERCIAL
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [{ 
                    role: "user", 
                    content: `Crea un copy muy corto (máximo 15 palabras) para un banner de alquiler de autos en Mendoza. Evento o temporada: ${evento}, Descuento: ${descuento}%.` 
                }]
            });
            descripcionFinal = completion.choices[0].message.content.replace(/"/g, '');
        } catch (textError) {
            descripcionFinal = `¡Aprovechá un ${descuento}% de descuento en Mendoza para este ${evento}! Reserva hoy tu vehículo.`;
        }

        // 1B. LOGICA DINÁMICA DE PROMPT PARA IMAGEN
        let promptImagenOptimizado = "";
        try {
            const promptBuilder = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [{
                    role: "user",
                    content: `Analiza este evento publicitario: "${evento}". 
                    Devuelve ÚNICAMENTE un prompt de una sola línea en inglés optimizado para generar una imagen de fondo (background) espectacular de Mendoza.
                    REGLAS CRÍTICAS DE FORMATO:
                    - Debe ser un paisaje vacío e impecable para usar de fondo publicitario (background banner).
                    - NO incluyas autos en la descripción.
                    - NO agregues textos, palabras, letras ni logos en la imagen.
                    - Devuelve SOLO el texto del prompt en inglés, sin introducciones ni comillas.`
                }]
            });
            promptImagenOptimizado = promptBuilder.choices[0].message.content.trim();
        } catch (promptError) {
            promptImagenOptimizado = "Cinematic professional background photography of a scenic mountain road trip in Mendoza Argentina, majestic Andes mountains, beautiful landscape, high detailed, 4k, no text, no cars.";
        }

        console.log(`[IA Prompt] Prompt enviado: "${promptImagenOptimizado}"`);

        // 1C. GENERACIÓN DE LA IMAGEN REAL
        try {
            const image = await openai.images.generate({
                model: "gpt-image-2", // O dall-e-3 si tienes acceso
                prompt: promptImagenOptimizado,
                n: 1,
                size: "1024x1024"
            });

            if (image && image.data && image.data[0]) {
                imageUrl = image.data[0].url || image.data[0].b64_json;
            } else if (image && image.url) {
                imageUrl = image.url;
            }

            if (!imageUrl) throw new Error("La API respondió pero no se encontró imagen válida.");

        } catch (imageError) {
            console.error("❌ Error en generación de imagen, aplicando fallback...", imageError.message);
            // Fallback en caso de error
            imageUrl = "https://images.unsplash.com/photo-1589182373814-4d6d02a0fb20?q=80&w=1024&auto=format&fit=crop"; 
        }

        // CONTROL CLAVE: Preparar Base64 para el frontend si es necesario
        if (imageUrl && (imageUrl.startsWith("iVBORw0Gg") || (!imageUrl.startsWith("http") && imageUrl.length > 1000))) {
            imageUrl = `data:image/png;base64,${imageUrl.replace(/^data:image\/\w+;base64,/, "")}`;
        }

        res.json({ descripcion: descripcionFinal, imagen_url: imageUrl });

    } catch (error) { 
        console.error("Error general en el controlador de IA:", error);
        res.status(500).json({ error: "Error interno en el servidor de IA." }); 
    }
});

// ==========================================
// 2. CONSULTAR TODAS LAS PROMOCIONES ACTIVAS (CARRUSEL FRONTEND)
// ==========================================
router.get('/all-active', async (req, res) => {
    try {
        // Selecciona todos los banners cuya fecha de fin no haya pasado
        const [rows] = await db.query(
            `SELECT * FROM banners_promo WHERE fecha_fin >= CURDATE() ORDER BY id DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error consultando todas las promos activas:", error);
        res.status(500).json({ error: "Error de lectura DB." });
    }
});

// ==========================================
// 3. GUARDAR BANNER EN BASE DE DATOS Y DISCO
// ==========================================
router.post('/save-promo', async (req, res) => {
    try {
        let { titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin } = req.body;

        const nombreArchivo = `promo_${Date.now()}.png`;
        // Ajustamos la ruta para que suba un nivel desde 'routes' y entre a 'uploads/banner'
        const rutaDirectorio = path.join(__dirname, '../uploads/banner'); 
        const rutaImagenLocal = path.join(rutaDirectorio, nombreArchivo);

        if (!fs.existsSync(rutaDirectorio)) {
            fs.mkdirSync(rutaDirectorio, { recursive: true });
        }

        // Guardar físicamente la imagen
        if (imagen_url.startsWith('data:image') || imagen_url.startsWith('iVBORw0Gg')) {
            const cleanBase64 = imagen_url.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(cleanBase64, 'base64');
            fs.writeFileSync(rutaImagenLocal, imageBuffer);
        } else if (imagen_url.startsWith('http')) {
            const response = await axios({ url: imagen_url, responseType: 'stream' });
            const writer = fs.createWriteStream(rutaImagenLocal);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        }

        // Esta es la ruta exacta que leerá el frontend (App.jsx lo concatena con API_BASE_URL)
        const dbPath = `/uploads/banner/${nombreArchivo}`; 
        
        await db.query(
            `INSERT INTO banners_promo (titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)`, 
            [titulo, descripcion, dbPath, descuento, fecha_inicio, fecha_fin]
        );
        
        res.json({ success: true, dbPath });
    } catch (error) {
        console.error("❌ Error al guardar la promoción:", error.message);
        res.status(500).json({ error: "No se pudo almacenar la promoción localmente." });
    }
});

// ==========================================
// 4. LISTAR TODOS LOS BANNERS (ADMIN DASHBOARD)
// ==========================================
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM banners_promo ORDER BY id DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error de lectura DB." });
    }
});

// ==========================================
// 5. CONSULTAR BANNER ACTIVO (LEGACY)
// ==========================================
router.get('/active', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM banners_promo WHERE fecha_fin >= CURDATE() ORDER BY id DESC LIMIT 1`);
        if (rows.length > 0) res.json(rows[0]); 
        else res.status(404).json({ message: "No hay promociones." }); 
    } catch (error) {
        res.status(500).json({ error: "Error de lectura DB." });
    }
});

// ==========================================
// 6. ELIMINAR BANNER (FISICO Y LOGICO)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT imagen_url FROM banners_promo WHERE id = ?`, [id]);
        
        // Si existe el registro, intentamos borrar la imagen del disco
        if (rows.length > 0 && rows[0].imagen_url && !rows[0].imagen_url.startsWith('http')) {
            const imagePath = path.join(__dirname, '..', rows[0].imagen_url); 
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await db.query(`DELETE FROM banners_promo WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "No se pudo eliminar el banner." });
    }
});

module.exports = router;