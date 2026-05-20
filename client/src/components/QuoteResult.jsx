import React, { useState } from 'react';
import axios from 'axios';
import { 
  CheckCircle, ShieldCheck, Car, Plane, Building2, 
  Calendar, Sparkles, Loader2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function QuoteResult({ quote }) {
  const { t } = useTranslation();
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!quote?.enviado) return null;

  const {
    monto_total_ars = 0,
    descuento_aplicado_ars = 0,
    porcentaje_promo = 0,
    cotizacion = 1400,
    dias = 0,
    precio_sillita_ars = 0,
    precio_lavado_aplicado = 0,
    garantia_usd = 300,
    cliente_nombre = 'Cliente',
    cliente_whatsapp = '',
    auto_id = '',
    entrega = 'mendoza ciudad',
    devolucion = 'mendoza ciudad',
    sillita = false,
    auto_modelo = 'Vehículo Seleccionado',
    desde = '',
    hasta = '',
    hora_inicio = '10:00',
    hora_fin = '10:00'
  } = quote;

  const garantiaArs = garantia_usd * cotizacion;
  const itemEstilo = "flex items-start gap-3 p-3.5 bg-[#1E222F] rounded-xl border border-slate-800/40 text-left w-full shadow-inner";

  const formatLocationLabel = (locStr) => {
    const term = String(locStr).toLowerCase();
    if (term.includes('aeropuerto')) return t('loc_aeropuerto', 'Aeropuerto');
    if (term.includes('ciudad')) return t('loc_ciudad', 'Ciudad (Gratis)');
    return locStr;
  };

  const handleConfirmarReserva = async () => {
    setLoading(true);
    try {
      const payloadSeguro = {
        cliente_nombre: cliente_nombre || 'Cliente Web',
        cliente_whatsapp: cliente_whatsapp || '0',
        fecha_inicio: desde,
        hora_inicio: (hora_inicio && hora_inicio.length === 5) ? `${hora_inicio}:00` : (hora_inicio || '10:00:00'),
        fecha_fin: hasta,
        hora_fin: (hora_fin && hora_fin.length === 5) ? `${hora_fin}:00` : (hora_fin || '10:00:00'),
        lugar_retiro: entrega || 'Mendoza',
        lugar_devolucion: devolucion || 'Mendoza',
        auto_id: auto_id ? parseInt(auto_id) : 1,
        monto_total_ars: monto_total_ars || 0,
        tasa_dolar_usada: cotizacion || 1400,
        garantia_usd: garantia_usd || 300,
        sillita: sillita ? 1 : 0,
        estado_reserva: 'pendiente',
        estado: 'pendiente'
      };

      await axios.post(`${API_BASE_URL}/api/admin/nueva-cotizacion`, payloadSeguro);
      setConfirmado(true);
      setTimeout(() => window.location.reload(), 4000); 
    } catch (err) {
      console.error("Error al registrar:", err);
      alert("Hubo un error al conectar con el sistema. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="resultado-solicitud" className="w-full mx-auto mt-2 px-1 scroll-mt-24 animate-in fade-in zoom-in-95 duration-300">
      {!confirmado ? (
        <div className="bg-transparent backdrop-blur-md p-4 sm:p-6 rounded-[2rem] border border-slate-800/30 text-white w-full flex flex-col gap-4 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 w-full gap-2 text-left">
            <div className="min-w-0">
              <p className="text-[#5383B3] font-black uppercase text-[8px] tracking-widest italic mb-0.5">{t('resumen_badge', 'Presupuesto Listo')}</p>
              <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight truncate">
                {t('resumen_titulo_1', 'Resumen de')} <span className="text-[#88BDF2] italic">{t('resumen_titulo_2', 'Viaje')}</span>
              </h3>
            </div>
            <div className="bg-[#1E222F] px-3 py-1 rounded-xl border border-slate-800/40 flex-shrink-0 flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-300 tracking-wider">
              <Sparkles size={11} className="text-[#88BDF2] animate-spin" style={{ animationDuration: '4s' }} />
              <span>{cliente_nombre.split(' ')[0]}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <div className={itemEstilo}><div className="p-2 bg-[#121319] text-[#88BDF2] rounded-lg border border-slate-800"><Car size={14}/></div>
              <div className="min-w-0 flex-1"><p className="text-[8px] font-black uppercase text-[#666D7E]">Vehículo</p><h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{auto_modelo}</h4><p className="text-[10px] font-bold text-[#6F7D93] mt-0.5">{dias} Días</p></div>
            </div>
            {/* ... (resto de tus items de entrega/devolución) ... */}
            <div className={itemEstilo}><div className="p-2 bg-[#5383B3] text-white rounded-lg"><Plane size={14}/></div><div className="min-w-0 flex-1"><p className="text-[8px] font-black uppercase text-[#666D7E]">Retiro</p><h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{formatLocationLabel(entrega)}</h4><p className="text-[9px] font-bold text-[#6F7D93] mt-0.5">{desde} • {hora_inicio}</p></div></div>
            <div className={itemEstilo}><div className="p-2 bg-[#121319] text-[#6F7D93] rounded-lg border border-slate-800"><Plane size={14}/></div><div className="min-w-0 flex-1"><p className="text-[8px] font-black uppercase text-[#666D7E]">Devolución</p><h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{formatLocationLabel(devolucion)}</h4><p className="text-[9px] font-bold text-[#6F7D93] mt-0.5">{hasta} • {hora_fin}</p></div></div>
            <div className={`${itemEstilo} border-l-4 border-l-[#88BDF2]`}><div className="p-2 bg-[#88BDF2] text-[#121319] rounded-lg"><ShieldCheck size={14}/></div><div className="flex-1 min-w-0"><p className="text-[8px] font-black uppercase text-[#88BDF2]">Garantía</p><h4 className="text-xs font-black uppercase italic text-white mt-0.5">$ {garantiaArs.toLocaleString('es-AR')}</h4></div></div>
          </div>

          {/* 🔴 BLOQUE DE PROMOCIÓN APLICADA */}
          {descuento_aplicado_ars > 0 && (
            <div className="bg-emerald-600/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-emerald-400">
               <span className="text-[10px] font-black uppercase tracking-wider italic">¡Promoción {porcentaje_promo}% OFF aplicada!</span>
               <span className="text-xs font-black italic">- $ {descuento_aplicado_ars.toLocaleString('es-AR')} ARS</span>
            </div>
          )}

          <div className="bg-[#121319] p-4 rounded-2xl shadow-inner text-center w-full border border-slate-800">
            <p className="text-[8px] font-black uppercase text-[#88BDF2] tracking-widest mb-1">{descuento_aplicado_ars > 0 ? "TOTAL CON DESCUENTO" : "VALOR TOTAL NETO"}</p>
            <p className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white leading-none">$ {monto_total_ars.toLocaleString('es-AR')}</p>
          </div>

          <button onClick={handleConfirmarReserva} disabled={loading} className="w-full bg-[#88BDF2] hover:bg-[#5383B3] text-[#121319] font-black py-3.5 rounded-xl uppercase text-xs tracking-wider italic">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "RESERVAR AHORA"}
          </button>
        </div>
      ) : (
        <div className="bg-[#1E222F]/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-slate-800/40 text-center animate-in zoom-in duration-300 w-full">
          <CheckCircle className="text-[#88BDF2] w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-black uppercase italic text-white mb-2">¡SOLICITUD ENVIADA!</h3>
        </div>
      )}
    </div>
  );
}