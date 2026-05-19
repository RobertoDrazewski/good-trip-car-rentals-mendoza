import React, { useState } from 'react';
import { 
  CheckCircle, Clock, ShieldCheck, Car, Plane, Building2, 
  Calendar, Sparkles
} from 'lucide-react';
// 🌐 IMPORTADO: Hook de traducción para el flujo multi-idioma
import { useTranslation } from 'react-i18next';

export default function QuoteResult({ quote }) {
  // 🌐 ACTIVADO: Hook de traducción
  const { t } = useTranslation();
  const [confirmado, setConfirmado] = useState(false);

  if (!quote?.enviado) return null;

  const {
    monto_total_ars = 0,
    cotizacion = 1400,
    dias = 0,
    precio_sillita_ars = 0,
    precio_lavado_aplicado = 0, // 🧼 Cargo de lavado unificado proveniente del backend
    garantia_usd = 300,
    cliente_nombre = 'Cliente',
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
  
  /* 🎨 CONFIGURACIÓN DE PALETA DE COLORES PREMIUM (ESTILO BALANZ DARK) */
  const itemEstilo = "flex items-start gap-3 p-3.5 bg-[#1E222F] rounded-xl border border-slate-800/40 text-left w-full shadow-inner";

  // Helper dinámico para traducir las locaciones guardadas en minúsculas en la DB
  const formatLocationLabel = (locStr) => {
    const term = String(locStr).toLowerCase();
    if (term.includes('aeropuerto')) return t('loc_aeropuerto', 'Aeropuerto');
    if (term.includes('ciudad')) return t('loc_ciudad', 'Ciudad (Gratis)');
    return locStr;
  };

  return (
    <div id="resultado-solicitud" className="w-full mx-auto mt-2 px-1 scroll-mt-24 animate-in fade-in zoom-in-95 duration-300">
      {!confirmado ? (
        <div className="bg-transparent backdrop-blur-md p-4 sm:p-6 rounded-[2rem] border border-slate-800/30 text-white w-full flex flex-col gap-4 shadow-2xl">
          
          {/* CABECERA RESUMEN */}
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

          {/* CONTENEDOR GRID DE ITEMS COMPACTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            
            {/* ITEM 1: VEHÍCULO */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#121319] text-[#88BDF2] rounded-lg flex-shrink-0 border border-slate-800"><Car size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#666D7E]">{t('quote_item_car', 'Vehículo')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{auto_modelo}</h4>
                <p className="text-[10px] font-bold text-[#6F7D93] mt-0.5">
                  {t('resumen_dias', 'Alquiler por')} {dias} {dias === 1 ? t('quote_day', 'Día') : t('quote_days', 'Días')}
                </p>
              </div>
            </div>

            {/* ITEM 2: ENTREGA */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#5383B3] text-white rounded-lg flex-shrink-0">
                {String(entrega).toLowerCase().includes('aeropuerto') ? <Plane size={14}/> : <Building2 size={14}/>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#666D7E]">{t('lugar_retiro', 'Lugar Retiro')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{formatLocationLabel(entrega)}</h4>
                <p className="text-[9px] font-bold text-[#6F7D93] flex items-center gap-1 mt-0.5 truncate"><Calendar size={10}/> {desde} • {hora_inicio} hs</p>
              </div>
            </div>

            {/* ITEM 3: DEVOLUCIÓN */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#121319] text-[#6F7D93] rounded-lg flex-shrink-0 border border-slate-800"><Plane size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#666D7E]">{t('lugar_entrega', 'Lugar Devolución')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5 truncate">{formatLocationLabel(devolucion)}</h4>
                <p className="text-[9px] font-bold text-[#6F7D93] flex items-center gap-1 mt-0.5 truncate"><Calendar size={10}/> {hasta} • {hora_fin} hs</p>
              </div>
            </div>

            {/* ITEM 4: SILLITA */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#121319] text-[#6F7D93] rounded-lg text-xs flex items-center justify-center flex-shrink-0 border border-slate-800">👶</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#666D7E]">{t('quote_item_baby_seat', 'Sillita de Bebé')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5">
                  {sillita === true || sillita === 1 || String(sillita) === 'true' 
                    ? `✔️ $${precio_sillita_ars.toLocaleString('es-AR')} x día` 
                    : `❌ ${t('quote_not_requested', 'No Solicitada')}`
                  }
                </h4>
              </div>
            </div>

            {/* 🧼 ITEM: SERVICIO DE LAVADO */}
            <div className={itemEstilo}>
              <div className="p-2 bg-[#121319] text-[#6F7D93] rounded-lg text-xs flex items-center justify-center flex-shrink-0 border border-slate-800">🧼</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#666D7E]">{t('quote_item_wash', 'Servicio de Lavado Obligatorio')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-white mt-0.5">
                  ✔️ ${precio_lavado_aplicado.toLocaleString('es-AR')} <span className="text-[9px] font-bold text-[#666D7E] not-italic">(Tarifa Fija)</span>
                </h4>
              </div>
            </div>

            {/* ITEM 5: FRANQUICIA (Garantía) */}
            <div className={`${itemEstilo} border-l-4 border-l-[#88BDF2]`}>
              <div className="p-2 bg-[#88BDF2] text-[#121319] rounded-lg flex-shrink-0"><ShieldCheck size={14}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-wider text-[#88BDF2]">{t('label_garantia', 'Garantía Reembolsable')}</p>
                <h4 className="text-xs font-black uppercase italic text-white mt-0.5 truncate">
                  $ {garantiaArs.toLocaleString('es-AR')}{" "}
                  <span className="text-[9px] font-bold text-[#6F7D93] not-italic">({garantia_usd} USD)</span>
                </h4>
              </div>
            </div>

            {/* ITEM 6: PET FRIENDLY */}
            <div className={`${itemEstilo} sm:col-span-2 border-l-4 border-l-emerald-500`}>
              <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/30">🐩</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-emerald-400">{t('quote_pet_title', 'Pet Friendly Activo')}</p>
                <p className="text-[11px] font-black text-slate-200 mt-0.5">{t('pet_friendly_tag', '¡Tu mascota viaja con vos sin costos extras!')}</p>
              </div>
            </div>
          </div>

          {/* TOTAL DE ALQUILER COMPACTADO */}
          <div className="bg-[#121319] p-4 rounded-2xl shadow-inner text-center w-full border border-slate-800">
            <p className="text-[8px] font-black uppercase text-[#88BDF2] tracking-widest mb-1">{t('total_entrega', 'VALOR TOTAL NETO A ENTREGAR')}</p>
            <p className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white leading-none">
              $ {monto_total_ars.toLocaleString('es-AR')} <span className="text-xs font-bold text-[#6F7D93] not-italic">ARS</span>
            </p>
          </div>

          {/* BOTÓN RESERVAR AHORA */}
          <button 
            onClick={() => setConfirmado(true)} 
            className="w-full bg-[#88BDF2] hover:bg-[#5383B3] text-[#121319] hover:text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 duration-100 group cursor-pointer"
          >
            <span className="uppercase text-xs tracking-wider font-black italic">{t('btn_reservar', 'RESERVAR AHORA VIA WHATSAPP')}</span>
          </button>
        </div>
      ) : (
        /* PANTALLA DE CONFIRMACIÓN */
        <div className="bg-[#1E222F]/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-slate-800/40 text-center animate-in zoom-in duration-300 w-full">
          <div className="bg-[#121319] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-800">
            <CheckCircle className="text-[#88BDF2] w-7 h-7" />
          </div>
          <h3 className="text-lg font-black uppercase italic text-white mb-2 leading-none">
            {t('modal_titulo', '¡SOLICITUD ENVIADA!')}
          </h3>
          <p className="text-[#6F7D93] font-medium leading-relaxed mb-4 italic px-2 text-xs">
            {t('modal_sub', 'Nos pondremos en contacto con vos por WhatsApp para confirmar los detalles.')}
          </p>
        </div>
      )}
    </div>
  );
}