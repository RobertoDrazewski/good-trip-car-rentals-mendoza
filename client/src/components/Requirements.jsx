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
      icon: <Users className="text-yellow-500 group-hover:text-yellow-400 transition-colors" size={22} />
    },
    {
      title: t('req_doc_title', "Documentación"),
      text: t('req_doc_text', "Licencia de conducir física, vigente y habilitante para vehículos particulares."),
      icon: <ShieldCheck className="text-yellow-500 group-hover:text-yellow-400 transition-colors" size={22} />
    },
    {
      title: t('req_km_title', "Kilometraje Libre"),
      text: t('req_km_text', "Kilómetros ilimitados en todas las unidades y sin cargo por conductor adicional."),
      icon: <Fuel className="text-yellow-500 group-hover:text-yellow-400 transition-colors" size={22} />
    },
    {
      title: t('req_card_title', "Sin Tarjeta"),
      text: t('req_card_text', "No solicitamos garantía de tarjeta de crédito para concretar el alquiler."),
      icon: <CreditCard className="text-yellow-500 group-hover:text-yellow-400 transition-colors" size={22} />
    },
    {
      title: t('req_warranty_title', "Garantía"),
      text: t('req_warranty_text', "Depósito de $450.000 ARS o USD 300 (Reembolsable íntegramente al finalizar el contrato)."),
      icon: <DollarSign className="text-yellow-500 group-hover:text-yellow-400 transition-colors" size={22} />
    },
    {
      title: t('req_guide_title', "Guía Turística"),
      text: t('req_guide_text', "Le obsequiamos una guía exclusiva para aprovechar sus rutas en Mendoza."),
      icon: <BookOpen className="text-yellow-500 group-hover:text-yellow-400 transition-colors" size={22} />
    }
  ];

  return (
    /* 📱 RESPONSIVE: Reducido padding vertical de py-24 a py-12 en móviles */
    <section id="requisitos" className="py-12 md:py-24 bg-white w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-10 md:mb-16">
          {/* 📱 RESPONSIVE: text-3xl en celu para evitar desbordes feos de línea */}
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            {t('req_section_title', 'Requisitos de')} <span className="text-yellow-500">{t('req_section_subtitle', 'Alquiler')}</span>
          </h2>
          <div className="w-16 md:w-24 h-1.5 md:h-2 bg-yellow-500 mx-auto mt-4 md:mt-6 rounded-full" />
        </div>

        {/* CONTENEDOR DE TARJETAS / DESLIZABLE EN MÓVILES */}
        {/* 📱 TRUCO PREMIUM: En celulares se transforma en una hilera horizontal fluida (overflow-x-auto) 
           con efecto snap-center para que el cliente deslice las tarjetas como en una app de celular */}
        <div className="flex overflow-x-auto pb-6 gap-5 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-0">
          {reqs.map((item, idx) => (
            <div 
              key={idx} 
              /* 📱 RESPONSIVE: Adaptados paddings (p-6) y bordes (rounded-[2rem]) más limpios en móvil.
                 flex-shrink-0 y w-[82vw] le dan el tamaño ideal de tarjeta en teléfonos */
              className="p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] transition-all duration-300 group flex-shrink-0 w-[82vw] sm:w-[320px] md:w-auto snap-center"
            >
              <div className="mb-5 md:mb-6 w-11 h-11 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 transition-colors flex-shrink-0">
                {item.icon}
              </div>
              <h3 className="text-base md:text-lg font-black uppercase italic tracking-tight text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}