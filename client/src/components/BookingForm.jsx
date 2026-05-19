import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Car, Loader2, Clock, ChevronDown, ArrowRight, Star, User, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🔌 CAPTURA DINÁMICA DE LA API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BookingForm({ onQuoteGenerated, setAiContext, setIsChatOpen }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [listaAutos, setListaAutos] = useState([]);
  const [showAutoList, setShowAutoList] = useState(false);

  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_whatsapp: '',
    desde: '',
    hora_inicio: '10:00',
    hasta: '',
    hora_fin: '10:00',
    entrega: 'mendoza ciudad',
    devolucion: 'mendoza ciudad',
    auto_id: '',
    sillita: false
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const fetchAutos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard`); 
        const flota = res.data.autos || [];
        setListaAutos(flota);
        if (flota.length > 0) {
          setFormData(prev => ({ ...prev, auto_id: flota[0].id.toString() }));
        }
      } catch (err) { console.error("Error cargando flota"); }
    };
    fetchAutos();
  }, []);

  const selectedAuto = useMemo(() => 
    listaAutos.find(a => a.id.toString() === formData.auto_id.toString()), 
    [listaAutos, formData.auto_id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_nombre || !formData.cliente_whatsapp || !formData.desde || !formData.hasta) {
      alert(t('error_calc', 'Por favor completá todos los campos obligatorios.'));
      return;
    }
    setLoading(true);

    try {
      const fecha1 = new Date(formData.desde);
      const fecha2 = new Date(formData.hasta);
      const diasCalculadosLocal = Math.ceil(Math.abs(fecha2 - fecha1) / (1000 * 60 * 60 * 24)) || 1;

      const payloadCotizacion = {
        desde: formData.desde,
        hasta: formData.hasta,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        entrega: formData.entrega,
        devolucion: formData.devolucion,
        sillita: formData.sillita, 
        auto_id: formData.auto_id
      };

      let datosCalculados = {};
      try {
        const resCotizacion = await axios.post(`${API_BASE_URL}/api/prices/quote`, payloadCotizacion);
        datosCalculados = resCotizacion.data || {};
      } catch (quoteErr) { console.warn("Estimación local"); }

      const tasaDolar = datosCalculados.cotizacion || datosCalculados.tasa_dolar || 1400.00;
      const precioDiaUsd = selectedAuto?.precio_base_usd || 30;
      const precioLavadoFinal = datosCalculados.precio_lavado_aplicado ?? 12000;
      const totalArsFinal = datosCalculados.monto_total_ars || ((diasCalculadosLocal * precioDiaUsd * tasaDolar) + (formData.sillita ? 5000 * diasCalculadosLocal : 0) + precioLavadoFinal);

      const payloadDB = {
        cliente_nombre: formData.cliente_nombre,
        cliente_whatsapp: formData.cliente_whatsapp,
        fecha_inicio: formData.desde,
        hora_inicio: formData.hora_inicio + ":00", 
        fecha_fin: formData.hasta,
        hora_fin: formData.hora_fin + ":00",       
        lugar_retiro: formData.entrega,
        lugar_devolucion: formData.devolucion,
        auto_id: parseInt(formData.auto_id),
        monto_total_ars: totalArsFinal,
        tasa_dolar_usada: tasaDolar,
        sillita: formData.sillita ? 1 : 0          
      };

      await axios.post(`${API_BASE_URL}/api/admin/nueva-cotizacion`, payloadDB).catch(() => {});

      if (onQuoteGenerated) {
        onQuoteGenerated({ 
          enviado: true,
          monto_total_ars: totalArsFinal,
          cliente_nombre: formData.cliente_nombre,
          auto_modelo: selectedAuto?.modelo
        });
      }
    } catch (err) {
      alert("Error al procesar la cotización.");
    } finally {
      setLoading(false);
    }
  };

  const cardLabel = "text-[10px] font-black text-[#666D7E] uppercase tracking-wider mb-1 block ml-2 flex items-center gap-1.5 text-left";
  const bigInput = "w-full bg-[#1E222F] p-3 rounded-xl font-bold text-xs sm:text-sm text-white placeholder-[#666D7E] border border-slate-800 outline-none focus:border-[#88BDF2] transition-all";
  const selectInput = "w-full bg-[#1E222F] py-3 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-white border border-slate-800 outline-none cursor-pointer";

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit} className="bg-[#121319] p-4 sm:p-6 rounded-[1.8rem] text-white w-full flex flex-col gap-4 border border-slate-800/40 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#1E222F] pb-3 text-left">
          <Star size={14} className="text-[#88BDF2] fill-[#88BDF2]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-[#88BDF2]">{t('vip_badge', 'Configurar Cotización VIP')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <div>
            <label className={cardLabel}><User size={12} className="text-[#5383B3]"/> {t('placeholder_nombre', 'Nombre Completo')}</label>
            <input type="text" required className={bigInput} value={formData.cliente_nombre} onChange={e => setFormData({...formData, cliente_nombre: e.target.value})} />
          </div>

          <div>
            <label className={cardLabel}><Phone size={12} className="text-[#5383B3]"/> {t('placeholder_wa', 'WhatsApp')}</label>
            <input type="tel" required className={bigInput} value={formData.cliente_whatsapp} onChange={e => setFormData({...formData, cliente_whatsapp: e.target.value})} />
          </div>
          
          <div className="relative sm:col-span-2">
            <label className={cardLabel}><Car size={12} className="text-[#5383B3]"/> {t('nav_flota', 'Vehículo')}</label>
            <div onClick={() => setShowAutoList(!showAutoList)} className={`${bigInput} cursor-pointer flex items-center justify-between min-h-[52px]`}>
              {selectedAuto ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-7 bg-[#121319] rounded flex items-center justify-center border border-slate-800 flex-shrink-0">
                    <img src={`${API_BASE_URL}${selectedAuto.imagen_url}`} className="w-full h-full object-contain" alt={selectedAuto.modelo} />
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-xs font-black uppercase text-white">{selectedAuto.modelo}</span>
                    <span className="text-[9px] text-[#88BDF2] font-mono">{selectedAuto.patente} • {selectedAuto.transmision}</span>
                  </div>
                </div>
              ) : <span className="text-[#666D7E] text-xs">Seleccionar vehículo</span>}
              <ChevronDown size={16} />
            </div>

            {showAutoList && (
              <div className="absolute top-[105%] left-0 w-full bg-[#1E222F] rounded-2xl border border-slate-800 z-[110] p-2 flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {listaAutos.map(auto => (
                  <div key={auto.id} onClick={() => { setFormData({...formData, auto_id: auto.id.toString()}); setShowAutoList(false); }} className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl cursor-pointer border-b border-slate-800/50">
                    <div className="w-12 h-8 rounded overflow-hidden border border-slate-800"><img src={`${API_BASE_URL}${auto.imagen_url}`} className="w-full h-full object-cover" /></div>
                    <div className="flex-1"><p className="text-[11px] font-black uppercase text-white">{auto.modelo}</p><p className="text-[9px] text-[#666D7E]">{auto.patente} • {auto.transmision}</p></div>
                    <span className="text-[10px] font-black text-[#88BDF2]">USD {auto.precio_base_usd}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1E222F]/40 p-3 rounded-2xl border border-slate-800/60 space-y-2 text-left">
            <label className={cardLabel}><Clock size={12} className="text-[#5383B3]"/> Retiro</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" min={today} required className={`${bigInput} py-2`} value={formData.desde} onChange={e => setFormData({...formData, desde: e.target.value})} />
              <input type="time" className={`${bigInput} py-2 text-center`} value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
          </div>

          <div className="bg-[#1E222F]/40 p-3 rounded-2xl border border-slate-800/60 space-y-2 text-left">
            <label className={cardLabel}><Clock size={12} className="text-[#666D7E]"/> Devolución</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" min={formData.desde || today} required className={`${bigInput} py-2`} value={formData.hasta} onChange={e => setFormData({...formData, hasta: e.target.value})} />
              <input type="time" className={`${bigInput} py-2 text-center`} value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
          </div>

          <div>
            <label className={cardLabel}><MapPin size={12} className="text-[#5383B3]"/> Retiro</label>
            <select className={selectInput} value={formData.entrega} onChange={e => setFormData({...formData, entrega: e.target.value})}>
              <option value="mendoza ciudad">Ciudad</option>
              <option value="aeropuerto">Aeropuerto</option>
            </select>
          </div>

          <div>
            <label className={cardLabel}><MapPin size={12} className="text-[#666D7E]"/> Devolución</label>
            <select className={selectInput} value={formData.devolucion} onChange={e => setFormData({...formData, devolucion: e.target.value})}>
              <option value="mendoza ciudad">Ciudad</option>
              <option value="aeropuerto">Aeropuerto</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#88BDF2] text-[#121319] font-black py-3 rounded-xl uppercase text-xs italic flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : "COTIZAR"}
        </button>
      </form>
    </div>
  );
}