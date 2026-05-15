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

        const mesActual = new Date().getMonth() + 1;
        const anioActual = 2026;

        // Consultas a la base de datos
        const [preciosMes] = await db.query(
            'SELECT * FROM precios_mensuales WHERE mes = ? AND anio = ?', 
            [mesActual, anioActual]
        );
        const [config] = await db.query('SELECT * FROM settings WHERE id = 1');
        
        const s = config[0] || {};
        const p = preciosMes[0] || {};

        const PRECIO_DIA = p.precio_dia || s.precio_dia || 45000;
        const LOGISTICA_AEROPUERTO = p.cargo_aeropuerto || s.cargo_aeropuerto || 15000;
        const SILLA_BEBE_DIA = p.precio_sillita || s.precio_sillita || 5000;
        const FIANZA_ARS = p.garantia_ars || s.garantia_ars || 350000;
        const FIANZA_USD = p.garantia_usd || s.garantia_usd || 300;
        const DOLAR_BLUE = p.cotizacion_dolar || s.cotizacion_dolar || 1200;
        
        const NUMERO_ATENCION = "5492612764618";

        // REGLAS IDIOMÁTICAS INTERNACIONALES ESTRICTAS
        const instructions = {
            es: `Usted es un Asistente Ejecutivo de Ventas de Good Trip Car Rentals Mendoza. 
                 REGLAS CRUCIALES DE IDIOMA ESPAÑOL:
                 - Use estrictamente ESPAÑOL NEUTRO e INTERNACIONAL (Tratamiento de USTED).
                 - PROHIBIDO EL VOSEO ARGENTINO. No use palabras como "podés", "mandame", "revisá", "tenés", "estás". Reemplácelas por "puede", "envíeme", "revise", "tiene", "está".
                 - PROHIBIDOS MODISMOS LOCALES. Está terminantemente prohibido usar las palabras: "che", "viste", "mirá", "un espectáculo", "onda", "buenísimo" o similares.
                 - Su redacción debe ser seria, limpia, confiable y corporativa.`,
            
            en: `You are an Executive Sales Assistant for Good Trip Car Rentals Mendoza.
                 - Use a formal, business-professional tone.
                 - Address the customer with maximum respect ("You", formal).`,
            
            pt: `Você é um Assistente Executivo de Vendas da Good Trip Car Rentals Mendoza.
                 - Use um tom estritamente formal, educado e corporativo.
                 - Trate o cliente sempre por "Você/Senhor/Senhora".`
        };

        const targetLang = lang || 'es';

        const REQUISITOS_SISTEMA = `
        REQUISITOS OBLIGATORIOS PARA EL ALQUILER:
        1. Edad mínima: Mayor de 23 años.
        2. Documentación: Licencia de conducir física y vigente.
        3. Garantía Reembolsable: $${FIANZA_ARS} ARS o USD ${FIANZA_USD} (se abona al recibir el vehículo y se restituye por completo al finalizar el contrato).
        4. Sin Tarjeta Obligatoria: No exigimos tarjeta de crédito para concretar el alquiler.
        5. Kilometraje libre e ilimitado. Somos una empresa Pet Friendly (requiere aviso previo).
        `;

        const LOGICA_HORAS = `
        POLÍTICA HORARIA:
        - Margen de cortesía: Hasta 2 horas de gracia sin cargo adicional.
        - Retrasos de 2 a 6 horas: Aplica un cargo de medio día extra (0.5).
        - Retrasos mayores a 6 horas: Aplica el cobro de un día completo adicional.
        `;

        const systemPrompt = `
        Identidad comercial: Agente de Ventas Corporativo de la empresa "Good Trip Car Rentals Mendoza".
        
        ${instructions[targetLang] || instructions.es}

        TARIFAS OFICIALES SATORIADAS (Mes ${mesActual}/${anioActual}):
        - Precio por día base: $${PRECIO_DIA} ARS.
        - Depósito de Garantía: $${FIANZA_ARS} ARS o USD ${FIANZA_USD}.
        - Cargo logístico Aeropuerto Mendoza: $${LOGISTICA_AEROPUERTO} ARS.
        - Opcional Silla de Bebé: $${SILLA_BEBE_DIA} ARS por día.
        - Cotización de referencia Dólar: $${DOLAR_BLUE} ARS.

        ${REQUISITOS_SISTEMA}
        ${LOGICA_HORAS}

        DIRECTRICES DE RESPUESTA:
        1. Si el cliente consulta por tarifas o requisitos, expóngalos de forma clara y ordenada.
        2. Siempre mantenga el trato de Usted. No tutee ni vosee bajo ninguna circunstancia.
        3. Si el cliente requiere asistencia humana, invítelo cordialmente a comunicarse a nuestro canal centralizado de WhatsApp: https://wa.me/${NUMERO_ATENCION}

        CONTEXTO WEB DE RESERVA ACTUAL: ${userData ? JSON.stringify(userData) : 'El cliente está explorando la plataforma sin una cotización previa'}.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.1, // 👈 BAJA AL MÍNIMO: Evita que la IA "invente" o use modismos. Se vuelve 100% obediente.
        });

        let finalResponse = completion.choices[0].message.content;

        // --- 🛡️ FILTRO MAESTRO DE SEGURIDAD ANTILOCALISMOS ---
        // Si la IA comete un desliz por arrastre de caché, el código lo limpia antes de enviarlo a la pantalla del cliente.
        finalResponse = finalResponse
          .replace(/che/gi, '')
           .replace(/podés/gi, 'puede')
           .replace(/querés/gi, 'desea')
          .replace(/mandame/gi, 'envíeme')
          .replace(/te esperamos/gi, 'estamos a su disposición')
          .replace(/un espectáculo/gi, 'una excelente opción')
          .replace(/tenés/gi, 'tiene')
           .replace(/estás/gi, 'está')
           .replace(/mirá/gi, 'observe')
           .replace(/viste/gi, 'como usted sabe')
            .replace(/  +/g, ' '); // Limpia espacios dobles sobrantes

        res.json({ response: finalResponse.trim() });

    } catch (error) {
        console.error("❌ Error en Chat IA:", error.message);
        res.status(500).json({ error: 'En este momento nuestros canales están procesando solicitudes de reservas. Por favor, intente nuevamente o comuníquese a nuestra línea de atención directa.' });
    }
});

module.exports = router;