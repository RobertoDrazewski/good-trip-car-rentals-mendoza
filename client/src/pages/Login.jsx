import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, Key, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * Componente Login
 * Diseñado con la estética premium de Good Trip.
 * Maneja el acceso al panel administrativo y la recuperación de contraseña.
 */
export default function Login({ onLoginSuccess }) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', {
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo para profundidad visual */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full -z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[150px] rounded-full -z-0" />

      <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden p-10 md:p-14 relative z-10 border border-slate-100">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-10">
          <div className="bg-yellow-500 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20 rotate-3">
            <Lock className="text-slate-900" size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
            {isRecovering ? 'Recuperar' : 'Good Trip'} <br/>
            <span className="text-yellow-500">{isRecovering ? 'Acceso' : 'Admin Panel'}</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-30">
             <ShieldCheck size={12} className="text-slate-400" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security System v3.0</p>
          </div>
        </div>

        {!isRecovering ? (
          /* FORMULARIO DE LOGIN */
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Usuario</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="admin_mendoza"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-yellow-500 focus:bg-white transition-all font-bold text-slate-800"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Contraseña</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-yellow-500 focus:bg-white transition-all font-bold text-slate-800"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-yellow-500 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-yellow-500 hover:text-slate-900 transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={16} /> Ingresar al Panel
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsRecovering(true)}
              className="w-full text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-yellow-600 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          /* FORMULARIO DE RECUPERACIÓN */
          <form onSubmit={handleRecover} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <p className="text-sm text-slate-500 text-center font-medium leading-relaxed italic px-4">
              Ingresá tu email para enviarte las instrucciones de seguridad.
            </p>
            <input
              type="email"
              placeholder="tu-email@ejemplo.com"
              required
              className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-[1.8rem] outline-none focus:border-yellow-500 font-bold text-slate-800"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <button className="w-full bg-yellow-500 text-slate-900 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl">
              Enviar Recuperación
            </button>
            <button
              type="button"
              onClick={() => setIsRecovering(false)}
              className="flex items-center justify-center gap-2 w-full text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} /> Volver al Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}