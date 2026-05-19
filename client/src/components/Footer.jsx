import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, MapPin, Phone, ArrowUp } from 'lucide-react';
import logoCuadrado from '../assets/logocuadrado.png';

export default function Footer() {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  
  const INSTAGRAM_URL = "https://www.instagram.com/goodtripcarrentals/";
  const WHATSAPP_NUMBER = "5492612764618";
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola, Good Trip Mendoza.`;

  return (
    <footer className="relative bg-[#121319] border-t border-slate-800 pt-12 pb-6 w-full text-[#666D7E] overflow-hidden">
      {/* SELLO DE AGUA GLOBAL */}
      <img src={logoCuadrado} alt="Logo" className="footer-watermark" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-[11px] font-bold">
        
        {/* IZQUIERDA: Contacto y Ubicación */}
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
          <p className="uppercase text-white font-black text-sm mb-1">Good Trip Car Rentals</p>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-[#88BDF2]" />
            <span>Mendoza, Argentina</span>
          </div>
          <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#25D366] transition-colors">
            <Phone size={12} className="text-[#25D366]" /> +54 9 261 276-4618
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#E1306C] transition-colors">
            <Instagram size={12} className="text-[#E1306C]" /> @goodtripcarrentals
          </a>
        </div>

        {/* CENTRO: Logo y Crédito */}
<div className="flex flex-col items-center gap-3">
  {/* Cambiado de h-16 a h-20 */}
  <img src={logoCuadrado} alt="Logo" className="h-20 w-auto opacity-80" />
  <p className="text-[9px] uppercase tracking-widest text-center leading-relaxed">
    Designed and Powered by <a href="https://puma-code.com" className="text-[#88BDF2] hover:text-white transition-colors">Puma-Code.com</a><br/>
    © 2026 Marca Registrada.
  </p>
</div>

        {/* DERECHA: Staff y Scroll */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-2 bg-[#1E222F] hover:bg-[#88BDF2] hover:text-[#121319] transition-all rounded-lg uppercase tracking-wider font-bold"
          >
            Acceso Staff
          </button>
          <button 
            onClick={scrollToTop} 
            className="p-3 bg-[#1E222F] rounded-full border border-slate-800 hover:bg-[#5383B3] transition-colors"
          >
            <ArrowUp size={16} className="text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
}