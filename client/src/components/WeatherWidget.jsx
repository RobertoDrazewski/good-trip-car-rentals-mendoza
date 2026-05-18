import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Wind, Loader2, Droplets, Calendar, Sunrise, Sunset, Clock, CloudRain } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WeatherWidget() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localTime, setLocalTime] = useState(new Date());

  const API_KEY = '6dc99f87e40b4e919c324409261405'; 
  const CITY = 'Mendoza';

  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const getSouthernSeason = () => {
    const now = new Date();
    const month = now.getMonth() + 1; 
    const day = now.getDate();

    if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 21)) {
      return `${t('season_summer', 'Verano')} ☀️`;
    } else if ((month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day < 21)) {
      return `${t('season_autumn', 'Otoño')} 🍁`;
    } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 21)) {
      return `${t('season_winter', 'Invierno')} ❄️`;
    } else {
      return `${t('season_spring', 'Primavera')} 🌸`;
    }
  };

  const getWeatherStyle = () => {
    if (!data) return {};
    const code = data.current.condition.code;
    const isDay = data.current.is_day === 1;

    const soleado = [1000];
    const nublado = [1003, 1006, 1009, 1030, 1135, 1147];
    const lluvioso = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1087, 1273, 1276];
    const nieve = [1066, 1069, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282];

    if (!isDay) {
      if (lluvioso.includes(code)) {
        return {
          bg: "bg-gradient-to-b from-slate-950 via-neutral-950 to-slate-900",
          text: "text-white", subtitle: "text-white/30",
          badge: "bg-cyan-950/40 text-cyan-400 border-cyan-500/20",
          ambientTop: "bg-blue-900/10", ambientBottom: "bg-slate-900/20",
          textInverted: "text-white", sourceText: "text-slate-500"
        };
      }
      return {
        bg: "bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950",
        text: "text-white", subtitle: "text-white/30",
        badge: "bg-white/5 text-slate-300 border-white/10",
        ambientTop: "bg-indigo-500/5", ambientBottom: "bg-purple-950/10",
        textInverted: "text-white", sourceText: "text-slate-400"
      };
    }

    if (soleado.includes(code)) {
      return {
        bg: "bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600",
        text: "text-white", subtitle: "text-white/40",
        badge: "bg-white/20 text-white border-white/20",
        ambientTop: "bg-yellow-300/30", ambientBottom: "bg-amber-400/20",
        textInverted: "text-white", sourceText: "text-slate-100"
      };
    } else if (nublado.includes(code)) {
      return {
        bg: "bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600",
        text: "text-white", subtitle: "text-white/25",
        badge: "bg-white/10 text-white border-white/10",
        ambientTop: "bg-slate-300/20", ambientBottom: "bg-zinc-400/20",
        textInverted: "text-white", sourceText: "text-slate-200"
      };
    } else if (lluvioso.includes(code)) {
      return {
        bg: "bg-gradient-to-b from-slate-700 via-indigo-900 to-slate-800",
        text: "text-white", subtitle: "text-white/20",
        badge: "bg-white/5 text-white border-white/10",
        ambientTop: "bg-cyan-500/20", ambientBottom: "bg-blue-600/10",
        textInverted: "text-white", sourceText: "text-slate-400"
      };
    } else if (nieve.includes(code)) {
      return {
        bg: "bg-gradient-to-b from-blue-50 via-slate-200 to-blue-100",
        text: "text-slate-900", subtitle: "text-slate-900/30",
        badge: "bg-slate-900/10 text-slate-900 border-slate-900/10",
        ambientTop: "bg-white/60", ambientBottom: "bg-blue-400/20",
        textInverted: "text-slate-800", sourceText: "text-slate-600"
      };
    }

    return {
      bg: "bg-gradient-to-b from-slate-900 via-slate-950 to-black",
      text: "text-white", subtitle: "text-white/20",
      badge: "bg-white/5 text-white border-white/10",
      ambientTop: "bg-blue-500/10", ambientBottom: "bg-yellow-500/5",
      textInverted: "text-white", sourceText: "text-slate-400"
    };
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-sky-500" size={32} />
    </div>
  );

  if (!data) return null;

  const style = getWeatherStyle();
  const hoyForecast = data.forecast.forecastday[0];

  return (
    /**
     * 🛠专 AJUSTADO: Eliminados paddings externos e h-s para embutirse de forma premium
     * dentro de la solapa dinámica sin romper el scroll del sitio.
     */
    <div className={`relative ${style.bg} ${style.text} p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-md border border-white/10 overflow-hidden w-full transition-all duration-1000 text-slate-800 animate-in fade-in duration-300`}>
      
      {/* Capas Ambientales */}
      <div className={`absolute -top-24 -right-24 w-60 h-60 ${style.ambientTop} blur-[80px] rounded-full pointer-events-none transition-all duration-1000`} />
      <div className={`absolute -bottom-24 -left-24 w-60 h-60 ${style.ambientBottom} blur-[80px] rounded-full pointer-events-none transition-all duration-1000`} />

      <div className="relative z-10 w-full flex flex-col gap-4">
        
        {/* SECCIÓN SUPERIOR COMPACTADA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full border-b border-white/10 pb-3">
          <div className="space-y-1.5 text-left w-full sm:w-auto">
            
            <div className="flex flex-wrap gap-1.5 items-center">
              <div className={`flex items-center gap-1 ${style.badge} px-2.5 py-1 rounded-xl border`}>
                <MapPin size={11} className="text-yellow-500 animate-pulse" />
                <span className="font-black uppercase text-[8px] tracking-wider">Mendoza, AR</span>
              </div>
              
              <div className={`flex items-center gap-1.5 ${style.badge} px-2.5 py-1 rounded-xl border font-mono font-bold text-[8px]`}>
                <Clock size={10} className="text-yellow-500" />
                <span>{localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="opacity-40">•</span>
                <span>{getSouthernSeason()}</span>
              </div>
            </div>
            
            {/* Título Reducido sutilmente */}
            <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-tight italic">
              {t('weather_title', 'Pronóstico')} <span className={style.subtitle}>{t('weather_subtitle', 'En Vivo')}</span>
            </h3>
          </div>

          {/* CLIMA ACTUAL COMPACTO */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 border border-white/20 shadow-sm max-sm:w-full max-sm:justify-between">
            <img src={data.current.condition.icon} alt="icon" className="w-12 h-12 md:w-14 md:h-14 drop-shadow-md flex-shrink-0" />
            <div className="text-left">
              <div className="flex items-start">
                <p className="text-2xl md:text-3xl font-black tracking-tighter leading-none">{Math.round(data.current.temp_c)}</p>
                <span className="text-[10px] font-black text-yellow-500 mt-0.5">°C</span>
              </div>
              <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mt-0.5">{data.current.condition.text}</p>
            </div>
          </div>
        </div>

        {/* PANEL DE DATOS AVANZADOS COMPACTADOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full text-left">
          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
            <Sunrise className="text-yellow-500 flex-shrink-0" size={16} />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider opacity-40">{t('weather_sunrise', 'Salida')}</p>
              <p className="text-xs font-black italic">{hoyForecast.astro.sunrise}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
            <Sunset className="text-orange-500 flex-shrink-0" size={16} />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider opacity-40">{t('weather_sunset', 'Puesta')}</p>
              <p className="text-xs font-black italic">{hoyForecast.astro.sunset}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
            <CloudRain className="text-cyan-400 flex-shrink-0" size={16} />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider opacity-40">{t('weather_rain_chance', 'Prob. Lluvia')}</p>
              <p className="text-xs font-black italic">{hoyForecast.day.daily_chance_of_rain}%</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
            <Wind className="text-teal-400 flex-shrink-0" size={16} />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider opacity-40">{t('weather_wind_speed', 'Viento')}</p>
              <p className="text-xs font-black italic">{data.current.wind_kph} km/h</p>
            </div>
          </div>
        </div>

        {/* GRID PRONÓSTICO 7 DÍAS ULTRA COMPACTO */}
        <div className="flex overflow-x-auto pb-2 gap-2 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-7 md:pb-0 w-full">
          {data.forecast.forecastday.map((day, idx) => (
            <div 
              key={idx} 
              className={`min-w-[85px] md:min-w-0 p-2.5 rounded-xl text-center border transition-all duration-300 snap-center flex-shrink-0 flex-1 ${
                idx === 0 
                ? 'bg-yellow-500 border-yellow-400 text-slate-950 shadow-sm' 
                : 'bg-white/5 border-white/5 text-inherit'
              }`}
            >
              <p className={`text-[8px] font-black uppercase mb-1 tracking-wider ${idx === 0 ? 'text-slate-900 font-black' : 'opacity-60'}`}>
                {idx === 0 ? t('weather_today', 'Hoy') : new Date(day.date + "T00:00:00").toLocaleDateString(i18n.language, { weekday: 'short' })}
              </p>
              <img src={day.day.condition.icon} alt="icon" className="w-7 h-7 mx-auto mb-1" />
              <p className="text-sm font-black italic">{Math.round(day.day.maxtemp_c)}°</p>
              <p className={`text-[7px] font-black uppercase ${idx === 0 ? 'text-slate-900 opacity-50' : 'text-sky-300'}`}>
                 Min {Math.round(day.day.mintemp_c)}°
              </p>
            </div>
          ))}
        </div>

        {/* RECOMENDACIÓN FINAL INTEGRADISIMA */}
        <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 w-full text-[9px]">
          <div className="flex items-center gap-1.5 opacity-80 max-sm:w-full max-sm:justify-center">
            <Droplets size={12} className="text-yellow-500" />
            <span className="font-black uppercase tracking-wider">{t('weather_humidity', 'Humedad')}: {data.current.humidity}%</span>
          </div>
          
          <div className="bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5 w-full sm:w-auto justify-center backdrop-blur-sm">
            <Calendar size={11} className="text-yellow-500 flex-shrink-0" />
            <p className={`font-bold italic text-center leading-tight ${style.textInverted}`}>
              {t('weather_planning_text', 'Planificá tus rutas turísticas con datos en tiempo real.')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}