const db = require('../config/db');

const Auto = {
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM autos ORDER BY id DESC');
      return rows;
    } catch (error) {
      console.error("Error en Auto.getAll:", error);
      throw error;
    }
  },

  // --- AGREGAR AUTO (Con Imagen Real y Descripción Detallada) ---
  create: async (autoData) => {
    try {
      const { 
        modelo, 
        descripcion_larga, // Nuevo campo
        transmision, 
        precio_base_usd, 
        estado, 
        imagen_url, // Aquí vendrá el nombre del archivo guardado por Multer
        patente, 
        color 
      } = autoData;

      const query = `
        INSERT INTO autos 
        (modelo, descripcion_larga, transmision, precio_base_usd, estado, imagen_url, patente, color, odometro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `;

      const [result] = await db.query(query, [
        modelo,
        descripcion_larga || null,
        transmision || 'Manual',
        precio_base_usd,
        estado || 'Disponible',
        imagen_url || 'default-car.jpg', // Imagen real subida
        patente ? patente.toUpperCase() : null,
        color || 'S/D'
      ]);

      return result;
    } catch (error) {
      console.error("Error en Auto.create:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await db.query('DELETE FROM autos WHERE id = ?', [id]);
    } catch (error) {
      console.error("Error en Auto.delete:", error);
      throw error;
    }
  },

  updateEstado: async (id, estado) => {
    return await db.query('UPDATE autos SET estado = ? WHERE id = ?', [estado, id]);
  }
};

module.exports = Auto;