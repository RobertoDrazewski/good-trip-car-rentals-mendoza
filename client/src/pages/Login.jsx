import React, { useState } from 'react';
// 🛠️ SOLUCIONADO: Importación corregida de 'ajax' a 'axios' para evitar el SyntaxError de Vite
import axios from 'axios';
import { Lock, User, Key, ArrowLeft, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

/**
 * Componente Login - Optimizado para Dispositivos Móviles
 * Diseño premium adaptativo para la plataforma Good Trip.
 */
export default function Login({ onLoginSuccess }) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const res = await axios.post(`${apiUrl}/api/auth/login`, {
        username: formData.username,
        password: formData.password
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminUser', res.data.username);
      onLoginSuccess();
    } catch (err) {
      alert("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    alert(`Se ha enviado un enlace de recuperación al correo: ${formData.email}`);
    setIsRecovering(false);
  };

  return (
    // Fondo general cambiado al color ultra oscuro nativo de Balanz
    <div className="min-h-screen bg-[#121319] flex items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo con desenfoque alineados a la paleta corporativa */}
      <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-[#88BDF2]/10 blur-[100px] sm:blur-[150px] rounded-full -z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-[#5383B3]/10 blur-[100px] sm:blur-[150px] rounded-full -z-0" />

      {/* TARJETA CONTENEDORA PRINCIPAL - ESTILO BALANZ CARD */}
      <div className="bg-[#1E222F] w-full max-w-md rounded-3xl md:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden p-6 sm:p-10 md:p-14 relative z-10 border border-slate-800/40">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-6 sm:mb-10">
          {/* Contenedor del Candado: Fondo ultra oscuro y candado celeste activo */}
          <div className="bg-[#121319] w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl border border-slate-800/60 rotate-3">
            <Lock className="text-[#88BDF2] w-7 h-7 sm:w-9 sm:h-9" strokeWidth={2.5} />
          </div>
          {/* Títulos alineados con la marca */}
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
            {isRecovering ? 'Recuperar' : 'Good Trip'} <br/>
            <span className="text-[#88BDF2] not-italic">{isRecovering ? 'Acceso' : 'Admin Panel'}</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 opacity-40">
             <ShieldCheck size={12} className="text-[#6F7D93]" />
             <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#6F7D93]">Security System v3.0</p>
          </div>
        </div>

        {!isRecovering ? (
          /* FORMULARIO DE INGRESO */
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-[#666D7E] uppercase tracking-[0.2em] ml-4">Usuario</label>
              <div className="relative group">
                {/* Iconos de foco mutados al celeste acento */}
                <User className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#666D7E] group-focus-within:text-[#88BDF2] transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="admin_mendoza"
                  required
                  className="w-full bg-[#121319] border-2 border-transparent p-4 sm:p-5 pl-12 sm:pl-14 rounded-2xl sm:rounded-[1.8rem] outline-none focus:border-[#88BDF2] text-white placeholder-[#666D7E] transition-all font-black text-sm sm:text-base shadow-inner"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-[#666D7E] uppercase tracking-[0.2em] ml-4">Contraseña</label>
              <div className="relative group">
                <Key className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#666D7E] group-focus-within:text-[#88BDF2] transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#121319] border-2 border-transparent p-4 sm:p-5 pl-12 sm:pl-14 rounded-2xl sm:rounded-[1.8rem] outline-none focus:border-[#88BDF2] text-white placeholder-[#666D7E] transition-all font-black text-sm sm:text-base shadow-inner"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* BOTÓN PRINCIPAL: Esquema Celeste Activo a Azul Muted */}
            <button
              disabled={loading}
              className="w-full bg-[#88BDF2] text-[#121319] py-4 sm:py-5 rounded-2xl sm:rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-[#5383B3] hover:text-white transition-all active:scale-95 disabled:bg-slate-800 disabled:text-[#666D7E] flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin text-[#121319]" size={20} />
              ) : (
                <>
                  <Sparkles size={16} /> Ingresar al Panel
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsRecovering(true)}
              className="w-full text-[9px] sm:text-[10px] text-[#6F7D93] font-black uppercase tracking-widest hover:text-[#88BDF2] transition-colors py-2 touch-manipulation cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          /* FORMULARIO DE RECUPERACIÓN */
          <form onSubmit={handleRecover} className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <p className="text-xs sm:text-sm text-[#6F7D93] text-center font-bold leading-relaxed italic px-2 sm:px-4">
              Ingresá tu email para enviarte las instrucciones de seguridad.
            </p>
            <input
              type="email"
              placeholder="tu-email@ejemplo.com"
              required
              className="w-full bg-[#121319] border-2 border-transparent p-4 sm:p-5 rounded-2xl sm:rounded-[1.8rem] outline-none focus:border-[#88BDF2] text-white placeholder-[#666D7E] font-black text-sm sm:text-base shadow-inner"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {/* Botón de envío modificado al esquema Balanz */}
            <button className="w-full bg-[#88BDF2] text-[#121319] hover:bg-[#5383B3] hover:text-white py-4 sm:py-5 rounded-2xl sm:rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all cursor-pointer">
              Enviar Recuperación
            </button>
            <button
              type="button"
              onClick={() => setIsRecovering(false)}
              className="flex items-center justify-center gap-2 w-full text-[9px] sm:text-[10px] text-[#6F7D93] font-black uppercase tracking-widest hover:text-white transition-colors py-2 touch-manipulation cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver al Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}