import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket as TicketIcon, Printer } from 'lucide-react';

export default function Ticket({ data }) {
  const { t } = useTranslation();

  if (!data) return null;

  // Calculamos el monto total a entregar (Alquiler + Garantía)
  const montoEntregaReal = data.total + (data.garantia || 450000);

  return (
    <div className="relative group max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
      {/* Botón flotante para imprimir (Opcional) */}
      <button 
        onClick={() => window.print()} 
        className="absolute -right-4 -top-4 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-all md:flex hidden"
      >
        <Printer size={16} />
      </button>

      <div className="bg-white border-2 border-dashed border-gray-300 p-8 rounded-xl shadow-inner font-mono relative overflow-hidden">
        {/* Decoración de papel cortado superior */}
        <div className="absolute top-0 left-0 right-0 h-1 flex justify-around">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-50 rounded-full -translate-y-2 border border-gray-200"></div>
          ))}
        </div>

        <div className="text-center mb-6 border-b-2 border-gray-100 pb-4">
          <h2 className="font-black text-xl tracking-tighter text-gray-900">MENDOZA RENT-A-CAR</h2>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Mendoza, Argentina</p>
        </div>

        <div className="space-y-3 text-[12px] text-gray-700">
          <div className="flex justify-between border-b border-gray-50 py-1">
            <span className="text-gray-400">{t('label_retiro')}:</span> 
            <strong className="text-gray-900">{data.inicio}</strong>
          </div>
          <div className="flex justify-between border-b border-gray-50 py-1">
            <span className="text-gray-400">{t('label_devolucion')}:</span> 
            <strong className="text-gray-900">{data.fin}</strong>
          </div>
          <div className="flex justify-between border-b border-gray-50 py-1">
            <span className="text-gray-400">{t('lugar_retiro')}:</span> 
            <strong className="text-gray-900 uppercase">{data.retiro || data.entrega}</strong>
          </div>

          <div className="pt-4 space-y-1">
            <div className="flex justify-between font-bold text-gray-800">
              <span>{t('nav_reserva')}:</span> 
              <span>${data.total.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-blue-600 font-bold italic">
              <span>{t('label_garantia')}:</span> 
              <span>+${(data.garantia || 450000).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="mt-6 bg-gray-900 text-white p-4 rounded-lg text-center">
            <p className="text-[9px] uppercase tracking-widest opacity-70 mb-1">{t('total_entrega')}</p>
            <p className="text-lg font-black tracking-tight">
              ${montoEntregaReal.toLocaleString('es-AR')} ARS
            </p>
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-[10px] text-gray-400 italic">
            "Atención personalizada de Mauricio Manoni"
          </p>
          <div className="flex justify-center gap-1 opacity-20">
             {[...Array(20)].map((_, i) => <div key={i} className="w-1 h-4 bg-black"></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}