const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const db = require('../config/db');

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

router.post('/', async (req, res) => {
    try {
        const { message, lang, userData } = req.body;

        // 1. CONSULTAS A LA BASE DE DATOS (Recuperación total de datos)
        // Obtenemos todos los precios, autos, reservas y rutas para que la IA sea experta
        const [tarifasCompletas] = await db.query('SELECT * FROM precios_mensuales');
        const [autos] = await db.query('SELECT id, modelo, patente, transmision FROM autos');
        const [reservas] = await db.query('SELECT auto_id, fecha_inicio, fecha_fin, estado FROM reservas WHERE estado != "rechazado"');
        const [rutas] = await db.query('SELECT id, titulo, descripcion FROM routes ORDER BY orden ASC');
        
        // 2. CONSTRUCCIÓN DEL CONTEXTO PARA LA IA
        // Pasamos todas las tarifas disponibles para que la IA consulte el mes que desee
        const contextoParaIA = {
            tarifasMensuales: tarifasCompletas,
            flotaDisponible: autos,
            reservasOcupadas: reservas,
            destinosRecomendados: rutas,
            fechaActual: new Date().toISOString()
        };

        const NUMERO_ATENCION = "5492612764618";

        // 3. REGLAS IDIOMÁTICAS INTERNACIONALES
        const instructions = {
            es: `Usted es un Asistente Ejecutivo de Ventas de Good Trip Car Rentals Mendoza. 
                 - Use estrictamente ESPAÑOL NEUTRO e INTERNACIONAL (Tratamiento de USTED).
                 - PROHIBIDO EL VOSEO ARGENTINO ("podés", "tenés", "estás").
                 - PROHIBIDOS MODISMOS ("che", "viste", "mirá", "un espectáculo").
                 - Su redacción debe ser seria, corporativa y confiable.`,
            en: `You are an Executive Sales Assistant for Good Trip Car Rentals Mendoza. Use formal, business-professional tone.`,
            pt: `Você é um Assistente Executivo de Vendas da Good Trip Car Rentals Mendoza. Use um tom estritamente formal.`
        };

        // 4. SYSTEM PROMPT CON REGLAS DE ORO
        const systemPrompt = `
        Identidad: Agente de Ventas Corporativo de "Good Trip Car Rentals Mendoza".
        ${instructions[lang || 'es']}

        DATOS DINÁMICOS DE LA EMPRESA (BASE DE DATOS REAL):
        ${JSON.stringify(contextoParaIA)}

        REGLAS DE VENTA Y COTIZACIÓN:
        1. PRECIOS CERO O INEXISTENTES: Si el usuario solicita fechas para las cuales no hay datos en 'tarifasMensuales', NO invente precios. Responda cortésmente que esa tarifa específica no está disponible y derive al cliente a un representante humano.
        2. CÁLCULO: Si el cliente solicita presupuesto, busque el mes/año correspondiente en 'tarifasMensuales' y realice el cálculo usando los días solicitados + precio diario + cargos (aeropuerto/sillita).
        3. RUTA: Sugiera los 'destinosRecomendados' de forma proactiva como parte de la experiencia Good Trip.
        4. DISPONIBILIDAD: Compare las fechas del cliente con 'reservasOcupadas'. Si el vehículo está ocupado, ofrezca otro modelo de la lista 'flotaDisponible'.
        5. LÍMITE: Siempre invite al cliente a confirmar en WhatsApp: https://wa.me/${NUMERO_ATENCION}

        CONTEXTO CLIENTE: ${userData ? JSON.stringify(userData) : 'Cliente explorando la plataforma'}.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.1,
        });

        let finalResponse = completion.choices[0].message.content;

        // --- FILTRO DE SEGURIDAD (Anti-Voseo) ---
        finalResponse = finalResponse
          .replace(/che/gi, '').replace(/podés/gi, 'puede').replace(/querés/gi, 'desea')
          .replace(/mandame/gi, 'envíeme').replace(/te esperamos/gi, 'estamos a su disposición')
          .replace(/un espectáculo/gi, 'una excelente opción').replace(/tenés/gi, 'tiene')
           .replace(/estás/gi, 'está').replace(/mirá/gi, 'observe').replace(/viste/gi, 'como usted sabe');

        res.json({ response: finalResponse.trim() });

    } catch (error) {
        console.error("❌ Error en Chat IA:", error.message);
        res.status(500).json({ error: 'Nuestros canales están procesando solicitudes.' });
    }
});

module.exports = router;