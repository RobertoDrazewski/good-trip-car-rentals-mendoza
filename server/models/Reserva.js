const db = require('../config/db');

const Reserva = {
  /**
   * Crea una nueva reserva en la base de datos mapeando los datos del Frontend
   * @param {Object} data - Datos provenientes de la solicitud (req.body)
   * @returns {Number} insertId - El ID autogenerado de la nueva reserva
   */
  create: async (data) => {
    try {
      // 1. QUERY COMPLETA: Alineada con las columnas físicas de tu tabla en phpMyAdmin
      const query = `INSERT INTO reservas 
        (auto_id, cliente_nombre, cliente_whatsapp, fecha_inicio, hora_inicio, fecha_fin, hora_fin, lugar_retiro, lugar_devolucion, monto_total_ars, tasa_dolar_usada, garantia_usd, sillita, estado_reserva, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'pendiente')`;
      
      // 2. CAPTURA ABSOLUTA DE ATRIBUTOS (Evita undefined si el Front manda 'desde' o 'fecha_inicio')
      const autoId = data.auto_id;
      const clienteNombre = data.cliente_nombre;
      const clienteWhatsapp = data.cliente_whatsapp;
      const fechaInicio = data.fecha_inicio || data.desde;
      const horaInicio = data.hora_inicio || '10:00:00';
      const fechaFin = data.fecha_fin || data.hasta;
      const horaFin = data.hora_fin || '10:00:00';
      const lugarRetiro = data.lugar_retiro || data.entrega || 'mendoza ciudad';
      const lugarDevolucion = data.lugar_devolucion || data.devolucion || 'mendoza ciudad';
      const montoTotalArs = parseFloat(data.monto_total_ars || 0);
      const tasaDolarUsada = parseFloat(data.tasa_dolar_usada || data.cotizacion || 1400.00);
      const garantiaUsd = parseFloat(data.garantia_usd || 300.00);
      const sillita = data.sillita === true || data.sillita == 1 || String(data.sillita) === 'true' || String(data.sillita) === '1' ? 1 : 0;

      // 3. ARRAY DE VALORES PARA LA QUERY
      const values = [
        autoId,
        clienteNombre,
        clienteWhatsapp,
        fechaInicio,
        horaInicio,
        fechaFin,
        horaFin,
        lugarRetiro,
        lugarDevolucion,
        montoTotalArs,
        tasaDolarUsada,
        garantiaUsd,
        sillita
      ];

      // Validaciones preventivas estrictas en el Backend
      if (!autoId) throw new Error("El 'auto_id' es obligatorio.");
      if (!clienteNombre) throw new Error("El 'cliente_nombre' es obligatorio.");
      if (!fechaInicio || !fechaFin) throw new Error("Las fechas de inicio y fin son obligatorias.");

      // Ejecución de la sentencia en la base de datos
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error("❌ Error en Modelo Reserva (create):", error.sqlMessage || error.message);
      throw error;
    }
  },

  /**
   * Obtiene la totalidad de las reservas cargadas ordenadas por ID Descendente
   */
  getAll: async () => {
    try {
      const query = `
        SELECT r.*, a.modelo as auto_modelo, a.patente 
        FROM reservas r
        LEFT JOIN autos a ON r.auto_id = a.id
        ORDER BY r.id DESC`;
        
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error("❌ Error en Modelo Reserva (getAll):", error.sqlMessage || error.message);
      throw error;
    }
  }
};

module.exports = Reserva;