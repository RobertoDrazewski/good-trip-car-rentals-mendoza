import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Baby, MapPin, Calendar, Car, Loader2, Clock, ChevronDown, ArrowRight, Star, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingForm({ onQuoteGenerated, setAiContext, setIsChatOpen }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [listaAutos, setListaAutos] = useState([]);
  const [showAutoList, setShowAutoList] = useState(false);

  const [formData, setFormData] = useState({
    desde: '',
    hora_inicio: '10:00',
    hasta: '',
    hora_fin: '10:00',
    entrega: 'ciudad', 
    devolucion: 'ciudad', 
    sillita: false,
    auto_id: '' 
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const fetchAutos = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/admin/dashboard'); 
        const flota = res.data.autos || [];
        setListaAutos(flota);
        if (flota.length > 0) {
          setFormData(prev => ({ ...prev, auto_id: flota[0].id.toString() }));
        }
      } catch (err) { console.error("Error cargando flota"); }
    };
    fetchAutos();
  }, []);

  const selectedAuto = useMemo(() => 
    listaAutos.find(a => a.id.toString() === formData.auto_id.toString()), 
    [listaAutos, formData.auto_id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Enviamos todo el formData (incluye horas para el cálculo de día y medio)
      const res = await axios.post('http://localhost:3001/api/prices/quote', formData);
      
      onQuoteGenerated({
        ...res.data,
        ...formData,
        auto_modelo: selectedAuto?.modelo || 'Vehículo Seleccionado',
        fecha_inicio: formData.desde,
        fecha_fin: formData.hasta
      });
      
      setTimeout(() => {
        document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      console.error("Error en cotización:", err);
    } finally {
      setLoading(false);
    }
  };

  const cardLabel = "text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2";
  const bigInput = "w-full bg-slate-50 p-6 rounded-[2rem] font-black text-slate-800 border-2 border-transparent focus:border-yellow-500 focus:bg-white outline-none transition-all shadow-inner";

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4">
      {/* Badge Flotante Superior */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3 border-2 border-yellow-500/20">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span className="text-xs font-black uppercase tracking-[0.3em] italic">Reserva tu Experiencia</span>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="bg-white/95 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative -mt-32 z-40"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* COLUMNA 1: SELECTOR VISUAL DE AUTOS */}
          <div className={`flex flex-col justify-between relative ${showAutoList ? 'z-[100]' : 'z-30'}`}>
            <div className="relative">
              <label className={cardLabel}><Car size={18} className="text-yellow-500" /> Tu Vehículo</label>
              
              <div 
                onClick={() => setShowAutoList(!showAutoList)}
                className={`${bigInput} cursor-pointer flex items-center gap-4 relative overflow-hidden h-[95px] border-2 ${showAutoList ? 'border-yellow-500 bg-white shadow-xl' : 'border-transparent'}`}
              >
                {selectedAuto ? (
                  <>
                    <div className="w-24 h-14 flex items-center justify-center bg-white rounded-2xl p-1 shadow-sm">
                      <img 
                        src={`http://localhost:3001${selectedAuto.imagen_url}`} 
                        alt={selectedAuto.modelo} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black uppercase italic leading-tight">{selectedAuto.modelo}</span>
                      <span className="text-[9px] text-yellow-600 font-bold uppercase tracking-tighter bg-yellow-50 px-2 py-0.5 rounded-md w-fit mt-1">
                         {selectedAuto.transmision}
                      </span>
                    </div>
                  </>
                ) : <span className="text-slate-400 uppercase italic font-bold">Seleccionar unidad...</span>}
                <ChevronDown className={`absolute right-6 transition-transform duration-300 ${showAutoList ? 'rotate-180 text-yellow-500' : 'text-slate-400'}`} size={24} />
              </div>

              {showAutoList && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowAutoList(false)}></div>
                  <div className="absolute top-[105%] left-0 w-full bg-white/98 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200 z-[110] max-h-[320px] overflow-y-auto p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 my-2 italic">Unidades en Mendoza</p>
                    {listaAutos.map(auto => (
                      <div 
                        key={auto.id}
                        onClick={() => {
                          setFormData({...formData, auto_id: auto.id.toString()});
                          setShowAutoList(false);
                        }}
                        className={`p-4 rounded-[1.8rem] flex items-center gap-4 cursor-pointer transition-all ${formData.auto_id === auto.id.toString() ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 bg-slate-50'}`}
                      >
                        <div className="w-16 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm">
                          <img src={`http://localhost:3001${auto.imagen_url}`} className="w-full h-full object-contain" alt="car" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-[11px] font-black uppercase italic ${formData.auto_id === auto.id.toString() ? 'text-yellow-500' : 'text-slate-900'}`}>{auto.modelo}</p>
                          <p className={`text-[9px] font-bold ${formData.auto_id === auto.id.toString() ? 'text-slate-400' : 'text-slate-500'}`}>
                             {auto.transmision} • <span className="text-blue-500">${auto.precio_base_usd} USD/día</span>
                          </p>
                        </div>
                        {formData.auto_id === auto.id.toString() && <Check size={18} className="text-yellow-500" strokeWidth={3} />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-8">
              <label className="group flex items-center justify-between bg-slate-50 hover:bg-yellow-50 p-6 rounded-[2.5rem] cursor-pointer border-2 border-transparent hover:border-yellow-200 transition-all shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl">
                    <Baby size={24} className="text-yellow-600" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[11px] font-black text-slate-800 uppercase italic leading-none">¿Viajas con niños?</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Agregar sillita de bebé</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-8 h-8 rounded-xl accent-slate-900 cursor-pointer" 
                  checked={formData.sillita} 
                  onChange={e => setFormData({...formData, sillita: e.target.checked})} 
                />
              </label>
            </div>
          </div>

          {/* COLUMNA 2: FECHAS Y HORARIOS (LÓGICA DE PRECISIÓN) */}
          <div className="space-y-8 bg-slate-50/50 p-8 rounded-[3.5rem] border border-slate-100 shadow-sm z-20">
            <div>
              <label className={cardLabel}><Clock size={18} className="text-yellow-500" /> Fecha y Hora de Retiro</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="date" min={today} required 
                  className={bigInput}
                  value={formData.desde}
                  onChange={e => setFormData({...formData, desde: e.target.value})} 
                />
                <input 
                  type="time" required
                  className={`${bigInput} text-center text-2xl font-black italic`}
                  value={formData.hora_inicio}
                  onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className={cardLabel}><Clock size={18} className="text-red-500" /> Fecha y Hora de Devolución</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="date" min={formData.desde || today} required 
                  className={bigInput}
                  value={formData.hasta}
                  onChange={e => setFormData({...formData, hasta: e.target.value})} 
                />
                <input 
                  type="time" required
                  className={`${bigInput} text-center text-2xl font-black italic`}
                  value={formData.hora_fin}
                  onChange={e => setFormData({...formData, hora_fin: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* COLUMNA 3: LUGARES Y BOTÓN */}
          <div className="flex flex-col justify-between z-10">
            <div className="space-y-8">
              <div>
                <label className={cardLabel}><MapPin size={18} className="text-yellow-500" /> Punto de Entrega</label>
                <div className="relative">
                  <select 
                    className={`${bigInput} appearance-none cursor-pointer text-sm uppercase italic`}
                    value={formData.entrega} 
                    onChange={e => setFormData({...formData, entrega: e.target.value})}
                  >
                    <option value="ciudad">Mendoza Ciudad / Hotel</option>
                    <option value="aeropuerto">Aeropuerto (MDZ)</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div>
                <label className={cardLabel}><MapPin size={18} className="text-slate-400" /> Punto de Devolución</label>
                <div className="relative">
                  <select 
                    className={`${bigInput} appearance-none cursor-pointer text-sm uppercase italic`}
                    value={formData.devolucion} 
                    onChange={e => setFormData({...formData, devolucion: e.target.value})}
                  >
                    <option value="ciudad">Mendoza Ciudad / Hotel</option>
                    <option value="aeropuerto">Aeropuerto (MDZ)</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="mt-8 w-full bg-yellow-500 hover:bg-slate-900 text-slate-950 hover:text-white font-black py-8 rounded-[2.5rem] transition-all shadow-2xl shadow-yellow-500/30 flex items-center justify-center gap-4 group active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                <>
                  <span className="tracking-[0.2em] uppercase text-[13px] italic font-black">Cotizar Reserva</span>
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}