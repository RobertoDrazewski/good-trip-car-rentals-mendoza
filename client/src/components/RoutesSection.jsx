import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigation, Loader2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🔌 CAPTURA DINÁMICA DE LA API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RoutesSection() {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/routes/all`);
        setRutas(res.data);
      } catch (err) {
        console.error("Error al cargar rutas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRutas();
  }, []);

  const prevSlide = (e) => {
    e.stopPropagation(); 
    if (rutas.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? rutas.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = (e) => {
    e.stopPropagation(); 
    if (rutas.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === rutas.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleNavigation = (url) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert(t('routes_error_map', 'GPS no disponible para esta ruta'));
    }
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-sky-500" size={32} />
    </div>
  );

  if (rutas.length === 0) return (
    <div className="text-center py-8 text-slate-400 font-medium italic text-sm">
      {t('routes_empty', 'Próximamente nuevas rutas...')}
    </div>
  );

  const r = rutas[currentIndex];

  return (
    /**
     * 🛠️ AJUSTADO: Remoción de paddings masivos externos (py-24) y el header gigante
     * para una inserción fluida en el contenedor dinámico de pestañas de App.jsx
     */
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in duration-300">
      
      {/* CONTENEDOR DE TARJETA ÚNICA ACTIVA INTEGRADA */}
      <div 
        onClick={() => handleNavigation(r.maps_url)}
        /**
         * 🛠️ REPARADO: Alturas escaladas a proporciones lógicas (h-[250px] a h-[380px]) 
         * para eliminar por completo el scroll excesivo en monitores y celus.
         */
        className="group relative h-[250px] sm:h-[320px] md:h-[380px] rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-md cursor-pointer transition-all duration-700 w-full"
      >
        {/* Imagen de fondo */}
        <img 
          src={r.imagen_url ? `${API_BASE_URL}${r.imagen_url}` : 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80'} 
          alt={r.titulo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103"
        />

        {/* Overlay de degradado profundo */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-95 transition-opacity duration-500" />
        
        {/* Icono GPS Flotante Compacto */}
        <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20">
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3.5 rounded-xl text-white group-hover:bg-sky-500 group-hover:border-sky-500 transition-all duration-300 shadow-sm">
            <Navigation size={14} fill="currentColor" className="group-hover:fill-white" />
          </div>
        </div>

        {/* Contenido Visual al pie */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 z-10 text-left">
          
          {/* Pin de Locación */}
          <div className="flex items-center gap-1.5 text-sky-400 mb-1">
            <MapPin size={11} fill="currentColor" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Mendoza, AR</span>
          </div>
          
          {/* Título de la experiencia reescalado */}
          <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 break-words">
            {r.titulo}
          </h4>

          {/* DESCRIPCIÓN COMPACTA CON ANIMACIÓN SUAVE */}
          <p className="text-white/90 text-[11px] sm:text-xs md:text-sm leading-relaxed font-medium italic border-l-2 border-sky-500 pl-3 mb-2 max-w-xl transform max-md:translate-y-0 max-md:opacity-100 max-md:line-clamp-2 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
            {r.descripcion}
          </p>
          
          {/* Barra de interactividad en Celeste */}
          <div className="h-0.5 bg-white/20 rounded-full overflow-hidden w-12 sm:w-16 group-hover:w-full transition-all duration-700">
            <div className="h-full bg-sky-500 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </div>
        </div>
      </div>

      {/* 🎯 CONTROLES DEL CARRUSEL ULTRA-COMPACTOS */}
      <div className="flex items-center justify-center gap-4 mt-4 w-full z-20">
        <button
          onClick={prevSlide}
          className="p-2 bg-slate-800 hover:bg-sky-500 text-white rounded-full shadow-md active:scale-90 transition-all cursor-pointer border border-slate-700 touch-manipulation"
          aria-label="Ruta Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Indicador numérico de posición */}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 select-none">
          {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {rutas.length}
        </span>

        <button
          onClick={nextSlide}
          className="p-2 bg-slate-800 hover:bg-sky-500 text-white rounded-full shadow-md active:scale-90 transition-all cursor-pointer border border-slate-700 touch-manipulation"
          aria-label="Ruta Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}