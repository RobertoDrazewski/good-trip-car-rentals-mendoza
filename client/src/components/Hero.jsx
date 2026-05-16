import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    /** * 📱 RESPONSIVE: Cambiado pt-72 fijo por pt-44 en móvil. 
     * Esto deja el espacio perfecto para el logo en celulares sin empujar el texto fuera de la pantalla.
     */
    <div className="relative min-h-[85vh] bg-gradient-to-b from-blue-900 via-slate-900 to-black text-white pt-44 md:pt-72 pb-16 md:pb-24 px-4 sm:px-6 text-center flex flex-col justify-center overflow-hidden w-full">
      
      {/* Brillo de fondo para dar profundidad */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Título principal con el nombre de la empresa */}
        {/* 📱 RESPONSIVE: text-4xl en móvil para que el nombre entre en una o dos líneas perfectas */}
        <h2 className="text-4xl sm:text-5xl md:text-8xl font-black mb-4 sm:mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter uppercase italic">
          Good Trip <span className="text-yellow-500 not-italic">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza */}
        {/* 📱 RESPONSIVE: text-base en celulares para una lectura súper ejecutiva y cómoda */}
        <p className="text-base sm:text-xl md:text-3xl opacity-90 max-w-3xl mx-auto font-light leading-relaxed mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social (Valoraciones de Google) */}
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <div className="flex text-yellow-400 gap-0.5 sm:gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xl sm:text-2xl drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]">★</span>
            ))}
          </div>
          {/* 📱 RESPONSIVE: text-[9px] con tracking controlado para que no se desborde en pantallas chicas */}
          <p className="text-[9px] sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.3em] font-black text-slate-300 max-w-xs sm:max-w-none">
            5 Estrellas en Google • Expandiendo nuestra flota por vos
          </p>
        </div>
      </div>
    </div>
  );
}