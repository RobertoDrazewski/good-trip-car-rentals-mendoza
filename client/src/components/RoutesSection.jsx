import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigation, Loader2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🔌 CAPTURA DINÁMICA DE LA API (Detecta Render en la nube, o usa localhost de respaldo)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RoutesSection() {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    /* 📱 RESPONSIVE: Ajustado padding vertical (py-12 md:py-24) y márgenes de pantalla (px-4) */
    <section className="py-12 md:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 w-full overflow-hidden">
      
      {/* Cabecera Editorial */}
      <div className="mb-12 md:mb-20 text-center max-w-4xl mx-auto">
        <p className="text-yellow-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 italic">
          {t('routes_tag', 'Experiencias de Conducción')}
        </p>
        {/* 📱 RESPONSIVE: text-4xl en móvil para que entren los títulos largos traducidos */}
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-slate-900 uppercase leading-[0.9] sm:leading-[0.85] mb-6">
          {t('routes_title', 'Rutas')} <br />
          <span className="text-yellow-500">{t('routes_subtitle', 'Mendocinas')}</span>
        </h2>
      </div>

      {/* Grid: 2 columnas en Desktop, 1 en Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 w-full">
        {rutas.map((r, i) => (
          <div 
            key={i} 
            onClick={() => handleNavigation(r.maps_url)}
            /* 📱 RESPONSIVE: h-[380px] en celulares para que quepa bien en pantalla y rounded-[2.5rem] */
            className="group relative h-[380px] sm:h-[500px] md:h-[700px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-xl md:shadow-2xl cursor-pointer transition-all duration-700 hover:-translate-y-2 w-full"
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
            {/* 📱 RESPONSIVE: Ubicación y tamaño adaptados para dedos en móviles (top-4 right-4 vs top-10) */}
            <div className="absolute top-4 right-4 sm:top-10 sm:right-10 z-20">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3.5 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] text-white group-hover:bg-yellow-500 group-hover:text-slate-950 group-hover:border-yellow-500 transition-all duration-500 shadow-xl">
                <Navigation size={20} fill="currentColor" className="sm:w-[28px] sm:h-[28px] group-hover:fill-slate-900" />
              </div>
            </div>

            {/* Contenido Visual al pie */}
            {/* 📱 RESPONSIVE: Posicionamiento ergonómico inferior (bottom-6 left-6 vs bottom-12) */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-10 sm:right-10 md:left-16 md:right-16 z-10">
              <div className="flex items-center gap-2 text-yellow-500 mb-2 sm:mb-4">
                <MapPin size={14} fill="currentColor" />
                <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Mendoza, AR</span>
              </div>
              
              {/* 📱 RESPONSIVE: text-3xl a text-4xl en móviles para evitar cortes bruscos de texto */}
              <h4 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 sm:mb-6 break-words">
                {r.titulo}
              </h4>

              {/* DESCRIPCIÓN REINTEGRADA CON FIJACIÓN MÓVIL */}
              {/* 🛠️ REPARADO: En celulares (max-md:) forzamos translate-y-0 y opacity-100 fijas para que se lea. 
                 En computadoras (md:) mantiene tu animación hover original. Agregado line-clamp para no desbordar. */}
              <p className="text-white/80 text-xs sm:text-base md:text-xl leading-relaxed font-medium italic border-l-4 border-yellow-500 pl-4 sm:pl-6 mb-4 sm:mb-8 max-w-2xl transform max-md:translate-y-0 max-md:opacity-100 max-md:line-clamp-3 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700">
                {r.descripcion}
              </p>
              
              {/* Barra de interactividad */}
              <div className="h-1 bg-white/20 rounded-full overflow-hidden w-16 sm:w-24 group-hover:w-full transition-all duration-1000">
                <div className="h-full bg-yellow-500 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}