import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle, Loader2, Sparkles, Key, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Componente SetupPassword
 * Permite a los nuevos administradores configurar su contraseña inicial de forma segura.
 */
const SetupPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    
    // Captura el email de la URL y le limpia espacios ocultos o mayúsculas molestas
    const emailRaw = searchParams.get('email') || '';
    const email = emailRaw.trim().toLowerCase();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');
    const [generatedUsername, setGeneratedUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert(t('error_passwords_match', 'Las contraseñas no coinciden'));
            return;
        }

        if (password.length < 6) {
            alert(t('error_password_short', 'La contraseña debe tener al menos 6 caracteres'));
            return;
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Despachamos la petición al endpoint unificado del Backend
            const response = await axios.post(`${apiUrl}/api/admin/complete-setup`, {
                email: email,
                password: password
            });

            if (response.data && response.data.status === 'success') {
                // Capturamos el username real devuelto por la consulta select de MySQL
                const usernameAsignado = response.data.username || email.split('@')[0];
                setGeneratedUsername(usernameAsignado);
                setStatus('success');
                
                // Damos 6 segundos físicos para que el operador copie su usuario de la tarjeta verde
                setTimeout(() => {
                    navigate('/login');
                }, 6000);
            } else {
                alert("El servidor no devolvió una respuesta de éxito confirmada.");
            }
        } catch (error) {
            console.error("❌ Error detectado en el submit de SetupPassword:", error);
            // REPARADO: Captura el mensaje real descriptivo del Backend para no disparar alertas ciegas de ayuda
            const errorServer = error.response?.data?.error || 'No se pudo conectar con el servidor central.';
            alert(`${t('chat_error', 'Fallo estructural al activar:')} ${errorServer}`);
        } finally {
            setLoading(false);
        }
    };

    // PANTALLA DE ÉXITO PREMIUM (Muestra el usuario real recuperado de la Base de Datos)
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-6 text-center animate-fade-in">
                <div className="bg-white p-10 sm:p-16 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] animate-in zoom-in-95 duration-500 w-full max-w-xl">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
                        <CheckCircle size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black italic text-slate-800 mb-2 uppercase tracking-tighter">
                        ¡Cuenta Activada!
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-6">
                        Tu credencial operativa quedó registrada con éxito en el sistema
                    </p>

                    {/* RECUADRO DE USUARIO OPERATIVO ASIGNADO */}
                    <div className="bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl max-w-sm mx-auto mb-6 text-left flex items-center gap-4 shadow-inner">
                        <div className="bg-slate-800 p-2.5 rounded-xl text-sky-400 flex-shrink-0">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tu Usuario oficial para ingresar:</p>
                            <p className="text-base font-mono font-black text-slate-800 mt-0.5 tracking-tight selection:bg-sky-200">{generatedUsername}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="animate-spin text-sky-500" size={14} />
                        <p className="font-bold uppercase text-[9px] tracking-[0.3em]">
                            Redirigiendo al panel de inicio de sesión...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-700/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] p-10 md:p-14 relative z-10 border border-slate-100">
                
                <div className="text-center mb-10">
                    <div className="bg-slate-800 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/10 -rotate-3">
                        <Key className="text-sky-400" size={36} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
                        {t('setup_title', 'Configurar')} <br/>
                        <span className="text-sky-500">{t('setup_subtitle', 'Contraseña')}</span>
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                         <ShieldCheck size={12} className="text-slate-400" />
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 truncate max-w-[250px]">
                            {email}
                         </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 italic">
                            {t('label_new_password', 'Nueva Contraseña')}
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                            <input 
                                type="password" 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-sky-500 focus:bg-white transition-all font-black text-slate-800 shadow-inner"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 italic">
                            {t('label_confirm_password', 'Confirmar')}
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                            <input 
                                type="password" 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-sky-500 focus:bg-white transition-all font-black text-slate-800 shadow-inner"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-800 text-sky-400 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-sky-500 hover:text-white transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-2 group cursor-pointer touch-manipulation"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white" size={20} />
                        ) : (
                            <>
                                <Sparkles size={16} /> {t('btn_activate', 'ACTIVAR MI CUENTA')}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupPassword;