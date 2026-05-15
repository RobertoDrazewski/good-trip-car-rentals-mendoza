import React from 'react';
import { ShieldCheck, Users, Fuel, DollarSign, CreditCard, BookOpen } from 'lucide-react';

export default function Requirements() {
  const reqs = [
    {
      title: "Edad Mínima",
      text: "Para conducir nuestras unidades es necesario ser mayor de 23 años.",
      icon: <Users className="text-yellow-500" size={24} />
    },
    {
      title: "Documentación",
      text: "Licencia de conducir vigente y habilitante para vehículos particulares.",
      icon: <ShieldCheck className="text-yellow-500" size={24} />
    },
    {
      title: "Kilometraje Libre",
      text: "Kilómetros ilimitados en todas las unidades y sin cargo por conductor adicional.",
      icon: <Fuel className="text-yellow-500" size={24} />
    },
    {
      title: "Sin Tarjeta",
      text: "No solicitamos garantía de tarjeta de crédito para concretar el alquiler.",
      icon: <CreditCard className="text-yellow-500" size={24} />
    },
    {
      title: "Garantía",
      text: "Depósito de $450.000 ARS o USD 300 (Reembolsable al finalizar el contrato).",
      icon: <DollarSign className="text-yellow-500" size={24} />
    },
    {
      title: "Guía Turística",
      text: "Le obsequiamos una guía exclusiva para aprovechar sus rutas en Mendoza.",
      icon: <BookOpen className="text-yellow-500" size={24} />
    }
  ];

  return (
    <section id="requisitos" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Requisitos de <span className="text-yellow-500">Alquiler</span>
          </h2>
          <div className="w-24 h-2 bg-yellow-500 mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reqs.map((item, idx) => (
            <div key={idx} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="mb-6 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-lg font-black uppercase italic text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}