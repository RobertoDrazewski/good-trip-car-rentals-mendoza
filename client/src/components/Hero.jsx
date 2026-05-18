import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

/**
 * Componente Hero - Diseño Premium Centrado Adaptado para Fondo Envolvente Global
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    /**
     * 🛠️ MODIFICADO: Eliminado el bg-slate-900 y la etiqueta <img> interna.
     * Ahora el componente es transparente para integrarse con el fondo global de App.jsx
     */
    <div className="relative h-[35vh] sm:h-[45vh] md:h-[50vh] text-white px-4 sm:px-8 md:px-16 flex flex-col justify-center items-center overflow-hidden w-full bg-transparent">
      
      {/* Brillo radial de acento de servicios centrado sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-500/15 via-transparent to-transparent opacity-60 pointer-events-none z-1" />

      {/* CONTENEDOR DE TEXTO COMPLETAMENTE CENTRADO */}
      <div className="relative z-10 max-w-lg md:max-w-2xl w-full flex flex-col items-center pt-2 sm:pt-6 text-center">
        
        {/* Título principal compacto */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-1.5 sm:mb-2 leading-tight animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter uppercase italic text-white drop-shadow-[0_4px_12px_rgba(15,23,42,0.5)]">
          Good Trip <br className="max-md:hidden" />
          <span className="text-sky-400 not-italic">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza */}
        <p className="text-xs sm:text-sm md:text-base opacity-95 font-medium leading-relaxed mb-3 sm:mb-4 max-w-md md:max-w-xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 drop-shadow-[0_2px_8px_rgba(15,23,42,0.8)]">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social optimizada centrada */}
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 max-sm:scale-90 shadow-lg">
          <div className="flex text-sky-400 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="currentColor" className="text-sky-400" />
            ))}
          </div>
          <div className="w-[1px] h-3 bg-white/20" />
          <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-slate-200">
            5 Estrellas en Google
          </p>
        </div>

      </div>
    </div>
  );
}