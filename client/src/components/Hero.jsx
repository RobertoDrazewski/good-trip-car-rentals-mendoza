import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    /** 
     * pt-72: Espacio extra para el logo XL (h-48 + translate-y-6).
     * bg-gradient: Un degradado profundo que evoca profesionalismo y calidez.
     */
    <div className="relative min-h-[85vh] bg-gradient-to-b from-blue-900 via-slate-900 to-black text-white pt-72 pb-24 px-6 text-center flex flex-col justify-center overflow-hidden">
      
      {/* Brillo de fondo para dar profundidad */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Título principal con el nombre de la empresa */}
        <h2 className="text-5xl md:text-8xl font-black mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter">
          Good Trip <span className="text-yellow-500">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza */}
        <p className="text-xl md:text-3xl opacity-90 max-w-3xl mx-auto font-light leading-relaxed mb-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social (Valoraciones de Google) */}
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <div className="flex text-yellow-400 gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">★</span>
            ))}
          </div>
          <p className="text-sm uppercase tracking-[0.3em] font-bold opacity-70">
            5 Estrellas en Google • Expandiendo nuestra flota por vos
          </p>
        </div>
      </div>
    </div>
  );
}