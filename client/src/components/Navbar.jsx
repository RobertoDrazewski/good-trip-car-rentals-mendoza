import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    { href: '#requisitos', label: 'Requisitos' }, // Nueva sección
    { href: '#rutas', label: t('nav_rutas') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
      isScrolled 
        ? 'h-20 bg-white/90 backdrop-blur-lg shadow-md' 
        : 'h-36 bg-transparent'
    }`}>
      
      <div className="max-w-[1440px] h-full mx-auto px-6 md:px-12 flex justify-between items-center relative">
        
        <div className="flex-1 flex items-center">
          <a href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img 
              src="/logo.png" 
              alt="Mendoza Rent Logo" 
              className={`transition-all duration-500 object-contain drop-shadow-2xl ${
                isScrolled 
                  ? 'h-20 translate-y-0' 
                  : 'h-48 translate-y-6' 
              }`}
            />
          </a>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map(link => (
            <a 
              key={link.href}
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                isScrolled ? 'text-slate-900' : 'text-white drop-shadow-lg'
              } hover:text-yellow-500`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex-1 flex justify-end items-center gap-6">
          <div className={`flex items-center gap-2 rounded-full h-11 px-5 border transition-all ${
            isScrolled 
              ? 'bg-slate-900 border-slate-800 shadow-lg' 
              : 'bg-white/10 border-white/20 backdrop-blur-md'
          }`}>
            <Globe className="text-yellow-500" size={14} />
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-[10px] text-white outline-none cursor-pointer font-black uppercase tracking-widest border-none focus:ring-0"
            >
              <option value="es" className="bg-slate-900">ES</option>
              <option value="en" className="bg-slate-900">EN</option>
              <option value="pt" className="bg-slate-900">PT</option>
            </select>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-6 right-6 mt-4 bg-slate-950 p-10 rounded-[40px] shadow-2xl lg:hidden">
            <div className="flex flex-col gap-8">
              {navLinks.map(link => (
                <a 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-black uppercase text-white hover:text-yellow-500"
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