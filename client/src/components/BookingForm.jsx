import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Baby, MapPin, Calendar, Car, Loader2, Sparkles, ChevronDown, ArrowRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingForm({ onQuoteGenerated, setAiContext, setIsChatOpen }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listaAutos, setListaAutos] = useState([]);

  const [formData, setFormData] = useState({
    desde: '',
    hasta: '',
    entrega: 'ciudad', 
    devolucion: 'ciudad', 
    sillita: false,
    auto_id: '' 
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleOpenPicker = (e) => {
    if (e.target.showPicker) {
      try { e.target.showPicker(); } catch (err) { console.log("Picker no soportado"); }
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const checkRes = await axios.post('http://localhost:3001/api/prices/check-availability', {
        desde: formData.desde,
        hasta: formData.hasta,
        auto_id: formData.auto_id
      });

      if (!checkRes.data.disponible) {
        onQuoteGenerated(null);
        setAiContext({
            status: 'no_availability',
            sugerencia: t('error_calc') 
        });
        setIsChatOpen(true);
        setLoading(false);
        return;
      }

      const res = await axios.post('http://localhost:3001/api/prices/quote', formData);
      const autoSeleccionado = listaAutos.find(a => a.id.toString() === formData.auto_id.toString());

      onQuoteGenerated({
        ...res.data,
        auto_id: formData.auto_id,
        auto_modelo: autoSeleccionado?.modelo || 'Vehículo Seleccionado',
        desde: formData.desde,
        hasta: formData.hasta,
        fecha_inicio: formData.desde,
        fecha_fin: formData.hasta,
        lugar_entrega: formData.entrega,
        lugar_devolucion: formData.devolucion,
        sillita: formData.sillita
      });
      
      setTimeout(() => {
        const target = document.getElementById('reservas');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      
    } catch (err) {
      setError(t('chat_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4">
      {/* Badge Flotante Superior - Actualizado con colores de la marca */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-3 rounded-full shadow-2xl z-40 flex items-center gap-3 border-2 border-yellow-500/30">
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className="text-[11px] font-black uppercase tracking-[0.25em]">Good Trip Mendoza</span>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="bg-white/95 backdrop-blur-2xl p-8 md:p-14 rounded-[60px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-slate-100 relative -mt-32 z-30 transition-all"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 items-end">
          
          {/* VEHÍCULO */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Car size={14} className="text-yellow-500" /> {t('nav_flota')}
            </label>
            <div className="relative group">
              <select 
                required
                className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold border-2 border-transparent group-hover:bg-slate-100 focus:border-yellow-500 focus:bg-white outline-none appearance-none transition-all text-slate-800 cursor-pointer"
                value={formData.auto_id}
                onChange={e => setFormData({...formData, auto_id: e.target.value})}
              >
                {listaAutos.map(auto => (
                  <option key={auto.id} value={auto.id}>{auto.modelo}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </div>

          {/* FECHA RETIRO */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Calendar size={14} className="text-yellow-500" /> {t('label_retiro')}
            </label>
            <input 
              type="date" min={today} required 
              value={formData.desde} 
              onClick={handleOpenPicker}
              className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold border-2 border-transparent focus:border-yellow-500 focus:bg-white outline-none transition-all text-slate-800 cursor-pointer" 
              onChange={e => setFormData({...formData, desde: e.target.value, hasta: ''})} 
            />
          </div>

          {/* FECHA DEVOLUCIÓN */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Calendar size={14} className="text-yellow-500" /> {t('label_devolucion')}
            </label>
            <input 
              type="date" min={formData.desde || today} required 
              disabled={!formData.desde} 
              value={formData.hasta} 
              onClick={handleOpenPicker}
              className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold border-2 border-transparent focus:border-yellow-500 focus:bg-white outline-none disabled:opacity-30 disabled:grayscale transition-all text-slate-800 cursor-pointer" 
              onChange={e => setFormData({...formData, hasta: e.target.value})} 
            />
          </div>

          {/* LUGAR RETIRO */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <MapPin size={14} className="text-yellow-500" /> {t('lugar_retiro')}
            </label>
            <div className="relative group">
              <select 
                className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold border-2 border-transparent group-hover:bg-slate-100 focus:border-yellow-500 focus:bg-white outline-none appearance-none transition-all text-slate-800 cursor-pointer"
                value={formData.entrega} 
                onChange={e => setFormData({...formData, entrega: e.target.value})}
              >
                <option value="ciudad">{t('loc_ciudad')}</option>
                <option value="aeropuerto">{t('loc_aeropuerto')}</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </div>

          {/* LUGAR ENTREGA */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <MapPin size={14} className="text-yellow-500" /> {t('lugar_entrega')}
            </label>
            <div className="relative group">
              <select 
                className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold border-2 border-transparent group-hover:bg-slate-100 focus:border-yellow-500 focus:bg-white outline-none appearance-none transition-all text-slate-800 cursor-pointer"
                value={formData.devolucion} 
                onChange={e => setFormData({...formData, devolucion: e.target.value})}
              >
                <option value="ciudad">{t('loc_ciudad')}</option>
                <option value="aeropuerto">{t('loc_aeropuerto')}</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </div>

          {/* ACCIÓN FINAL */}
          <div className="space-y-4">
            <label className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-4 rounded-[2rem] cursor-pointer border-2 border-transparent hover:border-slate-200 transition-all shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <Baby size={20} className="text-yellow-600" />
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-tighter">{t('silla_bebe_q')}</span>
              </div>
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded-lg accent-slate-900 cursor-pointer" 
                checked={formData.sillita} 
                onChange={e => setFormData({...formData, sillita: e.target.checked})} 
              />
            </label>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-yellow-500 hover:bg-slate-900 text-slate-950 hover:text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-yellow-500/20 active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span className="tracking-[0.15em] uppercase text-xs">{t('btn_cotizar')}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )} 
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}