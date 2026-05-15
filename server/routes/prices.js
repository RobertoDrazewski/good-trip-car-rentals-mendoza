const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- 1. VERIFICAR DISPONIBILIDAD (ACTUALIZADO CON HORAS) ---
router.post('/check-availability', async (req, res) => {
    try {
        const { desde, hasta, auto_id, hora_inicio = "10:00", hora_fin = "10:00" } = req.body;
        if (!desde || !hasta || !auto_id) return res.status(400).json({ error: "Faltan datos." });

        // Creamos timestamps exactos para comparar
        const inicioFull = `${desde} ${hora_inicio}:00`;
        const finFull = `${hasta} ${hora_fin}:00`;

        const query = `
            SELECT COUNT(*) as ocupados 
            FROM reservas 
            WHERE auto_id = ? 
            AND estado != 'rechazado' 
            AND (
                (CONCAT(fecha_inicio, ' ', hora_inicio) <= ? AND CONCAT(fecha_fin, ' ', hora_fin) >= ?) OR
                (CONCAT(fecha_inicio, ' ', hora_inicio) <= ? AND CONCAT(fecha_fin, ' ', hora_fin) >= ?) OR
                (? <= CONCAT(fecha_inicio, ' ', hora_inicio) AND ? >= CONCAT(fecha_fin, ' ', hora_fin))
            )`;

        const [rows] = await db.query(query, [auto_id, inicioFull, inicioFull, finFull, finFull, inicioFull, finFull]);
        res.json({ disponible: rows[0].ocupados === 0 });
    } catch (error) {
        console.error("❌ Error Disponibilidad:", error);
        res.status(500).json({ error: "Error de servidor." });
    }
});

// --- 2. COTIZAR (LÓGICA DE PRECISIÓN POR HORAS) ---
router.post('/quote', async (req, res) => {
    try {
        const { desde, hasta, hora_inicio, hora_fin, entrega, devolucion, sillita } = req.body;

        // 1. Crear objetos de fecha reales
        const d1 = new Date(`${desde}T${hora_inicio || '10:00'}:00`);
        const d2 = new Date(`${hasta}T${hora_fin || '10:00'}:00`);

        // 2. Calcular diferencia exacta en horas
        const diffMs = d2 - d1;
        const diffHoras = diffMs / (1000 * 60 * 60);
        
        // 3. LÓGICA DE DÍAS (PRECISIÓN MAURICIO SUPER ADMIN)
        let diasParaCobrar = Math.floor(diffHoras / 24);
        const horasRemanentes = diffHoras % 24;

        if (diasParaCobrar === 0 && diffHoras > 0) {
            diasParaCobrar = 1; // Mínimo 1 día
        } else {
            // Si se pasa más de 2 horas pero menos de 6 -> Cobramos 0.5 día más
            if (horasRemanentes > 2 && horasRemanentes <= 6) {
                diasParaCobrar += 0.5;
            } 
            // Si se pasa más de 6 horas -> Cobramos el día entero
            else if (horasRemanentes > 6) {
                diasParaCobrar += 1;
            }
        }

        const mes = d1.getMonth() + 1;
        const anio = d1.getFullYear();

        // Obtener configuración y precios
        const [rowsMes] = await db.query('SELECT * FROM precios_mensuales WHERE mes = ? AND anio = ?', [mes, anio]);
        const [rowsSet] = await db.query('SELECT * FROM settings WHERE id = 1');
        
        const settings = rowsSet[0];
        const mensual = rowsMes[0] || {};

        const precioDia = parseFloat(mensual.precio_dia) || parseFloat(settings.precio_dia);
        const cargoAero = parseFloat(mensual.cargo_aeropuerto) || parseFloat(settings.cargo_aeropuerto);
        const precioSilla = parseFloat(mensual.precio_sillita) || parseFloat(settings.precio_sillita);
        const cotizacion = parseFloat(mensual.cotizacion_dolar) || parseFloat(settings.cotizacion_dolar);
        const garantia = parseFloat(mensual.garantia_ars) || parseFloat(settings.garantia_ars);

        // 4. Cálculos finales
        let totalArs = diasParaCobrar * precioDia;
        if (entrega === 'aeropuerto' || devolucion === 'aeropuerto') totalArs += cargoAero;
        if (sillita === true || sillita === 'true') totalArs += (Math.ceil(diasParaCobrar) * precioSilla);

        res.json({
            status: 'success',
            dias: diasParaCobrar, // Ahora puede devolver 1.5, 2, 2.5, etc.
            totalArs,
            totalUsd: totalArs / (cotizacion || 1),
            cotizacion,
            garantia,
            desde,
            hasta,
            hora_inicio,
            hora_fin
        });
    } catch (error) {
        console.error("❌ Error en quote:", error);
        res.status(500).json({ error: "Error al calcular cotización." });
    }
});

module.exports = router;