import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Wind, Loader2, Droplets, Calendar } from 'lucide-react';
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
    <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 md:py-10">
      {/* Contenedor Principal */}
      {/* 📱 RESPONSIVE: Ajustado el padding interno (p-5 sm:p-12 md:p-16) y bordes redondeados ergonómicos en móviles */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl text-white p-5 sm:p-12 md:p-16 rounded-[2rem] md:rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden w-full">
        
        {/* Efectos de Iluminación Ambiental */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full">
          {/* SECCIÓN SUPERIOR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-10 mb-10 md:mb-16 w-full">
            <div className="space-y-3 md:space-y-4 text-left w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5">
                <MapPin size={14} className="text-yellow-500 animate-pulse" />
                <span className="font-black uppercase text-[9px] tracking-[0.25em] text-yellow-500">Mendoza, AR</span>
              </div>
              
              {/* 📱 RESPONSIVE: text-3xl en móvil para evitar que se pisen los textos traducidos */}
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] sm:leading-none italic break-words">
                {t('weather_title')} <br/>
                <span className="text-white/20">{t('weather_subtitle')}</span>
              </h3>

              {/* Fuente del Servicio Meteorológico */}
              <div className="flex items-center gap-2 opacity-60 pt-0.5">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </div>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate max-w-[280px] sm:max-w-none">
                  {t('weather_source', 'Fuente: Servicio Meteorológico Internacional | Live 24/7')}
                </p>
              </div>
            </div>

            {/* CLIMA ACTUAL (Tarjeta Glassmorphism Inteligente) */}
            {/* 📱 RESPONSIVE: Adaptados paddings (p-4 sm:p-8) y bordes redondos más estéticos en teléfonos */}
            <div className="w-full lg:w-auto bg-white/5 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-between lg:justify-start gap-4 sm:gap-8 border border-white/10 shadow-inner">
              <img src={data.current.condition.icon} alt="icon" className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 drop-shadow-2xl flex-shrink-0" />
              <div className="text-left">
                <div className="flex items-start">
                  {/* 📱 RESPONSIVE: Escala de grados adaptable (text-5xl sm:text-6xl md:text-8xl) */}
                  <p className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none">{Math.round(data.current.temp_c)}</p>
                  <span className="text-xl sm:text-2xl font-black text-yellow-500 mt-1 sm:mt-2">°C</span>
                </div>
                <p className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1 sm:mt-2 line-clamp-1">{data.current.condition.text}</p>
              </div>
            </div>
          </div>

          {/* GRID PRONÓSTICO: DESLIZABLE NATIVO PREMIUM */}
          {/* 📱 TRUCO MAESTRO: En celular habilita el scroll de arrastre horizontal fluida con snap alignment 
             y oculta la barra de scroll nativa tosca para una estética de app móvil */}
          <div className="flex overflow-x-auto pb-4 gap-3 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-7 md:gap-4 md:pb-0">
            {data.forecast.forecastday.map((day, idx) => (
              <div 
                key={idx} 
                /* 📱 RESPONSIVE: w-[30vw] min-w-[115px] le da la proporción justa en cualquier smartphone */
                className={`min-w-[115px] w-[30vw] md:w-auto md:min-w-0 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] text-center border transition-all duration-500 snap-center flex-shrink-0 ${
                  idx === 0 
                  ? 'bg-yellow-500 border-yellow-400 text-slate-950 shadow-xl shadow-yellow-500/10' 
                  : 'bg-white/5 border-white/5'
                }`}
              >
                <p className={`text-[9px] sm:text-[10px] font-black uppercase mb-3 sm:mb-4 tracking-widest ${idx === 0 ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                  {idx === 0 ? t('weather_today', 'Hoy') : new Date(day.date + "T00:00:00").toLocaleDateString(i18n.language, { weekday: 'short' })}
                </p>
                <img src={day.day.condition.icon} alt="icon" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" />
                <p className="text-xl sm:text-2xl font-black italic">{Math.round(day.day.maxtemp_c)}°</p>
                <p className={`text-[8px] sm:text-[9px] font-black uppercase opacity-60 ${idx === 0 ? 'text-slate-900' : 'text-blue-400'}`}>
                   Min {Math.round(day.day.mintemp_c)}°
                </p>
              </div>
            ))}
          </div>

          {/* FOOTER: Recomendación Turística */}
          {/* 📱 RESPONSIVE: Organiza las métricas y la barra de recomendación en hileras limpias */}
          <div className="mt-8 md:mt-12 pt-6 sm:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 w-full">
            <div className="flex gap-8 justify-around w-full md:w-auto">
              <div className="flex items-center gap-2.5">
                <Wind size={16} className="text-yellow-500 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">{data.current.wind_kph} km/h</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Droplets size={16} className="text-yellow-500 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">{data.current.humidity}% Hum</span>
              </div>
            </div>

            <div className="bg-white/5 px-4 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center gap-3 border border-white/5 w-full md:w-auto justify-center md:justify-start">
              <Calendar size={14} className="text-yellow-500 flex-shrink-0" />
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 italic text-center md:text-left leading-tight">
                {t('weather_planning_text', 'Planificá tus rutas turísticas con datos en tiempo real.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}