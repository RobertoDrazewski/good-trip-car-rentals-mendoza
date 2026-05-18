import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Fuel, Users, Briefcase, Gauge, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// 🔌 CAPTURA DINÁMICA DE LA API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CarCarousel() {
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAutos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard`); 
        const disponibles = res.data.autos.filter(a => a.estado === 'Disponible');
        setAutos(disponibles);
      } catch (err) {
        console.error("Error cargando flota:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAutos();
  }, []);

  const prevSlide = () => {
    if (autos.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? autos.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    if (autos.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === autos.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-sky-500" size={32} />
    </div>
  );

  if (autos.length === 0) return (
    <div className="text-center py-8 text-slate-400 font-medium italic text-sm">
      No hay vehículos disponibles en este momento.
    </div>
  );

  const auto = autos[currentIndex];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      
      {/* 🛠️ CONVIVENCIA BI-COLUMNA EN PC: Flex en móvil, Grid 2 columnas en Desktop para aplastar el scroll */}
      <div className="w-full bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden flex flex-col md:grid md:grid-cols-12 relative animate-in fade-in duration-300">
        
        {/* BADGE DE VALORACIÓN COMPACTO */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-sky-600 border border-sky-100 text-[8px] sm:text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
            <Star size={9} fill="currentColor" stroke="none" /> 5.0 Google
          </span>
        </div>

        {/* COLUMNA IZQUIERDA: CONTENEDOR DE IMAGEN (Ocupa 5/12 del ancho en PC) */}
        <div className="h-48 sm:h-64 md:h-full md:col-span-5 bg-slate-100/60 relative flex items-center justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r border-slate-100">
          <img 
            src={auto.imagen_url ? `${API_BASE_URL}${auto.imagen_url}` : '/uploads/autos/default-car.jpg'} 
            alt={auto.modelo}
            className="max-w-full max-h-[140px] sm:max-h-[200px] md:max-h-[260px] object-contain transition-transform duration-700 drop-shadow-sm group-hover:scale-105"
          />
        </div>

        {/* COLUMNA DERECHA: CUERPO DE DETALLES Y DATOS TÉCNICOS (Ocupa 7/12 del ancho en PC) */}
        <div className="p-4 sm:p-6 md:p-8 md:col-span-7 flex flex-col justify-between text-left bg-white">
          
          {/* Fila superior: Título, Atributos y Precio */}
          <div>
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none truncate mb-1.5">
                  {auto.modelo}
                </h3>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-slate-800 text-white text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                    {auto.transmision}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-slate-200/50">
                    {auto.color || 'Gris Plata'}
                  </span>
                </div>
              </div>
              
              {/* Bloque Precio sutil */}
              <div className="text-right flex-shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Por Día</p>
                <p className="text-lg sm:text-2xl font-black text-slate-800 leading-none">
                  <span className="text-[10px] font-bold text-slate-400 mr-0.5">$</span>{auto.precio_base_usd}
                </p>
              </div>
            </div>

            {/* Descripción Estilo Editorial Compacta */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4 font-medium italic border-l-2 border-sky-500 pl-3 py-0.5">
              {auto.descripcion_larga || "Un vehículo seleccionado por nuestra familia para garantizar tu confort en las rutas mendocinas."}
            </p>
          </div>

          {/* GRILLA TÉCNICA REESCALADA Y LIMPIA */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                <Users size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider">Pasajeros</p>
                <p className="text-[10px] font-black text-slate-800 uppercase">5 Adultos</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                <Briefcase size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider">Equipaje</p>
                <p className="text-[10px] font-black text-slate-800 uppercase">2 Grandes</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                <Fuel size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider">Motor</p>
                <p className="text-[10px] font-black text-slate-800 uppercase">Eficiente</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                <Gauge size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider">Clima</p>
                <p className="text-[10px] font-black text-slate-800 uppercase">Full A/C</p>
              </div>
            </div>
          </div>

          {/* Botón de Acción integrado que scrollea suave hacia arriba */}
          <button 
            onClick={() => window.scrollTo({ top: 150, behavior: 'smooth' })}
            className="mt-4 w-full py-2.5 bg-slate-800 text-white rounded-xl font-black uppercase tracking-wider text-[9px] flex items-center justify-center gap-2 hover:bg-sky-500 hover:text-white transition-all duration-300 group/btn cursor-pointer shadow-sm"
          >
            Seleccionar este vehículo
            <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* CONTROLES DE DIRECCIÓN COMPACTADOS */}
      <div className="flex items-center justify-center gap-4 mt-4 w-full">
        <button
          onClick={prevSlide}
          className="p-2 bg-slate-800 hover:bg-sky-500 text-white rounded-full shadow-md active:scale-90 transition-all cursor-pointer border border-slate-700"
          aria-label="Vehículo Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 select-none">
          {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {autos.length}
        </span>

        <button
          onClick={nextSlide}
          className="p-2 bg-slate-800 hover:bg-sky-500 text-white rounded-full shadow-md active:scale-90 transition-all cursor-pointer border border-slate-700"
          aria-label="Vehículo Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}