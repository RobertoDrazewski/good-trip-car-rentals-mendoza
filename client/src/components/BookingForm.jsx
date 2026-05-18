import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Car, Loader2, Clock, ChevronDown, ArrowRight, Star, Check, User, Phone, MapPin } from 'lucide-react';
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
      let usoRespaldoLocal = false;

      try {
        const resCotizacion = await axios.post(`${API_BASE_URL}/api/prices/quote`, payloadCotizacion);
        datosCalculados = resCotizacion.data || {};
      } catch (quoteErr) {
        console.warn("⚠️ Usando estimación de respaldo local por fallo de comunicación:", quoteErr);
        usoRespaldoLocal = true;
      }

      const tasaDolar = datosCalculados.cotizacion || datosCalculados.tasa_dolar || 1400.00;
      const precioDiaUsd = selectedAuto?.precio_base_usd || 30;
      const lavadoResguardoLocal = 12000; 
      
      const precioLavadoFinal = datosCalculados.precio_lavado_aplicado !== undefined 
        ? datosCalculados.precio_lavado_aplicado 
        : lavadoResguardoLocal;

      const totalArsFinal = !usoRespaldoLocal && datosCalculados.monto_total_ars
        ? datosCalculados.monto_total_ars
        : ((diasCalculadosLocal * precioDiaUsd * tasaDolar) + (formData.sillita ? 5000 * diasCalculadosLocal : 0) + precioLavadoFinal);
      
      const diasFinales = datosCalculados.dias_totales || datosCalculados.dias || diasCalculadosLocal;

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
          precio_lavado_aplicado: precioLavadoFinal,
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

    } catch (err) {
      console.error(err);
      alert("Error al procesar el presupuesto de reserva.");
    } finally {
      setLoading(false);
    }
  };

  /* 🛠️ OPTIMIZADO: Clases modulares limpias sin alturas rígidas (h-[52px] o h-[44px]) que rompen las fuentes */
  const cardLabel = "text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block ml-2 flex items-center gap-1.5 text-left";
  const bigInput = "w-full bg-slate-50 p-3 sm:p-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-800 border-2 border-transparent focus:border-sky-500 focus:bg-white outline-none transition-all shadow-inner";
  
  /* 🛠️ NUEVO: Estilo exclusivo para los selectores de destino que evita el corte a la mitad */
  const selectInput = "w-full bg-slate-50 py-3 px-3.5 pr-8 rounded-xl font-bold text-xs sm:text-sm text-slate-800 border-2 border-transparent focus:border-sky-500 focus:bg-white outline-none transition-all shadow-inner bg-[right_12px_center] cursor-pointer";

  return (
    <div className="w-full relative">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-4 sm:p-6 rounded-[1.8rem] relative z-30 text-slate-800 w-full flex flex-col gap-4"
      >
        <div className="flex items-center gap-2 border-b border-slate-50 pb-2 text-left">
          <Star size={14} className="text-sky-500 fill-sky-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">{t('vip_badge', 'Configurar Cotización VIP')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {/* CAMPO: NOMBRE */}
          <div>
            <label className={cardLabel}><User size={12} className="text-sky-500"/> {t('placeholder_nombre', 'Nombre Completo')}</label>
            <input type="text" required placeholder={t('placeholder_nombre', 'Nombre Completo')} className={bigInput} value={formData.cliente_nombre} onChange={e => setFormData({...formData, cliente_nombre: e.target.value})} />
          </div>

          {/* CAMPO: WHATSAPP */}
          <div>
            <label className={cardLabel}><Phone size={12} className="text-sky-500"/> {t('placeholder_wa', 'Teléfono WhatsApp')}</label>
            <input type="tel" required placeholder="Ej: 2612764618" className={bigInput} value={formData.cliente_whatsapp} onChange={e => setFormData({...formData, cliente_whatsapp: e.target.value})} />
          </div>
          
          {/* CAMPO: VEHÍCULO SELECCIONADO */}
          <div className="relative sm:col-span-2">
            <label className={cardLabel}><Car size={12} className="text-sky-500"/> {t('nav_flota', 'Vehículo Seleccionado')}</label>
            <div 
              onClick={() => setShowAutoList(!showAutoList)} 
              className={`${bigInput} cursor-pointer flex items-center justify-between border-2 ${showAutoList ? 'border-sky-500 bg-white shadow-sm' : 'border-transparent'}`}
            >
              {selectedAuto ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-7 bg-white rounded-md flex items-center justify-center p-0.5 shadow-sm overflow-hidden border border-slate-100 flex-shrink-0">
                    <img src={`${API_BASE_URL}${selectedAuto.imagen_url}`} alt={selectedAuto.modelo} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=200&auto=format&fit=crop"; }} />
                  </div>
                  <p className="text-xs font-black uppercase italic text-slate-800 truncate">{selectedAuto.modelo}</p>
                  <span className="text-[8px] font-mono font-black bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded tracking-wider">{selectedAuto.patente || 'S/P'}</span>
                </div>
              ) : <span className="text-slate-400 font-bold text-xs">{t('select_car_label', 'Seleccionar Auto')}</span>}
              <ChevronDown className="text-slate-400 flex-shrink-0" size={16} />
            </div>

            {showAutoList && (
              <>
                <div className="fixed inset-0 z-[105]" onClick={() => setShowAutoList(false)}></div>
                <div className="absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 z-[110] max-h-[180px] overflow-y-auto p-1.5 flex flex-col gap-1">
                  {listaAutos.map(auto => (
                    <div key={auto.id} onClick={() => { setFormData({ ...formData, auto_id: auto.id.toString() }); setShowAutoList(false); }} className={`p-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${formData.auto_id === auto.id.toString() ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 bg-slate-50/70'}`}>
                      <div className="w-8 h-6 bg-white rounded flex items-center justify-center p-0.5 shadow-sm overflow-hidden flex-shrink-0 border border-slate-100"><img src={`${API_BASE_URL}${auto.imagen_url}`} className="w-full h-full object-contain" alt="car" /></div>
                      <p className="text-[11px] font-black uppercase italic truncate">{auto.modelo}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RETIRO CRONOLÓGICO */}
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 space-y-2 text-left">
            <label className={cardLabel}><Clock size={12} className="text-sky-500"/> {t('label_retiro', 'Fecha / Hora Retiro')}</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" min={today} required className={`${bigInput} bg-white py-2`} value={formData.desde} onChange={e => setFormData({...formData, desde: e.target.value})} />
              <input type="time" className={`${bigInput} bg-white py-2 text-center`} value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
          </div>

          {/* DEVOLUCIÓN CRONOLÓGICA */}
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 space-y-2 text-left">
            <label className={cardLabel}><Clock size={12} className="text-slate-400"/> {t('label_devolucion', 'Fecha / Hora Devolución')}</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" min={formData.desde || today} required className={`${bigInput} bg-white py-2`} value={formData.hasta} onChange={e => setFormData({...formData, hasta: e.target.value})} />
              <input type="time" className={`${bigInput} bg-white py-2 text-center`} value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
          </div>

          {/* 🛠️ REPARADO: Se reemplazó h-[44px] y bigInput por selectInput para evitar fuentes cortadas */}
          <div>
            <label className={cardLabel}><MapPin size={12} className="text-sky-500"/> {t('lugar_retiro', 'Lugar Retiro')}</label>
            <select className={selectInput} value={formData.entrega} onChange={e => setFormData({...formData, entrega: e.target.value})}>
              <option value="mendoza ciudad">{t('loc_ciudad', 'Ciudad (Gratis)')}</option>
              <option value="aeropuerto">{t('loc_aeropuerto', 'Aeropuerto')}</option>
            </select>
          </div>

          {/* 🛠️ REPARADO: Se reemplazó h-[44px] y bigInput por selectInput para evitar fuentes cortadas */}
          <div>
            <label className={cardLabel}><MapPin size={12} className="text-slate-400"/> {t('lugar_entrega', 'Lugar Devolución')}</label>
            <select className={selectInput} value={formData.devolucion} onChange={e => setFormData({...formData, devolucion: e.target.value})}>
              <option value="mendoza ciudad">{t('loc_ciudad', 'Ciudad (Gratis)')}</option>
              <option value="aeropuerto">{t('loc_aeropuerto', 'Aeropuerto')}</option>
            </select>
          </div>

          {/* ADICIONAL SILLITA */}
          <div 
            onClick={() => setFormData({ ...formData, sillita: !formData.sillita })} 
            className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all sm:col-span-2 ${formData.sillita ? 'bg-slate-800 border-slate-800 text-white' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">👶</span>
              <p className="text-[10px] font-black uppercase tracking-tight">{t('silla_bebe_q', '¿Necesitás Sillita?')}</p>
            </div>
            <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${formData.sillita ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300'}`}>
              {formData.sillita && <Check size={10} strokeWidth={4} />}
            </div>
          </div>

        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-slate-800 hover:bg-sky-500 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 duration-100 cursor-pointer mt-1"
        >
          {loading ? (
            <Loader2 className="animate-spin text-white" size={16} />
          ) : (
            <>
              <span className="uppercase text-xs font-black italic tracking-wider">{t('btn_cotizar', 'COTIZAR AHORA')}</span>
              <ArrowRight size={14}/>
            </>
          )}
        </button>
      </form>
    </div>
  );
}