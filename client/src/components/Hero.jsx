import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

// IMPORTACIÓN DE ASSETS: Traemos la imagen de forma segura desde tu carpeta
import imgHeroBackground from '../assets/hero.png';

/**
 * Componente Hero - Diseño Premium Centrado con Imagen de Fondo
 * Optimizado para el Layout Compacto con scroll mínimo.
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    /**
     * 🛠️ AJUSTADO: justify-center e items-center para centrar todo el bloque de texto
     * Se mantiene la altura compacta (h-[40vh] sm:h-[50vh] md:h-[55vh])
     */
    <div className="relative h-[35vh] sm:h-[45vh] md:h-[50vh] text-white px-4 sm:px-8 md:px-16 flex flex-col justify-center items-center overflow-hidden w-full bg-slate-900">
      
      {/* 🖼️ IMAGEN DE FONDO COMPLETA (BANNER COMPACTO) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img 
          src={imgHeroBackground} 
          alt="Fiat Cronos en Mendoza - Good Trip" 
          className="w-full h-full object-cover md:object-center animate-out fade-in duration-1000"
        />
        {/* Capas de degradado ajustadas a la gama de grises y centradas */}
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60" />
      </div>

      {/* Brillo radial de acento de servicios centrado */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-50 pointer-events-none z-1" />

      {/* CONTENEDOR DE TEXTO - 🛠️ COMPLETAMENTE CENTRADO Y ESCALADO SUTIL */}
      <div className="relative z-10 max-w-lg md:max-w-2xl w-full flex flex-col items-center pt-2 sm:pt-6 text-center">
        
        {/* Título principal compacto - REDUCIDO UN POCO */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-1.5 sm:mb-2 leading-tight animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter uppercase italic text-white">
          Good Trip <br className="max-md:hidden" />
          <span className="text-sky-400 not-italic">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza ( text-xs en móvil, text-sm/base en Desktop) */}
        <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-relaxed mb-3 sm:mb-4 max-w-md md:max-w-xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 drop-shadow-[0_2px_4px_rgba(15,23,42,0.8)]">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social optimizada centradad */}
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 bg-slate-900/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5 max-sm:scale-90">
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