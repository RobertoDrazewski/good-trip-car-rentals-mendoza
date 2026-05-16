import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  DollarSign, Car, Users, Calendar as CalendarIcon, BarChart3, 
  LogOut, Trash2, Activity, Navigation, Map as MapIcon,
  Settings, Plus, MessageCircle, Save, CheckCircle, 
  Sparkles, ChevronLeft, ChevronRight, User, Clock, ShieldCheck, FileText, UserPlus,
  Home // 🔥 Agregado para el ruteo al inicio público
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// 🔌 URL INTELIGENTE: Lee la variable de Render en producción, o usa localhost en tu Mac
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminDashboard() {
  // --- 1. ESTADOS PRINCIPALES EN LA RAÍZ (SEGURIDAD DE HOOKS CONTRA BUG DE RENDER) ---
  const [activeTab, setActiveTab] = useState('ventas');
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [reservas, setReservas] = useState([]);
  const [autos, setAutos] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [metrics, setMetrics] = useState({ ingresosTotales: 0, totalReservas: 0 });
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [preciosMes, setPreciosMes] = useState({});
  const [rutas, setRutas] = useState([]);
  
  // Estados Cartográficos Globalizados en la Raíz
  const [rutaMapaSeleccionada, setRutaMapaSeleccionada] = useState(null);
  const [puntoOrigenMapa, setPuntoOrigenMapa] = useState('aeropuerto');

  const [newRuta, setNewRuta] = useState({ nombre: '', descripcion: '', imagen: null, maps_url: '' });
  const [showAddAuto, setShowAddAuto] = useState(false);
  const [newAuto, setNewAuto] = useState({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
  const [newAdmin, setNewAdmin] = useState({ nombre: '', email: '' });

  const mesesNom = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

  // Coordenadas fijas estratégicas para el motor de mapas de Google
  const puntosEntregaCoordenadas = {
    aeropuerto: "Aeropuerto Internacional Gobernador Francisco Gabrielli, Mendoza",
    km0: "Kilómetro 0, Av. San Martín y Garibaldi, Mendoza"
  };

  const fetchData = async () => {
    try {
      const [resDash, resAdmins, resPrecios, resRutas] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/dashboard`, config),
        axios.get(`${apiUrl}/api/admin/users`, config).catch(() => ({data: []})),
        axios.get(`${apiUrl}/api/admin/precios-mensuales`, config).catch(() => ({data: []})),
        axios.get(`${apiUrl}/api/routes/all`).catch(() => ({data: []}))
      ]);
      setReservas(resDash.data.reservas || []);
      setAutos(resDash.data.autos || []);
      setSettings(resDash.data.settings || {});
      setMetrics(resDash.data.metrics || { ingresosTotales: 0, totalReservas: 0 });
      setAdmins(resAdmins.data || []);
      
      const listaRutas = resRutas.data || [];
      setRutas(listaRutas);
      
      // Inicializar la ruta cartográfica si el estado superior está vacío
      if (listaRutas.length > 0 && !rutaMapaSeleccionada) {
        setRutaMapaSeleccionada(listaRutas[0]);
      }

      const mapa = {};
      if (Array.isArray(resPrecios.data)) resPrecios.data.forEach(p => { mapa[p.mes] = p; });
      setPreciosMes(mapa);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 🔒 LOGOUT MEJORADO: Ahora redirige directo a la página de inicio pública (Home)
  const handleLogout = () => { 
    localStorage.clear(); 
    window.location.href = '/'; 
  };

  const handleAction = async (method, url, data = null) => {
    try {
      if (method === 'post') await axios.post(url, data, config);
      if (method === 'delete') await axios.delete(url, config);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // 🛠️ GENERADOR TRASLADO DINÁMICO CRUCIAL DE DISTANCIAS DE GOOGLE MAPS DIRECTIONS MAPS (REPARADO)
  const obtenerUrlEnrutamientoDinamico = (ruta) => {
    if (!ruta) return "https://maps.google.com/maps?q=Mendoza,Argentina&z=12&output=embed";
    
    const origenDireccion = puntosEntregaCoordenadas[puntoOrigenMapa];
    try {
      const destinoLimpio = encodeURIComponent(ruta.titulo + ", Mendoza, Argentina");
      const origenLimpio = encodeURIComponent(origenDireccion);
      // CORREGIDO: Se restauró la interpolación de JS original `${origenLimpio}` sin romper las llaves de Maps
      return `https://maps.google.com/maps?saddr=$saddr=${origenLimpio}&daddr=${destinoLimpio}&noheader=true&z=11&output=embed`;
    } catch (error) {
      return "https://maps.google.com/maps?q=Mendoza,Argentina&z=12&output=embed";
    }
  };

  // 🛠️ 1. VISUALIZAR PRESUPUESTO PREMIUM ESTILO QUOTE-RESULT + REQUISITOS + LOGO (A4 - 1 CARILLA)
  const descargarTicketPresupuesto = (reserva) => {
    try {
      const f1 = new Date(String(reserva.fecha_inicio).substring(0, 10));
      const f2 = new Date(String(reserva.fecha_fin).substring(0, 10));
      const diasCalculados = Math.ceil(Math.abs(f2 - f1) / (1000 * 60 * 60 * 24)) || 1;

      const totalARS = parseFloat(reserva.monto_total_ars || 0).toLocaleString('es-AR');
      const cotizacionDolar = parseFloat(reserva.tasa_dolar_usada || 1400).toLocaleString('es-AR');
      const garantiaUSD = parseFloat(reserva.garantia_usd || 300);
      const garantiaARS = (garantiaUSD * parseFloat(reserva.tasa_dolar_usada || 1400)).toLocaleString('es-AR');
      
      const isAeropuertoEntrega = String(reserva.lugar_retiro || '').toLowerCase().includes('aeropuerto');
      const isAeropuertoDevolucion = String(reserva.lugar_devolucion || '').toLowerCase().includes('aeropuerto');
      const tieneSillita = reserva.sillita === 1 || reserva.sillita === true || String(reserva.sillita) === '1' || String(reserva.sillita) === 'true';

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Presupuesto_${reserva.cliente_nombre ? reserva.cliente_nombre.replace(/\\s+/g, '_') : 'Reserva'}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
              
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: 'Inter', sans-serif; 
                background-color: #f8fafc; 
                color: #0f172a;
                padding: 30px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
              }
              
              .no-print-bar {
                margin-bottom: 20px;
                display: flex;
                gap: 15px;
              }
              .btn-print {
                background-color: #eab308;
                color: #0f172a;
                font-weight: 900;
                border: none;
                padding: 12px 30px;
                border-radius: 50px;
                cursor: pointer;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 1px;
                box-shadow: 0 4px 12px rgba(234,179,8,0.3);
                transition: all 0.2s;
              }
              .btn-print:hover {
                background-color: #0f172a;
                color: #ffffff;
              }
              .btn-close {
                background-color: #e2e8f0;
                color: #475569;
                font-weight: 700;
                border: none;
                padding: 12px 20px;
                border-radius: 50px;
                cursor: pointer;
                text-transform: uppercase;
                font-size: 11px;
              }

              .ticket-container {
                width: 100%;
                max-w: 700px;
                background: #ffffff;
                padding: 40px;
                border-radius: 24px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                border: 1px solid #e2e8f0;
              }

              .logo-container {
                text-align: center;
                margin-bottom: 15px;
              }
              .logo-img {
                height: 65px;
                object-fit: contain;
              }
              .logo-alt {
                font-weight: 900;
                font-size: 22px;
                font-style: italic;
                letter-spacing: -1px;
                text-transform: uppercase;
              }
              .logo-alt span { color: #eab308; }

              .tag-status {
                background-color: rgba(234, 179, 8, 0.1);
                color: #a16207;
                font-weight: 900;
                text-transform: uppercase;
                font-size: 9px;
                letter-spacing: 1px;
                padding: 5px 14px;
                border-radius: 50px;
                width: max-content;
                margin: 0 auto 15px auto;
              }

              .title-main {
                font-size: 22px;
                font-weight: 900;
                text-transform: uppercase;
                font-style: italic;
                text-align: center;
                margin-bottom: 4px;
                tracking: -0.5px;
              }
              .title-main span { color: #eab308; }
              
              .subtitle {
                color: #94a3b8;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                text-align: center;
                margin-bottom: 25px;
              }

              .grid-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 12px;
              }
              
              .info-card {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 12px;
                padding: 12px;
                display: flex;
                gap: 10px;
                align-items: flex-start;
              }
              .info-card .icon { font-size: 18px; line-height: 1; }
              .info-card .label { font-size: 8.5px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
              .info-card .value { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-top: 1px; }
              .info-card .subtext { font-size: 10.5px; color: #64748b; margin-top: 1px; }

              .full-width { grid-column: span 2; }
              
              .garantia-card {
                border-left: 4px solid #3b82f6;
                background-color: #eff6ff;
              }
              .garantia-card .label { color: #2563eb; }
              .garantia-card .warning-text { font-size: 10px; color: #1e40af; margin-top: 4px; line-height: 1.3; font-weight: 600; }

              .total-box {
                background-color: #0f172a;
                color: #ffffff;
                padding: 18px;
                border-radius: 14px;
                text-align: center;
                margin-top: 15px;
              }
              .total-box .total-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #eab308; letter-spacing: 2px; margin-bottom: 2px; }
              .total-box .total-amount { font-size: 28px; font-weight: 900; font-style: italic; }
              .total-box .total-amount span { font-size: 13px; font-style: normal; color: #94a3b8; font-weight: 700; margin-left: 3px; }
              .total-box .exchange-rate { font-size: 8.5px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-top: 4px; }

              .requisitos-section {
                margin-top: 25px;
                border-top: 1px dashed #e2e8f0;
                padding-top: 20px;
              }
              .requisitos-title {
                font-size: 11px;
                font-weight: 900;
                text-transform: uppercase;
                font-style: italic;
                letter-spacing: 1px;
                text-align: center;
                margin-bottom: 15px;
                color: #0f172a;
              }
              .requisitos-maestros-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              .req-horizontal-row {
                display: grid;
                grid-template-cols: repeat(3, 1fr);
                gap: 10px;
              }
              .req-box-compact {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                padding: 10px;
                border-radius: 10px;
              }
              .req-box-compact .req-head { 
                font-size: 8.5px; 
                font-weight: 900; 
                text-transform: uppercase; 
                color: #0f172a; 
                margin-bottom: 2px;
              }
              .req-box-compact .req-body { 
                font-size: 10.5px; 
                color: #475569; 
                line-height: 1.2; 
                font-weight: 600; 
              }

              .footer-ticket {
                margin-top: 25px;
                border-top: 1px solid #f1f5f9;
                padding-top: 15px;
                text-align: center;
                font-size: 9.5px;
                font-weight: 900;
                color: #94a3b8;
                letter-spacing: 1.5px;
                text-transform: uppercase;
              }

              @media print {
                .no-print-bar { display: none !important; }
                body { background: #ffffff; padding: 0; }
                .ticket-container { box-shadow: none !important; border: none !important; padding: 0 !important; }
              }
            </style>
          </head>
          <body>
            <div class="no-print-bar">
              <button onclick="window.print()" class="btn-print">🖨️ Imprimir Presupuesto</button>
              <button onclick="window.close()" class="btn-close">Cerrar</button>
            </div>

            <div class="ticket-container">
              <div class="logo-container">
                <img src="${apiUrl}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'; document.getElementById('alt-logo-text').style.display='block';" />
                <div id="alt-logo-text" class="logo-alt" style="display:none;">Good Trip <span>Car Rentals Mendoza</span></div>
              </div>

              <div class="tag-status">✨ Cotización Oficial Reservada</div>

              <h3 class="title-main">Tu Resumen de <span>Viaje</span></h3>
              <p class="subtitle">Hola ${reserva.cliente_nombre || 'Cliente'}, revisá las condiciones de tu alquiler:</p>

              <div class="grid-details">
                
                <div class="info-card">
                  <span class="icon">🚗</span>
                  <div>
                    <p class="label">Vehículo solicitado</p>
                    <p class="value">${reserva.auto_modelo || 'Vehículo de Flota'}</p>
                    <p class="subtext">Duración: ${diasCalculados} ${diasCalculados === 1 ? 'Día' : 'Días'}</p>
                  </div>
                </div>

                <div class="info-card">
                  <span class="icon">👶</span>
                  <div>
                    <p class="label">Opcional Sillita de Bebé</p>
                    <p class="value">${tieneSillita ? '✔️ Adicionada' : '❌ No Solicitada'}</p>
                  </div>
                </div>

                <div class="info-card">
                  <span class="icon">${isAeropuertoEntrega ? '✈️' : '🏢'}</span>
                  <div>
                    <p class="label">Lugar de Entrega</p>
                    <p class="value">${reserva.lugar_retiro || 'Mendoza Ciudad'}</p>
                    <p class="subtext">📅 ${String(reserva.fecha_inicio || '').substring(0,10)} • ⏱️ ${String(reserva.hora_inicio || '').substring(0,5)} hs</p>
                  </div>
                </div>

                <div class="info-card">
                  <span class="icon">${isAeropuertoDevolucion ? '✈️' : '🏢'}</span>
                  <div>
                    <p class="label">Lugar de Devolución</p>
                    <p class="value">${reserva.lugar_devolucion || 'Mendoza Ciudad'}</p>
                    <p class="subtext">📅 ${String(reserva.fecha_fin || '').substring(0,10)} • ⏱️ ${String(reserva.hora_fin || '').substring(0,5)} hs</p>
                  </div>
                </div>

                <div class="info-card full-width garantia-card">
                  <span class="icon">🛡️</span>
                  <div>
                    <p class="label">Franquicia de Garantía Reembolsable</p>
                    <p class="value" style="font-size: 14px;">$ ${garantiaARS} <span>ARS (${garantiaUSD} USD)</span></p>
                    <p class="warning-text">⚠️ IMPORTANTE: La garantía se paga en el momento de entrega del vehículo para concretar el bloqueo seguro de la unidad. El depósito se reembolsa de forma íntegra al finalizar el contrato.</p>
                  </div>
                </div>

              </div>

              <div class="total-box">
                <p class="total-label">Total Final Alquiler + Garantía</p>
                <p class="total-amount">$ ${totalARS} <span>ARS</span></p>
                <p class="exchange-rate">Tasa de cambio de referencia: $ ${cotizacionDolar} ARS por USD</p>
              </div>

              <div class="requisitos-section">
                <h4 class="requisitos-title">📋 REQUISITOS OBLIGATORIOS DE ALQUILER</h4>
                
                <div class="requisitos-maestros-container">
                  
                  <div class="req-horizontal-row">
                    <div class="req-box-compact">
                      <p class="req-head">👤 EDAD MÍNIMA</p>
                      <p class="req-body">Ser mayor de 23 años para conducir.</p>
                    </div>
                    <div class="req-box-compact">
                      <p class="req-head">🪪 DOCUMENTACIÓN</p>
                      <p class="req-body">Licencia de conducir física y vigente.</p>
                    </div>
                    <div class="req-box-compact">
                      <p class="req-head">♾️ KM LIBRE</p>
                      <p class="req-body">Kilómetros ilimitados sin cargos extras.</p>
                    </div>
                  </div>

                  <div class="req-horizontal-row">
                    <div class="req-box-compact">
                      <p class="req-head">💳 SIN TARJETA</p>
                      <p class="req-body">No exigimos tarjeta de crédito.</p>
                    </div>
                    <div class="req-box-compact">
                      <p class="req-head">💵 GARANTÍA</p>
                      <p class="req-body">Depósito de $450K o u$s300 reembolsable.</p>
                    </div>
                    <div class="req-box-compact">
                      <p class="req-head">🐩 PET FRIENDLY</p>
                      <p class="req-body">¡Tu caniche o mascota viaja gratis!</p>
                    </div>
                  </div>

                </div>
              </div>

              <div class="footer-ticket">
                Good Trip Car Rentals Mendoza • Good Trip
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      alert("No se pudo abrir el visor.");
    }
  };

  // 🛠️ 2. DISPARAR TEXTO FORMATEADO Y COPIADO AUTOMÁTICO EN PORTAPAPELES PARA EL FLUJO HÍBRIDO HASTA ADJUNTAR EL PDF
  const enviarTicketPorWhatsApp = (reserva) => {
    try {
      const totalARS = parseFloat(reserva.monto_total_ars || 0).toLocaleString('es-AR');
      const textoCajaEnvio = `Hola *${reserva.cliente_nombre.toUpperCase()}*! Te habla Mauricio de Mendoza Rent-a-Car. A continuación te adjunto el Presupuesto Oficial en formato PDF con todos los detalles de tu viaje y los requisitos de alquiler:`;
      const textoDesgloseCopiado = `📋 PRESUPUESTO MENDOZA RENT-A-CAR\n\nCliente: ${reserva.cliente_nombre}\nVehículo: ${reserva.auto_modelo || 'Unidad de Flota'}\nMonto Total Alquiler: $${totalARS} ARS\n\n(Guardá el PDF adjunto para revisar las bases, condiciones y la guía turística de regalo!)`;
      navigator.clipboard.writeText(textoDesgloseCopiado).catch(() => {});

      const whatsappUrl = `https://wa.me/${String(reserva.cliente_whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textoCajaEnvio)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 gap-6"><Activity className="text-yellow-500 animate-pulse" size={64} /><span className="text-yellow-500 font-black tracking-[0.3em] italic text-xl uppercase">Mendoza Rent Pro...</span></div>;

  return (
    <div className="flex min-h-screen w-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-slate-900 p-8 flex flex-col sticky top-0 h-screen border-r border-white/5 z-40">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-500 p-2 rounded-xl"><Activity className="text-slate-900" size={24} /></div>
          <span className="text-white font-black italic text-2xl tracking-tighter uppercase">Mendoza<span className="text-yellow-500">Rent</span></span>
        </div>

        {/* 🔥 BOTÓN PARA DIRECCIONAR DIRECTO AL HOME SIN TOCAR NADA MÁS */}
        <div className="mb-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-4 px-7 py-3 bg-slate-800 hover:bg-slate-700/80 text-yellow-500 rounded-[1.2rem] transition-all font-black text-[10px] uppercase tracking-wider shadow-inner cursor-pointer"
          >
            <Home size={18} /> Volver a la Web
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavBtn active={activeTab==='ventas'} label="Ventas & Leads" icon={<BarChart3 size={20}/>} onClick={()=>setActiveTab('ventas')}/>
          <NavBtn active={activeTab==='calendario'} label="Calendario" icon={<CalendarIcon size={20}/>} onClick={()=>setActiveTab('calendario')}/>
          <NavBtn active={activeTab==='rutas'} label="Gestión Rutas" icon={<Navigation size={20}/>} onClick={()=>setActiveTab('rutas')}/>
          <NavBtn active={activeTab==='mapa'} label="Mapa Mendoza" icon={<MapIcon size={20}/>} onClick={()=>setActiveTab('mapa')}/>
          <NavBtn active={activeTab==='flota'} label="Flota Vehicular" icon={<Car size={20}/>} onClick={()=>setActiveTab('flota')}/>
          <NavBtn active={activeTab==='precios'} label="Tarifas multi-año" icon={<Settings size={20}/>} onClick={()=>setActiveTab('precios')}/>
          <NavBtn active={activeTab==='staff'} label="Equipo Staff" icon={<Users size={20}/>} onClick={()=>setActiveTab('staff')}/>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* TOPBAR */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Panel de <span className="text-yellow-500">Control</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">Sistema Operativo • Mendoza Rent</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm hover:border-yellow-500/50 transition-all">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-yellow-500 font-black shadow-lg">
                {localStorage.getItem('userName')?.charAt(0) || 'M'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">{localStorage.getItem('userName') || 'Mauricio'}</span>
                <span className="text-[9px] font-black text-yellow-600 uppercase tracking-tighter bg-yellow-500/10 px-2 py-0.5 rounded-md w-fit text-center">Super Admin</span>
              </div>
              <button onClick={handleLogout} className="ml-4 p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg cursor-pointer"><LogOut size={18} /></button>
            </div>
          </div>
        </header>

        {/* 1. VENTAS OPERATIVAS HISTÓRICAS Y FUTURAS CRONOLÓGICAS */}
        {activeTab === 'ventas' && (() => {
          const reservasCronologicas = Array.isArray(reservas) ? [...reservas].sort((a, b) => {
            const strA = a.fecha_inicio ? String(a.fecha_inicio).substring(0, 10) : '1970-01-01';
            const strB = b.fecha_inicio ? String(b.fecha_inicio).substring(0, 10) : '1970-01-01';
            const dateA = new Date(strA.replace(/-/g, '/'));
            const dateB = new Date(strB.replace(/-/g, '/'));
            return dateB - dateA; 
          }) : [];

          return (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-4 gap-6">
                <StatCard 
                  label="Ingresos Totales (ARS)" 
                  val={`$${reservasCronologicas
                    .filter(r => r.estado === 'contratado' || r.estado === 'confirmado' || r.estado_reserva === 'pagado')
                    .reduce((acc, curr) => {
                      if (!curr.monto_total_ars || curr.monto_total_ars === 'NULL') return acc;
                      const montoLimpio = String(curr.monto_total_ars).replace(/[^0-9.-]/g, '');
                      return acc + (parseFloat(montoLimpio) || 0);
                    }, 0)
                    .toLocaleString('es-AR')}`} 
                  icon={<DollarSign className="text-green-500"/>}
                />
                <StatCard 
                  label="Leads Pendientes" 
                  val={reservasCronologicas.filter(r => r.estado === 'pendiente' || !r.estado || r.estado === '').length} 
                  icon={<Clock className="text-yellow-500"/>}
                />
                <StatCard 
                  label="Confirmadas Globales" 
                  val={reservasCronologicas.filter(r => r.estado === 'confirmado' || r.estado === 'contratado').length} 
                  icon={<CheckCircle className="text-blue-500"/>}
                />
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col justify-center shadow-sm border border-slate-800">
                  <p className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em] mb-1">Dólar Configurado</p>
                  <p className="text-2xl font-black italic text-white leading-none">
                    $ {preciosMes[new Date().getMonth() + 1]?.cotizacion_dolar || settings?.cotizacion_dolar || '1400'} <span className="text-xs font-bold text-slate-400 not-italic">ARS</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-4 flex items-center justify-between border-b border-slate-800">
                  <p className="text-xs font-black text-yellow-500 uppercase tracking-widest italic">📋 Listado Maestro (Sincronizado con Base de Datos)</p>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">{reservasCronologicas.length} Operaciones</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-6">Estado Alquiler</th>
                      <th className="p-6">Garantía / Franquicia</th>
                      <th className="p-6">Cliente / Vehículo</th>
                      <th className="p-6 text-center">Sillita 👶</th>
                      <th className="p-6">Retiro (Fecha y Lugar)</th>
                      <th className="p-6">Devolución (Fecha y Lugar)</th>
                      <th className="p-6 text-center">Chat</th>
                      <th className="p-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservasCronologicas.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <select value={r.estado || 'pendiente'} onChange={(e) => handleAction('post', `${apiUrl}/api/admin/cambiar-estado`, {id: r.id, estado: e.target.value})} className="bg-yellow-50 text-yellow-700 font-black text-[10px] px-3 py-2 uppercase rounded-xl border-none outline-none shadow-sm cursor-pointer">
                            <option value="pendiente">🟠 Pendiente</option>
                            <option value="contratado">🟢 Confirmado</option>
                            <option value="rechazado">🔴 Rechazado</option>
                          </select>
                        </td>
                        <td className="p-6">
                          <select 
                            value={localStorage.getItem(`garantia_reserva_${r.id}`) || 'pendiente'} 
                            onChange={(e) => {
                              try {
                                localStorage.setItem(`garantia_reserva_${r.id}`, e.target.value);
                                fetchData(); 
                              } catch(err) { 
                                alert("Error al guardar el estado informativo de la garantía"); 
                              }
                            }} 
                            className="bg-slate-100 font-black text-[10px] px-3 py-2 uppercase rounded-xl border-none outline-none cursor-pointer"
                          >
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="pagado">💵 Depositada</option>
                            <option value="resubido">✔️ Devuelta</option>
                          </select>
                        </td>
                        <td className="p-6">
                          <p className="text-base font-black italic uppercase text-slate-900 leading-none">{r.cliente_nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{r.auto_modelo || 'Vehículo'}</span>
                            <span className="text-[9px] font-black bg-slate-900 text-yellow-500 px-1.5 py-0.5 rounded">{r.patente || 'S/P'}</span>
                          </div>
                          <p className="text-xs font-black text-emerald-600 mt-1">Monto: ${parseFloat(r.monto_total_ars || 0).toLocaleString('es-AR')}</p>
                        </td>
                        <td className="p-6 text-center">
                          {r.sillita === 1 || r.sillita === true || String(r.sillita) === '1' || String(r.sillita) === 'true' ? (
                            <span className="bg-green-50 text-green-700 font-black text-[10px] px-2.5 py-1 rounded-full border border-green-200">✔️ Sí</span>
                          ) : (
                            <span className="bg-slate-50 text-slate-400 font-bold text-[10px] px-2.5 py-1 rounded-full">❌ No</span>
                          )}
                        </td>
                        <td className="p-6">
                          <p className="text-xs font-black text-slate-700">{r.fecha_inicio ? String(r.fecha_inicio).substring(0, 10) : 'A confirmar'}</p>
                          <p className="text-xs font-black text-slate-900 italic mt-0.5">⏱ {r.hora_inicio || '10:00:00'}</p>
                          <p className="text-[10px] font-black text-blue-600 uppercase mt-1 italic">📍 {r.lugar_retiro || 'mendoza ciudad'}</p>
                        </td>
                        <td className="p-6">
                          <p className="text-xs font-black text-slate-700">{r.fecha_fin ? String(r.fecha_fin).substring(0, 10) : 'A confirmar'}</p>
                          <p className="text-xs font-black text-slate-900 italic mt-0.5">⏱ {r.hora_fin || '10:00:00'}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase mt-1 italic">📍 {r.lugar_devolucion || 'mendoza ciudad'}</p>
                        </td>
                        <td className="p-6 text-center">
                          <a href={`https://wa.me/${String(r.cliente_whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all transform hover:scale-105 shadow-sm" title="Abrir Conversación Limpia"><MessageCircle size={18} /></a>
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => enviarTicketPorWhatsApp(r)} 
                              className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center font-bold cursor-pointer"
                              title="Disparar aviso y abrir chat del cliente"
                            >
                              📩
                            </button>
                            <button 
                              onClick={() => descargarTicketPresupuesto(r)} 
                              className="p-2.5 bg-slate-900 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center cursor-pointer"
                              title="Visualizar/Imprimir Presupuesto VIP"
                            >
                              <FileText size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente la reserva de ${r.cliente_nombre}?`)) {
                                  handleAction('delete', `${apiUrl}/api/admin/reservas/${r.id}`);
                                }
                              }} 
                              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 shadow-sm flex items-center justify-center cursor-pointer"
                              title="Eliminar Reserva"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* 2. CALENDARIO CON MINIATURAS Y PATENTES OPERATIVAS */}
        {activeTab === 'calendario' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black uppercase italic text-xl text-slate-900 tracking-wider">Control de Ocupación Visual</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoreo en tiempo real por unidad y patente</p>
                </div>
              </div>

              <style>{`
                .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; }
                .react-calendar__tile { height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; align-items: center !important; padding: 6px 4px !important; border: 1px solid #f1f5f9 !important; vertical-align: top !important; }
                .react-calendar__tile--active, .react-calendar__tile--now { background: #f8fafc !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }
                .react-calendar__month-view__days__day--weekend { color: #ef4444 !important; }
                .patente-tag { font-size: 8px !important; font-weight: 900 !important; text-transform: uppercase; background-color: #0f172a !important; color: #eab308 !important; padding: 1.5px 3px !important; border-radius: 4px !important; width: 95% !important; text-align: center; }
                .calendar-car-thumb { width: 100%; height: 38px; object-fit: contain; }
              `}</style>

              <Calendar 
                formatDay={(locale, date) => date.getDate()}
                tileContent={({ date, view }) => {
                  if (view !== 'month') return null;
                  const anio = date.getFullYear();
                  const mes = String(date.getMonth() + 1).padStart(2, '0');
                  const dia = String(date.getDate()).padStart(2, '0');
                  const fechaCelda = `${anio}-${mes}-${dia}`;

                  const reservasDelDia = reservas.filter(r => {
                    if (!r.fecha_inicio || !r.fecha_fin) return false;
                    const inicio = r.fecha_inicio.split('T')[0];
                    const fin = r.fecha_fin.split('T')[0];
                    return fechaCelda >= inicio && fechaCelda <= fin && (r.estado === 'confirmado' || r.estado === 'contratado');
                  });

                  if (reservasDelDia.length > 0) {
                    return (
                      <div className="w-full flex flex-col items-center overflow-y-auto max-h-[90px] mt-0.5 space-y-1 select-none">
                        {reservasDelDia.map((r, idx) => {
                          const cocheAsociado = autos.find(a => a.id.toString() === r.auto_id?.toString());
                          const imgUrl = cocheAsociado?.imagen_url ? `${apiUrl}${cocheAsociado.imagen_url}` : null;
                          return (
                            <div key={idx} className="w-full flex flex-col items-center">
                              {imgUrl ? <img src={imgUrl} className="calendar-car-thumb" alt="thumb" /> : <div className="h-5 text-[9px] text-slate-300 font-bold">🚗 s/img</div>}
                              <div className="patente-tag">{r.patente || cocheAsociado?.patente || 'S/PAT'}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <div className="mt-12 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 italic">Estatus & Disponibilidad de Unidades</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {autos.map(auto => {
                    const hoyStr = new Date().toISOString().split('T')[0];
                    const estaOcupadoHoy = reservas.some(r => {
                      const inicio = r.fecha_inicio?.split('T')[0];
                      const fin = r.fecha_fin?.split('T')[0];
                      return r.auto_id?.toString() === auto.id.toString() && hoyStr >= inicio && hoyStr <= fin && (r.estado === 'confirmado' || r.estado === 'contratado');
                    });
                    return (
                      <div key={auto.id} className="bg-slate-900 rounded-2xl p-4 flex flex-col text-white shadow-md border border-slate-800">
                        <div className="w-full h-20 bg-white rounded-xl flex items-center justify-center p-2 mb-3 overflow-hidden border border-slate-800">
                          <img src={`${apiUrl}${auto.imagen_url}`} className="w-full h-full object-contain" alt={auto.modelo} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-tight text-slate-100 truncate mb-1">{auto.modelo}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] font-black bg-yellow-500 text-slate-900 px-2 py-0.5 rounded tracking-wider font-mono">{auto.patente || 'S/PATENTE'}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${estaOcupadoHoy ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{estaOcupadoHoy ? '● Alquilado' : '● Libre'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GESTIÓN DE RUTAS */}
        {activeTab === 'rutas' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-lg border border-slate-100">
              <h3 className="text-xl font-black uppercase italic mb-8">Gestión de Experiencias</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <input type="file" onChange={(e) => setNewRuta({...newRuta, imagen: e.target.files[0]})} className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-slate-100 text-xs font-bold" />
                  <input placeholder="Título" className={inputStyle} value={newRuta.nombre} onChange={e=>setNewRuta({...newRuta, nombre: e.target.value})} />
                  <input placeholder="Link Maps" className={inputStyle} value={newRuta.maps_url} onChange={e=>setNewRuta({...newRuta, maps_url: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <textarea placeholder="Descripción..." className={`${inputStyle} h-32 resize-none`} value={newRuta.descripcion} onChange={e=>setNewRuta({...newRuta, descripcion: e.target.value})} />
                  <button onClick={async () => {
                    const res = await axios.post(`${apiUrl}/api/routes/ai-desc`, { titulo: newRuta.nombre, descripcion_base: newRuta.descripcion }, config);
                    setNewRuta({...newRuta, descripcion: res.data.suggestion});
                  }} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 hover:text-slate-900 transition-all uppercase cursor-pointer"><Sparkles size={18}/> Mejorar con IA</button>
                  <button onClick={async () => {
                    const fd = new FormData(); fd.append('titulo', newRuta.nombre); fd.append('descripcion', newRuta.descripcion); fd.append('maps_url', newRuta.maps_url); fd.append('imagen', newRuta.imagen);
                    await axios.post(`${apiUrl}/api/routes/save`, fd, { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } });
                    fetchData(); setNewRuta({nombre:'', descripcion:'', imagen: null, maps_url:''});
                  }} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase italic cursor-pointer">Guardar Ruta</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">{rutas.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-[2rem] flex justify-between items-center shadow-sm border border-slate-100">
                <span className="font-black text-xs uppercase italic truncate max-w-[150px]">{r.titulo}</span>
                <button onClick={()=>handleAction('delete', `${apiUrl}/api/routes/${r.id}`)} className="text-red-300 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={20}/></button>
              </div>
            ))}</div>
          </div>
        )}

        {/* 4. MAPA MENDOZA INTERACTIVO CON ENRUTAMIENTO DESDE PUNTOS DE ENTREGA */}
        {activeTab === 'mapa' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px] animate-in fade-in duration-500">
            
            {/* Panel Izquierdo (1/4): Centro de Cómputo y Control */}
            <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col justify-between overflow-hidden">
              <div className="space-y-5 overflow-y-auto max-h-[520px] pr-1">
                
                {/* Título e Instructivo */}
                <div>
                  <p className="text-[9px] font-black uppercase text-yellow-500 tracking-[0.2em] mb-1">Logística de Entregas VIP</p>
                  <h3 className="text-lg font-black text-white uppercase italic">Trazador de <span className="text-yellow-500">Distancias</span></h3>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">Simula trayectos interactivos cruzando los puntos de retiro con tus rutas turísticas.</p>
                </div>

                {/* Selector del Punto de Entrega/Retiro (Origen del Auto) */}
                <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">📍 Punto de Origen / Retiro:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setPuntoOrigenMapa('aeropuerto')}
                      className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase transition-all tracking-tight cursor-pointer ${
                        puntoOrigenMapa === 'aeropuerto'
                          ? 'bg-yellow-500 text-slate-950 shadow-md'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ✈️ Aeropuerto
                    </button>
                    <button
                      onClick={() => setPuntoOrigenMapa('km0')}
                      className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase transition-all tracking-tight cursor-pointer ${
                        puntoOrigenMapa === 'km0'
                          ? 'bg-yellow-500 text-slate-950 shadow-md'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      🏢 Km Cero
                    </button>
                  </div>
                </div>

                {/* Listado Dinámico de Destinos de tu Base de Datos MySQL */}
                <div className="w-full border-t border-slate-800 pt-3 flex flex-col gap-1.5">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 px-1">⛰️ Seleccionar Destino:</p>
                  {rutas.map((r, idx) => {
                    const esActiva = rutaMapaSeleccionada?.id === r.id;
                    return (
                      <button
                        key={r.id || idx}
                        onClick={() => setRutaMapaSeleccionada(r)}
                        className={`w-full text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all transform hover:scale-101 cursor-pointer flex items-center justify-between gap-2 ${
                          esActiva 
                            ? 'bg-yellow-500 text-slate-950 shadow-lg font-black' 
                            : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 font-medium'
                        }`}
                      >
                        <span className="truncate flex-1">👉 {r.titulo}</span>
                      </button>
                    );
                  })}
                  {rutas.length === 0 && (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">No hay destinos cargados.</p>
                  )}
                </div>
              </div>

              {/* Ficha Resumen del Itinerario Calculado al Pie */}
              {rutaMapaSeleccionada && (
                <div className="bg-slate-800/50 border border-slate-800/80 p-4 rounded-2xl text-[10px] space-y-1.5 animate-in fade-in duration-300">
                  <div className="flex justify-between text-yellow-500 font-black uppercase tracking-tighter">
                    <span>Ruta en Pantalla:</span>
                    <span className="text-white italic">Simulada ✔️</span>
                  </div>
                  <p className="text-white font-bold uppercase italic truncate">
                    {puntoOrigenMapa === 'aeropuerto' ? 'Aeropuerto ✈️' : 'Km Cero 🏢'} → {rutaMapaSeleccionada.titulo}
                  </p>
                  <p className="text-slate-400 font-medium leading-tight line-clamp-2 pt-0.5">
                    {rutaMapaSeleccionada.descripcion}
                  </p>
                </div>
              )}
            </div>

            {/* Panel Derecho (3/4): Visor Cartográfico Inteligente en Tiempo Real */}
            <div className="lg:col-span-3 h-full w-full rounded-[3.5rem] overflow-hidden border-[10px] border-white shadow-2xl relative bg-slate-100 flex items-center justify-center">
              <iframe 
                src={obtenerUrlEnrutamientoDinamico(rutaMapaSeleccionada)} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full rounded-2xl"
              ></iframe>
            </div>

          </div>
        )}

        {/* 5. FLOTA VEHICULAR */}
        {activeTab === 'flota' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <button onClick={() => setShowAddAuto(!showAddAuto)} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase italic hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-xl cursor-pointer">{showAddAuto ? '❌ Cancelar Registro' : '➕ Agregar Nueva Unidad'}</button>
            {showAddAuto && (
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Foto del Vehículo</label>
                    <input type="file" onChange={(e) => setNewAuto({...newAuto, imagen_file: e.target.files[0]})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 text-xs font-bold" />
                  </div>
                  <input placeholder="Modelo del Auto" className={inputStyle} value={newAuto.modelo} onChange={e => setNewAuto({...newAuto, modelo: e.target.value})} />
                  <input placeholder="Patente" className={inputStyle} value={newAuto.patente} onChange={e => setNewAuto({...newAuto, patente: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex flex-col gap-2"><label className="text-[10px] font-black uppercase text-slate-400">Color Calendario</label><input type="color" className="w-full h-10 border-none bg-transparent cursor-pointer" value={newAuto.color} onChange={e => setNewAuto({...newAuto, color: e.target.value})} /></div>
                    <div className="flex flex-col gap-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Transmisión</label><select className={inputStyle} value={newAuto.transmision} onChange={e => setNewAuto({...newAuto, transmision: e.target.value})}><option value="Manual">Manual</option><option value="Automático">Automático</option></select></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <input type="number" placeholder="Precio USD x Día" className={inputStyle} value={newAuto.precio_base_usd} onChange={e => setNewAuto({...newAuto, precio_base_usd: e.target.value})} />
                  <textarea placeholder="Descripción de equipamiento..." className={`${inputStyle} h-32 resize-none`} value={newAuto.descripcion_larga} onChange={e => setNewAuto({...newAuto, descripcion_larga: e.target.value})} />
                  <button onClick={async () => {
                    const fd = new FormData(); fd.append('modelo', newAuto.modelo); fd.append('patente', newAuto.patente); fd.append('color', newAuto.color); fd.append('transmision', newAuto.transmision || 'Manual'); fd.append('precio_base_usd', newAuto.precio_base_usd); fd.append('descripcion_larga', newAuto.descripcion_larga);
                    if(newAuto.imagen_file) fd.append('imagen', newAuto.imagen_file);
                    await axios.post(`${apiUrl}/api/admin/autos`, fd, { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } });
                    fetchData(); setShowAddAuto(false);
                    setNewAuto({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
                  }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black text-xl hover:bg-yellow-500 hover:text-slate-900 transition-all italic shadow-lg cursor-pointer">🚀 REGISTRAR UNIDAD EN FLOTA</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-8">{autos.map(a => (
              <div key={a.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all duration-300">
                <button onClick={() => handleAction('delete', `${apiUrl}/api/admin/autos/${a.id}`)} className="absolute top-6 right-6 text-slate-200 hover:text-red-500 transition-colors p-2 cursor-pointer"><Trash2 size={20}/></button>
                <img src={a.imagen_url ? `${apiUrl}${a.imagen_url}` : '/car-placeholder.jpg'} className="w-full h-44 object-contain mb-6 group-hover:scale-105 transition-transform" alt={a.modelo} />
                <div className="flex items-center gap-3 mb-4"><div className="w-4 h-4 rounded-full border shadow-inner" style={{backgroundColor: a.color}} /><h4 className="text-xl font-black uppercase italic text-slate-900 leading-none">{a.modelo}</h4></div>
                <div className="flex justify-between border-t border-slate-50 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>{a.patente}</span><span className="text-blue-500">USD {a.precio_base_usd}/DÍA</span></div>
              </div>
            ))}</div>
          </div>
        )}

        {/* 6. TARIFAS Y GARANTÍAS - EDICIÓN MULTI-AÑO FUTURO DE ALTA PRECISIÓN */}
        {activeTab === 'precios' && (() => {
          const listaOriginalPrecios = Array.isArray(preciosMes) ? preciosMes : Object.values(preciosMes);
          
          const datosMesActual = listaOriginalPrecios.find(
            p => parseInt(p.mes) === parseInt(selectedMes) && parseInt(p.anio) === parseInt(selectedAnio)
          ) || {
            precio_dia: 0,
            cotizacion_dolar: 1400,
            precio_sillita: 0,
            cargo_aeropuerto: 0,
            garantia_ars: 0,
            garantia_usd: 0
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
              
              {/* Encabezado Premium Oscuro Estilo Control de Mandos Temporal */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl border border-white/5">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse hidden sm:block" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em]">Configuración de Tarifas del Sistema</p>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight">
                      Período Operativo: <span className="text-yellow-400">{mesesNom[selectedMes - 1]}</span> de <span className="text-yellow-500">{selectedAnio}</span>
                    </h2>
                  </div>
                </div>
                
                {/* Doble Selector Profesional: Mes y Año Dinámicos */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  
                  {/* Selector de Mes */}
                  <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto justify-between">
                    <button 
                      onClick={() => setSelectedMes(m => m > 1 ? m - 1 : 12)} 
                      className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-all font-bold cursor-pointer"
                    >
                      <ChevronLeft size={14} strokeWidth={3} />
                    </button>
                    <span className="text-xs font-black uppercase italic tracking-wider text-center min-w-[100px] text-yellow-400">
                      {mesesNom[selectedMes - 1]}
                    </span>
                    <button 
                      onClick={() => setSelectedMes(m => m < 12 ? m + 1 : 1)} 
                      className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-all font-bold cursor-pointer"
                    >
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </div>

                  {/* Selector de Año Futuro */}
                  <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto justify-between">
                    <button 
                      onClick={() => setSelectedAnio(a => a - 1)} 
                      className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-all font-bold cursor-pointer"
                    >
                      <ChevronLeft size={14} strokeWidth={3} />
                    </button>
                    <span className="text-xs font-black uppercase italic tracking-wider text-center min-w-[70px] text-white font-mono">
                      {selectedAnio}
                    </span>
                    <button 
                      onClick={() => setSelectedAnio(a => a + 1)} 
                      className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-all font-bold cursor-pointer"
                    >
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </div>

                </div>
              </div>

              {/* Listado de Precios de Ancho Total en Fila Unificada */}
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-8 space-y-4">
                <div className="border-b border-slate-100 pb-4 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    Base de Datos Activa para: {mesesNom[selectedMes - 1]} / {selectedAnio}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  
                  <PriceBox 
                    label="VALOR ALQUILER POR DÍA (ARS)" 
                    val={datosMesActual.precio_dia} 
                    icon="💰"
                    onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_dia', valor: v })} 
                  />

                  <PriceBox 
                    label="COTIZACIÓN DEL DÓLAR BLUE DE REFERENCIA" 
                    val={datosMesActual.cotizacion_dolar} 
                    icon="💵"
                    onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'cotizacion_dolar', valor: v })} 
                  />

                  <PriceBox 
                    label="OPCIONAL SILLITA DE BEBÉ POR DÍA (ARS)" 
                    val={datosMesActual.precio_sillita} 
                    icon="👶"
                    onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_sillita', valor: v })} 
                  />

                  <PriceBox 
                    label="CARGO LOGÍSTICO POR ENTREGA/DEVOLUCIÓN EN AEROPUERTO (ARS)" 
                    val={datosMesActual.cargo_aeropuerto} 
                    icon="✈️"
                    onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'cargo_aeropuerto', valor: v })} 
                  />

                  <PriceBox 
                    label="FRANQUICIA / GARANTÍA DE RESGUARDO EN PESOS (ARS)" 
                    val={datosMesActual.garantia_ars} 
                    icon="🛡️"
                    onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'garantia_ars', valor: v })} 
                  />

                  <PriceBox 
                    label="FRANQUICIA / GARANTÍA DE RESGUARDO EN DÓLARES (USD)" 
                    val={datosMesActual.garantia_usd} 
                    icon="🇺🇸"
                    onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'garantia_usd', valor: v })} 
                  />

                </div>
              </div>

            </div>
          );
        })()}

        {/* 7. EQUIPO STAFF */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-2 gap-12 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black italic uppercase mb-8">Invitar Colaborador</h3>
              <div className="space-y-4">
                <input placeholder="Nombre" className={inputStyle} value={newAdmin.nombre} onChange={e => setNewAdmin({...newAdmin, nombre: e.target.value})} />
                <input placeholder="Email" className={inputStyle} value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                <button onClick={() => handleAction('post', `${apiUrl}/api/admin/invite`, newAdmin)} className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-lg hover:bg-yellow-500 hover:text-slate-900 transition-all flex items-center justify-center gap-3 cursor-pointer"><UserPlus size={20}/> Enviar Invitación</button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Equipo Activo</h3>
              {admins.map(adm => (
                <div key={adm.id} className="bg-white p-5 rounded-[1.5rem] flex justify-between items-center shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 uppercase">{adm.nombre?.charAt(0)}</div>
                    <div><p className="font-black text-slate-900 uppercase italic text-sm">{adm.nombre}</p><p className="text-[9px] font-bold text-slate-400 lowercase">{adm.email}</p></div>
                  </div>
                  <button onClick={() => handleAction('delete', `${apiUrl}/api/admin/users/${adm.id}`)} className="text-slate-200 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES MAESTROS
function NavBtn({active, label, icon, onClick}) {
  return <button onClick={onClick} className={`w-full flex items-center gap-4 px-7 py-4 rounded-[1.2rem] transition-all font-black text-[10px] uppercase tracking-wider cursor-pointer ${active ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>{icon} {label}</button>;
}

function StatCard({label, val, icon}) {
  return <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"><div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:bg-yellow-50 transition-colors">{icon}</div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">{val}</p></div>;
}

function PriceBox({ label, val, onSave, icon }) {
  const [v, setV] = useState(val || 0);
  const [guardadoOk, setGuardadoOk] = useState(false);

  useEffect(() => { setV(val || 0); }, [val]);

  const handleLocalSave = () => {
    onSave(v);
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 2000);
  };

  return (
    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors">
      <div className="flex items-center gap-4 sm:w-1/2 min-w-[280px]">
        <span className="text-xl bg-white w-11 h-11 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
          {icon || "📊"}
        </span>
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider leading-tight">
          {label}
        </label>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end w-full sm:w-auto">
        <input 
          type="number" 
          value={v} 
          onChange={e => setV(e.target.value)} 
          className="w-full sm:w-48 text-right text-xl font-black text-slate-900 bg-white border-2 border-slate-200 focus:border-yellow-500 rounded-xl px-4 py-2.5 outline-none transition-all shadow-inner tracking-tight"
          placeholder="0"
        />
        <button 
          onClick={handleLocalSave}
          className={`px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 cursor-pointer shadow-sm flex-shrink-0 min-w-[110px] text-center justify-center ${
            guardadoOk 
              ? 'bg-green-600 text-white' 
              : 'bg-slate-900 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900'
          }`}
        >
          {guardadoOk ? "✔️ Listo" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = "w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-100 font-black text-slate-900 outline-none focus:border-yellow-500 transition-colors";