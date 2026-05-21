import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, ShieldCheck, Car, Plane, Calendar, Sparkles, Loader2, Baby } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Requirements from './Requirements'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function QuoteResult({ quote }) {
  const { t } = useTranslation();
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validación segura de renderizado
  if (!quote || !quote.enviado) return null;

  const {
    monto_total_ars = 0,
    descuento_aplicado_ars = 0,
    porcentaje_promo = 0,
    cotizacion = 1400,
    dias = 0,
    precio_sillita_ars = 0,
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
      // 1. Armamos el objeto con los nombres EXACTOS que espera el modelo Reserva.js
      const payloadSeguro = {
        cliente_nombre: cliente_nombre || 'Cliente Web',
        cliente_whatsapp: cliente_whatsapp || '0',
        fecha_inicio: desde,
        // Evita el error de MySQL forzando el formato HH:MM:SS
        hora_inicio: (hora_inicio && hora_inicio.length === 5) ? `${hora_inicio}:00` : (hora_inicio || '10:00:00'),
        fecha_fin: hasta,
        hora_fin: (hora_fin && hora_fin.length === 5) ? `${hora_fin}:00` : (hora_fin || '10:00:00'),
        lugar_retiro: entrega || 'Mendoza',
        lugar_devolucion: devolucion || 'Mendoza',
        auto_id: auto_id ? parseInt(auto_id) : 1,
        monto_total_ars: monto_total_ars || 0,
        tasa_dolar_usada: cotizacion || 1400,
        garantia_usd: garantia_usd || 300,
        sillita: sillita ? 1 : 0
      };

      // 2. Enviamos la petición a la ruta que conectamos en tu index.js
      await axios.post(`${API_BASE_URL}/api/reservas/confirmar`, payloadSeguro);
      
      // 3. Confirmamos el éxito
      setConfirmado(true);
      
      // 4. Suave actualización para limpiar el entorno tras el éxito
      setTimeout(() => window.location.reload(), 4000); 
    } catch (err) {
      console.error("Error al registrar la reserva:", err);
      alert("Hubo un error al conectar con el sistema. Verifica tu conexión a internet o intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="resultado-solicitud" className="w-full mx-auto mt-4 px-1 scroll-mt-24 animate-in fade-in zoom-in-95 duration-300">
      {!confirmado ? (
        <div className="bg-transparent backdrop-blur-md p-4 sm:p-6 rounded-[2rem] border border-slate-800/30 text-white w-full flex flex-col gap-5 shadow-2xl">
          
          {/* Encabezado VIP */}
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 w-full gap-2 text-left">
            <div className="min-w-0">
              <p className="text-[#5383B3] font-black uppercase text-[8px] tracking-widest italic mb-0.5">
                {t('resumen_badge', 'Presupuesto Listo')}
              </p>
              <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight truncate">
                {t('resumen_titulo_1', 'Resumen de')} <span className="text-[#88BDF2] italic">{t('resumen_titulo_2', 'Viaje')}</span>
              </h3>
            </div>
            <div className="bg-[#1E222F] px-3 py-1 rounded-xl border border-slate-800/40 flex-shrink-0 flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-300 tracking-wider">
              <Sparkles size={11} className="text-[#88BDF2] animate-spin" style={{ animationDuration: '4s' }} />
              <span>{cliente_nombre.split(' ')[0]}</span>
            </div>
          </div>

          {/* Grilla de Resumen Desglosado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            {/* Vehículo y días */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#121319] text-[#88BDF2] rounded-lg border border-slate-800"><Car size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase text-[#666D7E]">Vehículo</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{auto_modelo}</h4>
                <p className="text-[10px] font-bold text-[#6F7D93] mt-0.5">{dias} {dias === 1 ? 'Día' : 'Días'} de Alquiler</p>
              </div>
            </div>

            {/* Garantía */}
            <div className={`${itemEstilo} border-l-4 border-l-[#88BDF2]`}>
              <div className="p-2 bg-[#88BDF2] text-[#121319] rounded-lg"><ShieldCheck size={14}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase text-[#88BDF2]">Depósito de Garantía</p>
                <h4 className="text-xs font-black uppercase italic text-white mt-0.5">$ {garantiaArs.toLocaleString('es-AR')} ARS</h4>
                <p className="text-[9px] font-bold text-[#6F7D93] mt-0.5">Equivale a USD {garantia_usd} (Reembolsable)</p>
              </div>
            </div>

            {/* Retiro */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#5383B3] text-white rounded-lg"><Plane size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase text-[#666D7E]">Lugar y Fecha Retiro</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{formatLocationLabel(entrega)}</h4>
                <p className="text-[9px] font-bold text-[#6F7D93] mt-0.5">{desde} • {hora_inicio} hs</p>
              </div>
            </div>

            {/* Devolución */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#121319] text-[#6F7D93] rounded-lg border border-slate-800"><Plane size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase text-[#666D7E]">Lugar y Fecha Devolución</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{formatLocationLabel(devolucion)}</h4>
                <p className="text-[9px] font-bold text-[#6F7D93] mt-0.5">{hasta} • {hora_fin} hs</p>
              </div>
            </div>

            {/* Sillita de bebé adicional (Solo aparece si se seleccionó) */}
            {sillita && (
              <div className={`${itemEstilo} sm:col-span-2 border-l-4 border-l-amber-500/50`}>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Baby size={14}/></div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-black uppercase text-amber-500">Adicional Incluido</p>
                  <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5">Sillita de Bebé VIP</h4>
                  <p className="text-[9px] font-bold text-[#6F7D93] mt-0.5">Calculada por los {dias} días de viaje</p>
                </div>
              </div>
            )}
          </div>

          {/* Bloque de Promoción Aplicada por Banner IA */}
          {descuento_aplicado_ars > 0 && (
            <div className="bg-emerald-600/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-emerald-400 animate-pulse">
               <span className="text-[10px] font-black uppercase tracking-wider italic flex items-center gap-1">
                 <Sparkles size={12}/> ¡Promoción {porcentaje_promo}% OFF Aplicada!
               </span>
               <span className="text-xs font-black italic">- $ {descuento_aplicado_ars.toLocaleString('es-AR')} ARS</span>
            </div>
          )}

          {/* Caja de Precio Final */}
          <div className="bg-[#121319] p-4 rounded-2xl shadow-inner text-center w-full border border-slate-800">
            <p className="text-[8px] font-black uppercase text-[#88BDF2] tracking-widest mb-1">
              {descuento_aplicado_ars > 0 ? "TOTAL NETO CON DESCUENTO" : "VALOR TOTAL NETO"}
            </p>
            <p className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white leading-none">
              $ {monto_total_ars.toLocaleString('es-AR')} ARS
            </p>
          </div>

          {/* Sección de Requisitos Obligatorios del Cliente */}
          <div className="border-t border-slate-800/60 pt-4 text-left">
            <p className="text-[9px] font-black uppercase text-[#6F7D93] tracking-widest mb-2 px-1">
              Términos y Requisitos de Alquiler
            </p>
            <div className="max-h-44 overflow-y-auto pr-1 rounded-xl bg-black/10 p-2 border border-slate-800/30">
              <Requirements />
            </div>
          </div>

          {/* Botón Finalizador de Solicitud */}
          <button 
            onClick={handleConfirmarReserva} 
            disabled={loading} 
            className="w-full bg-[#88BDF2] hover:bg-[#5383B3] text-[#121319] font-black py-4 rounded-xl uppercase text-xs tracking-wider italic transition-all shadow-lg hover:shadow-[0_0_20px_rgba(136,189,242,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "ACEPTAR TÉRMINOS Y RESERVAR AHORA"}
          </button>
        </div>
      ) : (
        <div className="bg-[#1E222F]/90 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-slate-800/40 text-center animate-in zoom-in duration-300 w-full">
          <CheckCircle className="text-[#88BDF2] w-14 h-14 mx-auto mb-4" />
          <h3 className="text-lg font-black uppercase italic text-white mb-2">¡SOLICITUD ENVIADA!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Hemos procesado tu cotización. Tu asesor comercial se comunicará a la brevedad para confirmar los detalles.
          </p>
        </div>
      )}
    </div>
  );
}