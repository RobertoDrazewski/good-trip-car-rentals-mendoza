const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- 1. VERIFICAR DISPONIBILIDAD ---
router.post('/check-availability', async (req, res) => {
    try {
        const { desde, hasta, auto_id } = req.body;
        if (!desde || !hasta || !auto_id) return res.status(400).json({ error: "Faltan datos." });

        const query = `
            SELECT COUNT(*) as ocupados 
            FROM reservas 
            WHERE auto_id = ? 
            AND estado != 'rechazado' 
            AND (
                (fecha_inicio <= ? AND fecha_fin >= ?) OR
                (fecha_inicio <= ? AND fecha_fin >= ?) OR
                (? <= fecha_inicio AND ? >= fecha_fin)
            )`;

        const [rows] = await db.query(query, [auto_id, desde, desde, hasta, hasta, desde, hasta]);
        res.json({ disponible: rows[0].ocupados === 0 });
    } catch (error) {
        console.error("❌ Error Disponibilidad:", error);
        res.status(500).json({ error: "Error de servidor." });
    }
});

// --- 2. COTIZAR (CON LÓGICA DE HERENCIA MEJORADA) ---
router.post('/quote', async (req, res) => {
    try {
        const { desde, hasta, entrega, devolucion, sillita } = req.body;

        const d1 = new Date(desde + "T12:00:00");
        const d2 = new Date(hasta + "T12:00:00");
        const dias = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));

        const mes = d1.getMonth() + 1;
        const anio = d1.getFullYear();

        // 1. Traer ambas tablas
        const [rowsMes] = await db.query('SELECT * FROM precios_mensuales WHERE mes = ? AND anio = ?', [mes, anio]);
        const [rowsSet] = await db.query('SELECT * FROM settings WHERE id = 1');
        
        const settings = rowsSet[0];
        const mensual = rowsMes[0] || {}; // Objeto vacío si no hay registro para ese mes

        // 2. LÓGICA DE HERENCIA: Si el valor mensual es 0 o null, usa el de settings
        const precioDia = parseFloat(mensual.precio_dia) || parseFloat(settings.precio_dia);
        const cargoAero = parseFloat(mensual.cargo_aeropuerto) || parseFloat(settings.cargo_aeropuerto);
        const precioSilla = parseFloat(mensual.precio_sillita) || parseFloat(settings.precio_sillita);
        const cotizacion = parseFloat(mensual.cotizacion_dolar) || parseFloat(settings.cotizacion_dolar);
        const garantia = parseFloat(mensual.garantia_ars) || parseFloat(settings.garantia_ars);

        // 3. Cálculos
        let totalArs = dias * precioDia;
        if (entrega === 'aeropuerto' || devolucion === 'aeropuerto') totalArs += cargoAero;
        if (sillita === true || sillita === 'true') totalArs += (dias * precioSilla);

        // Debug para ver qué valores se usaron al final
        console.log(`[Quote] Mes ${mes}: Usando precio ${precioDia} y cotización ${cotizacion}`);

        res.json({
            status: 'success',
            dias,
            totalArs,
            totalUsd: totalArs / (cotizacion || 1), // Evitar división por cero
            cotizacion,
            garantia,
            desde, // Importante para el QuoteResult
            hasta  // Importante para el QuoteResult
        });
    } catch (error) {
        console.error("❌ Error en quote:", error);
        res.status(500).json({ error: "Error al calcular cotización." });
    }
});

module.exports = router;