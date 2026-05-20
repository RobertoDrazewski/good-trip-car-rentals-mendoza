import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigation, Loader2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      } catch (err) { console.error("Error al cargar rutas:", err); }
      finally { setLoading(false); }
    };
    fetchRutas();
  }, []);

  const handleNavigation = (url) => {
    if (url && url.startsWith('http')) window.open(url, '_blank', 'noopener,noreferrer');
    else alert(t('routes_error_map', 'GPS no disponible para esta ruta'));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#88BDF2]" size={32} /></div>;
  if (rutas.length === 0) return null;

  const r = rutas[currentIndex];

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 h-full">
      
      {/* TARJETA DE RUTA: Mismo estilo Glassmorphic unificado */}
      <div 
        onClick={() => handleNavigation(r.maps_url)}
        className="w-full h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl relative cursor-pointer group border border-white/10"
      >
        {/* IMAGEN DE FONDO A PANTALLA COMPLETA */}
        <img 
          src={r.imagen_url ? `${API_BASE_URL}${r.imagen_url}` : 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80'} 
          alt={r.titulo}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
        />

        {/* DEGRADADO PARA LEER EL TEXTO */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121319]/95 via-[#121319]/30 to-transparent" />
        
        {/* CONTENIDO FLOTANTE */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="flex items-center gap-2 text-[#88BDF2] mb-3">
            <MapPin size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Destino Mendoza</span>
          </div>
          
          <h4 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
            {r.titulo}
          </h4>

          <p className="max-w-2xl text-white/80 text-sm md:text-base leading-relaxed font-medium italic border-l-2 border-[#88BDF2] pl-6">
            {r.descripcion}
          </p>

          <div className="flex items-center gap-4 mt-8">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
               <Navigation size={14} className="text-[#88BDF2]" /> Iniciar Navegación
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLES DE NAVEGACIÓN AGRANDADOS */}
      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => i === 0 ? rutas.length - 1 : i - 1); }}
          className="p-4 bg-[#121319]/60 backdrop-blur-md hover:bg-[#88BDF2] text-white hover:text-[#121319] rounded-full transition-all border border-white/10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="flex gap-2">
            {rutas.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-10 bg-[#88BDF2]' : 'w-2 bg-white/20'}`} />
            ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => i === rutas.length - 1 ? 0 : i + 1); }}
          className="p-4 bg-[#121319]/60 backdrop-blur-md hover:bg-[#88BDF2] text-white hover:text-[#121319] rounded-full transition-all border border-white/10"
        >
          <ChevronRight size={28} />
        </button>
      </div>

    </div>
  );
}