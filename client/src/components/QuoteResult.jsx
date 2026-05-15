import React, { useState } from 'react';
import { 
  CheckCircle, Clock, ShieldCheck, Car, Plane, Building2, 
  ChevronRight, Calendar, Sparkles
} from 'lucide-react';

export default function QuoteResult({ quote }) {
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
  const itemEstilo = "flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left";

  return (
    <div id="resultado-solicitud" className="max-w-3xl mx-auto mt-16 scroll-mt-32 animate-in fade-in zoom-in-95 duration-500">
      {!confirmado ? (
        <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border-2 border-slate-100 text-slate-900">
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-700 px-5 py-2 rounded-full w-fit mx-auto mb-6 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} /> 
            Presupuesto Calculado al Instante
          </div>

          <h3 className="text-3xl font-black uppercase italic text-center text-slate-900 mb-2 tracking-tight">
            Tu Resumen de <span className="text-yellow-500">Viaje</span>
          </h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center mb-10 italic">
            Hola {cliente_nombre}, revisá las condiciones de tu cotización oficial:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={itemEstilo}>
              <div className="p-3 bg-slate-900 text-yellow-500 rounded-xl"><Car size={20}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vehículo solicitado</p>
                <p className="text-sm font-black uppercase italic text-slate-900 mt-0.5">{auto_modelo}</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Duración: {dias} {dias === 1 ? 'Día' : 'Días'} de alquiler</p>
              </div>
            </div>

            <div className={itemEstilo}>
              <div className="p-3 bg-yellow-500 text-slate-950 rounded-xl">
                {String(entrega).toLowerCase().includes('aeropuerto') ? <Plane size={20}/> : <Building2 size={20}/>}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lugar de Entrega</p>
                <p className="text-sm font-black uppercase italic text-slate-900 mt-0.5">{entrega}</p>
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5"><Calendar size={12}/> {desde} • <Clock size={12}/> {hora_inicio} hs</p>
              </div>
            </div>

            <div className={itemEstilo}>
              <div className="p-3 bg-slate-200 text-slate-700 rounded-xl">
                {String(devolucion).toLowerCase().includes('aeropuerto') ? <Plane size={20}/> : <Building2 size={20}/>}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lugar de Devolución</p>
                <p className="text-sm font-black uppercase italic text-slate-900 mt-0.5">{devolucion}</p>
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5"><Calendar size={12}/> {hasta} • <Clock size={12}/> {hora_fin} hs</p>
              </div>
            </div>

            <div className={itemEstilo}>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl leading-none flex items-center justify-center">👶</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Opcional Sillita de Bebé</p>
                <p className="text-sm font-black uppercase italic text-slate-900 mt-0.5">
                  {sillita === true || sillita === 1 || String(sillita) === 'true' ? '✔️ Adicionada' : '❌ No Solicitada'}
                </p>
              </div>
            </div>

            <div className={`${itemEstilo} md:col-span-2 border-l-4 border-l-blue-500 bg-blue-50/40`}>
              <div className="p-3 bg-blue-600 text-white rounded-xl"><ShieldCheck size={20}/></div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Franquicia de Garantía Reembolsable</p>
                <p className="text-base font-black uppercase italic text-slate-900 mt-0.5">
                  $ {garantiaArs.toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500 not-italic">ARS ({garantia_usd} USD)</span>
                </p>
              </div>
            </div>

            <div className={`${itemEstilo} md:col-span-2 border-l-4 border-l-emerald-500 bg-emerald-50/30`}>
              <div className="p-3 bg-emerald-600 text-white rounded-xl text-xl flex items-center justify-center">🐩</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Good Trip Experience • Pet Friendly Activo</p>
                <p className="text-xs font-black uppercase text-slate-800 mt-0.5">¡Tu Caniche o mascota viaja con vos!</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white text-center shadow-xl relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.3em] mb-2">Total Final Estimado Alquiler</p>
            <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
              $ {monto_total_ars.toLocaleString('es-AR')} <span className="text-sm font-bold text-slate-400 not-italic">ARS</span>
            </p>
          </div>

          <button onClick={() => setConfirmado(true)} className="mt-8 w-full bg-yellow-500 hover:bg-slate-900 text-slate-950 hover:text-white font-black py-7 rounded-[2rem] transition-all flex items-center justify-center gap-4 shadow-lg active:scale-95 duration-150 group">
            <span className="uppercase text-sm tracking-wider font-black italic">RESERVAR AHORA</span>
          </button>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-slate-100 text-center animate-in zoom-in duration-300">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={48} className="text-green-600" /></div>
          <h3 className="text-3xl font-black uppercase italic text-slate-900 mb-4 leading-none">Solicitud <span className="text-green-600">Recibida</span></h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-10 italic px-4 text-sm">"Mauricio Manoni ha recibido tu solicitud en el Panel de Control. En breve nos pondremos en contacto directo a tu WhatsApp."</p>
        </div>
      )}
    </div>
  );
}