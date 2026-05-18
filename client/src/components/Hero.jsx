import React from 'react';
import { useTranslation } from 'react-i18next';

// IMPORTACIÓN DE ASSETS: Traemos la imagen de forma segura desde tu carpeta
import imgHeroBackground from '../assets/hero.png';

/**
 * Componente Hero - Diseño Premium con Imagen de Fondo
 * Optimizado con la paleta Gris Pizarra, Blanco y Celeste.
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    /**
     * RESPONSIVE: Adaptado de bg-slate-950 a bg-slate-900 (Gris Pizarra Corp)
     */
    <div className="relative min-h-screen sm:min-h-[85vh] text-white pt-40 sm:pt-44 md:pt-72 pb-28 md:pb-32 px-4 sm:px-6 md:px-16 flex flex-col justify-center items-center md:items-start overflow-hidden w-full bg-slate-900">
      
      {/* 🖼️ IMAGEN DE FONDO COMPLETA (BANNER) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img 
          src={imgHeroBackground} 
          alt="Fiat Cronos en Mendoza - Good Trip" 
          className="w-full h-full object-cover object-[75%_center] md:object-center animate-out fade-in duration-1000"
        />
        {/* Capas de degradado ajustadas a la gama de grises de la nueva identidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent max-md:bg-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
      </div>

      {/* Brillo radial de acento de servicios cambiado de Amarillo a Celeste Sky */}
      <div className="absolute top-0 left-1/4 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-50 pointer-events-none z-1" />

      {/* CONTENEDOR DE TEXTO */}
      <div className="relative z-10 max-w-xl md:max-w-2xl w-full flex flex-col items-center md:items-start">
        
        {/* Título principal - Amarillo removido por Celeste */}
        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter uppercase italic text-center md:text-left text-white">
          Good Trip <br className="max-md:hidden" />
          <span className="text-sky-400 not-italic">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza */}
        <p className="text-base sm:text-xl md:text-2xl opacity-95 font-medium leading-relaxed mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 text-center md:text-left drop-shadow-[0_2px_4px_rgba(15,23,42,0.8)]">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social (Valoraciones de Google) - Estrellas pasadas a Celeste */}
        <div className="flex flex-col items-center md:items-start gap-3 mb-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <div className="flex text-sky-400 gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl drop-shadow-[0_2px_10px_rgba(56,189,248,0.4)]">★</span>
            ))}
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.15em] sm:tracking-[0.25em] font-black text-slate-200 drop-shadow-[0_2px_4px_rgba(15,23,42,0.8)] text-center md:text-left">
            5 Estrellas en Google • Expandiendo nuestra flota por vos
          </p>
        </div>

      </div>
    </div>
  );
}