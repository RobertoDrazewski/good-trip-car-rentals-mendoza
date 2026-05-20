import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- COMPONENTES ---
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
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import SetupPassword from './pages/SetupPassword';
import Login from './pages/Login';

// --- ASSETS ---
import imgHeroBackground from './assets/hero.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- BANNER PROMOCIONAL (PRODUCCIÓN) ---
function PromoBanner() {
  const [promos, setPromos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/promos/all-active?t=${new Date().getTime()}`)
      .then(res => setPromos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPromos([]));
  }, []);

  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promos]);

  if (promos.length === 0) return null;

  const promo = promos[currentIndex];
  // Normalización de URL para evitar fallos de renderizado
  const imgUrl = promo.imagen_url?.startsWith('http') 
    ? promo.imagen_url 
    : `${API_BASE_URL}${promo.imagen_url.startsWith('/') ? '' : '/'}${promo.imagen_url}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 pt-6 md:pt-8 animate-in fade-in duration-700">
      <div className="relative z-10 h-40 md:h-56 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800/60 bg-[#121319]">
        <img 
          key={promo.id}
          src={imgUrl} 
          className="absolute inset-0 z-0 w-full h-full object-cover animate-in fade-in duration-1000" 
          alt="Promoción" 
        />
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-12 bg-black/40">
          <span className="bg-[#88BDF2] text-[#121319] text-[9px] md:text-[11px] font-black px-3 py-1.5 rounded w-fit mb-3 uppercase tracking-widest shadow-lg">
            {promo.descuento}% OFF
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            {promo.titulo}
          </h2>
        </div>
      </div>
    </div>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLoginSuccess={() => navigate('/admin')} />;
}

export default function App() {
  const [quote, setQuote] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="relative min-h-screen bg-[#121319] overflow-x-hidden font-sans text-white w-full">
            <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
              <img src={imgHeroBackground} alt="Fondo" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-[#121319]/45 backdrop-blur-[3px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
              <Navbar />
              <Hero />
              <PromoBanner />

              <main className="w-full max-w-7xl mx-auto px-4 lg:px-6 flex-1 flex flex-col gap-8 md:gap-12 pb-12 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
                  <div id="flota" className="lg:col-span-8 flex flex-col w-full h-full"><CarCarousel /></div>
                  <div id="requisitos" className="lg:col-span-4 flex flex-col w-full h-full"><Requirements /></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
                  <div id="reservas" className="lg:col-span-7 flex flex-col w-full h-full">
                    <BookingForm onQuoteGenerated={setQuote} setAiContext={setAiContext} setIsChatOpen={setIsChatOpen} />
                  </div>
                  <div className="lg:col-span-5 flex flex-col w-full h-full">
                    {quote ? <QuoteResult quote={quote} /> : <div id="testimonios" className="h-full flex flex-col w-full"><GoogleReviews /></div>}
                  </div>
                </div>

                <div id="clima" className="w-full flex flex-col h-full"><WeatherWidget /></div>
                <div id="rutas" className="w-full flex flex-col h-full"><RoutesSection /></div>
              </main>

              <ChatIA isOpen={isChatOpen} setIsOpen={setIsChatOpen} context={aiContext} />
              <Footer />
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