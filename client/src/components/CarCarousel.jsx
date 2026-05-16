import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Fuel, Users, Briefcase, Gauge, Star, ChevronRight } from 'lucide-react';

// 🔌 CAPTURA DINÁMICA DE LA API (Detecta Render en la nube, o usa localhost de respaldo)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CarCarousel() {
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutos = async () => {
      try {
        // 🌐 Corregido: Apunta a la API en la nube
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-yellow-500" size={40} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6 max-w-7xl mx-auto py-20">
      {autos.map((auto) => (
        <div 
          key={auto.id} 
          className="group bg-white rounded-[3.5rem] border border-slate-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 flex flex-col relative"
        >
          {/* BADGE DE VALORACIÓN - Refuerza la confianza familiar */}
          <div className="absolute top-8 left-8 z-10">
            <span className="bg-yellow-500 text-slate-950 text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-[0.15em] flex items-center gap-2 shadow-lg">
              <Star size={12} fill="currentColor" /> 5.0 Google Reviews
            </span>
          </div>

          {/* CONTENEDOR DE IMAGEN - Fondo suave para resaltar el vehículo */}
          <div className="h-96 bg-slate-50 relative overflow-hidden flex items-center justify-center p-12">
            {/* 🌐 Corregido: Ruta de la imagen adaptada para producción */}
            <img 
              src={auto.imagen_url ? `${API_BASE_URL}${auto.imagen_url}` : '/uploads/autos/default-car.jpg'} 
              alt={auto.modelo}
              className="max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-110 drop-shadow-2xl"
            />
            
            <div className="absolute bottom-6 right-10 opacity-40 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                Mendoza • 2026
              </p>
            </div>
          </div>

          {/* CUERPO DE LA TARJETA */}
          <div className="p-10 md:p-14 flex-1 flex flex-col">
            
            {/* Título y Precio */}
            <div className="flex justify-between items-start mb-10">
              <div className="flex-1">
                <h3 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-4">
                  {auto.modelo}
                </h3>
                <div className="flex gap-2">
                  <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest">
                    {auto.transmision}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest border border-slate-200/50">
                    {auto.color || 'Gris Plata'}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Por Día</p>
                <p className="text-5xl font-black text-slate-900 leading-none">
                  <span className="text-sm font-light text-slate-400 mr-1">$</span>{auto.precio_base_usd}
                </p>
              </div>
            </div>

            {/* Descripción Estilo "Editorial" */}
            <p className="text-slate-500 text-base leading-relaxed mb-10 font-medium italic border-l-4 border-yellow-500 pl-6 py-1">
              {auto.descripcion_larga || "Un vehículo seleccionado por nuestra familia para garantizar tu confort en las rutas mendocinas."}
            </p>

            {/* GRILLA TÉCNICA - Limpia y Iconográfica */}
            <div className="grid grid-cols-2 gap-y-10 pt-10 border-t border-slate-100">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-900 group-hover:bg-yellow-500/10 transition-colors">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pasajeros</p>
                  <p className="text-xs font-black text-slate-900 uppercase">5 Adultos</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-900 group-hover:bg-yellow-500/10 transition-colors">
                  <Briefcase size={22} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Equipaje</p>
                  <p className="text-xs font-black text-slate-900 uppercase">2 Grandes</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-900 group-hover:bg-yellow-500/10 transition-colors">
                  <Fuel size={22} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Motor</p>
                  <p className="text-xs font-black text-slate-900 uppercase">Eficiente</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-900 group-hover:bg-yellow-500/10 transition-colors">
                  <Gauge size={22} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Clima</p>
                  <p className="text-xs font-black text-slate-900 uppercase">Full A/C</p>
                </div>
              </div>
            </div>

            {/* Botón de Acción Sugerido */}
            <button 
              onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-12 w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-500 hover:text-slate-950 transition-all duration-300 group/btn"
            >
              Seleccionar este vehículo
              <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}