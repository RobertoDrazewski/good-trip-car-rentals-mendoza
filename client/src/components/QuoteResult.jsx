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
  const itemEstilo = "flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left w-full";

  return (
    <div id="resultado-solicitud" className="max-w-3xl mx-auto mt-8 sm:mt-16 px-2 sm:px-0 scroll-mt-32 animate-in fade-in zoom-in-95 duration-500 w-full">
      {!confirmado ? (
        <div className="bg-white p-5 sm:p-10 md:p-14 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border-2 border-slate-100 text-slate-900 w-full">
          
          {/* BADGE PRESUPUESTO */}
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-700 px-4 py-2 sm:px-5 sm:py-2 rounded-full w-fit mx-auto mb-4 sm:mb-6 text-[9px] sm:text-xs font-black uppercase tracking-wider text-center">
            <Sparkles size={13} className="animate-spin" style={{ animationDuration: '3s' }} /> 
            {t('quote_badge', 'Presupuesto Calculado al Instante')}
          </div>

          {/* TITULO */}
          <h3 className="text-2xl sm:text-3xl font-black uppercase italic text-center text-slate-900 mb-2 tracking-tight">
            {t('quote_title_1', 'Tu Resumen de')} <span className="text-yellow-500">{t('quote_title_2', 'Viaje')}</span>
          </h3>
          <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center mb-6 sm:mb-10 italic px-2">
            {t('quote_greeting', 'Hola')} {cliente_nombre}{t('quote_subtitle', ', revisá las condiciones de tu cotización oficial:')}
          </p>

          {/* CONTENEDOR GRID DE ITEMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
            
            {/* ITEM 1: VEHÍCULO */}
            <div className={itemEstilo}>
              <div className="p-2.5 sm:p-3 bg-slate-900 text-yellow-500 rounded-xl flex-shrink-0"><Car size={18}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('quote_item_car', 'Vehículo solicitado')}</p>
                <h4 className="text-xs sm:text-sm font-black uppercase italic text-slate-900 mt-0.5 truncate">{auto_modelo}</h4>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">
                  {t('quote_duration', 'Duración:')} {dias} {dias === 1 ? t('quote_day', 'Día') : t('quote_days', 'Días')} {t('quote_rental_text', 'de alquiler')}
                </p>
              </div>
            </div>

            {/* ITEM 2: ENTREGA */}
            <div className={itemEstilo}>
              <div className="p-2.5 sm:p-3 bg-yellow-500 text-slate-950 rounded-xl flex-shrink-0">
                {String(entrega).toLowerCase().includes('aeropuerto') ? <Plane size={18}/> : <Building2 size={18}/>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('quote_item_pickup', 'Lugar de Entrega')}</p>
                <h4 className="text-xs sm:text-sm font-black uppercase italic text-slate-900 mt-0.5 truncate">{entrega}</h4>
                <p className="text-[10px] sm:text-xs font-bold text-slate-600 flex flex-wrap items-center gap-1 mt-0.5"><Calendar size={11}/> {desde} • <Clock size={11}/> {hora_inicio} hs</p>
              </div>
            </div>

            {/* ITEM 3: DEVOLUCIÓN */}
            <div className={itemEstilo}>
              <div className="p-2.5 sm:p-3 bg-slate-200 text-slate-700 rounded-xl flex-shrink-0">
                {String(devolucion).toLowerCase().includes('aeropuerto') ? <Plane size={18}/> : <Building2 size={18}/>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('quote_item_dropoff', 'Lugar de Devolución')}</p>
                <h4 className="text-xs sm:text-sm font-black uppercase italic text-slate-900 mt-0.5 truncate">{devolucion}</h4>
                <p className="text-[10px] sm:text-xs font-bold text-slate-600 flex flex-wrap items-center gap-1 mt-0.5"><Calendar size={11}/> {hasta} • <Clock size={11}/> {hora_fin} hs</p>
              </div>
            </div>

            {/* ITEM 4: SILLITA */}
            <div className={itemEstilo}>
              <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl text-lg leading-none flex items-center justify-center flex-shrink-0">👶</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('quote_item_baby_seat', 'Opcional Sillita de Bebé')}</p>
                <h4 className="text-xs sm:text-sm font-black uppercase italic text-slate-900 mt-0.5">
                  {sillita === true || sillita === 1 || String(sillita) === 'true' ? `✔️ ${t('quote_added', 'Adicionada')}` : `❌ ${t('quote_not_requested', 'No Solicitada')}`}
                </h4>
              </div>
            </div>

            {/* ITEM 5: FRANQUICIA */}
            <div className={`${itemEstilo} md:col-span-2 border-l-4 border-l-blue-500 bg-blue-50/40`}>
              <div className="p-2.5 sm:p-3 bg-blue-600 text-white rounded-xl flex-shrink-0"><ShieldCheck size={18}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-600">{t('quote_item_warranty', 'Franquicia de Garantía Reembolsable')}</p>
                <h4 className="text-sm sm:text-base font-black uppercase italic text-slate-900 mt-0.5 flex flex-wrap items-baseline gap-1">
                  $ {garantiaArs.toLocaleString('es-AR')}{" "}
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 not-italic">ARS ({garantia_usd} USD)</span>
                </h4>
              </div>
            </div>

            {/* ITEM 6: PET FRIENDLY */}
            <div className={`${itemEstilo} md:col-span-2 border-l-4 border-l-emerald-500 bg-emerald-50/30`}>
              <div className="p-2.5 sm:p-3 bg-emerald-600 text-white rounded-xl text-lg flex items-center justify-center flex-shrink-0">🐩</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-600">{t('quote_pet_title', 'Good Trip Experience • Pet Friendly Activo')}</p>
                <p className="text-[11px] sm:text-xs font-black uppercase text-slate-800 mt-0.5">{t('quote_pet_text', '¡Tu Caniche o mascota viaja con vos!')}</p>
              </div>
            </div>
          </div>

          {/* TOTAL DE ALQUILER */}
          <div className="mt-6 sm:mt-8 bg-slate-900 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl relative overflow-hidden text-center w-full">
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em] sm:tracking-[0.3em] mb-1.5">{t('quote_total_label', 'Total Final Estimado Alquiler')}</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white">
              $ {monto_total_ars.toLocaleString('es-AR')} <span className="text-xs sm:text-sm font-bold text-slate-400 not-italic">ARS</span>
            </p>
          </div>

          {/* BOTÓN RESERVAR AHORA */}
          <button 
            onClick={() => setConfirmado(true)} 
            className="mt-6 sm:mt-8 w-full bg-yellow-500 hover:bg-slate-900 text-slate-950 hover:text-white font-black py-4 sm:py-7 rounded-[1.2rem] sm:rounded-[2rem] transition-all flex items-center justify-center gap-4 shadow-lg active:scale-95 duration-150 group cursor-pointer"
          >
            <span className="uppercase text-xs sm:text-sm tracking-wider font-black italic">{t('quote_btn_reserve', 'RESERVAR AHORA')}</span>
          </button>
        </div>
      ) : (
        /* PANTALLA DE CONFIRMACIÓN RECIBIDA SUCCESS MULTI-IDIOMA */
        <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border-2 border-slate-100 text-center animate-in zoom-in duration-300 w-full">
          <div className="bg-green-100 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
            <CheckCircle className="text-green-600 w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black uppercase italic text-slate-900 mb-3 sm:mb-4 leading-none">
            {t('success_title_1', 'Solicitud')} <span className="text-green-600">{t('success_title_2', 'Recibida')}</span>
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-6 sm:mb-10 italic px-2 sm:px-4 text-xs sm:text-sm">
            {t('success_message', '"Mauricio Manoni ha recibido tu solicitud en el Panel de Control. En breve nos pondremos en contacto directo a tu WhatsApp."')}
          </p>
        </div>
      )}
    </div>
  );
}