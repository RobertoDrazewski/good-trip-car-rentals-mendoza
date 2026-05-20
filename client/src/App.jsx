import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import { Instagram, MapPin, Phone, ArrowUp, Star } from 'lucide-react';
import axios from 'axios';

// Importaciones originales (Mantener tal cual)
import logoCuadrado from './assets/logocuadrado.png';
import imgHeroBackground from './assets/hero.png';
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
import AdminDashboard from './pages/AdminDashboard';
import SetupPassword from './pages/SetupPassword';
import Login from './pages/Login';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- BANNER REPARADO ---
function PromoBanner() {
  const [promo, setPromo] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/promos/active?t=${new Date().getTime()}`)
      .then(res => { setPromo(res.data); setImageError(false); })
      .catch(() => setPromo(null));
  }, []);

  if (!promo) return null;

  // Esta lógica asegura que siempre apunte al servidor backend correcto
  const imgUrl = promo.imagen_url?.startsWith('http') 
    ? promo.imagen_url 
    : `${API_BASE_URL}${promo.imagen_url}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 pt-6 md:pt-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative z-10 h-40 md:h-56 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800/60 !bg-transparent !backdrop-filter-none">
        {!imageError ? (
          <img 
            src={imgUrl} 
            className="absolute inset-0 z-0 w-full h-full object-cover" 
            alt="Promoción Activa" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 z-0 w-full h-full bg-slate-800 flex items-center justify-center">
             <span className="text-slate-500 text-xs">Error cargando imagen</span>
          </div>
        )}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-12 bg-black/20">
          <span className="bg-[#88BDF2] text-[#121319] text-[9px] md:text-[11px] font-black px-3 py-1.5 rounded w-fit mb-3 uppercase tracking-widest shadow-lg">
            Oferta Especial: {promo.descuento}% OFF
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            {promo.titulo}
          </h2>
          <p className="text-white text-xs md:text-sm font-bold mt-1 max-w-md uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {promo.descripcion}
          </p>
        </div>
      </div>
    </div>
  );
}

// ... El resto de tus componentes FooterLocal, LoginWrapper y App se mantienen IGUAL.
// Simplemente asegúrate de que App.jsx no tenga errores de sintaxis al copiar y pegar.

// --- COMPONENTE FOOTER ORIGINAL ---
function FooterLocal({ t }) {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const WHATSAPP_NUMBER = "5492612764618";
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me comunico desde la plataforma web de Good Trip Car Rentals y deseo recibir asistencia comercial.")}`;

  return (
    <footer className="sticky bottom-0 z-50 bg-[#121319]/90 backdrop-blur-md border-t border-slate-800/60 py-8 w-full text-white pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] mix-blend-screen">
        <img src={logoCuadrado} alt="Watermark Logo background" className="h-24 sm:h-32 w-auto object-contain"/>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-[#666D7E]">
        <p className="uppercase tracking-wider text-center md:text-left">
          © 2026 <span className="text-[#6F7D93]">Good Trip Car Rentals</span>. {t('footer_rights', 'Todos los derechos reservados.')}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <ul className="flex items-center gap-x-4 text-[9px] font-black uppercase tracking-wider text-[#6F7D93]">
            <li><a href="#flota" className="hover:text-[#88BDF2] transition-colors">Vehículos</a></li>
            <li><a href="#requisitos" className="hover:text-[#88BDF2] transition-colors">Requisitos</a></li>
            <li><a href="#reservas" className="hover:text-[#88BDF2] transition-colors">Reservas</a></li>
            <li><a href="#rutas" className="hover:text-[#88BDF2] transition-colors">Rutas</a></li>
          </ul>
          <span className="hidden sm:inline text-slate-800">|</span>
          <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-[#25D366] transition-colors font-black uppercase text-[9px] tracking-wider">
            <span>+54 9 261 276-4618</span>
          </a>
        </div>
        <div className="flex items-center gap-3 uppercase tracking-wider flex-shrink-0">
          <button onClick={() => navigate('/login')} className="hover:text-[#88BDF2] text-[#666D7E] transition-colors bg-transparent border-none outline-none font-bold cursor-pointer">Staff</button>
          <span className="select-none text-slate-800">•</span>
          <span className="text-[#666D7E] font-medium tracking-normal normal-case">
            Powered by <a href="https://www.puma-code.com" target="_blank" rel="noopener noreferrer" className="text-[#666D7E] hover:text-[#88BDF2] font-black transition-colors uppercase text-[9px]">Puma-Code.com</a>
          </span>
          <button onClick={scrollToTop} className="ml-1 p-1 bg-[#1E222F] hover:bg-[#5383B3] text-[#88BDF2] hover:text-white rounded-full transition-all cursor-pointer border border-slate-800 shadow-md">
            <ArrowUp size={10} />
          </button>
        </div>
      </div>
    </footer>
  );
}

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
            <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
              <img src={imgHeroBackground} alt="Fondo" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-[#121319]/45 backdrop-blur-[3px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen w-full justify-between">
              <div className="w-full flex-shrink-0">
                <Navbar />
                <Hero />
                <PromoBanner />
              </div>

              <main className="w-full max-w-7xl mx-auto px-4 lg:px-6 flex-1 flex flex-col gap-8 md:gap-12 pb-12 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
                  <div id="flota" className="bg-transparent backdrop-blur-md rounded-[2rem] border border-slate-800/30 p-6 lg:col-span-8">
                    <CarCarousel />
                  </div>
                  <div id="requisitos" className="bg-transparent backdrop-blur-md rounded-[2rem] border border-slate-800/30 p-6 lg:col-span-4">
                    <Requirements />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
                  <div id="reservas" className="bg-transparent p-6 rounded-[2rem] border border-slate-800/30 backdrop-blur-md lg:col-span-7">
                    <BookingForm onQuoteGenerated={setQuote} setAiContext={setAiContext} setIsChatOpen={setIsChatOpen} />
                  </div>
                  <div className="lg:col-span-5 w-full">
                    {quote ? <QuoteResult quote={quote} /> : <div id="testimonios" className="bg-transparent p-6 rounded-[2rem] border border-slate-800/30 backdrop-blur-md h-full"><GoogleReviews /></div>}
                  </div>
                </div>

                <div id="clima" className="bg-transparent backdrop-blur-md rounded-[2rem] border border-slate-800/30 p-6 w-full">
                  <WeatherWidget />
                </div>

                <div id="rutas" className="bg-transparent backdrop-blur-md rounded-[2rem] border border-slate-800/30 p-6 w-full">
                  <RoutesSection />
                </div>
              </main>

              <ChatIA isOpen={isChatOpen} setIsOpen={setIsChatOpen} context={aiContext} />
              <FooterLocal t={t} />
            </div>
          </div>
        } />

        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-password" element={<SetupPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}