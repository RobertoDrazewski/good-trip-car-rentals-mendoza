import React, { useState } from 'react';
// Manejo eficiente de rutas del lado del cliente sin recargas forzadas de navegador
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
// SOLUCIONADO: Importación dirigida al paquete correcto que provee el hook para React
import { useTranslation } from 'react-i18next'; 
import { Instagram, Facebook, Phone, MapPin, ArrowUp, Activity } from 'lucide-react';

// Importación modular del logotipo oficial
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

// Importación de Páginas del Módulo Administrativo
import AdminDashboard from './pages/AdminDashboard';
import SetupPassword from './pages/SetupPassword';
import Login from './pages/Login';

// Componente Wrapper para inyectar el hook de navegación dentro del callback de Login
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
        {/* RUTA PÚBLICA PRINCIPAL (LANDING PAGE) */}
        <Route path="/" element={
          <div className="relative min-h-screen bg-gray-50 overflow-x-hidden font-sans text-slate-800 w-full flex flex-col">
            
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

              {/* SECCIÓN 3: FLOTA VEHICULAR (🛠️ CAMBIADO AMARILLO A CELESTE) */}
              <section id="flota" className="scroll-mt-24 w-full">
                <div className="text-center mb-6 md:mb-12">
                  <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-slate-800 uppercase">
                    {t('flota_title', 'Nuestra')} <span className="text-sky-500">{t('nav_flota', 'Flota')}</span>
                  </h2>
                  <div className="w-16 md:w-24 h-1.5 md:h-2 bg-sky-500 mx-auto mt-4 rounded-full" />
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

            {/* ASISTENTE CONSERJE IA FLOTANTE */}
            <ChatIA 
              isOpen={isChatOpen} 
              setIsOpen={setIsChatOpen} 
              context={aiContext} 
            />

            {/* COMPONENTE LOCAL DEL FOOTER CON INTERNACIONALIZACIÓN */}
            <FooterLocal t={t} logoImg={logoMendozaRent} />

          </div>
        } />

        {/* INTERFAZ DE RUTAS ADMINISTRATIVAS */}
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-password" element={<SetupPassword />} />

        {/* REDIRECCIÓN DE RESGUARDO PARA RUTAS INEXISTENTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// 🎯 COMPONENTE LOCAL DEL FOOTER OPTIMIZADO - PASADO A GRIS PIZARRA Y CELESTE
function FooterLocal({ t, logoImg }) {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 pt-16 pb-8 overflow-hidden w-full text-white z-30 pointer-events-auto">
      
      {/* IMAGEN DE MARCA DE AGUA DE FONDO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={logoImg} 
          alt="Good Trip Logo Background" 
          className="w-56 h-56 md:w-[28rem] md:h-[28rem] object-contain opacity-20 select-none mix-blend-screen"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 border-b border-slate-800 pb-12 w-full">
          
          {/* COLUMNA 1: IDENTIDAD DE LA EMPRESA */}
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

          {/* COLUMNA 2: NAVEGACIÓN (CAMBIADOS HOVERS A CELESTE) */}
          <div className="text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-400 mb-4">
              {t('footer_nav_title', 'Navegación')}
            </h4>
            <ul className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
              <li><a href="#reservas" className="hover:text-sky-400 transition-colors">{t('nav_reserva', 'Reservas')}</a></li>
              <li><a href="#flota" className="hover:text-sky-400 transition-colors">{t('nav_flota', 'Vehículos')}</a></li>
              <li><a href="#requisitos" className="hover:text-sky-400 transition-colors">{t('req_section_subtitle', 'Requisitos')}</a></li>
              <li><a href="#rutas" className="hover:text-sky-400 transition-colors">{t('nav_rutas', 'Rutas')}</a></li>
            </ul>
          </div>

          {/* COLUMNA 3: CANALES DE CONTACTO */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-400 mb-2">
              {t('footer_contact_title', 'Atención Directa')}
            </h4>
            <div className="space-y-3 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-sky-400 flex-shrink-0" />
                <span>Mendoza Capital, Argentina</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-sky-400 flex-shrink-0" />
                <span>+54 9 261 276-4618</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENEDOR INFERIOR DE REDES, COPYRIGHT Y CREDITOS DE AGENCIA */}
        <div className="relative mt-8 flex flex-col sm:flex-row justify-between items-center gap-6 w-full z-50 isolate">
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/good.triprentals/" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-sky-500 hover:text-white rounded-full transition-all border border-slate-800">
              <Instagram size={16} />
            </a>
          </div>

          {/* Bloque de Copyright y Firma de Puma Code */}
          <div className="text-center sm:text-left space-y-2 relative z-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              © 2026 <span className="text-slate-400">Good Trip Car Rentals Mendoza, Arg</span>. {t('footer_rights', 'Todos los derechos reservados.')}
            </p>
            <div className="flex justify-center sm:justify-start gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 items-center">
              
              <button 
                onClick={() => navigate('/login')}
                onTouchStart={() => navigate('/login')}
                className="hover:text-sky-400 text-slate-500 transition-colors inline-block py-3 px-4 sm:py-1.5 sm:px-2 relative z-55 active:text-sky-500 touch-manipulation pointer-events-auto bg-transparent border-none outline-none appearance-none font-black uppercase tracking-[0.2em] cursor-pointer"
              >
                {t('nav_staff', 'Acceso Staff')}
              </button>

              <span className="select-none text-slate-800">•</span>

              {/* Crédito Oficial de Agencia Adaptado */}
              <a 
                href="https://www.puma-code.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-600 hover:text-sky-400 font-black transition-colors active:text-sky-500 touch-manipulation cursor-pointer pointer-events-auto lowercase tracking-normal"
              >
                Dev by Puma Code
              </a>
            </div>
          </div>

          {/* Botón flotante para scroll ascendente suave */}
          <button onClick={scrollToTop} className="group p-2.5 bg-white/5 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-full transition-all cursor-pointer relative z-30">
            <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default App;