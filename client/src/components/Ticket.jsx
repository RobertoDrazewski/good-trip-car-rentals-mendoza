const generarPDF = () => {
  const doc = new jsPDF();
  const purple = [110, 80, 200];
  const dark = [15, 23, 42];

  // --- Función para limpiar fechas (Elimina el T03:00:00.000Z) ---
  const formatFecha = (str) => {
    if(!str) return "Consultar";
    const f = str.split('T')[0]; // Toma solo AAAA-MM-DD
    const [y, m, d] = f.split('-');
    return `${d}/${m}/${y}`; // Retorna DD/MM/AAAA
  };

  // DISEÑO DEL ENCABEZADO
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("GOOD TRIP CAR RENTALS", 105, 25, { align: "center" });

  // DATOS DE CONTACTO
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`WhatsApp: +54 9 261 276 4618 | Mendoza, Argentina`, 105, 50, { align: "center" });

  // SECCIÓN FECHAS LIMPIAS
  doc.setTextColor(...purple);
  doc.setFont("helvetica", "bold");
  doc.text("Día de entrega", 30, 70);
  doc.text("Día de devolución", 130, 70);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  // Aquí usamos la función de limpieza
  doc.text(`${formatFecha(quote.desde)} - ${quote.hora_inicio} hs`, 30, 77);
  doc.text(`${formatFecha(quote.hasta)} - ${quote.hora_fin} hs`, 130, 77);

  // VEHÍCULO Y TOTAL
  let y = 100;
  doc.setDrawColor(230, 230, 230);
  doc.line(20, y, 190, y);
  
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Vehículo Seleccionado:", 20, y);
  doc.text(quote.auto_modelo.toUpperCase(), 120, y);
  
  y += 15;
  doc.setTextColor(...purple);
  doc.text("TOTAL PRESUPUESTO (EFECTIVO/TRANSF):", 20, y);
  doc.setTextColor(0, 0, 0);
  doc.rect(120, y-7, 70, 10);
  doc.text(`$ ${quote.total_ars.toLocaleString()}`, 125, y);

  // FINANCIACIÓN CON TARJETA
  const total = quote.total_ars;
  const opciones = [
    { t: "TARJETA CRÉDITO - 1 PAGO", v: total * 1.08 },
    { t: "TARJETA CRÉDITO - 3 PAGOS", v: total * 1.16 },
    { t: "TARJETA CRÉDITO - 6 PAGOS", v: total * 1.32 }
  ];

  opciones.forEach(opt => {
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(opt.t, 20, y);
    doc.setTextColor(0, 0, 0);
    doc.rect(120, y-7, 70, 10);
    doc.text(`$ ${Math.round(opt.v).toLocaleString()}`, 125, y);
  });

  // REQUISITOS FINALES
  y += 30;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Requisitos: +23 años, Licencia Vigente, Nafta Infinia, Garantía $450.000.", 105, y, { align: "center" });

  doc.save(`Presupuesto_GoodTrip_${quote.auto_modelo}.pdf`);
};