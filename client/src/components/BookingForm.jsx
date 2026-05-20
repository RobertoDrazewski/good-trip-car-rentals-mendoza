import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Car, Clock, User, Phone, MapPin, ChevronDown, Baby, Loader2, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BookingForm({ onQuoteGenerated, setIsChatOpen, setAiContext }) {
  const [loading, setLoading] = useState(false);
  const [listaAutos, setListaAutos] = useState([]);
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [preciosMes, setPreciosMes] = useState({});
  const [showAutoList, setShowAutoList] = useState(false);
  const [promoActiva, setPromoActiva] = useState(null);

  const [formData, setFormData] = useState({
    cliente_nombre: '', cliente_whatsapp: '', desde: '', hasta: '',
    hora_inicio: '10:00', hora_fin: '10:00', entrega: 'mendoza ciudad',
    devolucion: 'mendoza ciudad', auto_id: '', sillita: false
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [dash, precios, promo] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/dashboard`),
          axios.get(`${API_BASE_URL}/api/admin/precios-mensuales`).catch(() => ({data: []})),
          axios.get(`${API_BASE_URL}/api/promos/active`).catch(() => ({data: null}))
        ]);
        
        setListaAutos(dash.data.autos || []);
        setReservasExistentes(dash.data.reservas || []);
        const mapa = {}; precios.data.forEach(p => mapa[p.mes] = p);
        setPreciosMes(mapa);
        if (promo.data) setPromoActiva(promo.data);
        if (dash.data.autos?.length > 0) setFormData(prev => ({ ...prev, auto_id: dash.data.autos[0].id.toString() }));
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
    
    const conflicto = reservasExistentes.find(r => 
        r.auto_id.toString() === formData.auto_id && r.estado !== 'rechazado' &&
        (inicio < new Date(`${r.fecha_fin.split('T')[0]}T${r.hora_fin}`) && fin > new Date(`${r.fecha_inicio.split('T')[0]}T${r.hora_inicio}`))
    );

    if (conflicto) {
      alert("⚠️ El vehículo seleccionado no está disponible en este rango.");
      if(setIsChatOpen) setIsChatOpen(true);
      setLoading(false); return;
    }

    const dias = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)));
    const mes = new Date(formData.desde).getMonth() + 1;
    const tarifa = preciosMes[mes] || { precio_dia: 45000, cargo_aeropuerto: 36000, precio_sillita: 5000, garantia_usd: 300, cotizacion_dolar: 1400 };

    let totalSuma = (dias * tarifa.precio_dia) + (formData.sillita ? dias * tarifa.precio_sillita : 0) + 
                    (formData.entrega === 'aeropuerto' ? tarifa.cargo_aeropuerto : 0) + 
                    (formData.devolucion === 'aeropuerto' ? tarifa.cargo_aeropuerto : 0) + 12000;
    
    let descuentoAplicado = 0;
    if (promoActiva && formData.desde >= promoActiva.fecha_inicio.split('T')[0] && formData.desde <= promoActiva.fecha_fin.split('T')[0]) {
      descuentoAplicado = totalSuma * (Number(promoActiva.descuento) / 100);
      totalSuma -= descuentoAplicado;
    }

    onQuoteGenerated({ ...formData, dias, monto_total_ars: totalSuma, descuento_aplicado_ars: descuentoAplicado, auto_modelo: selectedAuto?.modelo });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-full p-8 rounded-[2.5rem] bg-[#121319]/60 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col gap-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#88BDF2] italic border-b border-white/10 pb-4">
        Configurar Reserva VIP
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" required placeholder="Nombre completo" className="bg-white/5 p-4 rounded-xl text-xs font-bold text-white placeholder-white/20 border border-white/5 outline-none focus:border-[#88BDF2]" onChange={e => setFormData({...formData, cliente_nombre: e.target.value})} />
        <input type="tel" required placeholder="WhatsApp" className="bg-white/5 p-4 rounded-xl text-xs font-bold text-white placeholder-white/20 border border-white/5 outline-none focus:border-[#88BDF2]" onChange={e => setFormData({...formData, cliente_whatsapp: e.target.value})} />
        
        {/* Selector de Auto */}
<div className="sm:col-span-2 relative">
  <div onClick={() => setShowAutoList(!showAutoList)} className="bg-white/5 p-3 rounded-xl cursor-pointer flex justify-between items-center border border-white/5 hover:border-[#88BDF2]/30 transition-all">
    {selectedAuto ? (
      <div className="flex items-center gap-3">
        <img src={`${API_BASE_URL}${selectedAuto.imagen_url}`} className="w-14 h-8 object-cover rounded-lg" alt={selectedAuto.modelo} />
        <div>
          <div className="text-xs font-black text-white uppercase">{selectedAuto.modelo}</div>
          <div className="text-[9px] text-[#6F7D93] uppercase font-bold tracking-widest">
            {selectedAuto.patente} • {selectedAuto.transmision}
          </div>
        </div>
      </div>
    ) : (
      <span className="text-xs font-bold text-[#6F7D93] px-2">Seleccionar vehículo</span>
    )}
    <ChevronDown size={16} className="text-[#88BDF2]"/>
  </div>

  {showAutoList && (
    <div className="absolute w-full bg-[#121319] border border-slate-700 z-50 rounded-xl mt-2 p-2 max-h-48 overflow-y-auto shadow-2xl">
      {listaAutos.map(a => (
        <div 
          key={a.id} 
          className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3" 
          onClick={() => {setFormData({...formData, auto_id: a.id.toString()}); setShowAutoList(false)}}
        >
          <img src={`${API_BASE_URL}${a.imagen_url}`} className="w-12 h-7 object-cover rounded" alt={a.modelo} />
          <div>
            <div className="text-xs font-black text-white uppercase">{a.modelo}</div>
            <div className="text-[9px] text-[#6F7D93] uppercase font-bold">{a.patente} • {a.transmision}</div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Inputs de Fecha y Hora */}
        {[
           { label: "Fecha Retiro", type: "date", key: "desde", icon: <Calendar size={12}/> },
           { label: "Hora Retiro", type: "time", key: "hora_inicio", icon: <Clock size={12}/> },
           { label: "Fecha Devolución", type: "date", key: "hasta", icon: <Calendar size={12}/> },
           { label: "Hora Devolución", type: "time", key: "hora_fin", icon: <Clock size={12}/> }
        ].map((field, i) => (
           <div key={i} className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-[#6F7D93] uppercase ml-2 flex items-center gap-1">{field.icon} {field.label}</label>
              <input type={field.type} required className="bg-white/5 p-3 rounded-xl text-xs font-bold border border-white/5 outline-none focus:border-[#88BDF2]" onChange={e => setFormData({...formData, [field.key]: e.target.value})} />
           </div>
        ))}

        {/* Lugar Entrega/Devolución */}
        {['entrega', 'devolucion'].map((field, i) => (
          <div key={i} className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-[#6F7D93] uppercase ml-2 flex items-center gap-1"><MapPin size={12}/> Lugar {field === 'entrega' ? 'Retiro' : 'Devolución'}</label>
            <select className="bg-white/5 p-3 rounded-xl text-xs font-bold border border-white/5 outline-none focus:border-[#88BDF2]" onChange={e => setFormData({...formData, [field]: e.target.value})}>
              <option value="mendoza ciudad">Ciudad de Mendoza</option>
              <option value="aeropuerto">Aeropuerto</option>
            </select>
          </div>
        ))}
        
        <label className="sm:col-span-2 flex items-center gap-3 bg-white/5 p-4 rounded-xl cursor-pointer border border-white/5">
          <input type="checkbox" className="accent-[#88BDF2]" onChange={e => setFormData({...formData, sillita: e.target.checked})} />
          <div className="flex items-center gap-2 font-black text-xs uppercase italic"><Baby className="text-[#88BDF2]" size={16}/> Incluir sillita de bebé</div>
        </label>
      </div>

      <button type="submit" className="w-full bg-[#88BDF2] text-[#121319] font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg hover:shadow-[0_0_20px_rgba(136,189,242,0.4)]">
        {loading ? <Loader2 className="animate-spin" size={20}/> : "COTIZAR RESERVA"}
      </button>
    </form>
  );
}