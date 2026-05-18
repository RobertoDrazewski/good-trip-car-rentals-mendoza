import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Fuel, Users, Briefcase, Gauge, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// 🔌 CAPTURA DINÁMICA DE LA API (Detecta Render en la nube, o usa localhost de respaldo)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CarCarousel() {
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 NUEVO ESTADO: Rastrea el índice del vehículo visible actual
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

  // 🎯 FUNCIONES DE NAVEGACIÓN (Cíclicas e Infinitas)
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
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-yellow-500" size={40} />
    </div>
  );

  // Control de resguardo por si no se encuentran unidades en la base de datos
  if (autos.length === 0) return (
    <div className="text-center py-12 text-slate-400 font-medium italic">
      No hay vehículos disponibles en este momento.
    </div>
  );

  // Capturamos la unidad correspondiente al índice actual de renderizado
  const auto = autos[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* CONTENEDOR PRINCIPAL DE LA TARJETA ÚNICA ACTIVA */}
      <div 
        /* Transición suave al alternar tarjetas */
        className="w-full bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col relative animate-in fade-in duration-500"
      >
        {/* BADGE DE VALORACIÓN */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
          <span className="bg-yellow-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-3 py-1.5 sm:px-4 sm:py-2 rounded-full tracking-[0.12em] sm:tracking-[0.15em] flex items-center gap-1.5 sm:gap-2 shadow-lg">
            <Star size={11} fill="currentColor" /> 5.0 Google Reviews
          </span>
        </div>

        {/* CONTENEDOR DE IMAGEN */}
        <div className="h-64 sm:h-96 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 sm:p-12">
          <img 
            src={auto.imagen_url ? `${API_BASE_URL}${auto.imagen_url}` : '/uploads/autos/default-car.jpg'} 
            alt={auto.modelo}
            className="max-w-full max-h-full object-contain transition-transform duration-700 drop-shadow-2xl"
          />
          
          <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-10 opacity-30">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              Mendoza • 2026
            </p>
          </div>
        </div>

        {/* CUERPO DE LA TARJETA */}
        <div className="p-6 sm:p-10 md:p-14 flex-1 flex flex-col">
          
          {/* Título y Precio Adaptables */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="flex-1 w-full">
              <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-3 sm:mb-4 break-words">
                {auto.modelo}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-900 text-white text-[8px] sm:text-[9px] font-black uppercase px-3 py-1 sm:px-4 sm:py-1.5 rounded-full tracking-widest">
                  {auto.transmision}
                </span>
                <span className="bg-slate-100 text-slate-500 text-[8px] sm:text-[9px] font-black uppercase px-3 py-1 sm:px-4 sm:py-1.5 rounded-full tracking-widest border border-slate-200/50">
                  {auto.color || 'Gris Plata'}
                </span>
              </div>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 sm:border-none">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest sm:mb-1">Por Día</p>
              <p className="text-3xl sm:text-5xl font-black text-slate-900 leading-none">
                <span className="text-xs sm:text-sm font-light text-slate-400 mr-0.5">$</span>{auto.precio_base_usd}
              </p>
            </div>
          </div>

          {/* Descripción Estilo Editorial */}
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10 font-medium italic border-l-4 border-yellow-500 pl-4 sm:pl-6 py-1">
            {auto.descripcion_larga || "Un vehículo seleccionado por nuestra familia para garantizar tu confort en las rutas mendocinas."}
          </p>

          {/* GRILLA TÉCNICA */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-y-10 pt-8 sm:pt-10 border-t border-slate-100">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="p-2.5 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-900">
                <Users size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">Pasajeros</p>
                <p className="text-[11px] sm:text-xs font-black text-slate-900 uppercase">5 Adultos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="p-2.5 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-900">
                <Briefcase size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">Equipaje</p>
                <p className="text-[11px] sm:text-xs font-black text-slate-900 uppercase">2 Grandes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="p-2.5 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-900">
                <Fuel size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">Motor</p>
                <p className="text-[11px] sm:text-xs font-black text-slate-900 uppercase">Eficiente</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="p-2.5 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-900">
                <Gauge size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest">Clima</p>
                <p className="text-[11px] sm:text-xs font-black text-slate-900 uppercase">Full A/C</p>
              </div>
            </div>
          </div>

          {/* Botón de Acción Principal */}
          <button 
            onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 sm:mt-12 w-full py-4 sm:py-5 bg-slate-950 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-widest text-[10px] sm:text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-500 hover:text-slate-950 transition-all duration-300 group/btn cursor-pointer"
          >
            Seleccionar este vehículo
            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 🎯 CONTROLES DEL CARRUSEL ERGONÓMICOS PARA CELULARES */}
      <div className="flex items-center justify-center gap-6 mt-8 w-full">
        <button
          onClick={prevSlide}
          className="p-4 bg-slate-900 hover:bg-yellow-500 text-white hover:text-slate-950 rounded-full shadow-xl active:scale-90 transition-all cursor-pointer border border-white/10"
          aria-label="Vehículo Anterior"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Indicador de posición (Ej: 1 / 4) */}
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-4 py-2 rounded-full border border-slate-200/60 select-none">
          {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {autos.length}
        </span>

        <button
          onClick={nextSlide}
          className="p-4 bg-slate-900 hover:bg-yellow-500 text-white hover:text-slate-950 rounded-full shadow-xl active:scale-90 transition-all cursor-pointer border border-white/10"
          aria-label="Vehículo Siguiente"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
}