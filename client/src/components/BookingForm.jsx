import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Car, Loader2, Clock, ChevronDown, ArrowRight, Star, Check, User, Phone, MapPin } from 'lucide-react';

export default function BookingForm({ onQuoteGenerated, setAiContext, setIsChatOpen }) {
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
        const res = await axios.get('http://localhost:3001/api/admin/dashboard'); 
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
      alert("Por favor completá todos los campos obligatorios.");
      return;
    }
    setLoading(true);

    const fecha1 = new Date(formData.desde);
    const fecha2 = new Date(formData.hasta);
    const diferenciaTiempo = Math.abs(fecha2 - fecha1);
    const diasCalculadosLocal = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) || 1;

    try {
      // 1. OBTENER PRECIO DESDE EL COTIZADOR PÚBLICO
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
        const resCotizacion = await axios.post('http://localhost:3001/api/prices/quote', payloadCotizacion);
        datosCalculados = resCotizacion.data || {};
      } catch (quoteErr) {
        console.warn("⚠️ Usando estimación de respaldo local.");
      }

      const tasaDolar = datosCalculados.cotizacion || datosCalculados.tasa_dolar || 1400.00;
      const precioDiaUsd = selectedAuto?.precio_base_usd || 30;
      const totalArsFinal = datosCalculados.monto_total_ars || datosCalculados.total || (diasCalculadosLocal * precioDiaUsd * tasaDolar);
      const diasFinales = datosCalculados.dias || diasCalculadosLocal;

      // 2. PAYLOAD EN NOMBRE DE COLUMNAS EXACTAS PARA TU MODELO DE EXPRESS / BD
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

      // 3. PERSISTENCIA DIRECTA EN LA BASE DE DATOS
      const token = localStorage.getItem('token');
      try {
        await axios.post('http://localhost:3001/api/admin/nueva-cotizacion', payloadDB, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } catch (dbErr) {
        // Fallback sin token por si el endpoint es abierto para clientes web
        await axios.post('http://localhost:3001/api/admin/nueva-cotizacion', payloadDB).catch(() => {});
      }

      // 4. ENVÍO DE DATOS A QUOTE_RESULT
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

  const cardLabel = "text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-4 flex items-center gap-2";
  const bigInput = "w-full bg-slate-50 p-6 rounded-[2rem] font-black text-slate-800 border-2 border-transparent focus:border-yellow-500 focus:bg-white outline-none transition-all shadow-inner";

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4">
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3 border-2 border-yellow-500/20">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span className="text-xs font-black uppercase tracking-[0.3em] italic text-white">Solicitar Presupuesto VIP</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative -mt-32 z-40 text-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          <div className="space-y-6">
            <div>
              <label className={cardLabel}><User size={14}/> Nombre Completo</label>
              <input type="text" required placeholder="Nombre Completo" className={bigInput} value={formData.cliente_nombre} onChange={e => setFormData({...formData, cliente_nombre: e.target.value})} />
            </div>
            <div>
              <label className={cardLabel}><Phone size={14}/> Teléfono WhatsApp</label>
              <input type="tel" required placeholder="WhatsApp" className={bigInput} value={formData.cliente_whatsapp} onChange={e => setFormData({...formData, cliente_whatsapp: e.target.value})} />
            </div>
            
            <div className="relative z-50">
              <label className={cardLabel}><Car size={14}/> Vehículo Seleccionado</label>
              <div 
                onClick={() => setShowAutoList(!showAutoList)} 
                className={`${bigInput} cursor-pointer flex items-center gap-4 h-[95px] border-2 ${showAutoList ? 'border-yellow-500 bg-white shadow-md' : 'border-transparent'}`}
              >
                {selectedAuto ? (
                  <>
                    <div className="w-20 h-14 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm overflow-hidden border border-slate-100 flex-shrink-0">
                      <img src={`http://localhost:3001${selectedAuto.imagen_url}`} alt={selectedAuto.modelo} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=200&auto=format&fit=crop"; }} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-black uppercase italic leading-tight text-slate-900">{selectedAuto.modelo}</span>
                      <span className="text-[9px] text-yellow-600 font-black bg-yellow-50 px-1.5 py-0.5 rounded mt-1 w-fit">{selectedAuto.patente || 'S/P'}</span>
                    </div>
                  </>
                ) : <span className="text-slate-400 font-bold">Seleccionar Auto</span>}
                <ChevronDown className="ml-auto text-slate-400" size={20} />
              </div>

              {showAutoList && (
                <>
                  <div className="fixed inset-0 z-[105]" onClick={() => setShowAutoList(false)}></div>
                  <div className="absolute top-[105%] left-0 w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 z-[110] max-h-[280px] overflow-y-auto p-3 flex flex-col gap-2">
                    {listaAutos.map(auto => (
                      <div key={auto.id} onClick={() => { setFormData({ ...formData, auto_id: auto.id.toString() }); setShowAutoList(false); }} className={`p-3 rounded-[1.8rem] flex items-center gap-4 cursor-pointer transition-all ${formData.auto_id === auto.id.toString() ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-100 bg-slate-50'}`}>
                        <div className="w-16 h-11 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm overflow-hidden flex-shrink-0 border border-slate-100"><img src={`http://localhost:3001${auto.imagen_url}`} className="w-full h-full object-contain" alt="car" /></div>
                        <p className="text-[12px] font-black uppercase italic truncate">{auto.modelo}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8 bg-slate-50/50 p-8 rounded-[3.5rem] border border-slate-100">
            <div>
              <label className={cardLabel}><Clock size={14} className="text-yellow-500"/> Retiro (Fecha y Hora)</label>
              <input type="date" min={today} required className={bigInput} value={formData.desde} onChange={e => setFormData({...formData, desde: e.target.value})} />
              <input type="time" className={`${bigInput} mt-2 text-center text-xl italic font-black`} value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
            <div>
              <label className={cardLabel}><Clock size={14} className="text-red-500"/> Devolución (Fecha y Hora)</label>
              <input type="date" min={formData.desde || today} required className={bigInput} value={formData.hasta} onChange={e => setFormData({...formData, hasta: e.target.value})} />
              <input type="time" className={`${bigInput} mt-2 text-center text-xl italic font-black`} value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <label className={cardLabel}><MapPin size={14} className="text-yellow-500"/> Lugar de Entrega</label>
                <select className={bigInput} value={formData.entrega} onChange={e => setFormData({...formData, entrega: e.target.value})}>
                  <option value="mendoza ciudad">Mendoza Ciudad / Hotel</option>
                  <option value="aeropuerto">Aeropuerto (MDZ)</option>
                </select>
              </div>
              <div>
                <label className={cardLabel}><MapPin size={14} className="text-slate-400"/> Lugar de Devolución</label>
                <select className={bigInput} value={formData.devolucion} onChange={e => setFormData({...formData, devolucion: e.target.value})}>
                  <option value="mendoza ciudad">Mendoza Ciudad / Hotel</option>
                  <option value="aeropuerto">Aeropuerto (MDZ)</option>
                </select>
              </div>

              <div onClick={() => setFormData({ ...formData, sillita: !formData.sillita })} className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${formData.sillita ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">👶</span>
                  <p className="text-xs font-black uppercase tracking-tight">¿Necesitás Sillita de Bebé?</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${formData.sillita ? 'bg-yellow-500 border-yellow-500 text-slate-900' : 'border-slate-300'}`}>{formData.sillita && <Check size={12} strokeWidth={4} />}</div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-slate-900 text-slate-950 hover:text-white font-black py-7 rounded-[2.5rem] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 duration-150">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <><span className="uppercase text-[13px] font-black italic tracking-wider">Enviar Solicitud</span><ArrowRight size={20}/></>}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}