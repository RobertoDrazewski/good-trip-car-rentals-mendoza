import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react'; 

// Importación de Componentes
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookingForm from './components/BookingForm';
import QuoteResult from './components/QuoteResult';
import CarCarousel from './components/CarCarousel';
import GoogleReviews from './components/GoogleReviews'; 
import ChatIA from './components/ChatIA';
import RoutesSection from './components/RoutesSection';
import WeatherWidget from './components/WeatherWidget';

// Importación de Páginas
import AdminDashboard from './pages/AdminDashboard';
import SetupPassword from './pages/SetupPassword';
import Login from './pages/Login';

function App() {
  const { t } = useTranslation();
  const [quote, setQuote] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  return (
    <Router>
      <Routes>
        {/* LANDING PRINCIPAL: MENDOZA RENT ESTÉTICA ORIGINAL */}
        <Route path="/" element={
          <div className="relative min-h-screen bg-gray-50 overflow-x-hidden font-sans text-slate-900">
            {/* Navbar fijo en la parte superior */}
            <div className="sticky top-0 z-50 shadow-sm bg-white/90 backdrop-blur-md">
              <Navbar />
            </div>
            
            <Hero />
            
            <main className="relative z-10 max-w-6xl mx-auto px-4 py-16 space-y-32 md:space-y-48">
              
              {/* SECCIÓN 1: RESERVAS Y RESULTADOS */}
              <section id="reservas" className="scroll-mt-32">
                <BookingForm 
                  onQuoteGenerated={(data) => setQuote(data)} 
                  setAiContext={setAiContext}
                  setIsChatOpen={setIsChatOpen}
                />
                
                {/* Animación fluida cuando aparece el resultado */}
                {quote && (
                  <div className="mt-12 animate-in fade-in zoom-in duration-500">
                    <QuoteResult quote={quote} />
                  </div>
                )}
              </section>

              {/* SECCIÓN 2: TESTIMONIOS DE GOOGLE */}
              <section id="testimonios" className="scroll-mt-24">
                <GoogleReviews />
              </section>

              {/* SECCIÓN 3: FLOTA 2026 */}
              <section id="flota" className="scroll-mt-24">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 uppercase">
                    {t('reviews_section_title')} <span className="text-yellow-500">{t('nav_flota')}</span>
                  </h2>
                  <div className="w-24 h-2 bg-yellow-500 mx-auto mt-6 rounded-full shadow-lg shadow-yellow-500/20" />
                </div>
                <CarCarousel />
              </section>

              {/* SECCIÓN 4: CLIMA EN MENDOZA */}
              <section id="clima" className="scroll-mt-24">
                <div className="text-center mb-12">
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                    {t('chat_welcome')}
                  </p>
                  <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                    {t('weather_title')} <span className="text-blue-600">Mendoza</span>
                  </h2>
                </div>
                <WeatherWidget />
              </section>

              {/* SECCIÓN 5: RUTAS Y DESTINOS */}
              <section id="rutas" className="scroll-mt-24">
                <RoutesSection />
              </section>

            </main>

            {/* ASISTENTE VIRTUAL IA */}
            <ChatIA 
              isOpen={isChatOpen} 
              setIsOpen={setIsChatOpen} 
              context={aiContext} 
            />

            {/* FOOTER PREMIUM ORIGINAL */}
            <footer className="bg-[#0f172a] text-white pt-24 pb-12 text-center border-t-[12px] border-yellow-500 relative">
              <div className="max-w-4xl mx-auto px-6">
                {/* Logo en el Footer */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="bg-yellow-500 p-2 rounded-xl">
                    <Activity className="text-slate-900" size={28} fill="currentColor"/>
                  </div>
                  <span className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">
                    MENDOZA<span className="text-yellow-500">RENT</span>
                  </span>
                </div>

                <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-12 font-medium italic">
                  {t('hero_subtitle')}
                </p>

                {/* Línea divisoria decorativa */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full mb-10" />
                
                {/* Créditos y Copyright */}
                <div className="space-y-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
                    © 2026 {t('footer_rights')}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
                    Developed by <span className="text-yellow-500/40 font-black">Puma Code</span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        } />

        {/* RUTAS PARA EL PANEL DE ADMINISTRACIÓN */}
        <Route path="/login" element={<Login onLoginSuccess={() => window.location.href = '/admin'} />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-password" element={<SetupPassword />} />
      </Routes>
    </Router>
  );
}

export default App;