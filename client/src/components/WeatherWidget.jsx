import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Wind, Loader2, Thermometer, Droplets, Info, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WeatherWidget() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = '6dc99f87e40b4e919c324409261405'; 
  const CITY = 'Mendoza';

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${CITY}&days=7&aqi=no&lang=${i18n.language}`
        );
        setData(res.data);
      } catch (err) {
        console.warn("API Clima: Error de comunicación.");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [i18n.language]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-yellow-500" size={40} />
    </div>
  );

  if (!data) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-10">
      {/* Contenedor Principal: Slate 900 con transparencia para suavizar el fondo */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl text-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Efectos de Iluminación Ambiental */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-yellow-500/5 blur-[100px] rounded-full" />

        <div className="relative z-10">
          {/* SECCIÓN SUPERIOR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                <MapPin size={16} className="text-yellow-500 animate-pulse" />
                <span className="font-black uppercase text-[10px] tracking-[0.3em] text-yellow-500">Mendoza, AR</span>
              </div>
              
              <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">
                {t('weather_title')} <br/>
                <span className="text-white/20">{t('weather_subtitle')}</span>
              </h3>

              {/* Fuente del Servicio Meteorológico */}
              <div className="flex items-center gap-2 opacity-60">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest">
                  {t('weather_source', 'Fuente: Servicio Meteorológico Internacional | Live 24/7')}
                </p>
              </div>
            </div>

            {/* CLIMA ACTUAL (Tarjeta Glassmorphism) */}
            <div className="w-full lg:w-auto bg-white/5 p-8 rounded-[2.5rem] flex items-center justify-between lg:justify-start gap-8 border border-white/10 shadow-inner">
              <img src={data.current.condition.icon} alt="icon" className="w-20 h-20 md:w-28 md:h-28 drop-shadow-2xl" />
              <div>
                <div className="flex items-start">
                  <p className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{Math.round(data.current.temp_c)}</p>
                  <span className="text-2xl font-black text-yellow-500 mt-2">°C</span>
                </div>
                <p className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em] mt-2">{data.current.condition.text}</p>
              </div>
            </div>
          </div>

          {/* GRID PRONÓSTICO: Adaptado para Mobile (Scroll horizontal en pantallas pequeñas) */}
          <div className="flex md:grid md:grid-cols-7 gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
            {data.forecast.forecastday.map((day, idx) => (
              <div 
                key={idx} 
                className={`min-w-[140px] md:min-w-0 p-6 rounded-[2.5rem] text-center border transition-all duration-500 ${
                  idx === 0 
                  ? 'bg-yellow-500 border-yellow-400 text-slate-950 shadow-xl shadow-yellow-500/20' 
                  : 'bg-white/5 border-white/5'
                }`}
              >
                <p className={`text-[10px] font-black uppercase mb-4 tracking-widest ${idx === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                  {idx === 0 ? t('weather_today') : new Date(day.date + "T00:00:00").toLocaleDateString(i18n.language, { weekday: 'short' })}
                </p>
                <img src={day.day.condition.icon} alt="icon" className="w-12 h-12 mx-auto mb-4" />
                <p className="text-2xl font-black italic">{Math.round(day.day.maxtemp_c)}°</p>
                <p className={`text-[9px] font-black uppercase opacity-60 ${idx === 0 ? 'text-slate-900' : 'text-blue-400'}`}>
                   Min {Math.round(day.day.mintemp_c)}°
                </p>
              </div>
            ))}
          </div>

          {/* FOOTER: Recomendación Turística */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <Wind size={18} className="text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{data.current.wind_kph} km/h</span>
              </div>
              <div className="flex items-center gap-3">
                <Droplets size={18} className="text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{data.current.humidity}% Hum</span>
              </div>
            </div>

            <div className="bg-white/5 px-6 py-4 rounded-2xl flex items-center gap-3 border border-white/5">
              <Calendar size={14} className="text-yellow-500" />
              <p className="text-[10px] font-bold text-slate-300 italic">
                {t('weather_planning_text', 'Planificá tus rutas turísticas con datos en tiempo real.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}