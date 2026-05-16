import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  DollarSign, Car, Users, Calendar as CalendarIcon, BarChart3, 
  LogOut, Trash2, Activity, Navigation, Map as MapIcon,
  Settings, Plus, MessageCircle, Save, CheckCircle, 
  Sparkles, ChevronLeft, ChevronRight, User, Clock, ShieldCheck, FileText, UserPlus,
  Home 
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminDashboard() {
  // 1. TOP-LEVEL HOOK DECLARATIONS (Order is strictly preserved)
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
  
  const [rutaMapaSeleccionada, setRutaMapaSeleccionada] = useState(null);
  const [puntoOrigenMapa, setPuntoOrigenMapa] = useState('aeropuerto');

  const [newRuta, setNewRuta] = useState({ nombre: '', descripcion: '', imagen: null, maps_url: '' });
  const [showAddAuto, setShowAddAuto] = useState(false);
  const [newAuto, setNewAuto] = useState({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
  const [newAdmin, setNewAdmin] = useState({ nombre: '', email: '' });

  // FIXED: Moved selectedDate to the top level so it never mounts/unmounts conditionally
  const [selectedDate, setSelectedDate] = useState(new Date());

  const mesesNom = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

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
      
      if (listaRutas.length > 0 && !rutaMapaSeleccionada) {
        setRutaMapaSeleccionada(listaRutas[0]);
      }

      const mapa = {};
      if (Array.isArray(resPrecios.data)) resPrecios.data.forEach(p => { mapa[p.mes] = p; });
      setPreciosMes(mapa);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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

  const obtenerUrlEnrutamientoDinamico = (ruta) => {
    if (!ruta) return "https://maps.google.com/maps?q=Mendoza,Argentina&z=12&output=embed";
    const origenDireccion = puntosEntregaCoordenadas[puntoOrigenMapa];
    try {
      const destinoLimpio = encodeURIComponent(ruta.titulo + ", Mendoza, Argentina");
      const origenLimpio = encodeURIComponent(origenDireccion);
      return `https://maps.google.com/maps?saddr=$saddr=${origenLimpio}&daddr=${destinoLimpio}&noheader=true&z=11&output=embed`;
    } catch (error) {
      return "https://maps.google.com/maps?q=Mendoza,Argentina&z=12&output=embed";
    }
  };

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
              body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; padding: 30px 20px; display: flex; flex-direction: column; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print-bar { margin-bottom: 20px; display: flex; gap: 15px; }
              .btn-print { background-color: #eab308; color: #0f172a; font-weight: 900; border: none; padding: 12px 30px; border-radius: 50px; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(234,179,8,0.3); transition: all 0.2s; }
              .btn-print:hover { background-color: #0f172a; color: #ffffff; }
              .btn-close { background-color: #e2e8f0; color: #475569; font-weight: 700; border: none; padding: 12px 20px; border-radius: 50px; cursor: pointer; text-transform: uppercase; font-size: 11px; }
              .ticket-container { width: 100%; max-w: 700px; background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
              .logo-container { text-align: center; margin-bottom: 15px; }
              .logo-img { height: 65px; object-fit: contain; }
              .logo-alt { font-weight: 900; font-size: 22px; font-style: italic; letter-spacing: -1px; text-transform: uppercase; }
              .logo-alt span { color: #eab308; }
              .tag-status { background-color: rgba(234, 179, 8, 0.1); color: #a16207; font-weight: 900; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; padding: 5px 14px; border-radius: 50px; width: max-content; margin: 0 auto 15px auto; }
              .title-main { font-size: 22px; font-weight: 900; text-transform: uppercase; font-style: italic; text-align: center; margin-bottom: 4px; tracking: -0.5px; }
              .title-main span { color: #eab308; }
              .subtitle { color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; margin-bottom: 25px; }
              .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
              .info-card { background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px; display: flex; gap: 10px; align-items: flex-start; }
              .info-card .icon { font-size: 18px; line-height: 1; }
              .info-card .label { font-size: 8.5px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
              .info-card .value { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-top: 1px; }
              .info-card .subtext { font-size: 10.5px; color: #64748b; margin-top: 1px; }
              .full-width { grid-column: span 2; }
              .garantia-card { border-left: 4px solid #3b82f6; background-color: #eff6ff; }
              .garantia-card .label { color: #2563eb; }
              .garantia-card .warning-text { font-size: 10px; color: #1e40af; margin-top: 4px; line-height: 1.3; font-weight: 600; }
              .total-box { background-color: #0f172a; color: #ffffff; padding: 18px; border-radius: 14px; text-align: center; margin-top: 15px; }
              .total-box .total-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #eab308; letter-spacing: 2px; margin-bottom: 2px; }
              .total-box .total-amount { font-size: 28px; font-weight: 900; font-style: italic; }
              .total-box .total-amount span { font-size: 13px; font-style: normal; color: #94a3b8; font-weight: 700; margin-left: 3px; }
              .total-box .exchange-rate { font-size: 8.5px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-top: 4px; }
              .requisitos-section { margin-top: 25px; border-top: 1px dashed #e2e8f0; padding-top: 20px; }
              .requisitos-title { font-size: 11px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: 1px; text-align: center; margin-bottom: 15px; color: #0f172a; }
              .requisitos-maestros-container { display: flex; flex-direction: column; gap: 8px; }
              .req-horizontal-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
              .req-box-compact { background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 10px; border-radius: 10px; }
              .req-box-compact .req-head { font-size: 8.5px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-bottom: 2px; }
              .req-box-compact .req-body { font-size: 10.5px; color: #475569; line-height: 1.2; font-weight: 600; }
              .footer-ticket { margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; font-size: 9.5px; font-weight: 900; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; }
              @media print { .no-print-bar { display: none !important; } body { background: #ffffff; padding: 0; } .ticket-container { box-shadow: none !important; border: none !important; padding: 0 !important; } }
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
                <div class="info-card">${isAeropuertoEntrega ? '✈️' : '🏢'}<div>
                    <p class="label">Lugar de Entrega</p>
                    <p class="value">${reserva.lugar_retiro || 'Mendoza Ciudad'}</p>
                    <p class="subtext">📅 ${String(reserva.fecha_inicio || '').substring(0,10)} • ⏱️ ${String(reserva.hora_inicio || '').substring(0,5)} hs</p>
                  </div>
                </div>
                <div class="info-card">${isAeropuertoDevolucion ? '✈️' : '🏢'}<div>
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

  // Formatter helper built for the calendar calculations
  const formatLocalDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const fechaSeleccionadaStr = formatLocalDate(selectedDate);

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] font-sans text-slate-900 max-lg:flex-col">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-slate-900 p-8 flex flex-col sticky top-0 h-screen border-r border-white/5 z-40 max-lg:w-full max-lg:h-auto max-lg:p-5 max-lg:border-b">
        <div className="flex items-center gap-3 mb-4 max-lg:mb-3">
          <div className="bg-yellow-500 p-2 rounded-xl"><Activity className="text-slate-900" size={24} /></div>
          <span className="text-white font-black italic text-2xl tracking-tighter uppercase">Mendoza<span className="text-yellow-500">Rent</span></span>
        </div>

        <div className="mb-6 max-lg:mb-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-4 px-7 py-3 bg-slate-800 hover:bg-slate-700/80 text-yellow-500 rounded-[1.2rem] transition-all font-black text-[10px] uppercase tracking-wider shadow-inner cursor-pointer"
          >
            <Home size={18} /> Volver a la Web
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 max-lg:flex-row max-lg:overflow-x-auto max-lg:pb-2 max-lg:scrollbar-none max-lg:w-full">
          <NavBtn active={activeTab==='ventas'} label="Ventas" icon={<BarChart3 size={18}/>} onClick={()=>setActiveTab('ventas')}/>
          <NavBtn active={activeTab==='calendario'} label="Calendario" icon={<CalendarIcon size={18}/>} onClick={()=>setActiveTab('calendario')}/>
          <NavBtn active={activeTab==='rutas'} label="Rutas" icon={<Navigation size={18}/>} onClick={()=>setActiveTab('rutas')}/>
          <NavBtn active={activeTab==='mapa'} label="Mapa" icon={<MapIcon size={18}/>} onClick={()=>setActiveTab('mapa')}/>
          <NavBtn active={activeTab==='flota'} label="Flota" icon={<Car size={18}/>} onClick={()=>setActiveTab('flota')}/>
          <NavBtn active={activeTab==='precios'} label="Tarifas" icon={<Settings size={18}/>} onClick={()=>setActiveTab('precios')}/>
          <NavBtn active={activeTab==='staff'} label="Staff" icon={<Users size={18}/>} onClick={()=>setActiveTab('staff')}/>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {/* TOPBAR */}
        <header className="flex justify-between items-center mb-8 md:mb-10 max-sm:flex-col max-sm:items-start max-sm:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Panel de <span className="text-yellow-500">Control</span></h1>
            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">Sistema Operativo • Mendoza Rent</p>
          </div>
          <div className="flex items-center gap-6 max-sm:w-full">
            <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm hover:border-yellow-500/50 transition-all max-sm:w-full max-sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-yellow-500 font-black shadow-lg">
                  {localStorage.getItem('userName')?.charAt(0) || 'M'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">{localStorage.getItem('userName') || 'Mauricio'}</span>
                  <span className="text-[9px] font-black text-yellow-600 uppercase tracking-tighter bg-yellow-500/10 px-2 py-0.5 rounded-md w-fit text-center">Super Admin</span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg cursor-pointer"><LogOut size={18} /></button>
            </div>
          </div>
        </header>

        {/* 1. VENTAS & LEADS */}
        {activeTab === 'ventas' && (() => {
          const reservasCronologicas = Array.isArray(reservas) ? [...reservas].sort((a, b) => {
            const strA = a.fecha_inicio ? String(a.fecha_inicio).substring(0, 10) : '1970-01-01';
            const strB = b.fecha_inicio ? String(b.fecha_inicio).substring(0, 10) : '1970-01-01';
            return new Date(strB.replace(/-/g, '/')) - new Date(strA.replace(/-/g, '/')); 
          }) : [];

          return (
            <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
              {/* METRICAS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                  label="Ingresos Totales (ARS)" 
                  val={`$${reservasCronologicas
                    .filter(r => r.estado === 'contratado' || r.estado === 'confirmado' || r.estado_reserva === 'pagado')
                    .reduce((acc, curr) => {
                      if (!curr.monto_total_ars || curr.monto_total_ars === 'NULL') return acc;
                      return acc + (parseFloat(String(curr.monto_total_ars).replace(/[^0-9.-]/g, '')) || 0);
                    }, 0)
                    .toLocaleString('es-AR')}`} 
                  icon={<DollarSign className="text-green-500"/>}
                />
                <StatCard 
                  label="Leads Pendientes" 
                  val={reservasCronologicas.filter(r => r.estado === 'pendiente' || !r.estado).length} 
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

              {/* LISTADO MAESTRO RESPONSIVE */}
              <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-6 md:px-8 py-4 flex items-center justify-between border-b border-slate-800">
                  <p className="text-[11px] md:text-xs font-black text-yellow-500 uppercase tracking-widest italic">📋 Listado Maestro Sincronizado</p>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">{reservasCronologicas.length} Ops</span>
                </div>

                {/* COMPUTADORA VISTA (TABLE) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-6">Estado Alquiler</th>
                        <th className="p-6">Garantía</th>
                        <th className="p-6">Cliente / Vehículo</th>
                        <th className="p-6 text-center">Sillita 👶</th>
                        <th className="p-6">Retiro</th>
                        <th className="p-6">Devolución</th>
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
                            <select value={localStorage.getItem(`garantia_reserva_${r.id}`) || 'pendiente'} onChange={(e) => { localStorage.setItem(`garantia_reserva_${r.id}`, e.target.value); fetchData(); }} className="bg-slate-100 font-black text-[10px] px-3 py-2 uppercase rounded-xl border-none outline-none cursor-pointer">
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
                            {String(r.sillita) === '1' || String(r.sillita) === 'true' ? <span className="bg-green-50 text-green-700 font-black text-[10px] px-2.5 py-1 rounded-full border border-green-200">✔️ Sí</span> : <span className="bg-slate-50 text-slate-400 font-bold text-[10px] px-2.5 py-1 rounded-full">❌ No</span>}
                          </td>
                          <td className="p-6">
                            <p className="text-xs font-black text-slate-700">{r.fecha_inicio?.substring(0, 10)}</p>
                            <p className="text-xs font-black text-slate-900 italic mt-0.5">⏱ {r.hora_inicio || '10:00'}</p>
                            <p className="text-[10px] font-black text-blue-600 uppercase mt-1 italic">📍 {r.lugar_retiro}</p>
                          </td>
                          <td className="p-6">
                            <p className="text-xs font-black text-slate-700">{r.fecha_fin?.substring(0, 10)}</p>
                            <p className="text-xs font-black text-slate-900 italic mt-0.5">⏱ {r.hora_fin || '10:00'}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase mt-1 italic">📍 {r.lugar_devolucion}</p>
                          </td>
                          <td className="p-6 text-center">
                            <a href={`https://wa.me/${String(r.cliente_whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><MessageCircle size={18} /></a>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => enviarTicketPorWhatsApp(r)} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold cursor-pointer">📩</button>
                              <button onClick={() => descargarTicketPresupuesto(r)} className="p-2.5 bg-slate-900 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition-all cursor-pointer"><FileText size={16} /></button>
                              <button onClick={() => { if(window.confirm('⚠️ ¿Eliminar reserva?')) handleAction('delete', `${apiUrl}/api/admin/reservas/${r.id}`); }} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CELULAR VISTA */}
                <div className="block lg:hidden divide-y divide-slate-100 bg-slate-50/50">
                  {reservasCronologicas.map(r => (
                    <div key={r.id} className="p-5 space-y-4 bg-white shadow-sm mb-3 rounded-xl border border-slate-100 mx-3 my-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono bg-slate-900 text-yellow-500 px-2 py-0.5 rounded font-black">{r.patente || 'SIN PAT'}</span>
                        <div className="flex gap-2">
                          <select value={r.estado || 'pendiente'} onChange={(e) => handleAction('post', `${apiUrl}/api/admin/cambiar-estado`, {id: r.id, estado: e.target.value})} className="bg-yellow-50 text-yellow-700 font-black text-[9px] px-2.5 py-1.5 uppercase rounded-lg border-none outline-none">
                            <option value="pendiente">🟠 Pendiente</option>
                            <option value="contratado">🟢 Confirmado</option>
                            <option value="rechazado">🔴 Rechazado</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-black uppercase italic tracking-tight text-slate-900">{r.cliente_nombre}</h4>
                        <p className="text-xs font-bold text-blue-600 uppercase mt-0.5">{r.auto_modelo || 'Vehículo de Flota'}</p>
                        <p className="text-sm font-black text-emerald-600 mt-1">Monto: ${parseFloat(r.monto_total_ars || 0).toLocaleString('es-AR')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                        <div>
                          <p className="font-black text-slate-400 uppercase tracking-tighter">🛫 RETIRO</p>
                          <p className="font-bold text-slate-800 mt-0.5">{r.fecha_inicio?.substring(0, 10)} • {r.hora_inicio?.substring(0,5)} hs</p>
                          <p className="text-slate-500 uppercase text-[9px] truncate mt-0.5">📍 {r.lugar_retiro}</p>
                        </div>
                        <div>
                          <p className="font-black text-slate-400 uppercase tracking-tighter">🛬 DEVOLUCIÓN</p>
                          <p className="font-bold text-slate-800 mt-0.5">{r.fecha_fin?.substring(0, 10)} • {r.hora_fin?.substring(0,5)} hs</p>
                          <p className="text-slate-500 uppercase text-[9px] truncate mt-0.5">📍 {r.lugar_devolucion}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400">Garantía:</span>
                          <select value={localStorage.getItem(`garantia_reserva_${r.id}`) || 'pendiente'} onChange={(e) => { localStorage.setItem(`garantia_reserva_${r.id}`, e.target.value); fetchData(); }} className="bg-slate-100 font-black text-[9px] px-2 py-1 uppercase rounded-md border-none outline-none">
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="pagado">💵 Bloqueada</option>
                            <option value="resubido">✔️ Devuelta</option>
                          </select>
                        </div>

                        <div className="flex gap-1.5">
                          <a href={`https://wa.me/${String(r.cliente_whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-600 rounded-lg"><MessageCircle size={16} /></a>
                          <button onClick={() => enviarTicketPorWhatsApp(r)} className="p-2 bg-emerald-500 text-white rounded-lg text-xs font-bold">📩</button>
                          <button onClick={() => descargarTicketPresupuesto(r)} className="p-2 bg-slate-900 text-yellow-500 rounded-lg"><FileText size={16} /></button>
                          <button onClick={() => { if(window.confirm('⚠️ ¿Eliminar?')) handleAction('delete', `${apiUrl}/api/admin/reservas/${r.id}`); }} className="p-2 bg-slate-50 text-slate-300 rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. CALENDARIO (FIXED: Clean Layout, Hooks are completely decoupled from this section) */}
        {activeTab === 'calendario' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Contenedor del Calendario Principal */}
            <div className="bg-white p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <h3 className="font-black uppercase italic text-lg md:text-xl text-slate-900 tracking-wider mb-6">
                Ocupación en Tiempo Real
              </h3>

              <style>{`
                .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; }
                .react-calendar__tile { height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; align-items: center !important; padding: 6px 4px !important; border: 1px solid #f1f5f9 !important; transition: all 0.2s ease; }
                .react-calendar__tile:hover { background-color: #f8fafc !important; }
                .react-calendar__tile--active { background-color: #eff6ff !important; border: 2px solid #3b82f6 !important; color: #1e3a8a !important; }
                @media (max-width: 640px) { .react-calendar__tile { height: 80px !important; } }
                .patente-tag { font-size: 7px !important; font-weight: 900 !important; text-transform: uppercase; background-color: #0f172a !important; color: #eab308 !important; padding: 1px 2px !important; border-radius: 3px !important; width: 100% !important; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .calendar-car-thumb { width: 100%; height: 35px; object-fit: contain; }
                @media (max-width: 640px) { .calendar-car-thumb { height: 20px; } }
              `}</style>

              <Calendar 
                onChange={setSelectedDate}
                value={selectedDate}
                formatDay={(locale, date) => date.getDate()}
                tileContent={({ date, view }) => {
                  if (view !== 'month') return null;
                  const fechaCelda = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  const reservasDelDia = reservas.filter(r => 
                    r.fecha_inicio?.split('T')[0] <= fechaCelda && 
                    r.fecha_fin?.split('T')[0] >= fechaCelda && 
                    (r.estado === 'confirmado' || r.estado === 'contratado')
                  );

                  if (reservasDelDia.length > 0) {
                    return (
                      <div className="w-full flex flex-col items-center overflow-hidden max-h-[50px] sm:max-h-[90px] mt-0.5 space-y-0.5 select-none">
                        {reservasDelDia.slice(0, 2).map((r, idx) => {
                          const cocheAsociado = autos.find(a => a.id.toString() === r.auto_id?.toString());
                          return (
                            <div key={idx} className="w-full flex flex-col items-center">
                              {cocheAsociado?.imagen_url && (
                                <img src={`${apiUrl}${cocheAsociado.imagen_url}`} className="calendar-car-thumb hidden sm:block" alt="thumb" />
                              )}
                              <div className="patente-tag">{r.patente || cocheAsociado?.patente || 'S/P'}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </div>

            {/* Estado Detallado de Flota abajo del Calendario */}
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-2">
                <div>
                  <h4 className="font-black uppercase italic text-md md:text-lg text-slate-900 tracking-wider">
                    Estado de la Flota
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Monitoreando disponibilidad para el día: <span className="text-blue-600 font-bold">{selectedDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
                    <span className="text-emerald-700">Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
                    <span className="text-rose-700">Ocupado</span>
                  </div>
                </div>
              </div>

              {/* Rejilla de Autos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {autos.map((auto) => {
                  const reservaActiva = reservas.find(r => 
                    r.auto_id?.toString() === auto.id.toString() &&
                    r.fecha_inicio?.split('T')[0] <= fechaSeleccionadaStr && 
                    r.fecha_fin?.split('T')[0] >= fechaSeleccionadaStr && 
                    (r.estado === 'confirmado' || r.estado === 'contratado')
                  );

                  const estaOcupado = !!reservaActiva;

                  return (
                    <div 
                      key={auto.id} 
                      className={`flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                        estaOcupado 
                          ? 'border-rose-100 bg-rose-50/30' 
                          : 'border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/10'
                      }`}
                    >
                      <div className="w-24 h-16 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden">
                        {auto.imagen_url ? (
                          <img 
                            src={`${apiUrl}${auto.imagen_url}`} 
                            alt={auto.modelo} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Sin Foto</span>
                        )}
                      </div>

                      <div className="ml-4 flex-grow flex flex-col justify-between h-full min-w-0">
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-950 text-sm truncate uppercase tracking-tight">
                            {auto.modelo || 'Modelo no registrado'}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5 tracking-wider">
                            PATENTE: <span className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">{auto.patente || 'S/P'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {estaOcupado ? (
                            <>
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                              </span>
                              <span className="text-[10px] font-black uppercase text-rose-600 truncate">
                                Ocupado por: {reservaActiva.cliente_nombre || 'Cliente'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                              <span className="text-[10px] font-black uppercase text-emerald-600">
                                Disponible para alquiler
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. GESTIÓN DE RUTAS */}
        {activeTab === 'rutas' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg border border-slate-100">
              <h3 className="text-xl font-black uppercase italic mb-6">Gestión de Experiencias</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  }} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 hover:text-slate-900 transition-all uppercase cursor-pointer"><Sparkles size={18}/> IA Optimizer</button>
                  <button onClick={async () => {
                    const fd = new FormData(); fd.append('titulo', newRuta.nombre); fd.append('descripcion', newRuta.descripcion); fd.append('maps_url', newRuta.maps_url); fd.append('imagen', newRuta.imagen);
                    await axios.post(`${apiUrl}/api/routes/save`, fd, { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } });
                    fetchData(); setNewRuta({nombre:'', descripcion:'', imagen: null, maps_url:''});
                  }} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase italic cursor-pointer">Guardar Ruta</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{rutas.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100">
                <span className="font-black text-xs uppercase italic truncate max-w-[180px]">{r.titulo}</span>
                <button onClick={()=>handleAction('delete', `${apiUrl}/api/routes/${r.id}`)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={18}/></button>
              </div>
            ))}</div>
          </div>
        )}

        {/* 4. MAPA MENDOZA INTERACTIVO */}
        {activeTab === 'mapa' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[700px] animate-in fade-in duration-500">
            <div className="bg-slate-900 p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 flex flex-col justify-between gap-5">
              <div className="space-y-4 overflow-y-auto max-h-[400px] lg:max-h-[520px]">
                <div>
                  <p className="text-[9px] font-black uppercase text-yellow-500 tracking-[0.2em] mb-1">Logística de Entregas VIP</p>
                  <h3 className="text-lg font-black text-white uppercase italic">Trazador</h3>
                </div>

                <div className="bg-slate-800/80 p-2 rounded-xl">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2">📍 Retiro:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPuntoOrigenMapa('aeropuerto')} className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase transition-all ${puntoOrigenMapa === 'aeropuerto' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>✈️ Aeropuerto</button>
                    <button onClick={() => setPuntoOrigenMapa('km0')} className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase transition-all ${puntoOrigenMapa === 'km0' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>🏢 Km Cero</button>
                  </div>
                </div>

                <div className="w-full border-t border-slate-800 pt-3 flex flex-col gap-2">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-1">⛰️ Destino:</p>
                  {rutas.map((r, idx) => (
                    <button key={r.id || idx} onClick={() => setRutaMapaSeleccionada(r)} className={`w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase truncate ${rutaMapaSeleccionada?.id === r.id ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>👉 {r.titulo}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 h-96 lg:h-full w-full rounded-[1.5rem] lg:rounded-[3.5rem] overflow-hidden border-[6px] md:border-[10px] border-white shadow-xl relative bg-slate-100">
              <iframe src={obtenerUrlEnrutamientoDinamico(rutaMapaSeleccionada)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full"></iframe>
            </div>
          </div>
        )}

        {/* 5. FLOTA VEHICULAR */}
        {activeTab === 'flota' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <button onClick={() => setShowAddAuto(!showAddAuto)} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase italic hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-md cursor-pointer">{showAddAuto ? '❌ Cancelar' : '➕ Agregar Unidad'}</button>
            {showAddAuto && (
              <div className="bg-white p-6 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input type="file" onChange={(e) => setNewAuto({...newAuto, imagen_file: e.target.files[0]})} className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-100 text-xs font-bold" />
                  <input placeholder="Modelo del Auto" className={inputStyle} value={newAuto.modelo} onChange={e => setNewAuto({...newAuto, modelo: e.target.value})} />
                  <input placeholder="Patente" className={inputStyle} value={newAuto.patente} onChange={e => setNewAuto({...newAuto, patente: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-100 flex flex-col gap-1"><label className="text-[9px] font-black uppercase text-slate-400">Color</label><input type="color" className="w-full h-8 border-none bg-transparent" value={newAuto.color} onChange={e => setNewAuto({...newAuto, color: e.target.value})} /></div>
                    <div className="flex flex-col gap-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Caja</label><select className={inputStyle} value={newAuto.transmision} onChange={e => setNewAuto({...newAuto, transmision: e.target.value})}><option value="Manual">Manual</option><option value="Automático">Automático</option></select></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <input type="number" placeholder="Precio USD x Día" className={inputStyle} value={newAuto.precio_base_usd} onChange={e => setNewAuto({...newAuto, precio_base_usd: e.target.value})} />
                  <textarea placeholder="Descripción..." className={`${inputStyle} h-24 resize-none`} value={newAuto.descripcion_larga} onChange={e => setNewAuto({...newAuto, descripcion_larga: e.target.value})} />
                  <button onClick={async () => {
                    const fd = new FormData(); fd.append('modelo', newAuto.modelo); fd.append('patente', newAuto.patente); fd.append('color', newAuto.color); fd.append('transmision', newAuto.transmision || 'Manual'); fd.append('precio_base_usd', newAuto.precio_base_usd); fd.append('descripcion_larga', newAuto.descripcion_larga);
                    if(newAuto.imagen_file) fd.append('imagen', newAuto.imagen_file);
                    await axios.post(`${apiUrl}/api/admin/autos`, fd, { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } });
                    fetchData(); setShowAddAuto(false);
                    setNewAuto({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
                  }} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-md tracking-widest hover:bg-yellow-500 hover:text-slate-900 transition-all uppercase">🚀 GUARDAR VEHÍCULO</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{autos.map(a => (
              <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                <button onClick={() => handleAction('delete', `${apiUrl}/api/admin/autos/${a.id}`)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1"><Trash2 size={18}/></button>
                <img src={a.imagen_url ? `${apiUrl}${a.imagen_url}` : '/car-placeholder.jpg'} className="w-full h-36 object-contain mb-4" alt={a.modelo} />
                <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full border" style={{backgroundColor: a.color}} /><h4 className="text-md font-black uppercase italic text-slate-900">{a.modelo}</h4></div>
                <div className="flex justify-between border-t border-slate-50 pt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest"><span>{a.patente}</span><span className="text-blue-500 font-mono">USD {a.precio_base_usd}/DÍA</span></div>
              </div>
            ))}</div>
          </div>
        )}

        {/* 6. TARIFAS MULTI-AÑO */}
        {activeTab === 'precios' && (() => {
          const listaOriginalPrecios = Array.isArray(preciosMes) ? preciosMes : Object.values(preciosMes);
          const datosMesActual = listaOriginalPrecios.find(p => parseInt(p.mes) === parseInt(selectedMes) && parseInt(p.anio) === parseInt(selectedAnio)) || { precio_dia: 0, cotizacion_dolar: 1400, precio_sillita: 0, cargo_aeropuerto: 0, garantia_ars: 0, garantia_usd: 0 };

          return (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
              <div className="bg-slate-900 p-6 md:p-8 rounded-2xl text-white flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md">
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-black uppercase text-yellow-500 tracking-wider">Tarifas del Sistema</p>
                  <h2 className="text-xl font-black italic uppercase">{mesesNom[selectedMes - 1]} de {selectedAnio}</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <div className="flex items-center justify-between bg-slate-800 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
                    <button onClick={() => setSelectedMes(m => m > 1 ? m - 1 : 12)} className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white"><ChevronLeft size={14}/></button>
                    <span className="text-xs font-black px-4 uppercase text-yellow-400 text-center min-w-[90px]">{mesesNom[selectedMes - 1].substring(0,3)}</span>
                    <button onClick={() => setSelectedMes(m => m < 12 ? m + 1 : 1)} className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white"><ChevronRight size={14}/></button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
                    <button onClick={() => setSelectedAnio(a => a - 1)} className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white"><ChevronLeft size={14}/></button>
                    <span className="text-xs font-black px-4 font-mono text-white text-center min-w-[60px]">{selectedAnio}</span>
                    <button onClick={() => setSelectedAnio(a => a + 1)} className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white"><ChevronRight size={14}/></button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 md:p-6 space-y-3">
                <PriceBox label="VALOR ALQUILER POR DÍA (ARS)" val={datosMesActual.precio_dia} icon="💰" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_dia', valor: v })} />
                <PriceBox label="COTIZACIÓN DEL DÓLAR BLUE" val={datosMesActual.cotizacion_dolar} icon="💵" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'cotizacion_dolar', valor: v })} />
                <PriceBox label="SILLITA DE BEBÉ POR DÍA (ARS)" val={datosMesActual.precio_sillita} icon="👶" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_sillita', valor: v })} />
                <PriceBox label="CARGO LOGÍSTICO AEROPUERTO (ARS)" val={datosMesActual.cargo_aeropuerto} icon="✈️" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'cargo_aeropuerto', valor: v })} />
                <PriceBox label="GARANTÍA EN PESOS (ARS)" val={datosMesActual.garantia_ars} icon="🛡️" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'garantia_ars', valor: v })} />
                <PriceBox label="GARANTÍA EN DÓLARES (USD)" val={datosMesActual.garantia_usd} icon="🇺🇸" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'garantia_usd', valor: v })} />
              </div>
            </div>
          );
        })()}

        {/* 7. EQUIPO STAFF */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 md:p-12 rounded-2xl shadow-md border border-slate-100">
              <h3 className="text-lg font-black italic uppercase mb-6">Invitar Colaborador</h3>
              <div className="space-y-4">
                <input placeholder="Nombre" className={inputStyle} value={newAdmin.nombre} onChange={e => setNewAdmin({...newAdmin, nombre: e.target.value})} />
                <input placeholder="Email" className={inputStyle} value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                <button onClick={() => handleAction('post', `${apiUrl}/api/admin/invite`, newAdmin)} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider"><UserPlus size={18}/> Enviar Invitación</button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">Equipo Activo</h3>
              {admins.map(adm => (
                <div key={adm.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 uppercase text-xs">{adm.nombre?.charAt(0)}</div>
                    <div><p className="font-black text-slate-900 uppercase italic text-xs">{adm.nombre}</p><p className="text-[8px] font-mono text-slate-400 lowercase">{adm.email}</p></div>
                  </div>
                  <button onClick={() => handleAction('delete', `${apiUrl}/api/admin/users/${adm.id}`)} className="text-slate-300 hover:text-red-500 cursor-pointer"><Trash2 size={16}/></button>
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
  return <button onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider cursor-pointer whitespace-nowrap flex-shrink-0 lg:w-full lg:px-7 lg:py-4 ${active ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{icon} {label}</button>;
}

function StatCard({label, val, icon}) {
  return <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"><div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl group-hover:bg-yellow-50 transition-colors">{icon}</div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p><p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">{val}</p></div>;
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
    <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:bg-slate-100/50 transition-colors">
      <div className="flex items-center gap-3 w-full sm:w-1/2">
        <span className="text-lg bg-white w-9 h-9 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">{icon || "📊"}</span>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight">{label}</label>
      </div>
      <div className="flex items-center gap-2 flex-1 justify-end w-full sm:w-auto">
        <input type="number" value={v} onChange={e => setV(e.target.value)} className="w-full sm:w-36 text-right text-md font-black text-slate-900 bg-white border-2 border-slate-200 focus:border-yellow-500 rounded-lg px-3 py-1.5 outline-none font-mono" placeholder="0" />
        <button onClick={handleLocalSave} className={`px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-wider transition-all min-w-[80px] text-center ${guardadoOk ? 'bg-green-600 text-white' : 'bg-slate-900 text-yellow-500'}`}>{guardadoOk ? "✔️ Ok" : "Guardar"}</button>
      </div>
    </div>
  );
}

const inputStyle = "w-full p-3.5 bg-slate-50 rounded-xl border-2 border-slate-100 font-black text-slate-900 text-sm outline-none focus:border-yellow-500 transition-colors";