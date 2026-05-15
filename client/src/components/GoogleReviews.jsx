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
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* CABECERA */}
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-12">
          <div className="max-w-2xl text-left">
            <p className="text-yellow-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4 italic">
              {t('reviews_badge_tag')}
            </p>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
              {t('reviews_section_title')} <br />
              <span className="text-yellow-500 italic">{t('reviews_section_subtitle')}</span>
            </h2>
          </div>

          {/* BADGE GLOBAL */}
          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl flex items-center gap-8 border border-white/10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-yellow-500/10 transition-colors" />
            
            <div className="text-center relative z-10">
              <p className="text-6xl font-black text-white leading-none tracking-tighter">5.0</p>
              <RatingStars size={14} />
            </div>
            <div className="h-16 w-[1px] bg-white/10" />
            <div className="flex flex-col gap-3 relative z-10">
              <p className="text-white font-black text-sm uppercase tracking-widest leading-tight">
                Google <br /> Verified
              </p>
              <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-yellow-500 hover:text-white transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Read All</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* GRID DE RESEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-slate-50 p-12 rounded-[3.5rem] border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 group"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg group-hover:bg-yellow-500 group-hover:text-slate-900 transition-colors">
                  {rev.img}
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase text-sm tracking-tight">
                    {rev.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{rev.date}</p>
                </div>
              </div>

              <RatingStars size={14} />

              <p className="text-slate-600 italic text-lg leading-relaxed font-medium mt-6">
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <a 
            href={GOOGLE_MAPS_LINK}
            target="_blank" 
            rel="noreferrer" 
            className="group flex items-center gap-5 bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-yellow-500 hover:text-slate-950 transition-all shadow-2xl hover:-translate-y-2 active:scale-95"
          >
            {t('reviews_btn_google')} <ExternalLink size={20} className="group-hover:rotate-45 transition-transform" />
          </a>

          <a 
            href={INSTAGRAM_LINK}
            target="_blank" 
            rel="noreferrer" 
            className="group flex items-center gap-5 bg-white border-2 border-slate-900 text-slate-900 px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-xl hover:-translate-y-2 active:scale-95"
          >
            <InstagramIcon size={20} /> {t('reviews_btn_insta')}
          </a>
        </div>
      </div>
    </section>
  );
}