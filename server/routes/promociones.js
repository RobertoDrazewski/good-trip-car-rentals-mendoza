const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración de OpenAI con tus modelos permitidos
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

        // 1A. GENERACIÓN DEL COPY COMERCIAL (Usando gpt-4-turbo)
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

        // 1B. LOGICA DINÁMICA DE PROMPT (Clasificación limpia por gpt-4-turbo)
        let promptImagenOptimizado = "";
        try {
            const promptBuilder = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [{
                    role: "user",
                    content: `Analiza este evento publicitario: "${evento}". 
                    Devuelve ÚNICAMENTE un prompt de una sola línea en inglés optimizado para generar una imagen de fondo (background) espectacular de Mendoza.
                    
                    REGLAS DE ESCENARIO:
                    - Si el evento menciona invierno, nieve o esquí: El prompt debe describir de manera simple las montañas de los Andes nevadas en Las Leñas, Mendoza, un camino con nieve a los lados, ambiente frío y nítido.
                    - Si menciona verano, sol o calor: El prompt debe describir el Dique Potrerillos con agua turquesa brillante, montañas áridas de fondo y una ruta escénica bordeando el lago bajo un sol radiante.
                    - Si es un fin de semana largo, fiesta patria u otra fecha: El prompt debe describir un camino sinuoso en Mendoza cruzando viñedos dorados con la cordillera de fondo durante el atardecer (golden hour).
                    
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

        console.log(`[IA Prompt] Prompt enviado a gpt-image-2: "${promptImagenOptimizado}"`);

        // 1C. GENERACIÓN DE LA IMAGEN REAL (Usando gpt-image-2)
        try {
            const image = await openai.images.generate({
                model: "gpt-image-2",
                prompt: promptImagenOptimizado,
                n: 1,
                size: "1024x1024"
            });

            // Captura flexible: extrae tanto URL clásica como strings Base64 raw
            if (image && image.data && image.data[0]) {
                imageUrl = image.data[0].url || image.data[0].b64_json;
            } else if (image && image.url) {
                imageUrl = image.url;
            }

            if (!imageUrl) throw new Error("La API respondió pero no se encontró un campo de imagen válido.");

        } catch (imageError) {
            console.error("❌ Error crítico en gpt-image-2, aplicando fallback...", imageError.message);
            try {
                let fallbackPrompt = "Beautiful snowy mountains and winter landscape in Las Leñas Mendoza Argentina, cinematic background road photography, no text";
                if (evento.toLowerCase().includes("verano") || evento.toLowerCase().includes("potrerillos")) {
                    fallbackPrompt = "Beautiful lake and mountain view at Potrerillos dam Mendoza Argentina, sunny summer highway road background, no text";
                } else if (!evento.toLowerCase().includes("invierno") && !evento.toLowerCase().includes("nieve")) {
                    fallbackPrompt = "Scenic road trip highway through beautiful vineyards in Mendoza Argentina, sunset mountain background, no text";
                }

                const retryImage = await openai.images.generate({
                    model: "gpt-image-2",
                    prompt: fallbackPrompt,
                    n: 1,
                    size: "1024x1024"
                });
                
                imageUrl = retryImage?.data?.[0]?.url || retryImage?.data?.[0]?.b64_json || retryImage?.url;
                if (!imageUrl) throw new Error("El reintento también falló.");
            } catch (retryError) {
                console.error("❌ Ambos intentos fallaron:", retryError.message);
                return res.status(522).json({ error: "El servicio gpt-image-2 no se encuentra disponible temporalmente." });
            }
        }

        // CONTROL CLAVE: Si es un String Base64 puro sin cabecera, se la inyectamos para que el <img> del frontend renderice al instante
        if (imageUrl.startsWith("iVBORw0Gg") || !imageUrl.startsWith("http")) {
            imageUrl = `data:image/png;base64,${imageUrl.replace(/^data:image\/\w+;base64,/, "")}`;
        }

        res.json({ descripcion: descripcionFinal, imagen_url: imageUrl });

    } catch (error) { 
        console.error("Error general en el controlador:", error);
        res.status(500).json({ error: "Error interno en el servidor de IA al procesar la propuesta." }); 
    }
});

// ==========================================
// 2. GUARDAR BANNER EN BASE DE DATOS (REPARADO PARA SOPORTAR URL Y BASE64)
// ==========================================
router.post('/save-promo', async (req, res) => {
    try {
        let { titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin } = req.body;

        const nombreArchivo = `promo_${Date.now()}.png`; // Forzamos extensión estable PNG
        const rutaDirectorio = path.join(__dirname, '../uploads/banner'); 
        const rutaImagenLocal = path.join(rutaDirectorio, nombreArchivo);

        if (!fs.existsSync(rutaDirectorio)) fs.mkdirSync(rutaDirectorio, { recursive: true });

        // Verificamos si la imagen viene como Base64 (data:image/...) o como una URL clásica (http)
        if (imagen_url.startsWith('data:image') || imagen_url.startsWith('iVBORw0Gg')) {
            // Caso A: Procesamiento Seguro de String Base64
            const cleanBase64 = imagen_url.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(cleanBase64, 'base64');
            fs.writeFileSync(rutaImagenLocal, imageBuffer);
            console.log("✅ Imagen Base64 escrita físicamente en disco.");
        } else {
            // Caso B: Descarga Tradicional HTTP Stream
            const response = await axios({ url: imagen_url, responseType: 'stream' });
            const writer = fs.createWriteStream(rutaImagenLocal);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log("✅ Imagen descargada mediante Axios Stream.");
        }

        const dbPath = `/uploads/banner/${nombreArchivo}`; 
        
        await db.query(
            `INSERT INTO banners_promo (titulo, descripcion, imagen_url, descuento, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)`, 
            [titulo, descripcion, dbPath, descuento, fecha_inicio, fecha_fin]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Error al guardar la promoción:", error.message);
        res.status(500).json({ error: "No se pudo almacenar la promoción en el almacenamiento local." });
    }
});

// ==========================================
// 3. CONSULTAR BANNER ACTIVO
// ==========================================
router.get('/active', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM banners_promo ORDER BY id DESC LIMIT 1`);
        if (rows.length > 0) res.json(rows[0]); 
        else res.status(404).json({ message: "No hay promociones." }); 
    } catch (error) {
        res.status(500).json({ error: "Error de lectura DB." });
    }
});

// ==========================================
// 4. LISTAR TODOS LOS BANNERS
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
// 5. ELIMINAR BANNER (FISICO Y LOGICO)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT imagen_url FROM banners_promo WHERE id = ?`, [id]);
        
        if (rows.length > 0 && rows[0].imagen_url) {
            const imagePath = path.join(__dirname, '../', rows[0].imagen_url); 
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await db.query(`DELETE FROM banners_promo WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "No se pudo eliminar." });
    }
});

module.exports = router;