const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva'); // Conecta con el modelo que armaste antes

// Ruta: POST /api/reservas/confirmar
router.post('/confirmar', async (req, res) => {
    try {
        console.log("📥 Recibiendo nueva reserva del frontend:", req.body);
        
        // Llamamos al modelo que creaste, pasándole todos los datos
        const insertId = await Reserva.create(req.body);
        
        console.log("✅ Reserva guardada con éxito en la Base de Datos. ID:", insertId);
        res.status(201).json({ success: true, insertId });
    } catch (error) {
        console.error("❌ Error al procesar la reserva:", error);
        res.status(500).json({ success: false, error: "No se pudo guardar la reserva en la base de datos." });
    }
});

module.exports = router;