const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai'); // Asegúrate de tener: npm install openai
const db = require('../config/db');

// Configuración de OpenAI
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

router.post('/', async (req, res) => {
    try {
        const { message, lang, userData } = req.body;

        // 1. OBTENEMOS EL MES ACTUAL PARA BUSCAR PRECIOS DINÁMICOS
        const mesActual = new Date().getMonth() + 1;
        const anioActual = 2026;

        // 2. CONSULTA DOBLE: Intentamos traer precios del mes, y si no, los generales
        const [preciosMes] = await db.query(
            'SELECT * FROM precios_mensuales WHERE mes = ? AND anio = ?', 
            [mesActual, anioActual]
        );
        
        const [config] = await db.query('SELECT * FROM settings WHERE id = 1');
        
        const s = config[0] || {};
        const p = preciosMes[0] || {};

        // 3. LÓGICA DE PRECIOS: Prioriza el mes actual, sino usa settings
        const PRECIO_DIA = p.precio_dia || s.precio_dia || 45000;
        const LOGISTICA_AEROPUERTO = p.cargo_aeropuerto || s.cargo_aeropuerto || 15000;
        const SILLA_BEBE_DIA = p.precio_sillita || s.precio_sillita || 5000;
        const FIANZA_ARS = p.garantia_ars || s.garantia_ars || 350000;
        const FIANZA_USD = p.garantia_usd || s.garantia_usd || 300;
        const DOLAR_BLUE = p.cotizacion_dolar || s.cotizacion_dolar || 1200;
        
        const NUMERO_MAURICIO = "5492612764618";

        const instructions = {
            es: "RESPONDÉ SIEMPRE EN ESPAÑOL ARGENTINO (Mendocino). Sé directo con los números.",
            en: "ALWAYS RESPOND IN ENGLISH. Be precise with the pricing.",
            pt: "RESPONDA SEMPRE EM PORTUGUÊS. Seja direto com os valores."
        };

        const systemPrompt = `Eres Mauricio Manoni, dueño de Mendoza Rent-a-Car. 
        REGLA DE IDIOMA: ${instructions[lang] || instructions.es}

        INFORMACIÓN DE PRECIOS REALES PARA ESTE MES (${mesActual}/${anioActual}):
        - Valor por día (Fiat Cronos): $${PRECIO_DIA} ARS.
        - Fianza/Garantía: $${FIANZA_ARS} ARS o USD ${FIANZA_USD}.
        - Entrega en Aeropuerto: $${LOGISTICA_AEROPUERTO} ARS.
        - Opcional Silla de bebé: $${SILLA_BEBE_DIA} ARS por día.
        - Cotización del Dólar usada: $${DOLAR_BLUE} ARS.

        REGLAS DE ATENCIÓN:
        1. Tu tono es macanudo, servicial y muy mendocino (usar "che", "viste", "mirá").
        2. El Fiat Cronos se entrega impecable y con tanque lleno de nafta INFINIA.
        3. Somos Pet Friendly (perros pequeños/medianos).
        4. No des vueltas: si preguntan precio, dalo de una.
        5. Siempre intenta derivar a WhatsApp ${NUMERO_MAURICIO} para cerrar el trato.

        CONTEXTO DEL CLIENTE: ${userData ? JSON.stringify(userData) : 'Nuevo cliente'}.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7, // Subimos un poco para que sea más natural/mendocino
        });

        res.json({ response: completion.choices[0].message.content });

    } catch (error) {
        console.error("❌ Error en Chat IA:", error.message);
        res.status(500).json({ error: 'Mauricio está sin señal en la montaña, intentá de nuevo en un ratito.' });
    }
});

module.exports = router;