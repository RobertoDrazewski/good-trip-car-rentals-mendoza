const db = require('../config/db');

const Reserva = {
  create: async (data) => {
    try {
      const query = `INSERT INTO reservas 
        (auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, fecha_fin, lugar_retiro, lugar_devolucion, monto_total_ars, tasa_dolar_usada, estado_reserva) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`;
      
      // REPARACIÓN DE MAPEO: Aseguramos que los nombres coincidan con lo que manda el Front
      const values = [
        data.auto_id,                 // Antes tenías data.auto_id || null
        data.cliente_nombre,          // Antes tenías data.nombre
        data.cliente_whatsapp,        // Antes tenías data.whatsapp
        data.fecha_inicio,            // Antes tenías data.inicio
        data.fecha_fin,               // Antes tenías data.fin
        data.lugar_retiro || 'ciudad', 
        data.lugar_devolucion || 'ciudad', 
        parseFloat(data.monto_total_ars || 0), 
        data.tasa_dolar_usada || 1250.00
      ];

      // Validación de seguridad: Si el auto_id no está, lanzamos error antes de insertar basura
      if (!values[0]) {
        throw new Error("El auto_id es obligatorio para registrar la ocupación en el calendario.");
      }

      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error("❌ Error en Modelo Reserva:", error.sqlMessage || error.message);
      throw error;
    }
  },

  getAll: async () => {
    // Reparamos el JOIN: tu tabla de autos usa 'modelo', no 'nombre'
    const query = `
      SELECT r.*, a.modelo as auto_modelo 
      FROM reservas r
      LEFT JOIN autos a ON r.auto_id = a.id
      ORDER BY r.fecha_inicio DESC`;
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = Reserva;