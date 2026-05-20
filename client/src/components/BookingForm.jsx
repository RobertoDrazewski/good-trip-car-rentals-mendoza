import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Clock, User, Phone, MapPin, ChevronDown, Baby, Loader2, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BookingForm({ onQuoteGenerated, setIsChatOpen, setAiContext }) {
  const [loading, setLoading] = useState(false);
  const [listaAutos, setListaAutos] = useState([]);
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [preciosMes, setPreciosMes] = useState({});
  const [showAutoList, setShowAutoList] = useState(false);
  
  // 🔴 NUEVO ESTADO PARA LA PROMOCIÓN
  const [promoActiva, setPromoActiva] = useState(null);

  const [formData, setFormData] = useState({
    cliente_nombre: '', cliente_whatsapp: '', desde: '', hasta: '',
    hora_inicio: '10:00', hora_fin: '10:00', entrega: 'mendoza ciudad',
    devolucion: 'mendoza ciudad', auto_id: '', sillita: false
  });

  useEffect(() => {
    const init = async () => {
      try {
        // 🔴 AGREGAMOS LA PROMOCIÓN A LA CONSULTA INICIAL PARA NO DEMORAR LA CARGA
        const [dash, precios, promo] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/dashboard`),
          axios.get(`${API_BASE_URL}/api/admin/precios-mensuales`).catch(() => ({data: []})),
          axios.get(`${API_BASE_URL}/api/promos/active`).catch(() => ({data: null}))
        ]);
        
        setListaAutos(dash.data.autos || []);
        setReservasExistentes(dash.data.reservas || []);
        
        const mapa = {}; 
        precios.data.forEach(p => mapa[p.mes] = p);
        setPreciosMes(mapa);
        
        // Guardamos la promo si es que hay una vigente
        if (promo.data) setPromoActiva(promo.data);

        if (dash.data.autos?.length > 0) {
          setFormData(prev => ({ ...prev, auto_id: dash.data.autos[0].id.toString() }));
        }
      } catch (e) { console.error("Error al cargar datos:", e); }
    };
    init();
  }, []);

  const selectedAuto = listaAutos.find(a => a.id.toString() === formData.auto_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const inicio = new Date(`${formData.desde}T${formData.hora_inicio}`);
    const fin = new Date(`${formData.hasta}T${formData.hora_fin}`);
    
    // Validación de Disponibilidad Crucial
    const conflicto = reservasExistentes.find(r => 
        r.auto_id.toString() === formData.auto_id && r.estado !== 'rechazado' &&
        (inicio < new Date(`${r.fecha_fin.split('T')[0]}T${r.hora_fin}`) && fin > new Date(`${r.fecha_inicio.split('T')[0]}T${r.hora_inicio}`))
    );

    if (conflicto) {
      alert("⚠️ El vehículo seleccionado no está disponible en este rango. Por favor, selecciona otro.");
      if(setIsChatOpen) setIsChatOpen(true);
      if(setAiContext) setAiContext("El cliente intentó reservar un auto que está ocupado.");
      setLoading(false); 
      return;
    }

    const dias = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)));
    const mes = new Date(formData.desde).getMonth() + 1;
    const tarifa = preciosMes[mes] || { precio_dia: 45000, cargo_aeropuerto: 15000, precio_sillita: 5000, garantia_usd: 300, cotizacion_dolar: 1400 };

    // CÁLCULO ESTRICTO CON NÚMEROS
    const costoAlquiler = Number(dias) * Number(tarifa.precio_dia);
    const costoSillita = formData.sillita ? (Number(dias) * Number(tarifa.precio_sillita)) : 0;
    const cargoEntrega = (formData.entrega === 'aeropuerto' ? Number(tarifa.cargo_aeropuerto) : 0);
    const cargoDevolucion = (formData.devolucion === 'aeropuerto' ? Number(tarifa.cargo_aeropuerto) : 0);
    const costoLavado = 12000;
    
    let totalSuma = costoAlquiler + costoSillita + cargoEntrega + cargoDevolucion + costoLavado;
    let descuentoAplicado = 0;
    let porcentajePromo = 0;

    // 🔴 LÓGICA DE PROMOCIÓN ACTIVA Y CADUCIDAD
    if (promoActiva) {
      // Usamos comparación de strings ISO (YYYY-MM-DD) para evitar bugs de zona horaria
      const fechaReserva = formData.desde;
      const promoInicio = promoActiva.fecha_inicio.split('T')[0];
      const promoFin = promoActiva.fecha_fin.split('T')[0];

      // Si la fecha de retiro cae dentro del rango de la promoción
      if (fechaReserva >= promoInicio && fechaReserva <= promoFin) {
        porcentajePromo = Number(promoActiva.descuento);
        descuentoAplicado = totalSuma * (porcentajePromo / 100);
        totalSuma = totalSuma - descuentoAplicado; // Aplicamos el descuento al total final
      }
    }

    onQuoteGenerated({
      enviado: true,
      cliente_nombre: formData.cliente_nombre,
      cliente_whatsapp: formData.cliente_whatsapp,
      desde: formData.desde,
      hasta: formData.hasta,
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      entrega: formData.entrega,
      devolucion: formData.devolucion,
      sillita: formData.sillita,
      auto_id: formData.auto_id,
      auto_modelo: selectedAuto ? `${selectedAuto.modelo} | ${selectedAuto.patente} | ${selectedAuto.transmision}` : "Vehículo",
      dias: dias,
      monto_total_ars: totalSuma, // 🔴 Total ya con descuento
      descuento_aplicado_ars: descuentoAplicado, // 🔴 Pasamos el valor por si quieres mostrarlo en el QuoteResult
      porcentaje_promo: porcentajePromo, // 🔴 Pasamos el % por si quieres mostrarlo
      precio_sillita_ars: tarifa.precio_sillita,
      precio_lavado_aplicado: costoLavado,
      garantia_usd: tarifa.garantia_usd,
      cotizacion: tarifa.cotizacion_dolar
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#121319] p-6 rounded-[2rem] border border-slate-800 text-white flex flex-col gap-4 shadow-2xl w-full">
      <h3 className="text-sm font-black uppercase text-[#88BDF2] border-b border-slate-800 pb-3">Configurar Reserva VIP</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" required placeholder="Nombre completo" className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, cliente_nombre: e.target.value})} />
        <input type="tel" required placeholder="WhatsApp" className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, cliente_whatsapp: e.target.value})} />
        
        <div className="sm:col-span-2 relative">
          <div onClick={() => setShowAutoList(!showAutoList)} className="bg-[#1E222F] p-4 rounded-xl cursor-pointer flex justify-between items-center">
            {selectedAuto ? (
              <div className="flex items-center gap-3">
                <img src={`${API_BASE_URL}${selectedAuto.imagen_url}`} className="w-12 h-8 object-cover rounded" alt="auto" />
                <div>
                  <div className="font-bold text-sm text-white">{selectedAuto.modelo}</div>
                  <div className="text-[10px] text-[#666D7E] uppercase">{selectedAuto.patente} • {selectedAuto.transmision}</div>
                </div>
              </div>
            ) : "Seleccionar vehículo"}
            <ChevronDown size={18} className="text-[#88BDF2]"/>
          </div>
          {showAutoList && (
            <div className="absolute w-full bg-[#121319] border border-slate-700 z-50 rounded-xl mt-2 p-2 max-h-48 overflow-y-auto shadow-2xl">
              {listaAutos.map(a => (
                <div key={a.id} className="p-3 hover:bg-[#1E222F] border-b border-slate-800 text-sm cursor-pointer flex items-center gap-3" onClick={() => {setFormData({...formData, auto_id: a.id.toString()}); setShowAutoList(false)}}>
                  <img src={`${API_BASE_URL}${a.imagen_url}`} className="w-10 h-6 object-cover rounded" />
                  <div>
                     <span className="font-bold text-white">{a.modelo}</span>
                     <span className="text-[10px] text-[#666D7E] block uppercase">{a.patente} ({a.transmision})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[#666D7E] uppercase ml-2 flex items-center gap-1"><Calendar size={12}/> Fecha Retiro</label>
          <input type="date" required className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, desde: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[#666D7E] uppercase ml-2 flex items-center gap-1"><Clock size={12}/> Hora Retiro</label>
          <input type="time" required className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[#666D7E] uppercase ml-2 flex items-center gap-1"><Calendar size={12}/> Fecha Devolución</label>
          <input type="date" required className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, hasta: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[#666D7E] uppercase ml-2 flex items-center gap-1"><Clock size={12}/> Hora Devolución</label>
          <input type="time" required className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
        </div>
        
        <div className="flex flex-col gap-1">
           <label className="text-[10px] font-black text-[#666D7E] uppercase ml-2 flex items-center gap-1"><MapPin size={12}/> Lugar Entrega</label>
           <select className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, entrega: e.target.value})}>
             <option value="mendoza ciudad">Ciudad de Mendoza</option>
             <option value="aeropuerto">Aeropuerto</option>
           </select>
        </div>
        
        <div className="flex flex-col gap-1">
           <label className="text-[10px] font-black text-[#666D7E] uppercase ml-2 flex items-center gap-1"><MapPin size={12}/> Lugar Devolución</label>
           <select className="bg-[#1E222F] p-4 rounded-xl text-sm" onChange={e => setFormData({...formData, devolucion: e.target.value})}>
             <option value="mendoza ciudad">Ciudad de Mendoza</option>
             <option value="aeropuerto">Aeropuerto</option>
           </select>
        </div>
        
        <label className="sm:col-span-2 flex items-center gap-3 bg-[#1E222F] p-4 rounded-xl cursor-pointer mt-1">
          <input type="checkbox" className="w-5 h-5 accent-[#88BDF2]" onChange={e => setFormData({...formData, sillita: e.target.checked})} />
          <div className="flex items-center gap-2 font-bold text-sm"><Baby className="text-[#88BDF2]"/> Incluir sillita de bebé</div>
        </label>
      </div>
      <button type="submit" className="w-full bg-[#88BDF2] text-[#121319] font-black py-4 rounded-xl mt-2 uppercase transition-all flex justify-center items-center gap-2">
        {loading ? <Loader2 className="animate-spin text-[#121319]" size={20}/> : "COTIZAR RESERVA"}
      </button>
    </form>
  );
}