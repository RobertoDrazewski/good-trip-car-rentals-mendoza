import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Car, Loader2, Clock, ChevronDown, ArrowRight, Star, Check, User, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🔌 CAPTURA DINÁMICA DE LA API (Detecta Render en la nube, o usa localhost de respaldo)
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
      } catch (err) { 
        console.error("Error cargando flota"); 
      }
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
      // 🛠️ TRADUCIDO: Alerta de validación obligatoria
      alert(t('error_calc', 'Por favor completá todos los campos obligatorios.'));
      return;
    }
    setLoading(true);

    const fecha1 = new Date(formData.desde);
    const fecha2 = new Date(formData.hasta);
    const dTiempo = Math.abs(fecha2 - fecha1);
    const diasCalculadosLocal = Math.ceil(dTiempo / (1000 * 60 * 60 * 24)) || 1;

    try {
      const payloadCotizacion = {
        fecha_inicio: formData.desde,
        fecha_fin: formData.hasta,
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
      } catch (quoteErr) {
        console.warn("⚠️ Usando estimación de respaldo local.");
      }

      const tasaDolar = datosCalculados.cotizacion || datosCalculados.tasa_dolar || 1400.00;
      const precioDiaUsd = selectedAuto?.precio_base_usd || 30;
      const totalArsFinal = datosCalculados.monto_total_ars || datosCalculados.total || (diasCalculadosLocal * precioDiaUsd * tasaDolar);
      const diasFinales = datosCalculados.dias || diasCalculadosLocal;

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
        garantia_usd: 300.00,                      
        sillita: formData.sillita ? 1 : 0          
      };

      const token = localStorage.getItem('token');
      try {
        await axios.post(`${API_BASE_URL}/api/admin/nueva-cotizacion`, payloadDB, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } catch (dbErr) {
        await axios.post(`${API_BASE_URL}/api/admin/nueva-cotizacion`, payloadDB).catch(() => {});
      }

      if (typeof onQuoteGenerated === 'function') {
        onQuoteGenerated({ 
          enviado: true,
          monto_total_ars: totalArsFinal,
          cotizacion: tasaDolar,
          dias: diasFinales,
          precio_sillita_ars: datosCalculados.precio_sillita_ars || (formData.sillita ? 5000 : 0),
          garantia_usd: 300.00,
          cliente_nombre: formData.cliente_nombre,
          cliente_whatsapp: formData.cliente_whatsapp,
          entrega: formData.entrega,
          devolucion: formData.devolucion,
          sillita: formData.sillita, 
          auto_modelo: selectedAuto?.modelo || 'FIAT CRONOS PRECISION',
          desde: formData.desde,
          hasta: formData.hasta,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin
        });
      }

      if (typeof setAiContext === 'function') {
        setAiContext({ auto: selectedAuto?.modelo, desde: formData.desde, hasta: formData.hasta, total: totalArsFinal });
      }

      setTimeout(() => {
        document.getElementById('resultado-solicitud')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error(err);
      alert("Error al procesar el presupuesto de reserva.");
    } finally {
      setLoading(false);
    }
  };

  /* Estilos responsivos reutilizables */
  const cardLabel = "text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1.5 sm:mb-2 block ml-2 sm:ml-4 flex items-center gap-2";
  const bigInput = "w-full bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-base text-slate-800 border-2 border-transparent focus:border-yellow-500 focus:bg-white outline-none transition-all shadow-inner";

  return (
    <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* BADGE FLOTANTE DE PRESENTACIÓN */}
      <div className="absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2.5 sm:px-10 sm:py-4 rounded-full shadow-2xl z-40 flex items-center gap-2 sm:gap-3 border-2 border-yellow-500/20 whitespace-nowrap">
        <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
        <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] italic text-white">
          {t('vip_badge', 'Solicitar Presupuesto VIP')}
        </span>
      </div>

      {/* CONTENEDOR DEL FORMULARIO */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white/95 backdrop-blur-3xl p-4 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-slate-100 relative -mt-16 sm:-mt-24 md:-mt-32 z-30 text-slate-900"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12 w-full">
          
          {/* BLOQUE 1: DATOS GENERALES Y AUTO */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className={cardLabel}><User size={13}/> {t('placeholder_nombre', 'Nombre Completo')}</label>
              <input type="text" required placeholder={t('placeholder_nombre', 'Nombre Completo')} className={bigInput} value={formData.cliente_nombre} onChange={e => setFormData({...formData, cliente_nombre: e.target.value})} />
            </div>
            <div>
              <label className={cardLabel}><Phone size={13}/> {t('placeholder_wa', 'Teléfono WhatsApp')}</label>
              <input type="tel" required placeholder="WhatsApp" className={bigInput} value={formData.cliente_whatsapp} onChange={e => setFormData({...formData, cliente_whatsapp: e.target.value})} />
            </div>
            
            <div className="relative z-50">
              <label className={cardLabel}><Car size={13}/> {t('nav_flota', 'Vehículo Seleccionado')}</label>
              <div 
                onClick={() => setShowAutoList(!showAutoList)} 
                className={`${bigInput} cursor-pointer flex items-center gap-3 sm:gap-4 h-[85px] sm:h-[95px] border-2 ${showAutoList ? 'border-yellow-500 bg-white shadow-md' : 'border-transparent'}`}
              >
                {selectedAuto ? (
                  <>
                    <div className="w-16 h-12 sm:w-20 sm:h-14 bg-white rounded-lg sm:rounded-xl flex items-center justify-center p-1 shadow-sm overflow-hidden border border-slate-100 flex-shrink-0">
                      <img src={`${API_BASE_URL}${selectedAuto.imagen_url}`} alt={selectedAuto.modelo} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=200&auto=format&fit=crop"; }} />
                    </div>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className="text-[12px] sm:text-[13px] font-black uppercase italic leading-tight text-slate-900 truncate">{selectedAuto.modelo}</span>
                      <span className="text-[8px] sm:text-[9px] text-yellow-600 font-black bg-yellow-50 px-1.5 py-0.5 rounded mt-1 w-fit font-mono">{selectedAuto.patente || 'S/P'}</span>
                    </div>
                  </>
                ) : <span className="text-slate-400 font-bold text-sm">{t('select_car_label', 'Seleccionar Auto')}</span>}
                <ChevronDown className="ml-auto text-slate-400 flex-shrink-0" size={18} />
              </div>

              {showAutoList && (
                <>
                  <div className="fixed inset-0 z-[105]" onClick={() => setShowAutoList(false)}></div>
                  <div className="absolute top-[105%] left-0 w-full bg-white rounded-xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200 z-[110] max-h-[250px] overflow-y-auto p-2 flex flex-col gap-1.5">
                    {listaAutos.map(auto => (
                      <div key={auto.id} onClick={() => { setFormData({ ...formData, auto_id: auto.id.toString() }); setShowAutoList(false); }} className={`p-2.5 rounded-lg sm:rounded-[1.8rem] flex items-center gap-3 sm:gap-4 cursor-pointer transition-all ${formData.auto_id === auto.id.toString() ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-100 bg-slate-50'}`}>
                        <div className="w-14 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm overflow-hidden flex-shrink-0 border border-slate-100"><img src={`${API_BASE_URL}${auto.imagen_url}`} className="w-full h-full object-contain" alt="car" /></div>
                        <p className="text-[11px] sm:text-[12px] font-black uppercase italic truncate">{auto.modelo}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* BLOQUE 2: CALENDARIO - FECHAS Y HORAS */}
          <div className="space-y-4 sm:space-y-6 bg-slate-50/50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3.5rem] border border-slate-100">
            <div>
              <label className={cardLabel}><Clock size={13} className="text-yellow-500"/> {t('label_retiro', 'Fecha de Retiro')}</label>
              <input type="date" min={today} required className={bigInput} value={formData.desde} onChange={e => setFormData({...formData, desde: e.target.value})} />
              <input type="time" className={`${bigInput} mt-1.5 sm:mt-2 text-center text-lg sm:text-xl italic font-black py-2 sm:py-4`} value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
            <div>
              <label className={cardLabel}><Clock size={13} className="text-red-500"/> {t('label_devolucion', 'Fecha de Entrega')}</label>
              <input type="date" min={formData.desde || today} required className={bigInput} value={formData.hasta} onChange={e => setFormData({...formData, hasta: e.target.value})} />
              <input type="time" className={`${bigInput} mt-1.5 sm:mt-2 text-center text-lg sm:text-xl italic font-black py-2 sm:py-4`} value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
          </div>

          {/* BLOQUE 3: LOGÍSTICA DE PUNTOS Y ENVÍO */}
          <div className="flex flex-col justify-between space-y-4 sm:space-y-6 w-full">
            <div className="space-y-4">
              <div>
                <label className={cardLabel}><MapPin size={13} className="text-yellow-500"/> {t('lugar_retiro', 'Lugar Retiro')}</label>
                <select className={`${bigInput} py-3.5 sm:py-6`} value={formData.entrega} onChange={e => setFormData({...formData, entrega: e.target.value})}>
                  <option value="mendoza ciudad">{t('loc_ciudad', 'Ciudad (Gratis)')}</option>
                  <option value="aeropuerto">{t('loc_aeropuerto', 'Aeropuerto')}</option>
                </select>
              </div>
              <div>
                <label className={cardLabel}><MapPin size={13} className="text-slate-400"/> {t('lugar_entrega', 'Lugar Devolución')}</label>
                <select className={`${bigInput} py-3.5 sm:py-6`} value={formData.devolucion} onChange={e => setFormData({...formData, devolucion: e.target.value})}>
                  <option value="mendoza ciudad">{t('loc_ciudad', 'Ciudad (Gratis)')}</option>
                  <option value="aeropuerto">{t('loc_aeropuerto', 'Aeropuerto')}</option>
                </select>
              </div>

              {/* SILLITA DE BEBÉ ADAPTABLE */}
              <div onClick={() => setFormData({ ...formData, sillita: !formData.sillita })} className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${formData.sillita ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">👶</span>
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-tight">
                    {t('silla_bebe_q', '¿Necesitás Sillita?')}
                  </p>
                </div>
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${formData.sillita ? 'bg-yellow-500 border-yellow-500 text-slate-900' : 'border-slate-300'}`}>{formData.sillita && <Check size={11} strokeWidth={4} />}</div>
              </div>
            </div>

            {/* BOTÓN ENVIAR */}
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-slate-900 text-slate-950 hover:text-white font-black py-4 sm:py-7 rounded-xl sm:rounded-[2.5rem] transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-xl active:scale-95 duration-150 cursor-pointer mt-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><span className="uppercase text-xs sm:text-[13px] font-black italic tracking-wider">{t('btn_cotizar', 'COTIZAR')}</span><ArrowRight size={18}/></>}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}