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
            // 🔌 URL DINÁMICA: Lee la variable de Render en producción, o usa localhost en tu Mac
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

    // Pantalla de éxito tras configuración correcta
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-20 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-900 shadow-xl shadow-yellow-500/20">
                        <CheckCircle size={48} strokeWidth={3} />
                    </div>
                    <h1 className="text-5xl font-black italic text-slate-900 mb-4 uppercase tracking-tighter">
                        {t('setup_success_title', '¡Cuenta Activada!')}
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em]">
                        {t('setup_success_sub', 'Redirigiendo al login...')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decoración ambiental de fondo */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-10 md:p-14 relative z-10 border border-slate-100">
                
                {/* ENCABEZADO DE SECCIÓN */}
                <div className="text-center mb-10">
                    <div className="bg-yellow-500 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20 -rotate-3">
                        <Key className="text-slate-900" size={36} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        {t('setup_title', 'Configurar')} <br/>
                        <span className="text-yellow-500">{t('setup_subtitle', 'Contraseña')}</span>
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                         <ShieldCheck size={12} className="text-slate-400" />
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                            <input 
                                type="password" 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-yellow-500 focus:bg-white transition-all font-bold text-slate-800"
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
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
                            <input 
                                type="password" 
                                required
                                className="w-full bg-slate-50 border-2 border-transparent p-5 pl-14 rounded-[1.8rem] outline-none focus:border-yellow-500 focus:bg-white transition-all font-bold text-slate-800"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-yellow-500 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-yellow-500 hover:text-slate-900 transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
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