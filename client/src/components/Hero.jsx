import React from 'react';
import { useTranslation } from 'react-i18next';

// IMPORTACIÓN DE ASSETS: Traemos la imagen de forma segura desde tu carpeta
import imgHeroBackground from '../assets/hero.png';

/**
 * Componente Hero - Diseño Premium con Imagen de Fondo
 * Optimizado con alineación asimétrica para no tapar el vehículo en Desktop.
 */
export default function Hero() {
  // SOLUCIONADO: Corregido pequeño error de asignación del hook useTranslation
  const { t } = useTranslation();

  return (
    /**
     * RESPONSIVE: En móviles se mantiene centrado (items-center text-center), 
     * pero en PC se alinea a la izquierda (md:items-start md:text-left)
     */
    <div className="relative min-h-screen sm:min-h-[85vh] text-white pt-40 sm:pt-44 md:pt-72 pb-28 md:pb-32 px-4 sm:px-6 md:px-16 flex flex-col justify-center items-center md:items-start overflow-hidden w-full bg-slate-950">
      
      {/* 🖼️ IMAGEN DE FONDO COMPLETA (BANNER) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* SOLUCIONADO: Se removió el comentario interno que rompía la compilación de Babel */}
        <img 
          src={imgHeroBackground} 
          alt="Fiat Cronos en Mendoza - Good Trip" 
          className="w-full h-full object-cover object-[75%_center] md:object-center animate-out fade-in duration-1000"
        />
        {/* Capa de degradado oscuro superior e inferior para garantizar contraste con textos y Navbar */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent max-md:bg-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
      </div>

      {/* Brillo radial de acento de servicios */}
      <div className="absolute top-0 left-1/4 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-60 pointer-events-none z-1" />

      {/* CONTENEDOR DE TEXTO: md:max-w-2xl limita el ancho para que no avance sobre el auto */}
      <div className="relative z-10 max-w-xl md:max-w-2xl w-full flex flex-col items-center md:items-start">
        
        {/* Título principal */}
        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-10 duration-1000 tracking-tighter uppercase italic text-center md:text-left">
          Good Trip <br className="max-md:hidden" />
          <span className="text-yellow-500 not-italic">Car Rentals</span>
        </h2>
        
        {/* Mensaje de calidez y confianza */}
        <p className="text-base sm:text-xl md:text-2xl opacity-95 font-medium leading-relaxed mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 text-center md:text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
        </p>

        {/* Prueba social (Valoraciones de Google) */}
        <div className="flex flex-col items-center md:items-start gap-2 mb-2 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <div className="flex text-yellow-400 gap-0.5 sm:gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xl sm:text-2xl drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">★</span>
            ))}
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.15em] sm:tracking-[0.25em] font-black text-slate-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center md:text-left">
            5 Estrellas en Google • Expandiendo nuestra flota por vos
          </p>
        </div>

      </div>
    </div>
  );
}