const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Endpoint para generar contenido e imagen con IA
router.post('/generar-propuesta', async (req, res) => {
    const { evento, descuento } = req.body;

    // 1. Generar Copy con GPT
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: `Crea un copy persuasivo para un banner de alquiler de autos en Mendoza. Evento: ${evento}, Descuento: ${descuento}%.` }]
    });

    // 2. Generar Imagen con DALL-E 3
    const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Banner publicitario profesional para alquiler de autos en Mendoza, estilo limpio y elegante, relacionado con ${evento}, sin texto, calidad publicitaria.`,
        n: 1,
        size: "1024x1024",
    });

    res.json({
        descripcion: completion.choices[0].message.content,
        imagen_url: image.data[0].url
    });
});

module.exports = router;