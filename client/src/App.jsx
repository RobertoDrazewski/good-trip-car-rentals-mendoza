import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { Instagram, MapPin, Phone, ArrowUp, Star } from 'lucide-react';

// Importación de Activos de Marca (Sincronizados al logo cuadrado para el layout)
import logoCuadrado from './assets/logocuadrado.png';
import imgHeroBackground from './assets/hero.png';

// Importación de Componentes de Interfaz
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookingForm from './components/BookingForm';
import QuoteResult from './components/QuoteResult';
import CarCarousel from './components/CarCarousel';
import GoogleReviews from './components/GoogleReviews'; 
import ChatIA from './components/ChatIA';
import RoutesSection from './components/RoutesSection';
import WeatherWidget from './components/WeatherWidget';
import Requirements from './components/Requirements'; 

// Importación de Páginas Administrativas
import AdminDashboard from './pages/AdminDashboard';
import SetupPassword from './pages/SetupPassword';
import Login from './pages/Login';

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLoginSuccess={() => navigate('/admin')} />;
}

export default function App() {
  const { t } = useTranslation();
  const [quote, setQuote] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="relative min-h-screen bg-[#121319] overflow-x-hidden font-sans text-white w-full flex flex-col justify-between">
            
            {/* 🖼️ IMAGEN DE FONDO ENVOLVENTE FIJA */}
            <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
              <img 
                src={imgHeroBackground} 
                alt="Fondo Paisaje Mendoza Fijo Good Trip" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-[#121319]/45 backdrop-blur-[3px]" />
            </div>

            {/* CONTENIDO INTERFACES FLOTANTES SOBRE EL FONDO */}
            <div className="relative z-10 flex flex-col min-h-screen w-full justify-between">
              
              {/* Bloque superior */}
              <div className="w-full flex-shrink-0">
                <Navbar />
                <Hero />
              </div>
              
              {/* MAIN CONTAINER: Flujo libre adaptado para convivir con el Hero expandido */}
              <main className="w-full max-w-7xl mx-auto px-4 lg:px-6 flex-1 flex flex-col gap-8 md:gap-12 pb-12">
                
                {/* 🚗 SECCIÓN 1: FLOTA (lg:col-span-8) + REQUISITOS (lg:col-span-4) -> ¡MISMA ALTURA! */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
                  
                  {/* Flota Vehicular Carrusel */}
                  <div id="flota" className="bg-transparent backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-800/30 p-5 sm:p-6 lg:col-span-8 flex flex-col justify-between">
                    <div className="mb-3 text-left flex-shrink-0">
                      <h2 className="text-xs font-black italic tracking-tighter text-white uppercase">
                        {t('flota_title', 'Nuestra')} <span className="text-[#88BDF2]">{t('nav_flota', 'Flota')}</span>
                      </h2>
                    </div>
                    <div className="w-full flex-1 flex flex-col justify-center">
                      <CarCarousel />
                    </div>
                  </div>

                  {/* Requisitos Obligatorios */}
                  <div id="requisitos" className="bg-transparent backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-800/30 p-5 sm:p-6 lg:col-span-4 flex flex-col">
                    <div className="mb-3 border-b border-slate-800/40 pb-2 text-left flex-shrink-0">
                      <h2 className="text-xs font-black italic tracking-tighter text-white uppercase">
                        {t('req_section_title', 'Requisitos de')} <span className="text-[#88BDF2]">{t('req_section_subtitle', 'Alquiler')}</span>
                      </h2>
                    </div>
                    <div className="w-full flex-1">
                      <Requirements />
                    </div>
                  </div>

                </div>

                {/* 📝 SECCIÓN 2: BOOKING (lg:col-span-7) + REVIEWS (lg:col-span-5) -> MÁS ANCHO */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
  
  {/* Formulario Booking (Reducido de 8 a 7) */}
  <div id="reservas" className="bg-transparent p-5 sm:p-6 rounded-[2rem] shadow-2xl border border-slate-800/30 backdrop-blur-md lg:col-span-7 flex flex-col justify-center">
    <BookingForm 
      onQuoteGenerated={(data) => setQuote(data)} 
      setAiContext={setAiContext}
      setIsChatOpen={setIsChatOpen}
    />
  </div>

  {/* Bloque de Reviews (Aumentado de 4 a 5 -> más ancho) */}
  <div className="lg:col-span-5 w-full flex flex-col">
    {quote ? (
      <div className="w-full h-full flex flex-col">
        <QuoteResult quote={quote} />
      </div>
    ) : (
      <div id="testimonios" className="bg-transparent p-5 sm:p-6 rounded-[2rem] shadow-2xl border border-slate-800/30 backdrop-blur-md flex flex-col h-full flex-1">
        <div className="flex items-center gap-2 mb-3 bg-[#1E222F] text-slate-300 px-3 py-1 rounded-full w-fit text-[9px] font-black uppercase tracking-wider border border-slate-800/40 flex-shrink-0">
          <Star size={10} className="fill-[#88BDF2] text-[#88BDF2]" /> Google Verified
        </div>
        <div className="w-full flex-1 flex flex-col justify-between">
          <GoogleReviews />
        </div>
      </div>
    )}
  </div>

</div>

                {/* ⛅ SECCIÓN 3: CLIMA A TODO LO ANCHO */}
                <div id="clima" className="bg-transparent backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-800/30 p-5 sm:p-6 w-full">
                  <WeatherWidget />
                </div>

                {/* ⛰️ SECCIÓN 4: RUTAS A TODO LO ANCHO (DEBAJO DEL CLIMA) */}
                <div id="rutas" className="bg-transparent backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-800/30 p-5 sm:p-6 text-center w-full">
                  <div className="mb-3 text-left">
                    <h2 className="text-xs font-black italic tracking-tighter text-white uppercase">
                      {t('routes_title', 'Rutas')} <span className="text-[#88BDF2]">{t('routes_subtitle', 'Mendocinas')}</span>
                    </h2>
                  </div>
                  <div className="w-full">
                    <RoutesSection />
                  </div>
                </div>

              </main>

              {/* ASISTENTE CONSERJE IA FLOTANTE */}
              <ChatIA isOpen={isChatOpen} setIsOpen={setIsChatOpen} context={aiContext} />

              {/* FOOTER LOCAL ANCLADO SIEMPRE ABAJO */}
              <FooterLocal t={t} />
            </div>

          </div>
        } />

        {/* INTERFAZ ADMINISTRATIVA */}
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-password" element={<SetupPassword />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// 🎯 COMPONENTE FOOTER LOCAL: Reparado con la Sincronización del Logo Cuadrado Premium
function FooterLocal({ t }) {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const WHATSAPP_NUMBER = "5492612764618";
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me comunico desde la plataforma web de Good Trip Car Rentals y deseo recibir asistencia comercial.")}`;

  return (
    <footer className="sticky bottom-0 z-50 bg-[#121319]/90 backdrop-blur-md border-t border-slate-800/60 py-8 w-full text-white pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
      
      {/* 🏔️ REPARADO: Ahora inyecta el logoCuadrado oficial mapeado con las reglas estrictas de index.css */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] mix-blend-screen">
        <img 
          src={logoCuadrado} 
          alt="Watermark Logo background" 
          className="h-24 sm:h-32 w-auto object-contain"
        />
      </div>

      {/* CONTENEDOR DE CONTENIDO */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-[#666D7E]">
        
        {/* IZQUIERDA: Copyright Completo Legal */}
        <p className="uppercase tracking-wider text-center md:text-left">
          © 2026 <span className="text-[#6F7D93]">Good Trip Car Rentals</span>. {t('footer_rights', 'Todos los derechos reservados.')}
        </p>
        
        {/* CENTRO: Enlaces de Navegación rápidos y Link de WhatsApp con ícono */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <ul className="flex items-center gap-x-4 text-[9px] font-black uppercase tracking-wider text-[#6F7D93]">
            <li><a href="#flota" className="hover:text-[#88BDF2] transition-colors">Vehículos</a></li>
            <li><a href="#requisitos" className="hover:text-[#88BDF2] transition-colors">Requisitos</a></li>
            <li><a href="#reservas" className="hover:text-[#88BDF2] transition-colors">Reservas</a></li>
            <li><a href="#rutas" className="hover:text-[#88BDF2] transition-colors">Rutas</a></li>
          </ul>
          
          <span className="hidden sm:inline text-slate-800">|</span>

          {/* Enlace Comercial a WhatsApp */}
          <a 
            href={waUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 text-slate-300 hover:text-[#25D366] transition-colors font-black uppercase text-[9px] tracking-wider"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#25D366]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>+54 9 261 276-4618</span>
          </a>
        </div>

        {/* DERECHA: Créditos oficiales obligatorios y Acceso Administrativo */}
        <div className="flex items-center gap-3 uppercase tracking-wider flex-shrink-0">
          <button onClick={() => navigate('/login')} className="hover:text-[#88BDF2] text-[#666D7E] transition-colors bg-transparent border-none outline-none font-bold cursor-pointer">
            Staff
          </button>
          <span className="select-none text-slate-800">•</span>
          
          {/* Powered by Puma-Code.com */}
          <span className="text-[#666D7E] font-medium tracking-normal normal-case">
            Powered by{' '}
            <a href="https://www.puma-code.com" target="_blank" rel="noopener noreferrer" className="text-[#666D7E] hover:text-[#88BDF2] font-black transition-colors tracking-wide uppercase text-[9px]">
              Puma-Code.com
            </a>
          </span>

          <button onClick={scrollToTop} className="ml-1 p-1 bg-[#1E222F] hover:bg-[#5383B3] text-[#88BDF2] hover:text-white rounded-full transition-all cursor-pointer border border-slate-800 shadow-md">
            <ArrowUp size={10} />
          </button>
        </div>
      </div>
    </footer>
  );
}