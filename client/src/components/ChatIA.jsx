import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, ShieldCheck, Crown, MessageCircle, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🛠️ REPARADO: Importamos el logo de forma modular segura para que Render no lo rompa
import logoMendozaRent from '../assets/logo.png';

// 🔌 URL INTELIGENTE: Lee la variable de Render en producción, o usa localhost en tu Mac
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ChatIA({ isOpen, setIsOpen, context, userData }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const WHATSAPP_NUMBER = "5492612764618";

  // Efecto de Bienvenida Dinámica y Ejecutiva según el idioma seleccionado de la web
  useEffect(() => {
    const welcome = {
      es: "Bienvenido a Good Trip Car Rentals Mendoza. Soy su asistente ejecutivo de ventas. ¿En qué puedo asistirle hoy para coordinar su movilidad premium en nuestra provincia? Le informo que también puedo brindarle los requisitos obligatorios de reserva si los desea.",
      en: "Welcome to Good Trip Car Rentals Mendoza. I am your executive sales assistant. How may I assist you today in coordinating your premium mobility in our province? I can also provide the mandatory rental requirements if you wish.",
      pt: "Bem-vindo à Good Trip Car Rentals Mendoza. Sou seu assistente executivo de vendas. Como posso ajudá-lo hoje a coordenar sua mobilidade premium em nossa província? Também posso fornecer os requisitos de aluguel obrigatórios se desejar."
    };
    setMessages([{ role: 'assistant', content: welcome[i18n.language] || welcome['es'] }]);
  }, [i18n.language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Manejo de la sugerencia automática si no hay autos disponibles
  useEffect(() => {
    if (!context) return;
    if (context.status === 'no_availability') {
      const suggestions = {
        es: `Estimado cliente, le informo amavelmente que para las fechas solicitadas nuestra flota se encuentra reservada. No obstante, disponemos de una unidad premium libre a partir del día ${context.sugerencia}. ¿Desea que gestionemos su reserva para dicha fecha?`,
        en: `Dear customer, I kindly inform you that our fleet is fully booked for the requested dates. However, we have a premium unit available starting on ${context.sugerencia}. Would you like us to manage your reservation for that date?`,
        pt: `Prezado cliente, informo que nossa frota está reservada para as datas solicitadas. No entanto, temos uma unidade premium disponível a partir do dia ${context.sugerencia}. Deseja que organizemos sua reserva para esta data?`
      };
      setMessages(prev => [...prev, { role: 'assistant', content: suggestions[i18n.language] || suggestions['es'] }]);
    }
  }, [context, i18n.language]);

  const handleWhatsAppClick = () => {
    const message = "Hola, me encuentro en la plataforma web de Good Trip Car Rentals y deseo recibir asistencia personalizada con un asesor.";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 🛠️ REPARADO: Reemplazado localhost fijo por la variable inteligente apiUrl
      const res = await axios.post(`${apiUrl}/api/chat`, { 
        message: userMessage.content,
        lang: i18n.language,
        userData: userData
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Disculpe el inconveniente, he experimentado una breve interrupción técnica. Si lo prefiere, puede comunicarse directamente vía WhatsApp para recibir asistencia inmediata con nuestro equipo comercial." }]);
    } finally {
      setLoading(false);
    }
  };

  // Traducciones rápidas para la interfaz visual del contenedor de chat
  const uiTexts = {
    es: { bar: "Atención Directa", placeholder: "Escriba su consulta...", help: "¿Desea hablar con un asesor financiero o de reservas? Clic aquí" },
    en: { bar: "Direct Support", placeholder: "Type your inquiry...", help: "Would you like to speak with a booking agent? Click here" },
    pt: { bar: "Suporte Direto", placeholder: "Escreva sua consulta...", help: "Deseja falar com um agente de reservas? Clique aqui" }
  };
  const ui = uiTexts[i18n.language] || uiTexts['es'];

  return (
    /* 📱 RESPONSIVE: En celular reduce márgenes para no flotar incómodamente */
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[1000] font-sans flex flex-col items-end gap-4 max-sm:w-full max-sm:left-0 max-sm:px-4">
      
      {/* BOTÓN WHATSAPP FLOTANTE */}
      {!isOpen && (
        <button 
          onClick={handleWhatsAppClick}
          className="group bg-[#25D366] text-white p-4 rounded-full shadow-[0_15px_30px_rgba(37,211,102,0.3)] hover:scale-110 transition-all active:scale-95 flex items-center gap-3 border-2 border-white cursor-pointer"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
            {ui.bar}
          </span>
          <MessageCircle size={24} />
        </button>
      )}

      {/* BOTÓN APERTURA CHAT IA */}
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="relative group bg-slate-900 text-white p-5 rounded-full shadow-[0_20px_50px_rgba(15,23,42,0.4)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center border-2 border-yellow-500/50 cursor-pointer"
        >
          <Crown size={28} className="text-yellow-500" />
        </button>
      ) : (
        /* 📱 RESPONSIVE MAESTRO: En compu mantiene w-[400px] h-[650px], pero en celulares se expande 
           a pantalla completa ocupando todo el marco táctil de forma ergonómica */
        <div className="bg-white w-full sm:w-[400px] h-[85vh] sm:h-[650px] max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] rounded-[2.5rem] max-sm:rounded-none flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* HEADER DEL CONSERJE */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative max-sm:pt-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg p-1">
                {/* 🛠️ REPARADO: Cambiado src string por la variable importada segura */}
                <img src={logoMendozaRent} alt="Good Trip Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[11px] uppercase tracking-[0.15em] text-slate-100">Good Trip Car Rentals</span>
                <span className="text-[9px] text-yellow-500 flex items-center gap-1 font-black uppercase tracking-widest mt-0.5">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Sales Concierge
                </span>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2.5 rounded-xl transition-all cursor-pointer">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* CUERPO DEL CHAT */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[12.5px] shadow-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none font-medium' 
                    : 'bg-white text-slate-700 border border-slate-200/80 rounded-tl-none font-medium'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="p-2 italic text-[11px] text-slate-400 animate-pulse">Good Trip Assistant está procesando su solicitud...</div>}
          </div>

          {/* BOTÓN ASISTENCIA HUMANA ALTERNATIVA */}
          <div className="px-6 py-2.5 bg-slate-100/70 border-t border-slate-100 flex justify-center text-center">
            <button onClick={handleWhatsAppClick} className="text-[8.5px] font-black text-slate-500 uppercase tracking-[0.12em] hover:text-[#25D366] transition-colors flex items-center gap-2 cursor-pointer leading-tight">
              <Headphones size={13} /> {ui.help}
            </button>
          </div>

          {/* ENTRADA DE TEXTO (Ajustado con padding extra para teclados móviles) */}
          <div className="p-5 bg-white flex gap-3 items-center border-t border-slate-100 max-sm:pb-8">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              className="flex-1 bg-slate-50 rounded-xl px-5 py-3.5 text-sm outline-none border border-slate-200/60 focus:border-yellow-500/50 transition-colors" 
              placeholder={ui.placeholder} 
            />
            <button onClick={handleSend} className="bg-slate-900 text-yellow-500 p-3.5 rounded-xl shadow-md hover:bg-slate-800 transition-colors cursor-pointer">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}