const generarTextoComprobante = (data) => {
    const { nombre, inicio, fin, retiro, total, tasa } = data;
    
    return `✨ *MENDOZA RENT-A-CAR* ✨
------------------------------------------
📝 *COMPROBANTE DE RESERVA*
👤 *Cliente:* ${nombre.toUpperCase()}
------------------------------------------
🚗 *DETALLES DEL ALQUILER:*
📅 *Retiro:* ${inicio}
📅 *Devolución:* ${fin}
📍 *Entrega:* ${retiro}

💰 *PRESUPUESTO:*
💵 *Total:* $${total.toLocaleString('es-AR')} ARS
📈 *Tasa Ref:* $${tasa} (Dólar)
------------------------------------------
✅ Mauricio ya registró tu reserva. 
*Presentá este comprobante al retirar.*
------------------------------------------
💬 _Atención personalizada de Mauricio Manoni_`;
};

module.exports = { generarTextoComprobante };