import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Componente ChatIA
 * @param {boolean} isOpen - Controla la visibilidad del chat.
 * @param {function} setIsOpen - Función para actualizar el estado de visibilidad.
 * @param {object} context - Datos de contexto (ej. disponibilidad o nombre cliente).
 * @param {object} userData - Información del usuario para la IA.
 */
export default function ChatIA({ isOpen, setIsOpen, context, userData }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Inicialización de bienvenida con soporte multi-idioma
  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('chat_welcome') }]);
  }, [i18n.language, t]);

  // Scroll automático al final cuando llegan mensajes o cambia el estado de carga
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Manejo de lógica de contexto dinámico (Disponibilidad y Follow-up)
  useEffect(() => {
    if (!context) return;

    if (context.cliente && !context.status) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('chat_followup', { name: context.cliente }) 
      }]);
    }

    if (context.status === 'no_availability') {
      const suggestions = {
        es: `¡Hola! Che, te cuento que para esas fechas ya tengo los autos reservados 🤦‍♂️. Pero si te sirve, se me libera uno el día **${context.sugerencia}**. ¿Te gustaría que te lo guarde para esa fecha?`,
        en: `Hi! I'm sorry, but for those dates all cars are already booked 🤦‍♂️. However, I will have one available on **${context.sugerencia}**. Would you like me to hold it for you?`,
        pt: `Olá! Desculpe, mas para essas datas todos os carros já estão reservados 🤦‍♂️. Mas terei um disponível no dia **${context.sugerencia}**. Gostaria que eu reservasse para você?`
      };

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: suggestions[i18n.language] || suggestions['es'] 
      }]);
    }
  }, [context, t, i18n.language]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/chat', { 
        message: userMessage.content,
        lang: i18n.language,
        userData: userData, 
        userName: context?.cliente || 'Usuario',
        noAvailabilityMode: context?.status === 'no_availability'
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('chat_error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] font-sans">
      {!isOpen ? (
        <button 
          type="button"
          onClick={() => setIsOpen(true)} 
          className="relative group bg-yellow-500 text-slate-900 p-5 rounded-full shadow-[0_20px_50px_rgba(234,179,8,0.4)] hover:scale-110 transition-all active:scale-95 flex items-center justify-center border-4 border-white cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-20"></span>
          <MessageCircle size={32} className="relative z-10" />
        </button>
      ) : (
        <div className="bg-white w-[380px] h-[600px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] rounded-[2.5rem] flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* HEADER REPARADO */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative">
            <div className="flex items-center gap-3 z-10">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 shadow-inner">
                <Sparkles size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs uppercase tracking-widest leading-none mb-1">Good Trip IA</span>
                <span className="text-[10px] text-yellow-500 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span> {t('online_status')}
                </span>
              </div>
            </div>

            {/* BOTÓN X CORREGIDO */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Evita interferencias con el contenedor
                setIsOpen(false);
              }} 
              className="z-20 bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl transition-all cursor-pointer border border-white/5 active:scale-90"
              title="Cerrar chat"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* CUERPO DE CHAT */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.6rem] text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none font-medium'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT MEJORADO */}
          <div className="p-6 bg-white border-t border-slate-100 flex gap-3 items-center">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              disabled={loading}
              className="flex-1 bg-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-yellow-500/10 focus:bg-white transition-all disabled:opacity-50 font-medium placeholder:text-slate-400" 
              placeholder={t('chat_placeholder')} 
            />
            <button 
              type="button"
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-yellow-500 hover:text-slate-900 transition-all active:scale-95 disabled:bg-slate-200 shadow-xl shadow-slate-900/10 group cursor-pointer"
            >
              <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}