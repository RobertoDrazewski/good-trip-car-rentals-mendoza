import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';

// 🛠️ Importación relativa modular optimizada para Render
import logoMendozaRent from '../assets/logo.png'; 

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '#flota', label: t('nav_flota') },
    { href: '#requisitos', label: 'Requisitos' }, 
    { href: '#reservas', label: t('nav_reserva') },
    { href: '#rutas', label: t('nav_rutas') },
  ];

  return (
    /**
     * 🛠️ REPARADO: Alturas fijas optimizadas (h-16 en estático, h-14 en scroll para PC)
     * Reemplazado el fondo blanco por el gris azulado translúcido de Balanz en el scroll.
     */
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
      isScrolled 
        ? 'h-14 md:h-14 bg-[#1E222F]/90 backdrop-blur-lg shadow-2xl border-b border-slate-800/50' 
        : 'h-16 md:h-16 bg-gradient-to-b from-[#121319]/80 to-transparent'
    }`}>
      
      <div className="max-w-[1440px] h-full mx-auto px-4 md:px-12 flex justify-between items-center relative">
        
        {/* --- CONTENEDOR LOGO OPTIMIZADO (EVITA SOBREPOSICIÓN) --- */}
        <div className="flex-1 flex items-center">
          <a href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img 
              src={logoMendozaRent} 
              alt="Mendoza Rent Logo" 
              /**
               * 🛠️ REPARADO: Se redujo drásticamente el tamaño máximo en PC (de h-28 a lg:h-14 estático)
               * para liberar por completo al Hero. En scroll baja a lg:h-10 de forma súper sutil.
               */
              className={`transition-all duration-300 object-contain ${
                isScrolled 
                  ? 'h-9 sm:h-10 md:h-10 lg:h-10' 
                  : 'h-11 sm:h-12 md:h-14 lg:h-14' 
              }`}
            />
          </a>
        </div>

        {/* --- LINKS ESCRITORIO --- */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <a 
              key={link.href}
              href={link.href} 
              className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors text-white hover:text-[#88BDF2] drop-shadow-md"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* --- ACCIONES DERECHA --- */}
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-6">
          
          {/* Selector de idiomas adaptado al dark mode */}
          <div className="flex items-center gap-1.5 rounded-full h-9 px-3 md:px-4 border bg-[#121319]/60 border-slate-800/60 backdrop-blur-sm transition-all">
            <Globe className="text-[#88BDF2] flex-shrink-0" size={13} />
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-[10px] md:text-xs text-white outline-none cursor-pointer font-black border-none focus:ring-0 pr-1"
            >
              <option value="es" className="bg-[#1E222F] text-white">🇦🇷 AR</option>
              <option value="en" className="bg-[#1E222F] text-white">🇺🇸 EN</option>
              <option value="pt" className="bg-[#1E222F] text-white">🇧🇷 PT</option>
            </select>
          </div>

          {/* Botón menú hamburguesa móvil compacto */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#1E222F]/60 text-white backdrop-blur-md border border-slate-800/40"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* --- DROPDOWN MÓVIL REPARADO COHERENTE --- */}
        {isMenuOpen && (
          <div className="absolute top-[105%] left-4 right-4 bg-[#1E222F]/95 backdrop-blur-xl p-6 rounded-[22px] shadow-2xl border border-slate-800/60 lg:hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-5 text-left pl-2">
              {navLinks.map(link => (
                <a 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-black uppercase text-white hover:text-[#88BDF2] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}