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
    precio_lavado_aplicado = 0, // 🧼 CAPTURADO: Cargo de lavado unificado proveniente del backend
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
  
  /* 🛠️ AJUSTADO: Paddings de p-5 a p-3.5 para reducir drásticamente la altura de las tarjetas */
  const itemEstilo = "flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left w-full";

  // Helper dinámico para traducir las locaciones guardadas en minúsculas en la DB
  const formatLocationLabel = (locStr) => {
    const term = String(locStr).toLowerCase();
    if (term.includes('aeropuerto')) return t('loc_aeropuerto', 'Aeropuerto');
    if (term.includes('ciudad')) return t('loc_ciudad', 'Ciudad (Gratis)');
    return locStr;
  };

  return (
    /* 🛠️ COMPACTADO: mt-8 reducido para pegarse de manera prolija al BookingForm en el layout de 2 columnas */
    <div id="resultado-solicitud" className="w-full mx-auto mt-2 px-1 scroll-mt-24 animate-in fade-in zoom-in-95 duration-300">
      {!confirmado ? (
        <div className="bg-white p-4 sm:p-6 rounded-[1.8rem] border border-slate-100 text-slate-800 w-full flex flex-col gap-4">
          
          {/* CABECERA RESUMEN */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-2 w-full gap-2 text-left">
            <div className="min-w-0">
              <p className="text-sky-600 font-black uppercase text-[8px] tracking-widest italic mb-0.5">
                {t('resumen_badge', 'Presupuesto Listo')}
              </p>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-800 leading-tight truncate">
                {t('resumen_titulo_1', 'Resumen de')} <span className="text-sky-500 italic">{t('resumen_titulo_2', 'Viaje')}</span>
              </h3>
            </div>
            
            <div className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 flex-shrink-0 flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500 tracking-wider">
              <Sparkles size={11} className="text-sky-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{cliente_nombre.split(' ')[0]}</span>
            </div>
          </div>

          {/* CONTENEDOR GRID DE ITEMS COMPACTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            
            {/* ITEM 1: VEHÍCULO */}
            <div className={itemEstilo}>
              <div className="p-2 bg-slate-800 text-sky-400 rounded-lg flex-shrink-0"><Car size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{t('quote_item_car', 'Vehículo')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-slate-800 mt-0.5 truncate">{auto_modelo}</h4>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {t('resumen_dias', 'Alquiler por')} {dias} {dias === 1 ? t('quote_day', 'Día') : t('quote_days', 'Días')}
                </p>
              </div>
            </div>

            {/* ITEM 2: ENTREGA */}
            <div className={itemEstilo}>
              <div className="p-2 bg-sky-500 text-white rounded-lg flex-shrink-0">
                {String(entrega).toLowerCase().includes('aeropuerto') ? <Plane size={14}/> : <Building2 size={14}/>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{t('lugar_retiro', 'Lugar Retiro')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-slate-800 mt-0.5 truncate">{formatLocationLabel(entrega)}</h4>
                <p className="text-[9px] font-bold text-slate-600 flex items-center gap-1 mt-0.5 truncate"><Calendar size={10}/> {desde} • {hora_inicio} hs</p>
              </div>
            </div>

            {/* ITEM 3: DEVOLUCIÓN */}
            <div className={itemEstilo}>
              <div className="p-2 bg-slate-200 text-slate-700 rounded-lg flex-shrink-0">
                {String(devolucion).toLowerCase().includes('aeropuerto') ? <Plane size={14}/> : <Building2 size={14}/>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{t('lugar_entrega', 'Lugar Devolución')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-slate-800 mt-0.5 truncate">{formatLocationLabel(devolucion)}</h4>
                <p className="text-[9px] font-bold text-slate-600 flex items-center gap-1 mt-0.5 truncate"><Calendar size={10}/> {hasta} • {hora_fin} hs</p>
              </div>
            </div>

            {/* ITEM 4: SILLITA */}
            <div className={itemEstilo}>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center justify-center flex-shrink-0">👶</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{t('quote_item_baby_seat', 'Sillita de Bebé')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-slate-800 mt-0.5">
                  {sillita === true || sillita === 1 || String(sillita) === 'true' 
                    ? `✔️ $${precio_sillita_ars.toLocaleString('es-AR')} x día` 
                    : `❌ ${t('quote_not_requested', 'No Solicitada')}`
                  }
                </h4>
              </div>
            </div>

            {/* 🧼 ITEM NUEVO: IMPREVISTO COSTO DE LAVADO DEL AUTO */}
            <div className={itemEstilo}>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center justify-center flex-shrink-0">🧼</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{t('quote_item_wash', 'Servicio de Lavado Obligatorio')}</p>
                <h4 className="text-[11px] font-black uppercase italic text-slate-800 mt-0.5">
                  ✔️ ${precio_lavado_aplicado.toLocaleString('es-AR')} <span className="text-[9px] font-bold text-slate-400 not-italic">(Tarifa Fija)</span>
                </h4>
              </div>
            </div>

            {/* ITEM 5: FRANQUICIA (Garantía) */}
            <div className={`${itemEstilo} border-l-4 border-l-sky-500 bg-slate-50`}>
              <div className="p-2 bg-sky-600 text-white rounded-lg flex-shrink-0"><ShieldCheck size={14}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-wider text-sky-600">{t('label_garantia', 'Garantía Reembolsable')}</p>
                <h4 className="text-xs font-black uppercase italic text-slate-800 mt-0.5 truncate">
                  $ {garantiaArs.toLocaleString('es-AR')}{" "}
                  <span className="text-[9px] font-bold text-slate-500 not-italic">({garantia_usd} USD)</span>
                </h4>
              </div>
            </div>

            {/* ITEM 6: PET FRIENDLY */}
            <div className={`${itemEstilo} sm:col-span-2 border-l-4 border-l-emerald-500 bg-slate-50`}>
              <div className="p-2 bg-emerald-600 text-white rounded-lg text-xs flex items-center justify-center flex-shrink-0">🐩</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-emerald-600">{t('quote_pet_title', 'Pet Friendly Activo')}</p>
                <p className="text-[11px] font-black text-slate-700 mt-0.5">{t('pet_friendly_tag', '¡Tu mascota viaja con vos sin costos extras!')}</p>
              </div>
            </div>
          </div>

          {/* TOTAL DE ALQUILER COMPACTADO */}
          <div className="bg-slate-800 p-4 rounded-2xl shadow-md text-center w-full">
            <p className="text-[8px] font-black uppercase text-sky-400 tracking-widest mb-1">{t('total_entrega', 'VALOR TOTAL NETO A ENTREGAR')}</p>
            <p className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white leading-none">
              $ {monto_total_ars.toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-400 not-italic">ARS</span>
            </p>
          </div>

          {/* BOTÓN RESERVAR AHORA */}
          <button 
            onClick={() => setConfirmado(true)} 
            className="w-full bg-slate-800 hover:bg-sky-500 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 duration-100 group cursor-pointer"
          >
            <span className="uppercase text-xs tracking-wider font-black italic">{t('btn_reservar', 'RESERVAR AHORA VIA WHATSAPP')}</span>
          </button>
        </div>
      ) : (
        /* PANTALLA DE CONFIRMACIÓN */
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 text-center animate-in zoom-in duration-300 w-full">
          <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-sky-100">
            <CheckCircle className="text-sky-600 w-7 h-7" />
          </div>
          <h3 className="text-lg font-black uppercase italic text-slate-800 mb-2 leading-none">
            {t('modal_titulo', '¡SOLICITUD ENVIADA!')}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-4 italic px-2 text-xs">
            {t('modal_sub', 'Nos pondremos en contacto con vos por WhatsApp para confirmar los detalles.')}
          </p>
        </div>
      )}
    </div>
  );
}