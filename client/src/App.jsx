import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { Instagram, MapPin, Phone, ArrowUp, Star } from 'lucide-react';

// Importación de Activos de Marca
import logoMendozaRent from './assets/logo.png';
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

function App() {
  const { t } = useTranslation();
  const [quote, setQuote] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  return (
    <Router>
      <Routes>
        {/* RUTA PÚBLICA PRINCIPAL (COMPACT LANDING) */}
        <Route path="/" element={
          <div className="relative min-h-screen bg-slate-100 overflow-x-hidden font-sans text-slate-800 w-full flex flex-col">
            
            {/* 🖼️ IMAGEN DE FONDO ENVOLVENTE FIJA (Ocupa el 100% de la pantalla de forma estática) */}
            <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
              <img 
                src={imgHeroBackground} 
                alt="Fondo Paisaje Mendoza Fijo Good Trip" 
                className="w-full h-full object-cover object-center"
              />
              {/* Filtro cristalino uniforme para garantizar la legibilidad en toda la extensión */}
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />
            </div>

            {/* CONTENIDO INTERFACES FLOTANTES SOBRE EL FONDO */}
            <div className="relative z-10 flex flex-col min-h-screen w-full">
              <Navbar />
              
              <Hero />
              
              {/* MAIN CONTAINER: Distribución vertical simétrica */}
              <main className="max-w-7xl mx-auto px-4 w-full space-y-8 md:space-y-12 flex-1 -mt-6 sm:-mt-12 md:-mt-16 mb-12">
                
                {/* 📊 BLOQUE 1: RESERVAS + REVIEWS (Lado a Lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                  
                  {/* Formulario Booking */}
                  <div id="reservas" className="scroll-mt-24 lg:col-span-7 bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-100/80 backdrop-blur-sm bg-white/95">
                    <BookingForm 
                      onQuoteGenerated={(data) => setQuote(data)} 
                      setAiContext={setAiContext}
                      setIsChatOpen={setIsChatOpen}
                    />
                  </div>

                  {/* Cotización o Testimonios de Google */}
                  <div className="lg:col-span-5 h-full flex flex-col justify-stretch">
                    {quote ? (
                      <QuoteResult quote={quote} />
                    ) : (
                      <div id="testimonios" className="scroll-mt-24 bg-white p-5 sm:p-6 rounded-[2rem] shadow-2xl border border-slate-100 backdrop-blur-sm bg-white/95 flex-1 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3 bg-slate-100 text-slate-700 px-3 py-1 rounded-full w-fit text-[10px] font-black uppercase tracking-wider border border-slate-200/40">
                          <Star size={11} className="fill-sky-500 text-sky-500" /> Google Verified
                        </div>
                        <GoogleReviews />
                      </div>
                    )}
                  </div>
                </div>

                {/* 📊 BLOQUE 2: REQUISITOS + FLOTA VEHICULAR (Lado a Lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch w-full">
                  
                  {/* Requisitos Obligatorios */}
                  <div id="requisitos" className="scroll-mt-24 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-slate-100 p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <div className="mb-4 border-b border-slate-50 pb-2 text-left">
                        <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-slate-800 uppercase">
                          {t('req_section_title', 'Requisitos de')} <span className="text-sky-500">{t('req_section_subtitle', 'Alquiler')}</span>
                        </h2>
                      </div>
                      <Requirements />
                    </div>
                  </div>

                  {/* Flota Vehicular Carrusel */}
                  <div id="flota" className="scroll-mt-24 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-slate-100 p-5 sm:p-6 lg:col-span-7 flex flex-col justify-between text-center">
                    <div>
                      <div className="mb-4 text-left sm:text-center">
                        <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-slate-800 uppercase">
                          {t('flota_title', 'Nuestra')} <span className="text-sky-500">{t('nav_flota', 'Flota')}</span>
                        </h2>
                      </div>
                      <CarCarousel />
                    </div>
                  </div>

                </div>

                {/* 📊 BLOQUE 3: CLIMA + RUTAS RECOMENDADAS LADO A LADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch w-full">
                  
                  {/* Clima en Vivo de Mendoza */}
                  <div id="clima" className="scroll-mt-24 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-slate-100 p-4 sm:p-6 flex flex-col justify-between">
                    <WeatherWidget />
                  </div>

                  {/* Carrusel de Rutas Mendocinas */}
                  <div id="rutas" className="scroll-mt-24 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-slate-100 p-5 sm:p-6 flex flex-col justify-between text-center">
                    <div>
                      <div className="mb-4 text-left">
                        <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-slate-800 uppercase">
                          {t('routes_title', 'Rutas')} <span className="text-sky-500">{t('routes_subtitle', 'Mendocinas')}</span>
                        </h2>
                      </div>
                      <RoutesSection />
                    </div>
                  </div>

                </div>

              </main>

              {/* ASISTENTE CONSERJE IA FLOTANTE */}
              <ChatIA isOpen={isChatOpen} setIsOpen={setIsChatOpen} context={aiContext} />

              {/* FOOTER LOCAL RE-ESTILIZADO (Delgado, Centrado y Limpio) */}
              <FooterLocal t={t} />
            </div>

          </div>
        } />

        {/* INTERFAZ ADMINISTRATIVA */}
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-password" element={<SetupPassword />} />

        {/* ROUTE BACK RESGUARDO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// 🎯 COMPONENTE LOCAL DEL FOOTER (Optimizado, Fino y Centrado sin marca de agua)
function FooterLocal({ t }) {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 py-8 w-full text-white z-30 pointer-events-auto">
      <div className="relative max-w-6xl mx-auto px-4 z-10 w-full flex flex-col items-center gap-6">
        
        {/* TEXTO DE MARCA CENTRAL */}
        <div className="text-center space-y-2">
          <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white leading-none">
            GOOD TRIP <span className="text-sky-400 not-italic">CAR RENTALS</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            {t('footer_desc', 'Alquiler de vehículos sin franquicias ocultas ni sorpresas. Tu mejor experiencia recorriendo las rutas mendocinas.')}
          </p>
        </div>

        {/* ENLACES RÁPIDOS CENTRADOS */}
        <div className="w-full max-w-sm border-t border-b border-slate-800/60 py-3">
          <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
            <li><a href="#reservas" className="hover:text-sky-400 transition-colors">{t('nav_reserva', 'Reservas')}</a></li>
            <li><a href="#flota" className="hover:text-sky-400 transition-colors">{t('nav_flota', 'Vehículos')}</a></li>
            <li><a href="#requisitos" className="hover:text-sky-400 transition-colors">{t('req_section_subtitle', 'Requisitos')}</a></li>
            <li><a href="#rutas" className="hover:text-sky-400 transition-colors">{t('nav_rutas', 'Rutas')}</a></li>
          </ul>
        </div>

        {/* DATOS DE ATENCIÓN DIRECTA Y REDES */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5"><MapPin size={13} className="text-sky-400" /><span>Mendoza Capital, Argentina</span></div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <div className="flex items-center gap-1.5"><Phone size={13} className="text-sky-400" /><span>+54 9 261 276-4618</span></div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <a href="https://www.instagram.com/good.triprentals/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-400 transition-all text-slate-300">
            <Instagram size={13} className="text-sky-400" /> <span>@good.triprentals</span>
          </a>
        </div>

        {/* SUB-FOOTER LEGAL Y DE CONTROL DE ALTURA */}
        <div className="w-full border-t border-slate-800/40 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500">
          <p className="uppercase tracking-wider text-center sm:text-left">
            © 2026 <span className="text-slate-400">Good Trip Car Rentals</span>. {t('footer_rights', 'Todos los derechos reservados.')}
          </p>
          
          <div className="flex items-center gap-3 uppercase tracking-wider">
            <button onClick={() => navigate('/login')} className="hover:text-sky-400 text-slate-500 transition-colors bg-transparent border-none outline-none font-bold cursor-pointer">
              {t('nav_staff', 'Staff')}
            </button>
            <span className="select-none text-slate-800">•</span>
            <a href="https://www.puma-code.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-sky-400 font-black transition-colors lowercase tracking-normal">
              Puma Code
            </a>
          </div>

          <button onClick={scrollToTop} className="p-2 bg-slate-800 hover:bg-sky-500 text-sky-400 hover:text-white rounded-full transition-all cursor-pointer shadow-md">
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
}

export default App;