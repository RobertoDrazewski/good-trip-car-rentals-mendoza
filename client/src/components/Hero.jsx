import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

/**
 * Componente Hero - Versión Compacta de Alta Densidad para Evitar Desbordes
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    /**
     * 🛠️ REPARADO: Se eliminaron las alturas en VH (h-[35vh], h-[50vh]) que estiraban el layout vacío.
     * Ahora usa h-auto y lg:h-[130px] fijos, actuando como una marquesina ejecutiva de alta gama.
     */
    <div className="relative w-full h-auto lg:h-[130px] text-white px-4 sm:px-8 md:px-16 flex flex-col justify-center items-center overflow-hidden bg-transparent flex-shrink-0">
      
      {/* Brillo radial de acento de servicios centrado sutil - Gradiente Balanz */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#88BDF2]/10 via-transparent to-transparent opacity-60 pointer-events-none z-1" />

      {/* CONTENEDOR DE TEXTO INTEGRADO EN UNA LÍNEA COMPACTA PARA RENDIMIENTO DE ESPACIO */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-3 max-w-7xl pt-2 sm:pt-4">
        
        {/* Título principal y subtítulo en horizontal (Optimiza altura en PC) */}
        <div className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white drop-shadow-[0_4px_12px_rgba(18,19,25,0.6)]">
            Good Trip <span className="text-[#88BDF2] not-italic">Car Rentals</span>
          </h2>
          <p className="text-[11px] opacity-85 text-[#6F7D93] font-bold hidden md:block mt-0.5">
            {t('hero_subtitle', 'Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.')}
          </p>
        </div>

        {/* Prueba social optimizada centrada - Estilo Tarjeta Balanz */}
        <div className="flex items-center gap-2 bg-[#1E222F]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/60 shadow-2xl flex-shrink-0">
          <div className="flex text-[#88BDF2] gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill="currentColor" stroke="none" className="text-[#88BDF2]" />
            ))}
          </div>
          <div className="w-[1px] h-3 bg-slate-800" />
          <p className="text-[9px] uppercase tracking-widest font-black text-white/90">
            5 Estrellas en Google
          </p>
        </div>

      </div>
    </div>
  );
}