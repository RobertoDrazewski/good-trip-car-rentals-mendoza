import React from 'react';
import { ShieldCheck, Users, Fuel, DollarSign, CreditCard, BookOpen } from 'lucide-react';
// 🌐 IMPORTADO: Hook de traducción para el soporte multi-idioma
import { useTranslation } from 'react-i18next';

export default function Requirements() {
  // 🌐 ACTIVADO: Hook de traducción
  const { t } = useTranslation();

  const reqs = [
    {
      /* 🛠️ MODIFICADO: Agrupado de Edad Mínima + Días de Alquiler Mínimos para mantener la simetría de 6 tarjetas */
      title: t('req_conditions_title', "Condiciones Mínimas"),
      text: t('req_conditions_text', "Ser mayor de 23 años para conducir nuestras unidades. El período mínimo de alquiler es de 3 días."),
      icon: <Users className="text-[#88BDF2] group-hover:text-[#121319] transition-colors" size={15} />
    },
    {
      title: t('req_doc_title', "Documentación"),
      text: t('req_doc_text', "Licencia de conducir física, vigente y habilitante para vehículos particulares."),
      icon: <ShieldCheck className="text-[#88BDF2] group-hover:text-[#121319] transition-colors" size={15} />
    },
    {
      title: t('req_km_title', "Kilometraje Libre"),
      text: t('req_km_text', "Kilómetros ilimitados en todas las unidades y sin cargo por conductor adicional."),
      icon: <Fuel className="text-[#88BDF2] group-hover:text-[#121319] transition-colors" size={15} />
    },
    {
      title: t('req_card_title', "Sin Tarjeta"),
      text: t('req_card_text', "No solicitamos garantía de tarjeta de crédito para concretar el alquiler."),
      icon: <CreditCard className="text-[#88BDF2] group-hover:text-[#121319] transition-colors" size={15} />
    },
    {
      title: t('req_warranty_title', "Garantía Reembolsable"),
      text: t('req_warranty_text', "Depósito de $450.000 ARS o USD 300 (Reembolsable íntegramente al finalizar el contrato)."),
      icon: <DollarSign className="text-[#88BDF2] group-hover:text-[#121319] transition-colors" size={15} />
    },
    {
      title: t('req_guide_title', "Guía Turística"),
      text: t('req_guide_text', "Le obsequiamos una guía exclusiva para aprovechar sus rutas en Mendoza."),
      icon: <BookOpen className="text-[#88BDF2] group-hover:text-[#121319] transition-colors" size={15} />
    }
  ];

  return (
    <div className="w-full animate-in fade-in duration-300">
      
      {/* 🛠️ REPARADO: Estructura responsiva modular adaptada al entorno nocturno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 w-full">
        {reqs.map((item, idx) => (
          <div 
            key={idx} 
            className="p-3 sm:p-4 rounded-xl bg-[#1E222F] border border-slate-800/40 hover:border-[#88BDF2]/30 hover:bg-[#1E222F]/90 transition-all duration-200 group flex flex-col text-left w-full shadow-lg"
          >
            <div className="flex items-center gap-2.5 w-full mb-1.5">
              {/* Contenedor Icono Compacto Estilo Balanz */}
              <div className="w-7 h-7 bg-[#121319] rounded-lg flex items-center justify-center shadow-inner group-hover:bg-[#88BDF2] transition-colors flex-shrink-0 border border-slate-800">
                {item.icon}
              </div>
              
              <h3 className="text-[11px] sm:text-xs font-black uppercase italic tracking-tight text-white leading-tight flex-1">
                {item.title}
              </h3>
            </div>
            
            {/* Texto descriptivo en Gris Muted de alta legibilidad nocturna */}
            <p className="text-[10px] sm:text-[11px] text-[#6F7D93] font-bold leading-relaxed pl-0.5">
              {item.text}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}