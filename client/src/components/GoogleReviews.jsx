import React from 'react';
import { Star, ExternalLink } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';

/**
 * Componente utilitario interno: Estrellas en Celeste Activo Balanz Compactas
 */
const RatingStars = ({ size = 11 }) => (
  <div className="flex text-[#88BDF2] gap-0.5" aria-label="5 estrellas de calificación">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill="currentColor" stroke="none" />
    ))}
  </div>
);

/**
 * Icono de Instagram manual adaptado
 */
const InstagramIcon = ({ size = 12 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
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
    { id: 1, name: "Cesar Osores", rating: 5, text: t('rev_1_text', 'Excelente atención de primera...'), date: t('rev_1_date', 'Hace 1 semana'), img: "C" },
    { id: 2, name: "Mariana Zapata", rating: 5, text: t('rev_2_text', 'El auto impecable, súper puntuales...'), date: t('rev_2_date', 'Hace 2 semanas'), img: "M" },
    { id: 3, name: "Nicolas Martinez", rating: 5, text: t('rev_3_text', 'La mejor opción en Mendoza sin dudas.'), date: t('rev_3_date', 'Hace 1 mes'), img: "N" },
  ];

  const GOOGLE_MAPS_LINK = "https://share.google/VoJKuZ1dSUgMybMvA";
  const INSTAGRAM_LINK = "https://www.instagram.com/good.triprentals/";

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 text-white bg-[#121319] p-4 sm:p-6 rounded-[1.8rem] border border-slate-800/40 shadow-2xl">
      
      {/* 🛠️ CABECERA COMPACTADA ESTILO BALANZ */}
      <div className="flex items-center justify-between border-b border-[#1E222F] pb-3 w-full gap-2">
        <div className="text-left min-w-0">
          <p className="text-[#5383B3] font-black uppercase text-[8px] tracking-widest italic mb-0.5">
            {t('reviews_badge_tag', 'Experiencias Reales')}
          </p>
          <h2 className="text-lg font-black tracking-tight text-white uppercase leading-tight truncate">
            {t('reviews_section_title', 'Opiniones de')} <span className="text-[#88BDF2] italic">{t('reviews_section_subtitle', 'Clientes')}</span>
          </h2>
        </div>

        {/* mini badge global premium */}
        <div className="flex items-center gap-2 bg-[#1E222F] px-3 py-1.5 rounded-xl border border-slate-800/40 flex-shrink-0">
          <span className="text-base font-black text-white tracking-tighter leading-none">5.0</span>
          <div className="flex flex-col items-start">
            <RatingStars size={8} />
            <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noreferrer" className="text-[8px] font-black text-[#5383B3] uppercase tracking-tighter hover:underline flex items-center gap-0.5 mt-0.5">
              <span>ver todas</span>
              <ExternalLink size={6} />
            </a>
          </div>
        </div>
      </div>

      {/* 🛠️ FEED VERTICAL COMPACTO CON COLORES BALANZ */}
      <div className="flex flex-col gap-2.5 w-full max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
        {reviews.map((rev) => (
          <div 
            key={rev.id} 
            className="bg-[#1E222F]/60 p-3 sm:p-4 rounded-xl border border-transparent hover:border-[#88BDF2]/30 hover:bg-[#1E222F] transition-all duration-300 group text-left w-full"
          >
            <div className="flex items-start gap-3 w-full">
              {/* Avatar ultra-compacto */}
              <div className="w-8 h-8 bg-[#121319] rounded-lg flex items-center justify-center font-black text-[#88BDF2] text-xs shadow-sm border border-slate-800 group-hover:bg-[#88BDF2] group-hover:text-[#121319] transition-colors flex-shrink-0">
                {rev.img}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 w-full">
                  <h4 className="font-black text-white uppercase text-[11px] tracking-tight truncate">
                    {rev.name}
                  </h4>
                  <span className="text-[8px] font-bold text-[#666D7E] uppercase tracking-wider flex-shrink-0">{rev.date}</span>
                </div>
                
                <div className="mt-0.5"><RatingStars size={9} /></div>
                
                <p className="text-[#6F7D93] italic text-[11px] sm:text-xs leading-relaxed font-medium mt-1.5 line-clamp-2">
                  "{rev.text}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🛠️ ACCONES INTEGRADAS CON BOTONES MUTED Y ACCENT */}
      <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-[#1E222F]">
        <a 
          href={GOOGLE_MAPS_LINK}
          target="_blank" 
          rel="noreferrer" 
          className="group flex items-center justify-center gap-1.5 bg-[#1E222F] text-white border border-slate-800/80 py-3 px-2 rounded-xl font-black uppercase text-[9px] tracking-wider hover:bg-[#5383B3] transition-all text-center shadow-sm active:scale-95 duration-100 cursor-pointer min-h-[38px]"
        >
          <span>{t('reviews_btn_google', 'Google Maps')}</span> 
          <ExternalLink size={10} className="group-hover:rotate-45 transition-transform flex-shrink-0 text-[#88BDF2]" />
        </a>

        <a 
          href={INSTAGRAM_LINK}
          target="_blank" 
          rel="noreferrer" 
          className="group flex items-center justify-center gap-1.5 bg-[#88BDF2] text-[#121319] py-3 px-2 rounded-xl font-black uppercase text-[9px] tracking-wider hover:bg-[#5383B3] hover:text-white transition-all text-center shadow-sm active:scale-95 duration-100 cursor-pointer min-h-[38px]"
        >
          <InstagramIcon size={10} /> 
          <span>{t('reviews_btn_insta', 'Instagram')}</span>
        </a>
      </div>

    </div>
  );
}