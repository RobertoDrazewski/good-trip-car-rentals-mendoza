import React from 'react';
import { Star, ExternalLink } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';

const RatingStars = ({ size = 11 }) => (
  <div className="flex text-[#88BDF2] gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill="currentColor" stroke="none" />
    ))}
  </div>
);

const InstagramIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

  return (
    <div className="w-full h-full p-8 rounded-[2.5rem] bg-[#121319]/60 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col gap-6">
      
      {/* CABECERA INTEGRADA */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
        <div className="flex justify-between items-start">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#88BDF2] italic">
            {t('reviews_section_title', 'Opiniones de')} {t('reviews_section_subtitle', 'Clientes')}
          </h2>
          <div className="flex items-center gap-1 text-[10px] font-black text-white bg-[#88BDF2]/10 px-2 py-0.5 rounded-full">
            <Star size={10} fill="#88BDF2" /> 5.0
          </div>
        </div>
      </div>

      {/* FEED DE REVIEWS */}
      <div className="flex flex-col gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-[#88BDF2]/30 transition-all text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#121319] rounded-xl flex items-center justify-center font-black text-[#88BDF2] border border-white/10 flex-shrink-0">
                {rev.img}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-white uppercase text-[10px] truncate">{rev.name}</h4>
                  <span className="text-[8px] font-bold text-[#6F7D93] uppercase">{rev.date}</span>
                </div>
                <RatingStars size={9} />
                <p className="text-[#A0AEC0] italic text-[11px] leading-relaxed font-semibold mt-2">"{rev.text}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACCIONES ESTILIZADAS */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <a href="https://share.google/VoJKuZ1dSUgMybMvA" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#88BDF2] hover:text-[#121319] transition-all">
          Google Maps
        </a>
        <a href="https://www.instagram.com/good.triprentals/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#88BDF2] text-[#121319] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all">
          <InstagramIcon size={12} /> Instagram
        </a>
      </div>
    </div>
  );
}