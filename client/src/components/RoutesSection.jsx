import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigation, Loader2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🔌 CAPTURA DINÁMICA DE LA API (Detecta Render en la nube, o usa localhost de respaldo)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RoutesSection() {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 NUEVO ESTADO: Rastrea el índice de la ruta activa en el carrusel
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

  // 🎯 FUNCIONES DE NAVEGACIÓN CÍCLICA
  const prevSlide = (e) => {
    e.stopPropagation(); // Previene que el clic active la navegación GPS de la tarjeta
    if (rutas.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? rutas.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = (e) => {
    e.stopPropagation(); // Previene que el clic active la navegación GPS de la tarjeta
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
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-yellow-500" size={40} />
    </div>
  );

  // Resguardo seguro por si el backend no retorna registros
  if (rutas.length === 0) return (
    <div className="text-center py-12 text-slate-400 font-medium italic">
      {t('routes_empty', 'Próximamente nuevas rutas...')}
    </div>
  );

  // Extraemos la ruta correspondiente al índice actual
  const r = rutas[currentIndex];

  return (
    <section className="py-12 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 w-full overflow-hidden flex flex-col items-center">
      
      {/* Cabecera Editorial */}
      <div className="mb-12 md:mb-16 text-center max-w-4xl mx-auto">
        <p className="text-yellow-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 italic">
          {t('routes_tag', 'Experiencias de Conducción')}
        </p>
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-slate-900 uppercase leading-[0.9] sm:leading-[0.85] mb-6">
          {t('routes_title', 'Rutas')} <br />
          <span className="text-yellow-500">{t('routes_subtitle', 'Mendocinas')}</span>
        </h2>
      </div>

      {/* CONTENEDOR DE TARJETA ÚNICA ACTIVA */}
      <div 
        onClick={() => handleNavigation(r.maps_url)}
        className="group relative h-[380px] sm:h-[500px] md:h-[650px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-xl md:shadow-2xl cursor-pointer transition-all duration-700 w-full animate-in fade-in duration-500"
      >
        {/* Imagen de fondo */}
        <img 
          src={r.imagen_url ? `${API_BASE_URL}${r.imagen_url}` : 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80'} 
          alt={r.titulo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        {/* Overlay de degradado profundo */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 md:via-slate-900/40 to-transparent opacity-90 md:opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
        
        {/* Icono GPS */}
        <div className="absolute top-4 right-4 sm:top-10 sm:right-10 z-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3.5 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] text-white group-hover:bg-yellow-500 group-hover:text-slate-950 group-hover:border-yellow-500 transition-all duration-500 shadow-xl">
            <Navigation size={20} fill="currentColor" className="sm:w-[28px] sm:h-[28px] group-hover:fill-slate-900" />
          </div>
        </div>

        {/* Contenido Visual al pie */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-10 sm:right-10 md:left-16 md:right-16 z-10">
          <div className="flex items-center gap-2 text-yellow-500 mb-2 sm:mb-4">
            <MapPin size={14} fill="currentColor" />
            <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Mendoza, AR</span>
          </div>
          
          <h4 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 sm:mb-6 break-words">
            {r.titulo}
          </h4>

          {/* DESCRIPCIÓN CON ADAPTACIÓN MÓVIL */}
          <p className="text-white/80 text-xs sm:text-base md:text-lg leading-relaxed font-medium italic border-l-4 border-yellow-500 pl-4 sm:pl-6 mb-4 sm:mb-8 max-w-2xl transform max-md:translate-y-0 max-md:opacity-100 max-md:line-clamp-3 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700">
            {r.descripcion}
          </p>
          
          {/* Barra de interactividad */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden w-16 sm:w-24 group-hover:w-full transition-all duration-1000">
            <div className="h-full bg-yellow-500 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>

      {/* 🎯 CONTROLES DEL CARRUSEL ERGONÓMICOS PARA CELULARES */}
      <div className="flex items-center justify-center gap-6 mt-8 w-full z-20">
        <button
          onClick={prevSlide}
          className="p-4 bg-slate-900 hover:bg-yellow-500 text-white hover:text-slate-950 rounded-full shadow-xl active:scale-90 transition-all cursor-pointer border border-white/10 touch-manipulation"
          aria-label="Ruta Anterior"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Indicador de posición (Ej: 1 / 3) */}
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-4 py-2 rounded-full border border-slate-200/60 select-none">
          {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {rutas.length}
        </span>

        <button
          onClick={nextSlide}
          className="p-4 bg-slate-900 hover:bg-yellow-500 text-white hover:text-slate-950 rounded-full shadow-xl active:scale-90 transition-all cursor-pointer border border-white/10 touch-manipulation"
          aria-label="Ruta Siguiente"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </section>
  );
}