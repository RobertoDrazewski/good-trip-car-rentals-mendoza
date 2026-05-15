import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, Loader2, User, Phone, ShieldCheck, Dog, Baby, MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuoteResult({ quote }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [cliente, setCliente] = useState({ nombre: '', whatsapp: '' });

  if (!quote) return null;

  const handleConfirmar = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        auto_id: quote.auto_id,
        auto_modelo: quote.auto_modelo,
        cliente_nombre: cliente.nombre,
        cliente_whatsapp: cliente.whatsapp,
        desde: quote.desde || quote.fecha_inicio, 
        hasta: quote.hasta || quote.fecha_fin,
        monto_total_ars: quote.totalArs || quote.monto_total_ars,
        lugar_entrega: quote.lugar_entrega || 'Ciudad',
        lugar_devolucion: quote.lugar_devolucion || 'Ciudad'
      };

      if (!payload.desde || !payload.hasta) {
        throw new Error(t('error_calc'));
      }

      await axios.post('http://localhost:3001/api/admin/nueva-cotizacion', payload);
      
      setConfirmado(true);
      new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});

    } catch (err) {
      console.error("Error al enviar lead:", err);
      const msg = err.response?.data?.error || t('chat_error');
      alert(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="reservas" className="max-w-5xl mx-auto mt-16 mb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {!confirmado ? (
        <div className="bg-slate-900 text-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden border border-white/5 relative">
          
          {/* Brillo decorativo de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] -z-0" />

          <div className="p-10 md:p-16 relative z-10">
            {/* ENCABEZADO DEL RESULTADO */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
              <div className="space-y-4">
                <span className="bg-yellow-500 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {t('resumen_dias', { count: quote.dias })}
                </span>
                <h3 className="text-7xl md:text-8xl font-black italic tracking-tighter text-white leading-none">
                  ${parseFloat(quote.totalArs || 0).toLocaleString('es-AR')}
                </h3>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                    {t('nav_flota')}: <span className="text-white">{quote.auto_modelo}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    {t('nav_reserva')} {quote.desde || quote.fecha_inicio} — {quote.hasta || quote.fecha_fin}
                  </p>
                </div>
              </div>

              {/* CARD DE GARANTÍA */}
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 w-full lg:w-72 shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-yellow-500 font-black text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={16}/> {t('label_garantia')}
                </div>
                <p className="text-3xl font-black text-white italic">
                  ${parseFloat(quote.garantia || 0).toLocaleString('es-AR')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-2 leading-relaxed">{t('garantia_desc')}</p>
              </div>
            </div>

            {/* FORMULARIO DE CONFIRMACIÓN */}
            <form onSubmit={handleConfirmar} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">
                  {t('placeholder_nombre')}
                </label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
                  <input 
                    type="text" required placeholder={t('placeholder_nombre')}
                    className="w-full bg-slate-800/50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-yellow-500 transition-all font-bold text-white placeholder:text-slate-600"
                    onChange={e => setCliente({...cliente, nombre: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">
                  {t('placeholder_wa')}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
                  <input 
                    type="tel" required placeholder="Ej: 261555..."
                    className="w-full bg-slate-800/50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-yellow-500 transition-all font-bold text-white placeholder:text-slate-600"
                    onChange={e => setCliente({...cliente, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="group bg-yellow-500 hover:bg-white text-slate-950 p-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {t('btn_reservar')}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* TAGS INFERIORES */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2.5"><MapPin size={16} className="text-yellow-500"/> {t('lugar_retiro')}: {quote.lugar_entrega || 'Ciudad'}</span>
              <span className="flex items-center gap-2.5"><Dog size={16} className="text-yellow-500"/> {t('pet_friendly_tag')}</span>
              {quote.sillita && <span className="flex items-center gap-2.5"><Baby size={16} className="text-yellow-500"/> {t('silla_bebe_q')}</span>}
            </div>
          </div>
        </div>
      ) : (
        /* PANTALLA DE ÉXITO PREMIUM */
        <div className="bg-white p-20 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] text-center border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-900 shadow-xl shadow-yellow-500/20">
            <CheckCircle size={48} strokeWidth={3} />
          </div>
          <h3 className="text-5xl md:text-6xl font-black italic text-slate-900 mb-4 uppercase tracking-tighter">{t('modal_titulo')}</h3>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
            {t('modal_sub')}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-12 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-600 transition-colors"
          >
            ← {t('nav_reserva')}
          </button>
        </div>
      )}
    </div>
  );
}