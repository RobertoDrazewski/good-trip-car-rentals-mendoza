import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigation, Loader2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RoutesSection() {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/routes/all');
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
    <section className="py-24 max-w-[1440px] mx-auto px-6">
      {/* Cabecera Editorial */}
      <div className="mb-20 text-center max-w-4xl mx-auto">
        <p className="text-yellow-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4 italic">
          {t('routes_tag', 'Experiencias de Conducción')}
        </p>
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-slate-900 uppercase leading-[0.85] mb-6">
          {t('routes_title', 'Rutas')} <br />
          <span className="text-yellow-500">{t('routes_subtitle', 'Mendocinas')}</span>
        </h2>
      </div>

      {/* Grid: 2 columnas en Desktop, 1 en Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {rutas.map((r, i) => (
          <div 
            key={i} 
            onClick={() => handleNavigation(r.maps_url)}
            className="group relative h-[550px] md:h-[700px] rounded-[4rem] overflow-hidden shadow-2xl cursor-pointer transition-all duration-700 hover:-translate-y-2"
          >
            {/* Imagen de fondo */}
            <img 
              src={r.imagen_url ? `http://localhost:3001${r.imagen_url}` : 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80'} 
              alt={r.titulo}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Overlay de degradado (más oscuro abajo para legibilidad de la descripción) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
            
            {/* Icono GPS */}
            <div className="absolute top-10 right-10 z-20">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[2rem] text-white group-hover:bg-yellow-500 group-hover:text-slate-950 group-hover:border-yellow-500 transition-all duration-500 shadow-2xl">
                <Navigation size={28} fill="currentColor" className="group-hover:fill-slate-900" />
              </div>
            </div>

            {/* Contenido Visual al pie */}
            <div className="absolute bottom-12 left-10 right-10 md:left-16 md:right-16 z-10">
              <div className="flex items-center gap-3 text-yellow-500 mb-4">
                <MapPin size={20} fill="currentColor" />
                <span className="text-[12px] font-black uppercase tracking-[0.3em]">Mendoza, AR</span>
              </div>
              
              <h4 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                {r.titulo}
              </h4>

              {/* DESCRIPCIÓN REINTEGRADA */}
              <p className="text-white/80 text-lg md:text-xl leading-relaxed font-medium italic border-l-4 border-yellow-500 pl-6 mb-8 max-w-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                {r.descripcion}
              </p>
              
              {/* Barra de interactividad */}
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden w-24 group-hover:w-full transition-all duration-1000">
                <div className="h-full bg-yellow-500 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}