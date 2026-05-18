import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { Instagram, MapPin, Phone, ArrowUp, Star } from 'lucide-react';

// Importación de Activos de Marca
import logoMendozaRent from './assets/logo.png';

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
        {/* RUTA PÚBLICA PRINCIPAL (COMPACT LANDING - SIN PANEL DE PESTAÑAS) */}
        <Route path="/" element={
          <div className="relative min-h-screen bg-gray-50 overflow-x-hidden font-sans text-slate-800 w-full flex flex-col">
            
            <Navbar />
            
            <Hero />
            
            {/* MAIN CONTAINER: Flujo vertical limpio con separación equilibrada (space-y-12) */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 w-full space-y-12 md:space-y-16 flex-1 -mt-6 sm:-mt-12 md:-mt-16">
              
              {/* BLOQUE DE CONVERSIÓN: Reservas + Cotización o Testimonios Lado a Lado */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Columna Izquierda: Formulario de Booking Principal */}
                <div id="reservas" className="scroll-mt-24 lg:col-span-7 bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
                  <BookingForm 
                    onQuoteGenerated={(data) => setQuote(data)} 
                    setAiContext={setAiContext}
                    setIsChatOpen={setIsChatOpen}
                  />
                </div>

                {/* Columna Derecha Dinámica: Cotización o Testimonios de Google */}
                <div className="lg:col-span-5 h-full flex flex-col justify-stretch">
                  {quote ? (
                    <QuoteResult quote={quote} />
                  ) : (
                    <div id="testimonios" className="scroll-mt-24 bg-white p-5 sm:p-6 rounded-[2rem] shadow-md border border-slate-100 flex-1 flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-3 bg-slate-100 text-slate-700 px-3 py-1 rounded-full w-fit text-[10px] font-black uppercase tracking-wider border border-slate-200/40">
                        <Star size={11} className="fill-sky-500 text-sky-500" /> Google Verified
                      </div>
                      <GoogleReviews />
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN: FLOTA VEHICULAR (Integrado directamente) */}
              <div id="flota" className="scroll-mt-24 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 p-4 sm:p-6 text-center">
                <div className="mb-4">
                  <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-slate-800 uppercase">
                    {t('flota_title', 'Nuestra')} <span className="text-sky-500">{t('nav_flota', 'Flota')}</span>
                  </h2>
                </div>
                <CarCarousel />
              </div>

              {/* SECCIÓN: REQUISITOS OBLIGATORIOS */}
              <div id="requisitos" className="scroll-mt-24 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 p-4 sm:p-6">
                <div className="text-center mb-4 border-b border-slate-50 pb-2">
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-800 uppercase">
                    {t('req_section_title', 'Requisitos de')} <span className="text-sky-500">{t('req_section_subtitle', 'Alquiler')}</span>
                  </h2>
                </div>
                <Requirements />
              </div>

              {/* SECCIÓN: ESTADO DEL CLIMA EN VIVO */}
              <div id="clima" className="scroll-mt-24 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 p-4 sm:p-6">
                <WeatherWidget />
              </div>

              {/* SECCIÓN: EXPERIENCIAS Y RUTAS MENDOCINAS */}
              <div id="rutas" className="scroll-mt-24 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 p-4 sm:p-6 text-center">
                <div className="mb-4">
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-800 uppercase">
                    {t('routes_title', 'Rutas')} <span className="text-sky-500">{t('routes_subtitle', 'Mendocinas')}</span>
                  </h2>
                </div>
                <RoutesSection />
              </div>

            </main>

            {/* ASISTENTE CONSERJE IA FLOTANTE */}
            <ChatIA isOpen={isChatOpen} setIsOpen={setIsChatOpen} context={aiContext} />

            {/* FOOTER LOCAL */}
            <FooterLocal t={t} logoImg={logoMendozaRent} />

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

// 🎯 COMPONENTE LOCAL DEL FOOTER (Mantenido intacto de producción)
function FooterLocal({ t, logoImg }) {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 pt-12 pb-8 overflow-hidden w-full text-white z-30 pointer-events-auto mt-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={logoImg} alt="Watermark" className="w-56 h-56 md:w-[28rem] md:h-[28rem] object-contain opacity-20 select-none mix-blend-screen" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 border-b border-slate-800 pb-12 w-full">
          <div className="space-y-4 text-left">
            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
              GOOD TRIP <br />
              <span className="text-sky-400 not-italic">CAR RENTALS</span> <br />
              <span className="text-xs font-bold not-italic tracking-widest text-slate-400 block mt-1">MENDOZA, ARG</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
              {t('footer_desc', 'Alquiler de vehículos sin franquicias ocultas ni sorpresas. Tu mejor experiencia recorriendo las rutas mendocinas.')}
            </p>
          </div>

          <div className="text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-400 mb-4">{t('footer_nav_title', 'Navegación')}</h4>
            <ul className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
              <li><a href="#reservas" className="hover:text-sky-400 transition-colors">{t('nav_reserva', 'Reservas')}</a></li>
              <li><a href="#flota" className="hover:text-sky-400 transition-colors">{t('nav_flota', 'Vehículos')}</a></li>
              <li><a href="#requisitos" className="hover:text-sky-400 transition-colors">{t('req_section_subtitle', 'Requisitos')}</a></li>
              <li><a href="#rutas" className="hover:text-sky-400 transition-colors">{t('nav_rutas', 'Rutas')}</a></li>
            </ul>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-400 mb-2">{t('footer_contact_title', 'Atención Directa')}</h4>
            <div className="space-y-3 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2"><MapPin size={14} className="text-sky-400 flex-shrink-0" /><span>Mendoza Capital, Argentina</span></div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-sky-400 flex-shrink-0" /><span>+54 9 261 276-4618</span></div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col sm:flex-row justify-between items-center gap-6 w-full z-50 isolate">
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/good.triprentals/" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-sky-500 hover:text-white rounded-full transition-all border border-slate-800"><Instagram size={16} /></a>
          </div>

          <div className="text-center sm:text-left space-y-2 relative z-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              © 2026 <span className="text-slate-400">Good Trip Car Rentals Mendoza, Arg</span>. {t('footer_rights', 'Todos los derechos reservados.')}
            </p>
            <div className="flex justify-center sm:justify-start gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 items-center">
              <button onClick={() => navigate('/login')} className="hover:text-sky-400 text-slate-500 transition-colors bg-transparent border-none outline-none font-black uppercase tracking-[0.2em] cursor-pointer">
                {t('nav_staff', 'Acceso Staff')}
              </button>
              <span className="select-none text-slate-800">•</span>
              <a href="https://www.puma-code.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-sky-400 font-black transition-colors lowercase tracking-normal">
                Dev by Puma Code
              </a>
            </div>
          </div>

          <button onClick={scrollToTop} className="group p-2.5 bg-white/5 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-full transition-all cursor-pointer relative z-30">
            <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default App;