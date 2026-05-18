import React from 'react';
import { Star, ExternalLink } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';

/**
 * Componente utilitario interno: Estrellas ahora en Celeste Premium
 */
const RatingStars = ({ size = 14 }) => (
  <div className="flex text-sky-500 gap-0.5 sm:gap-1" aria-label="5 estrellas de calificación">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill="currentColor" stroke="none" />
    ))}
  </div>
);

/**
 * Icono de Instagram manual adaptado
 */
const InstagramIcon = ({ size = 16 }) => (
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
    className="flex-shrink-0"
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
    <section className="py-12 md:py-32 bg-white relative overflow-hidden w-full">
      {/* Luz ambiental difuminada en Celeste Sky en lugar de Amarillo */}
      <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-sky-400/10 blur-[100px] sm:blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
        
        {/* CABECERA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 md:mb-20 gap-6 md:gap-12 w-full">
          <div className="max-w-2xl text-left w-full">
            <p className="text-sky-600 font-black uppercase text-[8px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] mb-2 sm:mb-4 italic">
              {t('reviews_badge_tag')}
            </p>
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-800 leading-none uppercase break-words">
              {t('reviews_section_title')} <br />
              <span className="text-sky-500 italic">{t('reviews_section_subtitle')}</span>
            </h2>
          </div>

          {/* BADGE GLOBAL DE GOOGLE REVIEWS - ELIMINADO EL NEGRO */}
          <div className="bg-slate-100 p-5 sm:p-8 rounded-[1.8rem] sm:rounded-[3rem] shadow-sm flex items-center gap-4 sm:gap-8 border border-slate-200/60 relative overflow-hidden group w-full lg:w-auto flex-shrink-0">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full group-hover:bg-sky-500/20 transition-colors" />
            
            <div className="text-center relative z-10 flex-shrink-0">
              <p className="text-4xl sm:text-6xl font-black text-slate-800 leading-none tracking-tighter">5.0</p>
              <div className="mt-1 flex justify-center"><RatingStars size={10} /></div>
            </div>
            
            <div className="h-10 sm:h-16 w-[1px] bg-slate-300 flex-shrink-0" />
            
            <div className="flex flex-col gap-1 sm:gap-3 relative z-10 w-full sm:w-auto">
              <p className="text-slate-800 font-black text-[10px] sm:text-sm uppercase tracking-widest leading-tight whitespace-nowrap">
                Google Verified
              </p>
              <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-600 hover:text-sky-800 transition-colors w-fit touch-manipulation">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Read All</span>
                <ExternalLink size={10} className="flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* GRID DE RESEÑAS */}
        <div className="flex overflow-x-auto pb-6 gap-5 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 md:gap-10 md:mb-20 md:pb-0 w-full">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-slate-50 p-5 sm:p-8 md:p-12 rounded-[1.8rem] md:rounded-[3.5rem] border border-transparent hover:border-sky-200 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(14,165,233,0.1)] transition-all duration-500 group flex-shrink-0 w-[82vw] sm:w-[340px] md:w-auto snap-center flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6 w-full">
                  {/* Avatar: Pasado de Negro a Gris Oscuro y Celeste al interactuar */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-800 rounded-full flex items-center justify-center font-black text-white text-base sm:text-lg shadow-md group-hover:bg-sky-500 group-hover:text-white transition-colors flex-shrink-0">
                    {rev.img}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 uppercase text-xs sm:text-sm tracking-tight truncate">
                      {rev.name}
                    </h4>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{rev.date}</p>
                  </div>
                </div>

                <RatingStars size={11} />

                <p className="text-slate-600 italic text-sm md:text-lg leading-relaxed font-medium mt-4 sm:mt-6 line-clamp-6 md:line-clamp-none break-words">
                  "{rev.text}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* BOTONES DE REDES - CERO AMARILLO O NEGRO ABSOLUTO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4 md:mt-0 w-full">
          <a 
            href={GOOGLE_MAPS_LINK}
            target="_blank" 
            rel="noreferrer" 
            className="group flex items-center justify-center gap-3 bg-slate-800 text-white w-full sm:w-auto px-4 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.25em] hover:bg-sky-500 hover:text-white transition-all shadow-lg hover:-translate-y-1 active:scale-95 text-center touch-manipulation whitespace-normal min-h-[52px]"
          >
            <span className="break-words">{t('reviews_btn_google')}</span> 
            <ExternalLink size={14} className="group-hover:rotate-45 transition-transform flex-shrink-0" />
          </a>

          <a 
            href={INSTAGRAM_LINK}
            target="_blank" 
            rel="noreferrer" 
            className="group flex items-center justify-center gap-3 bg-white border-2 border-slate-800 text-slate-800 w-full sm:w-auto px-4 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.25em] hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all shadow-md hover:-translate-y-1 active:scale-95 text-center touch-manipulation whitespace-normal min-h-[52px]"
          >
            <InstagramIcon size={14} /> 
            <span className="break-words">{t('reviews_btn_insta')}</span>
          </a>
        </div>

      </div>
    </section>
  );
}