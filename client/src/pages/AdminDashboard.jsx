import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  DollarSign, Car, Users, Calendar as CalendarIcon, BarChart3, 
  LogOut, Trash2, Activity, Navigation, Map as MapIcon,
  Settings, MessageCircle, Sparkles, ChevronLeft, ChevronRight, 
  User, Clock, ShieldCheck, FileText, UserPlus,
  Home, BellRing, X, Loader2, CheckCircle
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTranslation } from 'react-i18next'; 

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminDashboard() {
  const { t } = useTranslation(); 
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [isInviting, setIsInviting] = useState(false);
  const usuarioLogueado = localStorage.getItem('userName') || 'Admin';

  const [newLeadAlert, setNewLeadAlert] = useState(false);
  const [recentLeadName, setRecentLeadName] = useState('');
  const [recentLeadPhone, setRecentLeadPhone] = useState('');
  const [recentLeadIsMendoza, setRecentLeadIsMendoza] = useState(false);
  
  const prevLeadsCount = useRef(null);
  const audioCtxRef = useRef(null); 
  const [banners, setBanners] = useState([]);

  // --- ESTADOS PROMOCIONES IA ---
  const [promoData, setPromoData] = useState({ evento: '', descuento: '', inicio: '', fin: '' });
  const [propuestaIA, setPropuestaIA] = useState(null);
  const [iaLoading, setIaLoading] = useState(false);

  const mesesNom = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const puntosEntregaCoordenadas = {
    aeropuerto: "Aeropuerto Internacional Gobernador Francisco Gabrielli, Mendoza",
    km0: "Kilómetro 0, Av. San Martín y Garibaldi, Mendoza"
  };

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const windowAudioCtx = window.AudioContext || window.webkitAudioContext;
        if(windowAudioCtx) audioCtxRef.current = new windowAudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const reproducirAlarmaSonora = () => {
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const windowAudioCtx = window.AudioContext || window.webkitAudioContext;
        if(windowAudioCtx) {
          ctx = new windowAudioCtx();
          audioCtxRef.current = ctx;
        }
      }
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      [0, 0.2, 0.4].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    } catch (e) {
      console.warn("Audio Context bloqueado.");
    }
  };

  const fetchData = async () => {
    try {
      const authHeader = getAuthConfig();
      const [resDash, resAdmins, resPrecios, resRutas, resPromos] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/dashboard`, authHeader),
        axios.get(`${apiUrl}/api/admin/users`, authHeader).catch(() => ({data: []})),
        axios.get(`${apiUrl}/api/admin/precios-mensuales`, authHeader).catch(() => ({data: []})),
        axios.get(`${apiUrl}/api/routes/all`).catch(() => ({data: []})),
        axios.get(`${apiUrl}/api/promos/all`).catch(() => ({data: []}))
      ]);
      
      const nuevasReservas = resDash.data.reservas || [];

      if (prevLeadsCount.current !== null && nuevasReservas.length > prevLeadsCount.current) {
        const reservasOrdenadas = [...nuevasReservas].sort((a, b) => (b.id || 0) - (a.id || 0));
        const ultimoLead = reservasOrdenadas[0] || {}; 
        
        const tel = String(ultimoLead.cliente_whatsapp || ultimoLead.telefono || '');
        setRecentLeadName(ultimoLead.cliente_nombre || 'Nuevo Cliente');
        setRecentLeadPhone(tel);
        setRecentLeadIsMendoza(tel.includes('261'));
        
        setNewLeadAlert(true);
        reproducirAlarmaSonora();
      }

      prevLeadsCount.current = nuevasReservas.length;
      setReservas(nuevasReservas);
      setAutos(resDash.data.autos || []);
      setSettings(resDash.data.settings || {});
      setMetrics(resDash.data.metrics || { ingresosTotales: 0, totalReservas: 0 });
      setAdmins(resAdmins.data || []);
      setBanners(resPromos.data || []);
      
      const listaRutas = resRutas.data || [];
      setRutas(listaRutas);
      if (listaRutas.length > 0 && !rutaMapaSeleccionada) {
        setRutaMapaSeleccionada(listaRutas[0]);
      }

      const mapa = {};
      if (Array.isArray(resPrecios.data)) resPrecios.data.forEach(p => { mapa[p.mes] = p; });
      setPreciosMes(mapa);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(() => { fetchData(); }, 15000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { 
    localStorage.clear(); 
    window.location.href = '/'; 
  };

  const handleAction = async (method, url, data = null) => {
    try {
      const authHeader = getAuthConfig();
      if (method === 'post') await axios.post(url, data, authHeader);
      if (method === 'delete') await axios.delete(url, authHeader);
      if (method === 'put') await axios.put(url, data, authHeader);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // 🚀 NUEVA FUNCIÓN: Actualización Optimista para los Leads
  const cambiarEstadoReserva = async (id, nuevoEstado) => {
    // 1. Modificamos el estado local de React al instante (UX fluida)
    setReservas(prevReservas => prevReservas.map(r => 
      r.id === id ? { ...r, estado: nuevoEstado } : r
    ));
    
    // 2. Realizamos la petición al backend en background
    try {
      // He vuelto a utilizar la ruta /cambiar-estado que tenías inicialmente. 
      // Si tu backend realmente usa el PUT que intentaste poner antes, cámbiala a:
      // await axios.put(`${apiUrl}/api/admin/reservas/${id}/estado`, { estado: nuevoEstado }, getAuthConfig());
      await axios.post(`${apiUrl}/api/admin/cambiar-estado`, { id, estado: nuevoEstado }, getAuthConfig());
    } catch (error) {
      console.error("Error guardando el estado", error);
      alert("Hubo un error al guardar el estado. Verificá la conexión.");
      fetchData(); // Si la API falla, recargamos para revertir al dato real
    }
  };

  // --- FUNCIONES PROMOCIONES IA ---
  const generarPropuestaIA = async () => {
    setIaLoading(true);
    try {
        const res = await axios.post(`${apiUrl}/api/promos/generar-propuesta`, { evento: promoData.evento, descuento: promoData.descuento }, getAuthConfig());
        setPropuestaIA(res.data);
    } catch (e) { alert("Error al generar con IA"); }
    setIaLoading(false);
  };

  const guardarPromo = async () => {
    try {
        await axios.post(`${apiUrl}/api/promos/save-promo`, { ...propuestaIA, descuento: promoData.descuento, fecha_inicio: promoData.inicio, fecha_fin: promoData.fin, titulo: promoData.evento }, getAuthConfig());
        alert("Banner publicado exitosamente en el Home");
        setPropuestaIA(null);
        setPromoData({ evento: '', descuento: '', inicio: '', fin: '' });
        fetchData();
    } catch (e) { alert("Error al guardar la promo."); }
  };

  const obtenerUrlEnrutamientoDinamico = (ruta) => {
    if (!ruta) return "about:blank";
    const origenDireccion = puntosEntregaCoordenadas[puntoOrigenMapa];
    try {
      const destinoLimpio = encodeURIComponent(ruta.titulo + ", Mendoza, Argentina");
      const origenLimpio = encodeURIComponent(origenDireccion);
      return `https://maps.google.com/maps?q=${origenLimpio}&daddr=${destinoLimpio}&noheader=true&z=11&output=embed`;
    } catch (error) {
      return "about:blank";
    }
  };

  const descargarTicketPresupuesto = (reserva) => {
    try {
      const fechaInicioRaw = reserva.fecha_inicio || reserva.desde || '';
      const fechaFinRaw = reserva.fecha_fin || reserva.hasta || '';
      
      const f1 = new Date(String(fechaInicioRaw).substring(0, 10));
      const f2 = new Date(String(fechaFinRaw).substring(0, 10));
      const diasCalculados = Math.ceil(Math.abs(f2 - f1) / (1000 * 60 * 60 * 24)) || 1;
      
      const fechaInicioFormateada = String(fechaInicioRaw).substring(0, 10);
      const fechaFinFormateada = String(fechaFinRaw).substring(0, 10);

      const totalARS = parseFloat(reserva.monto_total_ars || 0).toLocaleString('es-AR');
      const cotizacionDolar = parseFloat(reserva.tasa_dolar_usada || 1400).toLocaleString('es-AR');
      const garantiaUSD = parseFloat(reserva.garantia_usd || 300);
      const garantiaARS = (garantiaUSD * parseFloat(reserva.tasa_dolar_usada || 1400)).toLocaleString('es-AR');
      const lavadoARS = parseFloat(reserva.precio_lavado_aplicado || 16000).toLocaleString('es-AR');

      const lugarRetiroOficial = reserva.lugar_retiro || reserva.entrega || 'Mendoza Ciudad';
      const lugarDevolucionOficial = reserva.lugar_devolucion || reserva.devolucion || 'Mendoza Ciudad';
      const tieneSillita = reserva.sillita === 1 || reserva.sillita === true || String(reserva.sillita) === '1' || String(reserva.sillita) === 'true';

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Presupuesto_${reserva.cliente_nombre ? reserva.cliente_nombre.replace(/\s+/g, '_') : 'Reserva'}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #1e293b; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print-bar { margin-bottom: 25px; display: flex; gap: 15px; }
              .btn-print { background-color: #0ea5e9; color: #ffffff; font-weight: 900; border: none; padding: 14px 35px; border-radius: 50px; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(14,165,233,0.3); transition: all 0.2s; }
              .btn-print:hover { background-color: #0f172a; transform: translateY(-1px); }
              .btn-close { background-color: #e2e8f0; color: #475569; font-weight: 700; border: none; padding: 14px 25px; border-radius: 50px; cursor: pointer; text-transform: uppercase; font-size: 11px; }
              .ticket-container { width: 100%; max-width: 680px; background: #ffffff; padding: 40px; border-radius: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
              .logo-container { text-align: center; margin-bottom: 20px; }
              .logo-alt { font-weight: 900; font-size: 24px; font-style: italic; letter-spacing: -1.5px; text-transform: uppercase; color: #0f172a; }
              .logo-alt span { color: #0ea5e9; }
              .tag-status { background-color: #f0f9ff; color: #0369a1; font-weight: 900; text-transform: uppercase; font-size: 9px; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 50px; width: max-content; margin: 0 auto 20px auto; border: 1px solid #e0f2fe; }
              .title-main { font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; text-align: center; margin-bottom: 6px; color: #0f172a; }
              .title-main span { color: #0ea5e9; }
              .subtitle { color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; margin-bottom: 30px; }
              .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
              .info-card { background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 16px; display: flex; gap: 12px; align-items: flex-start; text-align: left; }
              .info-card .icon-box { font-size: 16px; width: 32px; height: 32px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; flex-shrink: 0; }
              .info-card .content-box { flex-grow: 1; }
              .info-card .label { font-size: 8.5px; font-weight: 900; text-transform: uppercase; color: #94a3b8; }
              .info-card .value { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #1e293b; margin-top: 2px; }
              .info-card .subvalue { font-size: 10.5px; color: #0ea5e9; font-weight: 700; margin-top: 4px; text-transform: uppercase; }
              .info-card .subvalue.gray { color: #64748b; }
              .full-width { grid-column: span 2; }
              .garantia-card { border-left: 4px solid #0ea5e9; background-color: #f0f9ff; }
              .garantia-card .label { color: #0284c7; }
              .total-box { background-color: #0f172a; color: #ffffff; padding: 22px; border-radius: 20px; text-align: center; margin-top: 10px; margin-bottom: 30px; }
              .total-box .total-label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #0ea5e9; letter-spacing: 1.5px; margin-bottom: 2px; }
              .total-box .total-amount { font-size: 32px; font-weight: 900; font-style: italic; }
              .req-section-ticket { border-top: 2px dashed #e2e8f0; padding-top: 25px; text-align: left; }
              .req-title-ticket { font-size: 14px; font-weight: 900; text-transform: uppercase; font-style: italic; color: #0f172a; margin-bottom: 16px; }
              .req-title-ticket span { color: #0ea5e9; }
              .req-grid-ticket { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .req-item-ticket { background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
              .req-item-header { display: flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 900; text-transform: uppercase; font-style: italic; color: #1e293b; }
              .req-item-header span { color: #0ea5e9; font-size: 12px; }
              .req-item-desc { font-size: 10px; color: #475569; font-weight: 600; line-height: 1.4; }
              .footer-ticket { margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; }
              @media print { .no-print-bar { display: none !important; } body { background: #ffffff; padding: 0; } .ticket-container { box-shadow: none !important; border: none !important; padding: 0 !important; } }
            </style>
          </head>
          <body>
            <div class="no-print-bar">
              <button onclick="window.print()" class="btn-print">🖨️ Imprimir Presupuesto Premium</button>
              <button onclick="window.close()" class="btn-close">Cerrar</button>
            </div>
            <div class="ticket-container">
              <div class="logo-container">
                <div class="logo-alt">Good Trip <span>Car Rentals</span></div>
              </div>
              <div class="tag-status">✨ Cotización Oficial Reservada</div>
              <h3 class="title-main">Tu Resumen de <span>Viaje</span></h3>
              <p class="subtitle">Resumen de Cotización para la gestión interna de Good Trip</p>
              <div class="grid-details">
                <div class="info-card"><div class="icon-box">👤</div><div class="content-box"><p class="label">Titular de Reserva</p><p class="value">${reserva.cliente_nombre || 'Cliente'}</p></div></div>
                <div class="info-card"><div class="icon-box">🚗</div><div class="content-box"><p class="label">Vehículo solicitado</p><p class="value">${reserva.auto_modelo || 'Vehículo de Flota'}</p></div></div>
                <div class="info-card"><div class="icon-box">🛫</div><div class="content-box"><p class="label">Retiro / Entrega</p><p class="value">${fechaInicioFormateada} — ${reserva.hora_inicio || '10:00'} hs</p><p class="subvalue">📍 ${lugarRetiroOficial}</p></div></div>
                <div class="info-card"><div class="icon-box">🛬</div><div class="content-box"><p class="label">Devolución</p><p class="value">${fechaFinFormateada} — ${reserva.hora_fin || '10:00'} hs</p><p class="subvalue gray">📍 ${lugarDevolucionOficial}</p></div></div>
                <div class="info-card"><div class="icon-box">⏱️</div><div class="content-box"><p class="label">Tiempo Total</p><p class="value">${diasCalculados} ${diasCalculados === 1 ? 'Día' : 'Días'} de Alquiler</p></div></div>
                <div class="info-card"><div class="icon-box">👶</div><div class="content-box"><p class="label">Opcional Sillita de Bebé</p><p class="value">${tieneSillita ? '✔️ Adicionada' : '❌ No Solicitada'}</p></div></div>
                <div class="info-card"><div class="icon-box">🧼</div><div class="content-box"><p class="label">Servicio de Lavado Obligatorio</p><p class="value">$ ${lavadoARS} ARS</p></div></div>
                <div class="info-card"><div class="icon-box">💵</div><div class="content-box"><p class="label">Tasa Cambio Base</p><p class="value">1 USD = $ ${cotizacionDolar} ARS</p></div></div>
                
                ${reserva.descuento_aplicado_ars > 0 ? `
                  <div class="info-card full-width" style="border-left: 4px solid #10b981; background-color: #ecfdf5;">
                    <div class="icon-box" style="border-color: #10b981; color: #10b981;">✨</div>
                    <div class="content-box">
                      <p class="label" style="color: #059669;">Promoción Especial Aplicada</p>
                      <p class="value">${reserva.porcentaje_promo}% OFF - Ahorro: $ ${parseFloat(reserva.descuento_aplicado_ars).toLocaleString('es-AR')} ARS</p>
                    </div>
                  </div>
                ` : ''}

                <div class="info-card full-width garantia-card"><div class="icon-box">🛡️</div><div class="content-box"><p class="label">Franquicia de Garantía Reembolsable</p><p class="value">$ ${garantiaARS} ARS <span style="font-size: 11px; font-weight: 500; color: #64748b;">(${garantiaUSD} USD)</span></p></div></div>
              </div>
              <div class="total-box">
                <p class="total-label">VALOR TOTAL NETO DE CONTRATO</p>
                <p class="total-amount">$ ${totalARS} ARS</p>
              </div>
              <div class="req-section-ticket">
                <h4 class="req-title-ticket">📋 Requisitos de <span>Alquiler Obligatorios</span></h4>
                <div class="req-grid-ticket">
                  <div class="req-item-ticket"><div class="req-item-header"><span>👥</span> Condiciones Mínimas</div><p class="req-item-desc">Ser mayor de 23 años para conducir nuestras unidades. El período mínimo de alquiler es de 3 días.</p></div>
                  <div class="req-item-ticket"><div class="req-item-header"><span>🛡️</span> Documentación</div><p class="req-item-desc">Licencia de conducir física, vigente y habilitante para vehículos particulares.</p></div>
                  <div class="req-item-ticket"><div class="req-item-header"><span>⛽</span> Kilometraje Libre</div><p class="req-item-desc">Kilómetros ilimitados en todas las unidades y sin cargo por conductor adicional.</p></div>
                  <div class="req-item-ticket"><div class="req-item-header"><span>💳</span> Sin Tarjeta</div><p class="req-item-desc">No solicitamos garantía de tarjeta de crédito para concretar el alquiler.</p></div>
                  <div class="req-item-ticket"><div class="req-item-header"><span>💰</span> Garantía Reembolsable</div><p class="req-item-desc">Depósito de $450.000 ARS o USD 300 (Reembolsable íntegramente al finalizar).</p></div>
                  <div class="req-item-ticket"><div class="req-item-header"><span>📖</span> Guía Turística</div><p class="req-item-desc">Le obsequiamos una guía exclusiva para aprovechar sus rutas en Mendoza.</p></div>
                </div>
              </div>
              <div class="footer-ticket">Good Trip Car Rentals Mendoza • Dev by Puma Code</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) { alert("No se pudo abrir el visor de impresión."); }
  };

  const enviarTicketPorWhatsApp = (reserva) => {
    try {
      const totalARS = parseFloat(reserva.monto_total_ars || 0).toLocaleString('es-AR');
      const textoCajaEnvio = `Hola *${reserva.cliente_nombre.toUpperCase()}*! Te habla ${usuarioLogueado} de Good Trip Car Rentals. A continuación te adjunto el Presupuesto Oficial:`;
      const textoDesgloseCopiado = `📋 PRESUPUESTO GOOD TRIP CAR RENTALS\n\nCliente: ${reserva.cliente_nombre}\nMonto Total Alquiler: $${totalARS} ARS`;
      navigator.clipboard.writeText(textoDesgloseCopiado).catch(() => {});
      const whatsappUrl = `https://wa.me/${String(reserva.cliente_whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textoCajaEnvio)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) { console.error(err); }
  };

  const formatLocalDate = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  if (loading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-[#121319] gap-6"><Activity className="text-[#88BDF2] animate-pulse" size={64} /><span className="text-[#88BDF2] font-black tracking-[0.3em] italic text-xl uppercase">Good Trip Pro...</span></div>;

  const fechaSeleccionadaStr = formatLocalDate(selectedDate);
  const inputStyle = "w-full p-3.5 bg-[#121319] text-white rounded-xl border border-slate-800 font-black text-sm placeholder-[#666D7E] outline-none focus:border-[#88BDF2] transition-colors text-left";

  return (
    <div className="flex min-h-screen w-full bg-[#121319] font-sans text-white max-lg:flex-col relative">
      
      {/* ALERTA DE NUEVO LEAD */}
      {newLeadAlert && (
        <div 
          onClick={() => {
            setActiveTab('ventas');
            setNewLeadAlert(false);
          }}
          className="fixed top-6 right-6 left-6 sm:left-auto sm:w-96 bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.35)] z-[9999] border border-emerald-500 flex gap-4 items-center animate-in fade-in duration-300 cursor-pointer transition-colors select-none"
        >
          <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
            <BellRing size={22} className="text-white animate-pulse" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">¡Nueva Venta Inbound!</p>
            <h4 className="text-sm font-black uppercase tracking-tight truncate mt-0.5">{recentLeadName}</h4>
            <p className="text-xs font-black text-white mt-1">{recentLeadPhone}</p>
            {recentLeadIsMendoza && (
              <span className="inline-block mt-1 bg-[#121319]/80 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/50 uppercase font-black">
                📍 Es de Mendoza
              </span>
            )}
            <p className="text-[10px] text-emerald-100 font-medium leading-tight mt-1.5">Ingresó una nueva solicitud de cotización desde el sitio web.</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setNewLeadAlert(false); }} 
            className="p-2 text-white/80 hover:text-white rounded-xl transition-all cursor-pointer bg-white/10 hover:bg-white/20 flex items-center justify-center relative z-10"
            title="Cerrar Alerta"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* SIDEBAR CORPORATIVO */}
      <aside className="w-80 bg-[#1E222F] p-6 flex flex-col sticky top-0 h-screen border-r border-slate-800/60 z-40 max-lg:w-full max-lg:h-auto max-lg:p-5 max-lg:border-b">
        <div className="flex flex-col gap-1 mb-6 max-lg:mb-3 text-left">
          <div className="flex items-center gap-3">
            <div className="bg-[#121319] p-2 rounded-xl border border-slate-800/40"><Activity className="text-[#88BDF2]" size={20} /></div>
            <span className="text-white font-black italic text-lg tracking-tighter uppercase leading-none">Good Trip</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#88BDF2] mt-1 pl-1">Panel de control</span>
        </div>

        <div className="mb-6 max-lg:mb-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-4 px-6 py-3 bg-[#121319] hover:bg-[#121319]/80 text-[#88BDF2] rounded-xl transition-all border border-slate-800/40 font-black text-[10px] uppercase tracking-wider shadow-inner cursor-pointer"
          >
            <Home size={16} /> Volver a la Web
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5 max-lg:flex-row max-lg:overflow-x-auto max-lg:pb-2 max-lg:scrollbar-none max-lg:w-full">
          <NavBtn active={activeTab==='ventas'} label="Ventas" icon={<BarChart3 size={16}/>} onClick={()=>setActiveTab('ventas')}/>
          <NavBtn active={activeTab==='promos'} label="Promociones IA" icon={<Sparkles size={16}/>} onClick={()=>setActiveTab('promos')}/>
          <NavBtn active={activeTab==='calendario'} label="Calendario" icon={<CalendarIcon size={16}/>} onClick={()=>setActiveTab('calendario')}/>
          <NavBtn active={activeTab==='rutas'} label="Rutas" icon={<Navigation size={16}/>} onClick={()=>setActiveTab('rutas')}/>
          <NavBtn active={activeTab==='mapa'} label="Mapa" icon={<MapIcon size={16}/>} onClick={()=>setActiveTab('mapa')}/>
          <NavBtn active={activeTab==='flota'} label="Flota" icon={<Car size={16}/>} onClick={()=>setActiveTab('flota')}/>
          <NavBtn active={activeTab==='precios'} label="Tarifas" icon={<Settings size={16}/>} onClick={()=>setActiveTab('precios')}/>
          <NavBtn active={activeTab==='staff'} label="Staff" icon={<Users size={16}/>} onClick={()=>setActiveTab('staff')}/>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800/40 max-lg:hidden">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#121319]/40 hover:bg-rose-500/10 text-[#6F7D93] hover:text-rose-400 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <User size={14} className="text-[#6F7D93]" />
              <span className="text-white">{usuarioLogueado}</span>
            </div>
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {/* TOPBAR */}
        <header className="flex justify-between items-center mb-8 md:mb-10 max-sm:flex-col max-sm:items-start max-sm:gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Panel de <span className="text-[#88BDF2]">Control</span></h1>
            <p className="text-[#6F7D93] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">Sistema Operativo • Good Trip Car Rentals</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#1E222F] p-2 pr-6 rounded-2xl border border-slate-800/40 shadow-sm max-sm:w-full max-sm:justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#121319] rounded-xl flex items-center justify-center text-[#88BDF2] font-black border border-slate-800">
                {usuarioLogueado.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black text-white">{usuarioLogueado}</span>
                <span className="text-[9px] font-black text-[#88BDF2] uppercase tracking-tighter bg-[#121319] px-2 py-0.5 rounded-md w-fit border border-slate-800/40">Admin Activo</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-[#6F7D93] hover:text-rose-500 transition-colors bg-[#121319] rounded-lg border border-slate-800/40"><LogOut size={16} /></button>
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
              {/* METRICAS */}
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
                  icon={<DollarSign className="text-emerald-400"/>}
                />
                <StatCard 
                  label="Leads Pendientes" 
                  val={reservasCronologicas.filter(r => r.estado === 'pendiente' || !r.estado).length} 
                  icon={<Clock className="text-[#88BDF2]"/>}
                />
                <StatCard 
                  label="Confirmadas Globales" 
                  val={reservasCronologicas.filter(r => r.estado === 'confirmado' || r.estado === 'contratado').length} 
                  icon={<CheckCircle className="text-emerald-400"/>}
                />
                <div className="bg-[#1E222F] p-6 rounded-[2rem] text-white flex flex-col justify-center shadow-sm border border-slate-800/40 text-left">
                  <p className="text-[10px] font-black uppercase text-[#88BDF2] tracking-[0.2em] mb-1">Dólar Configurado</p>
                  <p className="text-2xl font-black italic text-white leading-none">
                    $ {preciosMes[new Date().getMonth() + 1]?.cotizacion_dolar || settings?.cotizacion_dolar || '1400'} <span className="text-xs font-bold text-[#6F7D93] not-italic">ARS</span>
                  </p>
                </div>
              </div>

              {/* LISTADO MAESTRO */}
              <div className="bg-[#1E222F] rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-800/40 overflow-hidden">
                <div className="bg-[#121319] px-6 md:px-8 py-4 flex items-center justify-between border-b border-slate-800/60">
                  <p className="text-[11px] md:text-xs font-black text-[#88BDF2] uppercase tracking-widest italic">📋 Listado Maestro Sincronizado</p>
                  <span className="text-[9px] bg-[#1E222F] text-slate-300 px-3 py-1 rounded-full font-bold border border-slate-800/40">{reservasCronologicas.length} Ops</span>
                </div>
                
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-[#121319]/80 text-[#6F7D93] text-[9px] uppercase tracking-widest border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10">
                      <tr>
                        <th className="px-6 py-4 font-black">Estado Alquiler</th>
                        <th className="px-6 py-4 font-black">Garantía</th>
                        <th className="px-6 py-4 font-black">Cliente / Vehículo</th>
                        <th className="px-6 py-4 font-black text-center">Sillita 👶</th>
                        <th className="px-6 py-4 font-black">Retiro</th>
                        <th className="px-6 py-4 font-black">Devolución</th>
                        <th className="px-6 py-4 font-black text-center">Chat</th>
                        <th className="px-6 py-4 font-black text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {reservasCronologicas.map(r => {
                        const tel = String(r.cliente_whatsapp || r.telefono || '');
                        const isMendoza = tel.includes('261');
                        return (
                        <tr key={r.id} className="hover:bg-[#121319]/40 transition-colors group">
                          <td className="p-6 text-left">
                            <select 
                              value={r.estado || 'pendiente'} 
                              onChange={(e) => cambiarEstadoReserva(r.id, e.target.value)} 
                              className="bg-[#121319] text-white font-black text-[10px] px-2 py-1 uppercase rounded-md border border-slate-800 outline-none cursor-pointer"
                            >
                              <option value="pendiente">⏳ Pendiente</option>
                              
                              <option value="contratado">🤝 Contratado</option>
                              
                            </select>
                          </td>
                          <td className="p-6 text-left">
                            <select 
                              value={localStorage.getItem(`g_res_${r.id}`) || 'pendiente'} 
                              onChange={(e) => { localStorage.setItem(`g_res_${r.id}`, e.target.value); fetchData(); }} 
                              className="bg-[#121319] text-[#88BDF2] font-black text-[9px] px-2 py-1 uppercase rounded-md border border-slate-800 outline-none cursor-pointer"
                            >
                              <option value="pendiente">⏳ Pendiente</option>
                              <option value="pagado">💵 Bloqueada</option>
                              <option value="resubido">✔️ Devuelta</option>
                            </select>
                          </td>
                          <td className="p-6 text-left">
                            <p className="font-bold text-sm text-white uppercase">{r.cliente_nombre}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] font-black text-slate-400">{tel || 'Sin Teléfono'}</p>
                              {isMendoza && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] px-1.5 py-0.5 rounded uppercase font-black">Mendoza</span>}
                            </div>
                            <p className="text-[10px] font-black text-[#88BDF2] uppercase mt-1">{r.auto_modelo}</p>
                            <p className="text-xs font-black text-emerald-400 mt-1">Monto: ${parseFloat(r.monto_total_ars || 0).toLocaleString('es-AR')}</p>
                          </td>
                          <td className="p-6 text-center">
                            {r.sillita === 1 || r.sillita === true || String(r.sillita) === '1' || String(r.sillita) === 'true' ? 
                              <span className="bg-emerald-500/10 text-emerald-400 font-black text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20">✔️ Sí</span> : 
                              <span className="bg-[#121319] text-[#6F7D93] font-bold text-[10px] px-2.5 py-1 rounded-full border border-slate-800/60">❌ No</span>
                            }
                          </td>
                          <td className="p-6 text-left">
                            <p className="text-xs font-black text-slate-300">{r.fecha_inicio?.substring(0, 10)}</p>
                            <p className="text-xs font-black text-white italic mt-0.5">⏱ {r.hora_inicio || '10:00'}</p>
                            <p className="text-[10px] font-black text-[#88BDF2] uppercase mt-1 italic">📍 {r.lugar_retiro}</p>
                          </td>
                          <td className="p-6 text-left">
                            <p className="text-xs font-black text-slate-300">{r.fecha_fin?.substring(0, 10)}</p>
                            <p className="text-xs font-black text-white italic mt-0.5">⏱ {r.hora_fin || '10:00'}</p>
                            <p className="text-[10px] font-black text-[#6F7D93] uppercase mt-1 italic">📍 {r.lugar_devolucion}</p>
                          </td>
                          <td className="p-6 text-center">
                            <a href={`https://wa.me/${String(r.cliente_whatsapp || r.telefono || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex p-2.5 bg-[#121319] text-slate-300 rounded-xl hover:bg-emerald-500 hover:text-white border border-slate-800/60 transition-all shadow-sm">
                              <MessageCircle size={16} />
                            </a>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => enviarTicketPorWhatsApp(r)} title="Enviar Ticket Whatsapp" className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-bold cursor-pointer shadow-[0_5px_15px_rgba(16,185,129,0.2)]">📩</button>
                              <button onClick={() => descargarTicketPresupuesto(r)} title="Ver Presupuesto" className="p-2.5 bg-[#121319] text-[#88BDF2] border border-slate-800/60 rounded-xl hover:bg-[#88BDF2] hover:text-[#121319] transition-all cursor-pointer"><FileText size={16} /></button>
                              <button onClick={() => { if(window.confirm('⚠️ ¿Eliminar reserva permanentemente?')) handleAction('delete', `${apiUrl}/api/admin/reservas/${r.id}`); }} title="Eliminar Reserva" className="p-2.5 bg-[#121319] text-[#6F7D93] border border-slate-800/60 rounded-xl hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>

                {/* VERSIÓN MOBILE */}
                <div className="lg:hidden divide-y divide-slate-800/40">
                  {reservasCronologicas.map(r => {
                    const tel = String(r.cliente_whatsapp || r.telefono || '');
                    const isMendoza = tel.includes('261');
                    return(
                    <div key={r.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-white uppercase">{r.cliente_nombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-black text-slate-400">{tel || 'Sin Teléfono'}</p>
                            {isMendoza && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] px-1.5 py-0.5 rounded uppercase font-black">Mendoza</span>}
                          </div>
                          <p className="text-[10px] font-black text-[#88BDF2] uppercase mt-1">{r.auto_modelo}</p>
                          <p className="text-xs font-black text-emerald-400 mt-1">Monto: ${parseFloat(r.monto_total_ars || 0).toLocaleString('es-AR')}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <select 
                              value={r.estado || 'pendiente'} 
                              onChange={(e) => cambiarEstadoReserva(r.id, e.target.value)} 
                              className="bg-[#121319] text-white font-black text-[9px] px-2 py-1 uppercase rounded-md border border-slate-800 outline-none"
                            >
                              <option value="pendiente">⏳ Pendiente</option>
                              <option value="confirmado">✔️ Confirmado</option>
                              <option value="contratado">🤝 Contratado</option>
                              <option value="cancelado">❌ Cancelado</option>
                          </select>
                          {r.sillita === 1 || r.sillita === true || String(r.sillita) === '1' || String(r.sillita) === 'true' ? 
                            <span className="bg-emerald-500/10 text-emerald-400 font-black text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20">Sillita ✔️</span> : 
                            null
                          }
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 bg-[#121319] p-3 rounded-xl border border-slate-800/40">
                        <div>
                          <p className="text-[9px] font-black text-[#666D7E] uppercase mb-1">Retiro</p>
                          <p className="text-xs font-black text-white">{r.fecha_inicio?.substring(0, 10)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">⏱ {r.hora_inicio || '10:00'}</p>
                          <p className="text-[9px] font-black text-[#88BDF2] uppercase truncate mt-0.5">📍 {r.lugar_retiro}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-[#666D7E] uppercase mb-1">Devolución</p>
                          <p className="text-xs font-black text-white">{r.fecha_fin?.substring(0, 10)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">⏱ {r.hora_fin || '10:00'}</p>
                          <p className="text-[9px] font-black text-[#6F7D93] uppercase truncate mt-0.5">📍 {r.lugar_devolucion}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#666D7E]">Garantía:</span>
                          <select 
                            value={localStorage.getItem(`g_res_${r.id}`) || 'pendiente'} 
                            onChange={(e) => { localStorage.setItem(`g_res_${r.id}`, e.target.value); fetchData(); }} 
                            className="bg-[#121319] text-white font-black text-[9px] px-2 py-1 uppercase rounded-md border border-slate-800 outline-none"
                          >
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="pagado">💵 Bloqueada</option>
                            <option value="resubido">✔️ Devuelta</option>
                          </select>
                        </div>
                        <div className="flex gap-1.5">
                          <a href={`https://wa.me/${String(r.cliente_whatsapp || r.telefono || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-[#121319] text-slate-300 border border-slate-800/40 rounded-lg"><MessageCircle size={16} /></a>
                          <button onClick={() => enviarTicketPorWhatsApp(r)} className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">📩</button>
                          <button onClick={() => descargarTicketPresupuesto(r)} className="p-2 bg-[#121319] text-[#88BDF2] border border-slate-800/40 rounded-lg"><FileText size={16} /></button>
                          <button onClick={() => { if(window.confirm('⚠️ ¿Eliminar?')) handleAction('delete', `${apiUrl}/api/admin/reservas/${r.id}`); }} className="p-2 bg-[#121319] text-[#6F7D93] border border-slate-800/40 rounded-lg hover:text-rose-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          );
        })()}


{activeTab === 'promos' && (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* FORMULARIO DE GENERACIÓN */}
      <div className="bg-[#1E222F]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-left">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#121319] p-3 rounded-2xl border border-slate-800/60">
            <Sparkles className="text-amber-400" size={24}/>
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Generador IA</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6F7D93]">Diseño inteligente de banners</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-[#88BDF2] tracking-wider pl-1">Motivo o Evento</label>
            <input placeholder="Ej. Black Friday, Verano..." className={inputStyle} value={promoData.evento} onChange={e => setPromoData({...promoData, evento: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-[#88BDF2] tracking-wider pl-1">Descuento (%)</label>
            <input type="number" placeholder="Ej. 15" className={inputStyle} value={promoData.descuento} onChange={e => setPromoData({...promoData, descuento: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-[#88BDF2] tracking-wider pl-1">Inicio</label>
              <input type="date" className={inputStyle} value={promoData.inicio} onChange={e => setPromoData({...promoData, inicio: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-[#88BDF2] tracking-wider pl-1">Fin</label>
              <input type="date" className={inputStyle} value={promoData.fin} onChange={e => setPromoData({...promoData, fin: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={generarPropuestaIA} 
            disabled={iaLoading || !promoData.evento || !promoData.descuento || !promoData.inicio || !promoData.fin}
            className="w-full mt-4 bg-[#88BDF2] text-[#121319] p-4 rounded-xl font-black text-sm flex justify-center items-center gap-2 uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {iaLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
            {iaLoading ? 'Diseñando Banner...' : 'Generar Propuesta IA'}
          </button>
        </div>
      </div>

      {/* VISTA PREVIA Y PUBLICACIÓN */}
      <div className="bg-[#1E222F]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center min-h-[400px]">
        {!propuestaIA ? (
          <div className="text-[#6F7D93] flex flex-col items-center gap-4">
            <Sparkles size={48} className="opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest italic max-w-[200px] leading-tight">La propuesta gráfica aparecerá aquí</p>
          </div>
        ) : (
          <div className="w-full text-left animate-in fade-in duration-500">
            <p className="text-[9px] font-black uppercase text-emerald-400 mb-3 tracking-widest">Vista Previa del Banner</p>
            <img src={propuestaIA.imagen_url} alt="Promo" className="w-full h-48 object-cover rounded-2xl border border-white/10 shadow-lg mb-6" />
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{promoData.evento}</h4>
            <p className="text-sm font-medium text-slate-300 italic mb-4">"{propuestaIA.descripcion}"</p>
            
            <button 
              onClick={async () => {
                try {
                  await axios.post(`${apiUrl}/api/promos/save-promo`, {
                    titulo: promoData.evento,
                    descripcion: propuestaIA.descripcion,
                    imagen_url: propuestaIA.imagen_url,
                    descuento: promoData.descuento,
                    fecha_inicio: promoData.inicio,
                    fecha_fin: promoData.fin
                  });
                  alert("🚀 ¡Banner publicado en la web oficial!");
                  // Refrescar lista manualmente
                  handleAction('list', `${apiUrl}/api/promos/all`);
                } catch (e) { alert("Error al publicar"); }
              }} 
              className="w-full bg-emerald-600 p-4 rounded-xl font-black text-white hover:bg-emerald-500 transition-all uppercase tracking-widest cursor-pointer shadow-lg"
            >
              🚀 Publicar en Web Oficial
            </button>
          </div>
        )}
      </div>
    </div>

    {/* LISTADO DE BANNERS */}
    <div className="bg-[#1E222F]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl text-left mt-6">
      <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase italic tracking-tighter">
        <Activity size={20} className="text-[#88BDF2]" /> Banners Publicados
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-[10px] uppercase bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-4">Imagen</th>
              <th className="px-6 py-4">Evento</th>
              <th className="px-6 py-4">Descuento</th>
              <th className="px-6 py-4">Vigencia</th>
              <th className="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? banners.map(b => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <img src={b.imagen_url.startsWith('http') ? b.imagen_url : `${apiUrl}${b.imagen_url}`} className="w-20 h-12 object-cover rounded-xl border border-white/10" />
                </td>
                <td className="px-6 py-4 font-black text-white uppercase">{b.titulo}</td>
                <td className="px-6 py-4 text-emerald-400 font-black">{b.descuento}% OFF</td>
                <td className="px-6 py-4 text-[10px]">
                  <span className="block text-slate-400">Desde: {b.fecha_inicio?.substring(0, 10)}</span>
                  <span className="block text-slate-400 mt-1">Hasta: {b.fecha_fin?.substring(0, 10)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleAction('delete', `${apiUrl}/api/promos/${b.id}`)}
                    className="text-rose-500 hover:text-white p-3 bg-white/5 rounded-xl border border-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic uppercase text-[10px] tracking-widest">No hay banners publicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

        {/* 3. CALENDARIO */}
        {activeTab === 'calendario' && (
          <div className="bg-[#1E222F] p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-800/40 animate-in fade-in duration-500 overflow-hidden w-full max-w-full">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 text-left flex items-center gap-2"><CalendarIcon size={24} className="text-[#88BDF2]"/> Calendario <span className="text-slate-500 text-sm">Operativo</span></h2>
            <div className="overflow-x-auto w-full scrollbar-none pb-4">
              <div className="min-w-[800px] w-full">
                <style>{`
                  .react-calendar { width: 100%; border: none !important; background: transparent !important; font-family: inherit; color: #fff; }
                  .react-calendar__navigation { margin-bottom: 20px; }
                  .react-calendar__navigation button { color: #88BDF2; min-width: 44px; background: #121319; border: 1px solid #1E222F; border-radius: 12px; margin: 0 4px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
                  .react-calendar__navigation button:enabled:hover { background-color: #88BDF2; color: #121319; }
                  .react-calendar__month-view__weekdays { text-transform: uppercase; font-weight: 900; font-size: 0.7rem; color: #6F7D93; letter-spacing: 1px; }
                  .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
                  .react-calendar__month-view__days__day--weekend { color: #rose-400; }
                  .react-calendar__tile { height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; align-items: center !important; padding: 8px 4px !important; border: 1px solid #1E222F !important; background: #121319; color: #fff; transition: all 0.2s ease; }
                  .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #1E222F !important; }
                  .react-calendar__tile--now { background: #1E222F !important; font-weight: bold; border: 1px solid #5383B3 !important; }
                  .react-calendar__tile--active { background-color: #1E222F !important; border: 2px solid #88BDF2 !important; color: #88BDF2 !important; }
                  @media (max-width: 640px) { .react-calendar__tile { height: 80px !important; } }
                  .patente-tag { font-size: 7px !important; font-weight: 900 !important; text-transform: uppercase; background-color: #121319 !important; color: #88BDF2 !important; padding: 2px 4px !important; border-radius: 4px !important; width: 100% !important; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px solid rgba(136,189,242,0.2); }
                  .calendar-car-thumb { width: 100%; height: 35px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
                  @media (max-width: 640px) { .calendar-car-thumb { height: 20px; } }
                `}</style>
                <Calendar 
                  onChange={setSelectedDate} 
                  value={selectedDate} 
                  formatDay={(locale, date) => date.getDate()} 
                  tileContent={({ date, view }) => {
                    if (view !== 'month') return null;
                    const fechaCelda = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    
                    const reservasDelDia = reservas.filter(r => {
                      if (!r.auto_id || !r.fecha_inicio || !r.fecha_fin) return false;
                      const fInit = r.fecha_inicio.substring(0, 10);
                      const fEnd = r.fecha_fin.substring(0, 10);
                      return fInit <= fechaCelda && fEnd >= fechaCelda && (r.estado === 'confirmado' || r.estado === 'contratado');
                    });

                    if (reservasDelDia.length === 0) return null;

                    return (
                      <div className="w-full flex flex-col gap-1 mt-1 px-1 overflow-y-auto scrollbar-none h-full pt-1">
                        {reservasDelDia.map((r, idx) => {
                          const infoAuto = autos.find(a => a.id === r.auto_id);
                          return (
                            <div key={idx} className="w-full flex flex-col items-center bg-[#1E222F] border border-slate-700/50 rounded p-1" title={`${infoAuto?.modelo} - ${r.cliente_nombre}`}>
                              {infoAuto?.imagen_url && <img src={`${apiUrl}${infoAuto.imagen_url}`} alt="car" className="calendar-car-thumb" />}
                              <span className="patente-tag mt-0.5">{infoAuto?.patente || 'S/P'}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800/60">
              <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-4 text-left">Estado de Flota para el <span className="text-[#88BDF2]">{fechaSeleccionadaStr}</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {autos.map(auto => {
                  const idTerm = auto.id;
                  const reservaActiva = reservas.find(r => 
                    r.auto_id === idTerm && r.fecha_inicio?.split('T')[0] <= fechaSeleccionadaStr && r.fecha_fin?.split('T')[0] >= fechaSeleccionadaStr && (r.estado === 'confirmado' || r.estado === 'contratado')
                  );
                  const estaOcupado = !!reservaActiva;
                  
                  return (
                    <div key={auto.id} className={`flex items-center p-4 rounded-2xl border transition-all duration-300 ${estaOcupado ? 'border-rose-900/40 bg-rose-950/20' : 'border-slate-800/40 bg-[#121319]/50 hover:border-emerald-500/30'}`}>
                      <div className="w-24 h-16 bg-[#121319] rounded-xl p-1 flex items-center justify-center border border-slate-800/40 shadow-sm flex-shrink-0 overflow-hidden">
                        {auto.imagen_url ? <img src={`${apiUrl}${auto.imagen_url}`} alt={auto.modelo} className="w-full h-full object-contain" /> : <span className="text-[10px] text-[#666D7E] font-bold uppercase">Sin Foto</span>}
                      </div>
                      <div className="ml-4 flex-grow flex flex-col justify-between h-full min-w-0 text-left">
                        <div className="min-w-0">
                          <h5 className="font-bold text-white text-sm truncate uppercase tracking-tight">{auto.modelo}</h5>
                          <p className="text-[10px] text-[#6F7D93] font-mono font-bold mt-0.5 tracking-wider">PATENTE: <span className="bg-[#121319] text-[#88BDF2] border border-slate-800/60 px-1 py-0.5 rounded">{auto.patente || 'S/P'}</span></p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {estaOcupado ? (
                            <>
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                              </span>
                              <span className="text-[10px] font-black uppercase text-rose-400 truncate">Ocupado: {reservaActiva.cliente_nombre}</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={12} className="text-emerald-500" />
                              <span className="text-[10px] font-black uppercase text-emerald-500">Disponible</span>
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

        {/* 4. RUTAS */}
        {activeTab === 'rutas' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <div className="bg-[#1E222F] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-800/40">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-2"><Navigation size={24} className="text-[#88BDF2]"/> Agregar Nueva Ruta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input placeholder="Título de la Ruta" className={inputStyle} value={newRuta.nombre} onChange={e => setNewRuta({...newRuta, nombre: e.target.value})} />
                  <textarea placeholder="Descripción Breve" className={`${inputStyle} h-24 resize-none`} value={newRuta.descripcion} onChange={e => setNewRuta({...newRuta, descripcion: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <input placeholder="Enlace a Google Maps (Opcional)" className={inputStyle} value={newRuta.maps_url} onChange={e => setNewRuta({...newRuta, maps_url: e.target.value})} />
                  <input type="file" accept="image/*" className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#88BDF2] file:text-[#121319] hover:file:bg-[#5383B3]`} onChange={e => setNewRuta({...newRuta, imagen: e.target.files[0]})} />
                  <button onClick={async () => {
                    const fd = new FormData();
                    fd.append('titulo', newRuta.nombre);
                    fd.append('descripcion', newRuta.descripcion);
                    fd.append('maps_url', newRuta.maps_url);
                    if(newRuta.imagen) fd.append('imagen', newRuta.imagen);
                    await axios.post(`${apiUrl}/api/routes/add`, fd, getAuthConfig());
                    setNewRuta({ nombre: '', descripcion: '', imagen: null, maps_url: '' });
                    fetchData();
                  }} className="w-full bg-[#88BDF2] text-[#121319] p-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#5383B3] hover:text-white transition-colors cursor-pointer">Guardar Ruta</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rutas.map(r => (
                <div key={r.id} className="bg-[#1E222F] p-5 rounded-2xl flex justify-between items-center shadow-sm border border-slate-800/40">
                  <span className="font-black text-xs uppercase italic truncate max-w-[180px] text-white">{r.titulo}</span>
                  <button onClick={()=>handleAction('delete', `${apiUrl}/api/routes/${r.id}`)} className="text-[#6F7D93] hover:text-rose-500 cursor-pointer transition-colors"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MAPA INTERACTIVO */}
        {activeTab === 'mapa' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[700px] animate-in fade-in duration-500 text-left">
            <div className="bg-[#1E222F] p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/40 flex flex-col justify-between gap-5 shadow-2xl">
              <div className="space-y-4 overflow-y-auto max-h-[400px] lg:max-h-[520px] scrollbar-none">
                <div>
                  <p className="text-[9px] font-black uppercase text-[#88BDF2] tracking-[0.2em] mb-1">Logística de Entregas VIP</p>
                  <h3 className="text-base font-black text-white uppercase italic tracking-tight">{t('routes_title', 'Trazador')}</h3>
                </div>
                
                <div className="bg-[#121319] p-3 rounded-xl border border-slate-800/40">
                  <p className="text-[9px] font-black uppercase text-[#6F7D93] mb-2">📍 {t('lugar_retiro', 'Lugar Retiro')}:</p>
                  <div className="w-full">
                    <button type="button" onClick={() => setPuntoOrigenMapa('aeropuerto')} className={`w-full py-2.5 px-2 rounded-lg text-[9px] font-black uppercase transition-all mb-2 flex items-center justify-center gap-2 ${puntoOrigenMapa === 'aeropuerto' ? 'bg-[#88BDF2] text-[#121319] shadow-md' : 'bg-[#1E222F] text-slate-300 border border-slate-800/60 hover:bg-slate-800'}`}>
                      ✈️ Aeropuerto
                    </button>
                    <button type="button" onClick={() => setPuntoOrigenMapa('km0')} className={`w-full py-2.5 px-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${puntoOrigenMapa === 'km0' ? 'bg-[#88BDF2] text-[#121319] shadow-md' : 'bg-[#1E222F] text-slate-300 border border-slate-800/60 hover:bg-slate-800'}`}>
                      🏙️ Ciudad
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-[#6F7D93] mb-2">🗺️ Destino Sugerido:</p>
                  {rutas.map(ruta => (
                    <button
                      key={ruta.id}
                      onClick={() => setRutaMapaSeleccionada(ruta)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${rutaMapaSeleccionada?.id === ruta.id ? 'bg-[#88BDF2]/10 border-[#88BDF2] shadow-sm' : 'bg-[#121319] border-slate-800/60 hover:border-slate-700'}`}
                    >
                      <h4 className={`text-xs font-black uppercase tracking-tight truncate ${rutaMapaSeleccionada?.id === ruta.id ? 'text-[#88BDF2]' : 'text-slate-300'}`}>{ruta.titulo}</h4>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 bg-[#1E222F] rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/40 p-2 overflow-hidden shadow-2xl relative">
              {rutaMapaSeleccionada ? (
                <iframe
                  title="Mapa de Entregas"
                  src={obtenerUrlEnrutamientoDinamico(rutaMapaSeleccionada)}
                  className="w-full h-[400px] lg:h-full rounded-[1rem] md:rounded-[2rem] border-none grayscale-[20%] contrast-125"
                  loading="lazy"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4 min-h-[400px]">
                  <MapIcon size={48} className="opacity-20" />
                  <span className="text-xs font-black uppercase tracking-widest">Seleccione una ruta de destino</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. FLOTA */}
        {activeTab === 'flota' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <div className="flex justify-between items-center bg-[#1E222F] p-4 md:p-6 rounded-2xl border border-slate-800/40">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2"><Car size={24} className="text-[#88BDF2]"/> Vehículos <span className="text-slate-500 text-sm">Registrados</span></h2>
              <button onClick={() => setShowAddAuto(!showAddAuto)} className="bg-[#88BDF2] text-[#121319] px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#5383B3] hover:text-white transition-all cursor-pointer">
                {showAddAuto ? 'Cerrar Panel' : '+ Nuevo Vehículo'}
              </button>
            </div>

            {showAddAuto && (
              <div className="bg-[#1E222F] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-slate-800/40 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input placeholder="Modelo del Auto" className={inputStyle} value={newAuto.modelo} onChange={e => setNewAuto({...newAuto, modelo: e.target.value})} />
                    <input placeholder="Patente" className={inputStyle} value={newAuto.patente} onChange={e => setNewAuto({...newAuto, patente: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#121319] p-3 rounded-xl border border-slate-800/40 flex flex-col gap-1"><label className="text-[9px] font-black uppercase text-[#666D7E]">Color</label><input type="color" className="w-full h-8 border-none bg-transparent cursor-pointer" value={newAuto.color} onChange={e => setNewAuto({...newAuto, color: e.target.value})} /></div>
                      <div className="flex flex-col gap-1"><label className="text-[9px] font-black uppercase text-[#666D7E] ml-2">Caja</label><select className={inputStyle} value={newAuto.transmision} onChange={e => setNewAuto({...newAuto, transmision: e.target.value})}><option value="Manual">Manual</option><option value="Automático">Automático</option></select></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input type="number" placeholder="Precio USD x Día" className={inputStyle} value={newAuto.precio_base_usd} onChange={e => setNewAuto({...newAuto, precio_base_usd: e.target.value})} />
                    <textarea placeholder="Descripción..." className={`${inputStyle} h-24 resize-none`} value={newAuto.descripcion_larga} onChange={e => setNewAuto({...newAuto, descripcion_larga: e.target.value})} />
                    <input type="file" accept="image/*" className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#88BDF2] file:text-[#121319] hover:file:bg-[#5383B3]`} onChange={e => setNewAuto({...newAuto, imagen_file: e.target.files[0]})} />
                    <button onClick={async () => {
                      const authHeader = getAuthConfig();
                      const fd = new FormData();
                      fd.append('modelo', newAuto.modelo);
                      fd.append('patente', newAuto.patente);
                      fd.append('color', newAuto.color);
                      fd.append('transmision', newAuto.transmision || 'Manual');
                      fd.append('precio_base_usd', newAuto.precio_base_usd);
                      fd.append('descripcion_larga', newAuto.descripcion_larga);
                      if(newAuto.imagen_file) fd.append('imagen', newAuto.imagen_file);
                      await axios.post(`${apiUrl}/api/admin/autos`, fd, { headers: { ...authHeader.headers, 'Content-Type': 'multipart/form-data' } });
                      setShowAddAuto(false);
                      setNewAuto({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
                      fetchData();
                    }} className="w-full bg-[#88BDF2] text-[#121319] p-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#5383B3] hover:text-white transition-colors cursor-pointer">Guardar Unidad</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {autos.map(a => (
                <div key={a.id} className="bg-[#1E222F] p-5 rounded-[1.5rem] flex flex-col items-center shadow-lg border border-slate-800/40 relative group overflow-hidden">
                  <div className="absolute top-4 left-4 flex gap-1 z-10">
                    <span className="bg-[#121319] text-[#88BDF2] text-[8px] font-black px-2 py-1 rounded border border-slate-800 uppercase tracking-widest shadow-sm">{a.transmision}</span>
                    <span className="bg-[#121319] text-white text-[8px] font-black px-2 py-1 rounded border border-slate-800 tracking-widest shadow-sm">{a.patente}</span>
                  </div>
                  <button onClick={() => { if(window.confirm('¿Eliminar?')) handleAction('delete', `${apiUrl}/api/admin/autos/${a.id}`); }} className="absolute top-4 right-4 text-[#6F7D93] hover:text-rose-500 bg-[#121319] p-1.5 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 shadow-sm"><Trash2 size={14}/></button>
                  <div className="w-full h-32 bg-[#121319] rounded-xl flex items-center justify-center p-2 mt-8 mb-4 border border-slate-800/40 overflow-hidden shadow-inner">
                    {a.imagen_url ? <img src={`${apiUrl}${a.imagen_url}`} alt={a.modelo} className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform" /> : <Car size={40} className="text-slate-700" />}
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-tight text-white mb-1 w-full text-center truncate px-2">{a.modelo}</h3>
                  <p className="text-[#88BDF2] font-black text-lg italic tracking-tighter">USD {a.precio_base_usd}<span className="text-[10px] text-[#6F7D93] not-italic tracking-normal"> / día</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TARIFAS MULTI-AÑO */}
        {activeTab === 'precios' && (() => {
          const listaOriginalPrecios = Array.isArray(preciosMes) ? preciosMes : Object.values(preciosMes);
          const datosMesActual = listaOriginalPrecios.find(p => parseInt(p.mes) === parseInt(selectedMes) && parseInt(p.anio) === parseInt(selectedAnio)) || { precio_dia: 0, cotizacion_dolar: 1400, precio_sillita: 0, cargo_aeropuerto: 0, garantia_ars: 0, garantia_usd: 0, precio_lavado: 0 };

          return (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 text-left">
              <div className="bg-[#1E222F] p-6 md:p-8 rounded-2xl text-white flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md border border-slate-800/40">
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-black uppercase text-[#88BDF2] tracking-wider">Tarifas del Sistema</p>
                  <h2 className="text-xl font-black italic uppercase text-white">{mesesNom[selectedMes - 1]} de {selectedAnio}</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <div className="flex items-center justify-between bg-[#121319] p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                    <button onClick={() => setSelectedMes(m => m > 1 ? m - 1 : 12)} className="w-8 h-8 bg-[#1E222F] border border-slate-800/60 rounded-lg flex items-center justify-center font-bold text-white"><ChevronLeft size={14}/></button>
                    <span className="text-xs font-black px-4 uppercase text-[#88BDF2] text-center min-w-[90px]">{mesesNom[selectedMes - 1].substring(0,3)}</span>
                    <button onClick={() => setSelectedMes(m => m < 12 ? m + 1 : 1)} className="w-8 h-8 bg-[#1E222F] border border-slate-800/60 rounded-lg flex items-center justify-center font-bold text-white"><ChevronRight size={14}/></button>
                  </div>
                  <div className="flex items-center justify-between bg-[#121319] p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                    <button onClick={() => setSelectedAnio(a => a - 1)} className="w-8 h-8 bg-[#1E222F] border border-slate-800/60 rounded-lg flex items-center justify-center font-bold text-white"><ChevronLeft size={14}/></button>
                    <span className="text-xs font-black px-4 font-mono text-white text-center min-w-[60px]">{selectedAnio}</span>
                    <button onClick={() => setSelectedAnio(a => a + 1)} className="w-8 h-8 bg-[#1E222F] border border-slate-800/60 rounded-lg flex items-center justify-center font-bold text-white"><ChevronRight size={14}/></button>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E222F] rounded-2xl shadow-md border border-slate-800/40 p-4 md:p-6 space-y-3">
                <PriceBox label="VALOR ALQUILER POR DÍA (ARS)" val={datosMesActual.precio_dia} icon="💰" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_dia', valor: v })} />
                <PriceBox label="COTIZACIÓN DEL DÓLAR BLUE" val={datosMesActual.cotizacion_dolar} icon="💵" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'cotizacion_dolar', valor: v })} />
                <PriceBox label="SILLITA DE BEBÉ POR DÍA (ARS)" val={datosMesActual.precio_sillita} icon="👶" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_sillita', valor: v })} />
                <PriceBox label="TARIFA DE LAVADO DEL AUTO (ARS)" val={datosMesActual.precio_lavado || 0} icon="🧼" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'precio_lavado', valor: v })} />
                <PriceBox label="CARGO LOGÍSTICO AEROPUERTO (ARS)" val={datosMesActual.cargo_aeropuerto} icon="✈️" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'cargo_aeropuerto', valor: v })} />
                <PriceBox label="GARANTÍA EN PESOS (ARS)" val={datosMesActual.garantia_ars} icon="🛡️" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'garantia_ars', valor: v })} />
                <PriceBox label="GARANTÍA EN DÓLARES (USD)" val={datosMesActual.garantia_usd} icon="🇺🇸" onSave={(v) => handleAction('post', `${apiUrl}/api/admin/update-precio-mensual`, { mes: selectedMes, anio: selectedAnio, campo: 'garantia_usd', valor: v })} />
              </div>
            </div>
          );
        })()}


        {/* 8. STAFF */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1 bg-[#1E222F] p-6 md:p-8 rounded-[1.5rem] shadow-xl border border-slate-800/40 h-fit">
                <h2 className="text-lg font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-2"><UserPlus size={20} className="text-[#88BDF2]"/> Nuevo Integrante</h2>
                <div className="space-y-4">
                  <input placeholder="Nombre Completo" className={inputStyle} value={newAdmin.nombre} onChange={e => setNewAdmin({...newAdmin, nombre: e.target.value})} />
                  <input type="email" placeholder="Email" className={inputStyle} value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                  <button 
                    disabled={isInviting}
                    onClick={async () => {
                      if (!newAdmin.nombre || !newAdmin.email) {
                        alert("Por favor completá el nombre y el email para enviar la invitación.");
                        return;
                      }
                      setIsInviting(true);
                      try {
                        const authHeader = getAuthConfig();
                        await axios.post(`${apiUrl}/api/admin/invite`, newAdmin, authHeader);
                        setNewAdmin({ nombre: '', email: '' });
                        alert("¡Alta directa procesada! Las credenciales fueron enviadas a la casilla.");
                        fetchData();
                      } catch (err) {
                        console.error("❌ Error staff:", err);
                        const serverMessage = err.response?.data?.error || "Error de conexión.";
                        alert(`No se pudo procesar: ${serverMessage}`);
                      } finally {
                        setIsInviting(false);
                      }
                    }} 
                    className="w-full bg-[#88BDF2] text-[#121319] p-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider hover:bg-[#5383B3] hover:text-white transition-all cursor-pointer disabled:bg-slate-800 disabled:text-[#666D7E]"
                  >
                    {isInviting ? (
                      <Loader2 className="animate-spin text-[#121319]" size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {isInviting ? 'Procesando Alta...' : 'Dar de Alta Equipo'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-[#1E222F] p-6 md:p-8 rounded-[1.5rem] shadow-xl border border-slate-800/40">
                <h2 className="text-lg font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-2"><Users size={20} className="text-[#88BDF2]"/> Directorio Activo</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {admins.map(a => (
                    <div key={a.id} className="bg-[#121319] p-4 rounded-2xl flex items-center gap-4 border border-slate-800/60 shadow-sm relative group">
                      <div className="w-12 h-12 bg-[#1E222F] rounded-xl flex items-center justify-center text-[#88BDF2] font-black text-lg border border-slate-800 shadow-inner">
                        {a.nombre?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-sm uppercase truncate">{a.nombre}</p>
                        <p className="text-[10px] text-[#6F7D93] truncate tracking-wider">{a.email}</p>
                      </div>
                      <button onClick={() => { if(window.confirm('⚠️ ¿Remover acceso permanentemente?')) handleAction('delete', `${apiUrl}/api/admin/users/${a.id}`); }} className="absolute right-4 text-[#6F7D93] hover:text-rose-500 bg-[#1E222F] p-2 rounded-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES
function NavBtn({ active, label, icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-left flex-shrink-0 cursor-pointer ${
        active ? 'bg-[#88BDF2] text-[#121319] shadow-[0_10px_20px_rgba(136,189,242,0.15)]' : 'text-[#6F7D93] hover:bg-[#121319] hover:text-white'
      }`}
    >
      <span className={active ? 'text-[#121319]' : 'text-[#88BDF2]'}>{icon}</span> {label}
    </button>
  );
}

function StatCard({ label, val, icon }) {
  return (
    <div className="bg-[#1E222F] p-6 rounded-[2rem] flex items-center gap-4 shadow-sm border border-slate-800/40 text-left hover:border-slate-700 transition-colors">
      <div className="bg-[#121319] p-4 rounded-2xl border border-slate-800/60 shadow-inner">{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase text-[#6F7D93] tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black italic text-white leading-none tracking-tighter">{val}</p>
      </div>
    </div>
  );
}

function PriceBox({ label, val, icon, onSave }) {
  const [v, setV] = useState(val || 0);
  const [guardadoOk, setGuardadoOk] = useState(false);
  
  useEffect(() => { setV(val || 0); }, [val]);

  const handleLocalSave = () => {
    onSave(v);
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 2000);
  };

  return (
    <div className="bg-[#121319] p-3 sm:p-4 rounded-xl border border-slate-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:bg-[#121319]/60 transition-colors text-left">
      <div className="flex items-center gap-3 w-full sm:w-1/2">
        <span className="text-lg bg-[#1E222F] border border-slate-800/60 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">{icon || "📊"}</span>
        <label className="text-[10px] font-black text-[#6F7D93] uppercase tracking-wider leading-tight">{label}</label>
      </div>
      <div className="flex items-center gap-2 flex-1 justify-end w-full sm:w-auto">
        <input type="number" value={v} onChange={e => setV(e.target.value)} className="w-full sm:w-36 text-right text-md font-black text-white bg-[#1E222F] border border-slate-800 focus:border-[#88BDF2] rounded-lg px-3 py-2 outline-none transition-colors" />
        <button onClick={handleLocalSave} className={`px-4 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${guardadoOk ? 'bg-emerald-600 text-white' : 'bg-[#88BDF2] text-[#121319] hover:bg-[#5383B3] hover:text-white'}`}>
          {guardadoOk ? <CheckCircle size={14}/> : 'Guardar'}
        </button>
      </div>
    </div>
  );
}