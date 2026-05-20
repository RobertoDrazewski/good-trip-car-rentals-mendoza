import React from 'react';
import { ShieldCheck, Users, Fuel, CreditCard, MapPin, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Requirements() {
  const { t } = useTranslation();

  const reqs = [
    { title: t('req_conditions_title', "Condiciones Mínimas"), text: t('req_conditions_text', "Ser mayor de 23 años con licencia física vigente. El período mínimo de alquiler es de 3 días."), icon: <Users size={16} /> },
    { title: t('req_doc_title', "Seguro y Documentación"), text: t('req_doc_text', "El auto cuenta con seguro para alquilar sin chofer, contrato formal y tarjeta verde para circular sin inconvenientes."), icon: <ShieldCheck size={16} /> },
    { title: t('req_km_title', "Kilómetros y Conductores"), text: t('req_km_text', "Los kilómetros son ilimitados en todas las unidades y no se cobra ningún cargo por conductor adicional."), icon: <Car size={16} /> },
    { title: t('req_fuel_title', "Política de Combustible"), text: t('req_fuel_text', "La unidad se entrega con tanque lleno de nafta INFINIA y se debe devolver exactamente de igual manera."), icon: <Fuel size={16} /> },
    { title: t('req_delivery_title', "Logística y Entregas"), text: t('req_delivery_text', "Entrega sin cargo en tu hospedaje (Gran Mendoza). Retiro/devolución en aeropuerto tiene un costo único total de $36.000."), icon: <MapPin size={16} /> },
    { title: t('req_warranty_title', "Garantía y Pagos"), text: t('req_warranty_text', "Sin tarjeta de crédito. Depósito de garantía de $450.000 ARS o USD 300 (Reembolsable íntegramente al finalizar)."), icon: <CreditCard size={16} /> }
  ];

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      {/* Columna única con espaciado ajustado para caber en ~480px */}
      <div className="flex flex-col gap-2 h-full">
        {reqs.map((item, idx) => (
          <div 
            key={idx} 
            className="flex-1 p-3 rounded-2xl bg-[#121319]/60 backdrop-blur-md border border-white/5 shadow-lg flex items-center gap-3 hover:border-[#88BDF2]/30 transition-all duration-300 min-h-0"
          >
            {/* Icono con fondo estilo carrusel, tamaño fijo */}
            <div className="p-2.5 bg-[#1E222F] rounded-xl text-[#88BDF2] border border-white/5 flex-shrink-0">
              {item.icon}
            </div>
            
            {/* Contenido con truncado de texto si es necesario */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic truncate">
                {item.title}
              </h3>
              <p className="text-[9px] text-[#A0AEC0] font-medium leading-tight line-clamp-2">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}