import React from 'react';
import { Star, ExternalLink } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';

/**
 * Componente utilitario interno para renderizar las 5 estrellas
 */
const RatingStars = ({ size = 14 }) => (
  <div className="flex text-yellow-500 gap-1" aria-label="5 estrellas de calificación">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill="currentColor" />
    ))}
  </div>
);

/**
 * Icono de Instagram manual para evitar errores de importación en lucide-react
 */
const InstagramIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function GoogleReviews() {
  const { t } = useTranslation();

  const reviews = [
    { id: 1, name: "Cesar Osores", rating: 5, text: t('rev_1_text'), date: t('rev_1_date'), img: "C" },
    { id: 2, name: "Mariana Zapata", rating: 5, text: t('rev_2_text'), date: t('rev_2_date'), img: "M" },
    { id: 3, name: "Nicolas Martinez", rating: 5, text: t('rev_3_text'), date: t('rev_3_date'), img: "N" },
  ];

  const GOOGLE_MAPS_LINK = "https://share.google/VoJKuZ1dSUgMybMvA";
  const INSTAGRAM_LINK = "https://www.instagram.com/good.triprentals/";

  return (
    /* 📱 RESPONSIVE: Reducido el padding vertical de py-32 a py-16 en móviles */
    <section className="py-16 md:py-32 bg-white relative overflow-hidden w-full">
      <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-500/5 blur-[100px] sm:blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* CABECERA */}
        {/* 📱 RESPONSIVE: El layout pasa de flex-col a items-start/end según pantalla con espaciados lógicos */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 md:mb-20 gap-8 md:gap-12">
          <div className="max-w-2xl text-left">
            <p className="text-yellow-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 italic">
              {t('reviews_badge_tag')}
            </p>
            {/* 📱 RESPONSIVE: Cambiado text-6xl rígido por text-4xl en móvil para evitar saltos de línea feos */}
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95] sm:leading-[0.9] uppercase break-words">
              {t('reviews_section_title')} <br />
              <span className="text-yellow-500 italic">{t('reviews_section_subtitle')}</span>
            </h2>
          </div>

          {/* BADGE GLOBAL DE GOOGLE REVIEWS */}
          {/* 📱 RESPONSIVE: Adaptado padding y esquinas en celular (rounded-[2rem] vs rounded-[3rem]) */}
          <div className="bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl flex items-center justify-between sm:justify-start gap-6 sm:gap-8 border border-white/10 relative overflow-hidden group w-full lg:w-auto">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-yellow-500/10 transition-colors" />
            
            <div className="text-center relative z-10">
              <p className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">5.0</p>
              <div className="mt-1 flex justify-center"><RatingStars size={12} /></div>
            </div>
            <div className="h-12 sm:h-16 w-[1px] bg-white/10" />
            <div className="flex flex-col gap-2 sm:gap-3 relative z-10">
              <p className="text-white font-black text-[11px] sm:text-sm uppercase tracking-widest leading-tight">
                Google <br /> Verified
              </p>
              <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-yellow-500 hover:text-white transition-colors w-fit">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Read All</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* GRID DE RESEÑAS / SCROLL HORIZONTAL EN MÓVILES */}
        {/* 📱 TRUCO PREMIUM: En celular se convierte en una hilera deslizable con el dedo (overflow-x-auto) 
           con efecto snap, mientras que en PC se mantiene la grilla fija de 3 columnas */}
        <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 md:gap-10 md:mb-20 md:pb-0">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-slate-50 p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 group flex-shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-center"
            >
              <div className="flex items-center gap-4 sm:gap-5 mb-6 md:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 rounded-full flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:bg-yellow-500 group-hover:text-slate-900 transition-colors flex-shrink-0">
                  {rev.img}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm tracking-tight truncate max-w-[180px]">
                    {rev.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{rev.date}</p>
                </div>
              </div>

              <RatingStars size={13} />

              {/* 📱 RESPONSIVE: Reducido el tamaño del texto en celular (text-base a md:text-lg) para que entre más contenido */}
              <p className="text-slate-600 italic text-base md:text-lg leading-relaxed font-medium mt-4 sm:mt-6 line-clamp-5 md:line-clamp-none">
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>

        {/* ACCIONES / BOTONES DE REDES */}
        {/* 📱 RESPONSIVE: En móviles reduce el padding interno de los botones y achica el tracking de texto 
           para evitar que las palabras largas de la traducción colapsen el botón */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-4 md:mt-0">
          <a 
            href={GOOGLE_MAPS_LINK}
            target="_blank" 
            rel="noreferrer" 
            className="group flex items-center justify-center gap-4 bg-slate-900 text-white w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em] hover:bg-yellow-500 hover:text-slate-950 transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-center"
          >
            {t('reviews_btn_google')} <ExternalLink size={16} className="group-hover:rotate-45 transition-transform flex-shrink-0" />
          </a>

          <a 
            href={INSTAGRAM_LINK}
            target="_blank" 
            rel="noreferrer" 
            className="group flex items-center justify-center gap-4 bg-white border-2 border-slate-900 text-slate-900 w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-md hover:-translate-y-1 active:scale-95 text-center"
          >
            <InstagramIcon size={16} /> <span className="truncate">{t('reviews_btn_insta')}</span>
          </a>
        </div>

      </div>
    </section>
  );
}