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
    { href: '#reservas', label: t('nav_reserva') },
    { href: '#flota', label: t('nav_flota') },
    { href: '#requisitos', label: 'Requisitos' }, 
    { href: '#rutas', label: t('nav_rutas') },
  ];

  return (
    /**
     * 🛠️ AJUSTADO: Se subió un poco la altura de la barra en escritorio (h-28) cuando está estática 
     * para darle aire al logo más grande. Al scrollear baja a h-20 fijo en PC.
     */
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
      isScrolled 
        ? 'h-16 md:h-20 bg-white/95 backdrop-blur-lg shadow-md' 
        : 'h-20 md:h-28 bg-gradient-to-b from-slate-950/70 to-transparent'
    }`}>
      
      <div className="max-w-[1440px] h-full mx-auto px-4 md:px-12 flex justify-between items-center relative">
        
        {/* --- CONTENEDOR LOGO OPTIMIZADO EN AMBAS VISTAS --- */}
        <div className="flex-1 flex items-center">
          <a href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img 
              src={logoMendozaRent} 
              alt="Mendoza Rent Logo" 
              /**
               * 🛠️ REPARADO: Calibración milimétrica responsiva. 
               * Celular: h-12 estático / h-10 scroll (Mantiene el resguardo del Hero)
               * Computadora: h-24/h-28 estático (Impacto visual) / h-16/h-20 scroll (Sutil y corporativo)
               */
              className={`transition-all duration-300 object-contain drop-shadow-md ${
                isScrolled 
                  ? 'h-10 sm:h-12 md:h-16 lg:h-18' 
                  : 'h-12 sm:h-16 md:h-24 lg:h-28' 
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
              className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                isScrolled ? 'text-slate-800' : 'text-white drop-shadow-md'
              } hover:text-sky-500`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* --- ACCIONES DERECHA --- */}
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-6">
          
          {/* Selector de idiomas adaptado con flags universales */}
          <div className={`flex items-center gap-1.5 rounded-full h-9 md:h-11 px-3 md:px-5 border transition-all ${
            isScrolled 
              ? 'bg-slate-800 border-slate-700 shadow-sm' 
              : 'bg-slate-900/60 border-white/20 backdrop-blur-sm'
          }`}>
            <Globe className="text-sky-400 flex-shrink-0" size={13} />
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-[10px] md:text-xs text-white outline-none cursor-pointer font-black border-none focus:ring-0 pr-1"
            >
              <option value="es" className="bg-slate-800 text-white">🇦🇷 AR</option>
              <option value="en" className="bg-slate-800 text-white">🇺🇸 EN</option>
              <option value="pt" className="bg-slate-800 text-white">🇧🇷 PT</option>
            </select>
          </div>

          {/* Botón menú hamburguesa móvil compacto */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all ${
              isScrolled ? 'bg-slate-100 text-slate-800' : 'bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* --- DROPDOWN MÓVIL REPARADO --- */}
        {isMenuOpen && (
          <div className="absolute top-[85%] left-4 right-4 mt-2 bg-slate-900/95 backdrop-blur-xl p-6 rounded-[22px] shadow-2xl border border-slate-800 lg:hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-5 text-left pl-2">
              {navLinks.map(link => (
                <a 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-black uppercase text-white hover:text-sky-400 transition-colors"
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