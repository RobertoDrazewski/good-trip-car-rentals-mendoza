import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Se mantiene la importación limpia y corregida
import { Lock, CheckCircle, Loader2, Sparkles, Key, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Componente SetupPassword
 * Permite a los nuevos administradores configurar su contraseña inicial.
 */
const SetupPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert(t('error_passwords_match', 'Las contraseñas no coinciden'));
            return;
        }

        setLoading(true);
        try {
            // 🔌 URL DINÁMICA: Lee la variable de Render en producción o usa localhost de respaldo
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            await axios.post(`${apiUrl}/api/admin/complete-setup`, {
                email,
                password
            });
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error(error);
            alert(t('chat_error', 'Error al configurar la contraseña'));
        } finally {
            setLoading(false);
        }
    };

    // PANTALLA DE ÉXITO TRAS CONFIGURACIÓN (🛠️ ADAPTADA A CELESTE PREMIUM)
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 sm:p-20 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] animate-in zoom-in-95 duration-500 w-full max-w-xl">
                    <div className="w-24 h-24 bg-sky-500/10 border border-sky-100 rounded-full flex items-center justify-center mx-auto mb-8 text-sky-600 shadow-inner">
                        <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black italic text-slate-800 mb-4 uppercase tracking-tighter">
                        {t('setup_success_title', '¡Cuenta Activada!')}
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em]">
                        {t('setup_success_sub', 'Redirigiendo al login...')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        // Fondo general adaptado al degradado oscuro satinado de la landing
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decoración ambiental de fondo con la gama de azules fríos */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-700/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] p-10 md:p-14 relative z-10 border border-slate-100">
                
                {/* ENCABEZADO DE SECCIÓN - CAMBIADO A SLATE Y SKY */}
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
                    {/* CAMPO: NUEVA CONTRASEÑA */}
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

                    {/* CAMPO: CONFIRMAR CONTRASEÑA */}
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

                    {/* BOTÓN DE ACCIÓN: Cambiado a Slate-800 e iluminado en Sky-500 al tacto */}
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