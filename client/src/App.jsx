import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Phone, MapPin, ArrowUp, Activity } from 'lucide-react';

// Importamos el logo de forma modular segura desde tu carpeta assets
import logoMendozaRent from './assets/logo.png';

// Importación de Componentes Oficiales
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

// Componente auxiliar para manejar el login con el ruteo interno de React
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
        {/* RUTA PÚBLICA PRINCIPAL */}
        <Route path="/" element={
          <div className="relative min-h-screen bg-gray-50 overflow-x-hidden font-sans text-slate-900 w-full flex flex-col">
            
            <Navbar />
            
            <Hero />
            
            <main className="relative z-10 max-w-7xl mx-auto px-4 w-full space-y-16 md:space-y-40 flex-1">
              
              {/* SECCIÓN 1: RESERVAS Y PRESUPUESTOS */}
              <section id="reservas" className="scroll-mt-24 sm:scroll-mt-32 w-full">
                <BookingForm 
                  onQuoteGenerated={(data) => setQuote(data)} 
                  setAiContext={setAiContext}
                  setIsChatOpen={setIsChatOpen}
                />
                {quote && <QuoteResult quote={quote} />}
              </section>

              {/* SECCIÓN 2: TESTIMONIOS PREMIUM (GOOGLE REVIEWS) */}
              <section id="testimonios" className="scroll-mt-24 w-full">
                <GoogleReviews />
              </section>

              {/* SECCIÓN 3: FLOTA VEHICULAR */}
              <section id="flota" className="scroll-mt-24 w-full">
                <div className="text-center mb-6 md:mb-12">
                  <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-slate-900 uppercase">
                    {t('flota_title', 'Nuestra')} <span className="text-yellow-500">{t('nav_flota', 'Flota')}</span>
                  </h2>
                  <div className="w-16 md:w-24 h-1.5 md:h-2 bg-yellow-500 mx-auto mt-4 rounded-full" />
                </div>
                <CarCarousel />
              </section>

              {/* SECCIÓN 4: REQUISITOS OBLIGATORIOS */}
              <section id="requisitos" className="scroll-mt-24 sm:scroll-mt-32 w-full">
                <Requirements />
              </section>

              {/* SECCIÓN 5: ESTADO DEL CLIMA EN VIVO */}
              <section id="clima" className="scroll-mt-24 w-full">
                <WeatherWidget />
              </section>

              {/* SECCIÓN 6: EXPERIENCIAS Y RUTAS MENDOCINAS */}
              <section id="rutas" className="scroll-mt-24 w-full">
                <RoutesSection />
              </section>

            </main>

            {/* CHAT CON CONSERJE IA FLOTANTE */}
            <ChatIA 
              isOpen={isChatOpen} 
              setIsOpen={setIsChatOpen} 
              context={aiContext} 
            />

            {/* FOOTER LOCAL CON RUTA DE ACCESO RESTAURADA */}
            <FooterLocal t={t} logoImg={logoMendozaRent} />

          </div>
        } />

        {/* INTERFAZ DE RUTAS ADMINISTRATIVAS */}
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-password" element={<SetupPassword />} />

        {/* REDIRECCIÓN GLOBAL DE SEGURIDAD */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// 🎯 COMPONENTE LOCAL DEL FOOTER REPARADO
function FooterLocal({ t, logoImg }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-slate-950 border-t border-white/5 pt-16 pb-8 overflow-hidden w-full text-white">
      
      {/* LOGO EN MARCA DE AGUA SEGURO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={logoImg} 
          alt="Good Trip Logo Background" 
          className="w-56 h-56 md:w-[28rem] md:h-[28rem] object-contain opacity-35 md:opacity-40 select-none mix-blend-screen"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 border-b border-white/5 pb-12 w-full">
          
          {/* COLUMNA 1: LOGO REAL Y EMPRESA */}
          <div className="space-y-4 text-left">
            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
              GOOD TRIP <br />
              <span className="text-yellow-500">CAR RENTALS</span> <br />
              <span className="text-xs font-bold not-italic tracking-widest text-slate-400 block mt-1">MENDOZA, ARG</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
              {t('footer_desc', 'Alquiler de vehículos sin franquicias ocultas ni sorpresas. Tu mejor experiencia recorriendo las rutas mendocinas.')}
            </p>
          </div>

          {/* COLUMNA 2: NAVIGATION */}
          <div className="text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-500 mb-4">Navegación</h4>
            <ul className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
              <li><a href="#reservas" className="hover:text-yellow-500 transition-colors">Reservas</a></li>
              <li><a href="#flota" className="hover:text-yellow-500 transition-colors">Vehículos</a></li>
              <li><a href="#requisitos" className="hover:text-yellow-500 transition-colors">Requisitos</a></li>
              <li><a href="#rutas" className="hover:text-yellow-500 transition-colors">Rutas</a></li>
            </ul>
          </div>

          {/* COLUMNA 3: CONTACT INFORMATION */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-500 mb-2">Atención Directa</h4>
            <div className="space-y-3 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-yellow-500 flex-shrink-0" />
                <span>Mendoza Capital, Argentina</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-yellow-500 flex-shrink-0" />
                <span>+54 9 261 276-4618</span>
              </div>
            </div>
          </div>
        </div>

        {/* REDES, COPYRIGHT Y ENLACE INTERNO DE STAFF */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6 w-full">
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/good.triprentals/" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-yellow-500 hover:text-slate-950 rounded-full transition-all border border-white/5">
              <Instagram size={16} />
            </a>
          </div>

          {/* 🛠️ REPARADO: Centralizado el copyright junto al botón "secreto" de acceso al login */}
          <div className="text-center sm:text-left space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              © 2026 <span className="text-slate-400">Good Trip Car Rentals Mendoza, Arg</span>. Todos los derechos reservados.
            </p>
            <div className="flex justify-center sm:justify-start gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
              <a href="/login" className="hover:text-yellow-500/80 transition-colors">Acceso Staff</a>
              <span>•</span>
              <span className="text-slate-700">Dev by Puma Code</span>
            </div>
          </div>

          <button onClick={scrollToTop} className="group p-2.5 bg-white/5 hover:bg-slate-900 text-yellow-500 border border-white/10 rounded-full transition-all cursor-pointer">
            <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default App;