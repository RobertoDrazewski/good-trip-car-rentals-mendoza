import React from 'react';
import { ShieldCheck, Users, Fuel, DollarSign, CreditCard, BookOpen } from 'lucide-react';
// 🌐 IMPORTADO: Hook de traducción para el soporte multi-idioma
import { useTranslation } from 'react-i18next';

export default function Requirements() {
  // 🌐 ACTIVADO: Hook de traducción
  const { t } = useTranslation();

  const reqs = [
    {
      title: t('req_age_title', "Edad Mínima"),
      text: t('req_age_text', "Para conducir nuestras unidades es necesario ser mayor de 23 años."),
      icon: <Users className="text-sky-500 group-hover:text-white transition-colors" size={16} />
    },
    {
      title: t('req_doc_title', "Documentación"),
      text: t('req_doc_text', "Licencia de conducir física, vigente y habilitante para vehículos particulares."),
      icon: <ShieldCheck className="text-sky-500 group-hover:text-white transition-colors" size={16} />
    },
    {
      title: t('req_km_title', "Kilometraje Libre"),
      text: t('req_km_text', "Kilómetros ilimitados en todas las unidades y sin cargo por conductor adicional."),
      icon: <Fuel className="text-sky-500 group-hover:text-white transition-colors" size={16} />
    },
    {
      title: t('req_card_title', "Sin Tarjeta"),
      text: t('req_card_text', "No solicitamos garantía de tarjeta de crédito para concretar el alquiler."),
      icon: <CreditCard className="text-sky-500 group-hover:text-white transition-colors" size={16} />
    },
    {
      title: t('req_warranty_title', "Garantía"),
      text: t('req_warranty_text', "Depósito de $450.000 ARS o USD 300 (Reembolsable íntegramente al finalizar el contrato)."),
      icon: <DollarSign className="text-sky-500 group-hover:text-white transition-colors" size={16} />
    },
    {
      title: t('req_guide_title', "Guía Turística"),
      text: t('req_guide_text', "Le obsequiamos una guía exclusiva para aprovechar sus rutas en Mendoza."),
      icon: <BookOpen className="text-sky-500 group-hover:text-white transition-colors" size={16} />
    }
  ];

  return (
    /**
     * 🛠️ AJUSTADO: Se eliminaron los paddings pesados (py-24), el fondo blanco duplicado y el título
     * para calzar de forma nativa e inmediata dentro del layout por pestañas.
     */
    <div className="w-full animate-in fade-in duration-300">
      
      {/* CONTENEDOR DE TARJETAS OPTIMIZADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full">
        {reqs.map((item, idx) => (
          <div 
            key={idx} 
            className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-sky-200 hover:bg-white hover:shadow-sm transition-all duration-300 group flex flex-col text-left w-full"
          >
            <div className="flex items-center gap-3 mb-2.5 w-full">
              {/* Contenedor Icono Reescalado */}
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors flex-shrink-0 border border-slate-100">
                {item.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-slate-800 truncate">
                {item.title}
              </h3>
            </div>
            
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed pl-0.5">
              {item.text}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}