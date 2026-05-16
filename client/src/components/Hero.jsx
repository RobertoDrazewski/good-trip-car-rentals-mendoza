import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Componente Hero - Optimizado para evitar solapamientos con el BookingForm
 * Asegura la visualización de la prueba social (estrellas de Google) en móviles.
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    /**
     * 🛠️ CORREGIDO: Se cambió min-h-[85vh] por min-h-screen en móviles (o remoción de altura rígida si es necesario)
     * y se aumentó el padding inferior (pb-28 en móvil) para empujar el formulario de reservas hacia abajo.
     */
    <div className="relative min-h-screen sm:min-h-[85vh] bg-gradient-to-b from-blue-900 via-slate-900 to-black text-white pt-40 sm:pt-44 md:pt-72 pb-28 md:pb-24 px-4 sm:px-6 text-center flex flex-col justify-center overflow-hidden w-full">
      
      {/* Brillo de fondo para dar profundidad */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Título principal con el nombre de la empresa */}
        <h2 className="text-4xl sm:text-5xl md:text-8xl font-black mb-4 sm:mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter uppercase italic">
          Good Trip <span className="text-yellow-500 not-italic">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza */}
        <p className="text-base sm:text-xl md:text-3xl opacity-90 max-w-3xl mx-auto font-light leading-relaxed mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social (Valoraciones de Google) */}
        {/* 🛠️ MODIFICADO: Se añade un margen inferior (mb-2) de resguardo */}
        <div className="flex flex-col items-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <div className="flex text-yellow-400 gap-0.5 sm:gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xl sm:text-2xl drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]">★</span>
            ))}
          </div>
          <p className="text-[9px] sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.3em] font-black text-slate-300 max-w-xs sm:max-w-none">
            5 Estrellas en Google • Expandiendo nuestra flota por vos
          </p>
        </div>
      </div>
    </div>
  );
}