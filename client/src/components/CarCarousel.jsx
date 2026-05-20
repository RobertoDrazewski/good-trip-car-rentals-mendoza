import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Fuel, Users, Briefcase, Gauge, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
      } catch (err) { console.error("Error cargando flota:", err); } 
      finally { setLoading(false); }
    };
    fetchAutos();
  }, []);

  const scrollToBooking = () => {
    const element = document.getElementById('reservas');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#88BDF2]" size={32} /></div>;
  if (autos.length === 0) return null;

  const auto = autos[currentIndex];

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500 h-full">
      
      {/* TARJETA UNIFICADA: Ajustada para ser robusta como el BookingForm */}
      <div className="w-full h-full p-8 rounded-[2.5rem] bg-[#121319]/60 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col justify-between">
        
        {/* IMAGEN MÁS GRANDE: Aumentamos altura de 56 a 64 y quitamos limitaciones de max-h */}
        <div className="relative w-full h-64 bg-gradient-to-b from-[#1E222F]/50 to-transparent rounded-[2rem] flex items-center justify-center mb-6 overflow-hidden">
          <div className="absolute w-64 h-64 bg-[#88BDF2]/10 rounded-full blur-3xl" />
          <img 
            src={auto.imagen_url ? `${API_BASE_URL}${auto.imagen_url}` : '/uploads/autos/default-car.jpg'} 
            alt={auto.modelo}
            className="relative z-10 w-[90%] h-[90%] object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* CONTENIDO INTEGRADO */}
        <div className="flex flex-col flex-grow justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic">{auto.modelo}</h3>
              <span className="flex items-center gap-1 text-[10px] font-black text-[#88BDF2] uppercase bg-[#88BDF2]/10 px-2 py-0.5 rounded-full">
                <Star size={10} fill="#88BDF2" /> 5.0
              </span>
            </div>

            <p className="text-[#A0AEC0] text-xs leading-relaxed font-semibold mb-6 italic border-l-2 border-[#88BDF2] pl-3">
              {auto.descripcion_larga || "Un vehículo premium seleccionado para garantizar tu confort y seguridad en las rutas mendocinas."}
            </p>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6">
              {[
                { icon: <Users size={18}/>, label: "Pasajeros", val: "5 Adultos" },
                { icon: <Briefcase size={18}/>, label: "Equipaje", val: "2 Grandes" },
                { icon: <Fuel size={18}/>, label: "Motor", val: "Eficiente" },
                { icon: <Gauge size={18}/>, label: "Clima", val: "Full A/C" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <div className="text-[#88BDF2] bg-white/5 p-2 rounded-lg">{item.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold text-[#6F7D93]">{item.label}</span>
                    <span className="text-[11px] font-black">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
             <p className="text-3xl font-black text-white italic">$ {auto.precio_base_usd} <span className="text-xs text-[#6F7D93] not-italic font-bold">/ día</span></p>
             <button 
                onClick={scrollToBooking}
                className="px-8 py-4 bg-[#88BDF2] text-[#121319] font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all shadow-lg"
             >
                Reservar
             </button>
          </div>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="flex items-center gap-6 mt-8">
        <button onClick={() => setCurrentIndex(i => i === 0 ? autos.length - 1 : i - 1)} className="p-4 bg-white/5 hover:bg-[#88BDF2] text-white hover:text-[#121319] rounded-full transition-all border border-white/10">
            <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
            {autos.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-10 bg-[#88BDF2]' : 'w-2 bg-white/20'}`} />
            ))}
        </div>
        <button onClick={() => setCurrentIndex(i => i === autos.length - 1 ? 0 : i + 1)} className="p-4 bg-white/5 hover:bg-[#88BDF2] text-white hover:text-[#121319] rounded-full transition-all border border-white/10">
            <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}