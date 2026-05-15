import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  DollarSign, Car, Users, Calendar as CalendarIcon, BarChart3, 
  LogOut, Trash2, Activity, Navigation, Bell, Map as MapIcon,
  Settings, Plus, MessageCircle, Save, CheckCircle, 
  Sparkles, ChevronLeft, ChevronRight, Search, User,
  Clock, Image as ImageIcon, UserPlus, ShieldCheck
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ventas');
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [reservas, setReservas] = useState([]);
  const [autos, setAutos] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [metrics, setMetrics] = useState({ ingresosTotales: 0, totalReservas: 0 });
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [preciosMes, setPreciosMes] = useState({});
  const [rutas, setRutas] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [newRuta, setNewRuta] = useState({ nombre: '', descripcion: '', imagen: null, maps_url: '' });
  const [showAddAuto, setShowAddAuto] = useState(false);
  const [newAuto, setNewAuto] = useState({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
  const [newAdmin, setNewAdmin] = useState({ nombre: '', email: '' });

  const mesesNom = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

  const fetchData = async () => {
    try {
      const [resDash, resAdmins, resPrecios, resRutas] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/dashboard', config),
        axios.get('http://localhost:3001/api/admin/users', config).catch(() => ({data: []})),
        axios.get('http://localhost:3001/api/admin/precios-mensuales', config).catch(() => ({data: []})),
        axios.get('http://localhost:3001/api/routes/all').catch(() => ({data: []}))
      ]);
      setReservas(resDash.data.reservas || []);
      setAutos(resDash.data.autos || []);
      setSettings(resDash.data.settings || {});
      setMetrics(resDash.data.metrics || { ingresosTotales: 0, totalReservas: 0 });
      setAdmins(resAdmins.data || []);
      setRutas(resRutas.data || []);
      const mapa = {};
      if (Array.isArray(resPrecios.data)) resPrecios.data.forEach(p => { mapa[p.mes] = p; });
      setPreciosMes(mapa);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  const handleAction = async (method, url, data = null) => {
    try {
      if (method === 'post') await axios.post(url, data, config);
      if (method === 'delete') await axios.delete(url, config);
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 gap-6"><Activity className="text-yellow-500 animate-pulse" size={64} /><span className="text-yellow-500 font-black tracking-[0.3em] italic text-xl uppercase tracking-widest">Mendoza Rent Pro...</span></div>;

  return (
    <div className="flex min-h-screen w-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-slate-900 p-8 flex flex-col sticky top-0 h-screen border-r border-white/5 z-40">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-yellow-500 p-2 rounded-xl"><Activity className="text-slate-900" size={24} /></div>
          <span className="text-white font-black italic text-2xl tracking-tighter uppercase">Mendoza<span className="text-yellow-500">Rent</span></span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <NavBtn active={activeTab==='ventas'} label="Ventas & Leads" icon={<BarChart3 size={20}/>} onClick={()=>setActiveTab('ventas')}/>
          <NavBtn active={activeTab==='calendario'} label="Calendario" icon={<CalendarIcon size={20}/>} onClick={()=>setActiveTab('calendario')}/>
          <NavBtn active={activeTab==='rutas'} label="Gestión Rutas" icon={<Navigation size={20}/>} onClick={()=>setActiveTab('rutas')}/>
          <NavBtn active={activeTab==='mapa'} label="Mapa Mendoza" icon={<MapIcon size={20}/>} onClick={()=>setActiveTab('mapa')}/>
          <NavBtn active={activeTab==='flota'} label="Flota Vehicular" icon={<Car size={20}/>} onClick={()=>setActiveTab('flota')}/>
          <NavBtn active={activeTab==='precios'} label="Tarifas 2026" icon={<Settings size={20}/>} onClick={()=>setActiveTab('precios')}/>
          <NavBtn active={activeTab==='staff'} label="Equipo Staff" icon={<Users size={20}/>} onClick={()=>setActiveTab('staff')}/>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* TOPBAR (MAURICIO SUPER ADMIN) */}
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
              <button onClick={handleLogout} className="ml-4 p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"><LogOut size={18} /></button>
            </div>
          </div>
        </header>

        {/* 1. VENTAS */}
        {activeTab === 'ventas' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-3 gap-8">
              <StatCard label="Ingresos (ARS)" val={`$${metrics.ingresosTotales.toLocaleString()}`} icon={<DollarSign className="text-green-500"/>}/>
              <StatCard label="Leads Pendientes" val={reservas.filter(r=>r.estado==='pendiente').length} icon={<Clock className="text-yellow-500"/>}/>
              <StatCard label="Confirmadas" val={metrics.totalReservas} icon={<CheckCircle className="text-blue-500"/>}/>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-8">Estado</th><th className="p-8">Cliente</th><th className="p-8">WhatsApp</th><th className="p-8">Acción</th></tr></thead>
                <tbody className="divide-y divide-slate-50">{reservas.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-8">
                      <select value={r.estado} onChange={(e) => handleAction('post', 'http://localhost:3001/api/admin/cambiar-estado', {id: r.id, estado: e.target.value})} className="bg-slate-100 border-none rounded-xl font-black text-[10px] px-4 py-2 uppercase outline-none">
                        <option value="pendiente">🟠 Pendiente</option><option value="contratado">🟢 Confirmado</option><option value="rechazado">🔴 Rechazado</option>
                      </select>
                    </td>
                    <td className="p-8"><p className="text-xl font-black italic uppercase text-slate-900 leading-none">{r.cliente_nombre}</p><p className="text-[10px] font-black text-blue-500 uppercase mt-2 tracking-widest">{r.auto_modelo}</p></td>
                    <td className="p-8 text-center"><a href={`https://wa.me/${r.cliente_whatsapp}`} target="_blank" rel="noreferrer" className="inline-block p-3 bg-green-50 text-green-500 rounded-2xl hover:scale-110 transition-transform"><MessageCircle size={28} fill="currentColor" fillOpacity={0.1}/></a></td>
                    <td className="p-8 text-center"><button onClick={()=>handleAction('delete', `http://localhost:3001/api/admin/reservas/${r.id}`)} className="text-slate-300 hover:text-red-400 p-2"><Trash2 size={22}/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. CALENDARIO COMPACTO CON DISPONIBILIDAD */}
        {activeTab === 'calendario' && (
          <div className="space-y-6 animate-in zoom-in duration-500 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <style>{`
                .react-calendar { width: 100% !important; border: none !important; }
                .react-calendar__tile { 
                  height: 70px !important; border-radius: 16px !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; font-weight: 800 !important; font-size: 14px !important; border: 2px solid transparent !important;
                }
                .react-calendar__tile--now { background: #fffbeb !important; color: #d97706 !important; border-color: #fef3c7 !important; }
                .react-calendar__tile--active { background: #0f172a !important; color: white !important; }
                .react-calendar__navigation button { font-size: 16px !important; font-weight: 900 !important; text-transform: uppercase !important; }
                .dot-container { display: flex; justify-content: center; gap: 2px; margin-top: 4px; }
                .res-dot { width: 6px; height: 6px; border-radius: 50%; }
              `}</style>
              <Calendar tileContent={({ date, view }) => {
                if (view === 'month' && reservas.length > 0) {
                  const d = new Date(date); d.setHours(0,0,0,0);
                  const resDelDia = reservas.filter(r => {
                    if (r.estado === 'rechazado' || !r.fecha_inicio || !r.fecha_fin) return false;
                    const inicio = new Date(r.fecha_inicio); inicio.setHours(0,0,0,0);
                    const fin = new Date(r.fecha_fin); fin.setHours(0,0,0,0);
                    return d >= inicio && d <= fin;
                  });
                  if (resDelDia.length > 0) {
                    return (
                      <div className="dot-container">
                        {resDelDia.map((res, idx) => {
                          const autoData = autos.find(a => a.id === res.auto_id);
                          return <div key={idx} className="res-dot" style={{ backgroundColor: autoData?.color || '#cbd5e1' }} />;
                        })}
                      </div>
                    );
                  }
                }
                return null;
              }} locale="es-AR" />
            </div>

            {/* Disponibilidad de autos debajo del calendario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {autos.map(auto => {
                const hoy = new Date().toISOString().split('T')[0];
                const estaOcupado = reservas.some(r => r.auto_id === auto.id && r.estado === 'contratado' && hoy >= r.fecha_inicio?.split('T')[0] && hoy <= r.fecha_fin?.split('T')[0]);
                return (
                  <div key={auto.id} className="bg-slate-900 p-5 rounded-[1.5rem] flex items-center justify-between border border-white/5 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: auto.color || '#cbd5e1', border: '1px solid rgba(255,255,255,0.3)' }} />
                      <p className="text-white font-black italic text-sm uppercase leading-none truncate w-24">{auto.modelo}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg font-black text-[8px] uppercase border ${estaOcupado ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {estaOcupado ? 'OCUPADO' : 'LIBRE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. RUTAS */}
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
                    const res = await axios.post('http://localhost:3001/api/routes/ai-desc', { titulo: newRuta.nombre, descripcion_base: newRuta.descripcion }, config);
                    setNewRuta({...newRuta, descripcion: res.data.suggestion});
                  }} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 hover:text-slate-900 transition-all uppercase"><Sparkles size={18}/> Mejorar con IA</button>
                  <button onClick={async () => {
                    const fd = new FormData(); fd.append('titulo', newRuta.nombre); fd.append('descripcion', newRuta.descripcion); fd.append('maps_url', newRuta.maps_url); fd.append('imagen', newRuta.imagen);
                    await axios.post('http://localhost:3001/api/routes/save', fd, { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } });
                    fetchData(); setNewRuta({nombre:'', descripcion:'', imagen: null, maps_url:''});
                  }} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase italic">Guardar Ruta</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">{rutas.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-[2rem] flex justify-between items-center shadow-sm border border-slate-100">
                <span className="font-black text-xs uppercase italic truncate max-w-[150px]">{r.titulo}</span>
                <button onClick={()=>handleAction('delete', `http://localhost:3001/api/routes/${r.id}`)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
              </div>
            ))}</div>
          </div>
        )}

        {/* 4. MAPA (REPARADO) */}
        {activeTab === 'mapa' && (
          <div className="animate-in zoom-in h-[650px] w-full duration-500">
            <div className="h-full w-full rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-2xl relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3350.2372797274!2d-68.847587!3d-32.890184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e091216091931%3A0x6a2c262f2757262f!2sMendoza%2C%20Argentina!5e0!3m2!1ses!2sar!4v1715732100000!5m2!1ses!2sar" 
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        )}

        {/* 5. FLOTA VEHICULAR (REPARADA) */}
{activeTab === 'flota' && (
  <div className="space-y-8 animate-in fade-in duration-500">
    <button 
      onClick={() => setShowAddAuto(!showAddAuto)} 
      className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase italic hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-xl"
    >
      {showAddAuto ? '❌ Cancelar Registro' : '➕ Agregar Nueva Unidad'}
    </button>

    {showAddAuto && (
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 grid grid-cols-2 gap-10">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Foto del Vehículo</label>
            <input type="file" onChange={(e) => setNewAuto({...newAuto, imagen_file: e.target.files[0]})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 text-xs font-bold" />
          </div>
          <input placeholder="Modelo del Auto" className={inputStyle} value={newAuto.modelo} onChange={e => setNewAuto({...newAuto, modelo: e.target.value})} />
          <input placeholder="Patente" className={inputStyle} value={newAuto.patente} onChange={e => setNewAuto({...newAuto, patente: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2 border-2 border-slate-100">
              <label className="text-[10px] font-black uppercase text-slate-400">Color Calendario</label>
              <input type="color" className="w-full h-10 border-none bg-transparent cursor-pointer" value={newAuto.color} onChange={e => setNewAuto({...newAuto, color: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Transmisión</label>
               <select className={inputStyle} value={newAuto.transmision} onChange={e => setNewAuto({...newAuto, transmision: e.target.value})}>
                 <option value="Manual">Manual</option>
                 <option value="Automático">Automático</option>
               </select>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-4">
          <input type="number" placeholder="Precio USD x Día" className={inputStyle} value={newAuto.precio_base_usd} onChange={e => setNewAuto({...newAuto, precio_base_usd: e.target.value})} />
          <textarea placeholder="Descripción de equipamiento..." className={`${inputStyle} h-32 resize-none`} value={newAuto.descripcion_larga} onChange={e => setNewAuto({...newAuto, descripcion_larga: e.target.value})} />
          
          <button 
            onClick={async () => {
              const fd = new FormData(); 
              fd.append('modelo', newAuto.modelo); 
              fd.append('patente', newAuto.patente); 
              fd.append('color', newAuto.color); 
              // --- CORRECCIÓN CRÍTICA AQUÍ ---
              fd.append('transmision', newAuto.transmision || 'Manual'); 
              fd.append('precio_base_usd', newAuto.precio_base_usd); 
              fd.append('descripcion_larga', newAuto.descripcion_larga); 
              
              if(newAuto.imagen_file) fd.append('imagen', newAuto.imagen_file);

              try {
                await axios.post('http://localhost:3001/api/admin/autos', fd, { 
                  headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } 
                });
                fetchData(); 
                setShowAddAuto(false);
                // Reset de formulario
                setNewAuto({ modelo: '', precio_base_usd: '', patente: '', color: '#000000', descripcion_larga: '', transmision: 'Manual', imagen_file: null });
              } catch (err) {
                console.error("Error al registrar auto:", err);
                alert("Error al registrar el auto. Verifica la consola del servidor.");
              }
            }} 
            className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black text-xl hover:bg-yellow-500 hover:text-slate-900 transition-all italic shadow-lg"
          >
            🚀 REGISTRAR UNIDAD EN FLOTA
          </button>
        </div>
      </div>
    )}

    {/* GRILLA DE AUTOS */}
    <div className="grid grid-cols-3 gap-8">
      {autos.map(a => (
        <div key={a.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all duration-300">
          <button 
            onClick={() => handleAction('delete', `http://localhost:3001/api/admin/autos/${a.id}`)} 
            className="absolute top-6 right-6 text-slate-200 hover:text-red-500 transition-colors p-2"
          >
            <Trash2 size={20}/>
          </button>
          
          <img 
            src={a.imagen_url ? `http://localhost:3001${a.imagen_url}` : '/car-placeholder.jpg'} 
            className="w-full h-44 object-contain mb-6 group-hover:scale-105 transition-transform" 
            alt={a.modelo}
          />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-4 rounded-full border shadow-inner" style={{backgroundColor: a.color}} />
            <h4 className="text-xl font-black uppercase italic text-slate-900 leading-none">{a.modelo}</h4>
          </div>
          
          <div className="flex justify-between border-t border-slate-50 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>{a.patente}</span>
            <span className="text-blue-500">USD {a.precio_base_usd}/DÍA</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        {/* 6. TARIFAS Y GARANTÍAS */}
        {activeTab === 'precios' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-xl border border-white/5">
              <h2 className="text-2xl font-black italic uppercase">Tarifas Mensuales <span className="text-yellow-500">{mesesNom[selectedMes-1]}</span></h2>
              <div className="flex gap-4">
                <button onClick={()=>setSelectedMes(m=>m>1?m-1:12)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><ChevronLeft/></button>
                <button onClick={()=>setSelectedMes(m=>m<12?m+1:1)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><ChevronRight/></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PriceBox label="VALOR DÍA (ARS)" val={preciosMes[selectedMes]?.precio_dia || settings.precio_dia} onSave={(v) => handleAction('post', 'http://localhost:3001/api/admin/update-precio-mensual', {mes: selectedMes, anio: 2026, campo: 'precio_dia', valor: v})} />
              <PriceBox label="DÓLAR BLUE" val={preciosMes[selectedMes]?.cotizacion_dolar || settings.cotizacion_dolar} onSave={(v) => handleAction('post', 'http://localhost:3001/api/admin/update-precio-mensual', {mes: selectedMes, anio: 2026, campo: 'cotizacion_dolar', valor: v})} />
              <PriceBox label="SILLITA BEBÉ" val={preciosMes[selectedMes]?.precio_sillita || settings.precio_sillita} onSave={(v) => handleAction('post', 'http://localhost:3001/api/admin/update-precio-mensual', {mes: selectedMes, anio: 2026, campo: 'precio_sillita', valor: v})} />
              <PriceBox label="TASA AEROPUERTO" val={preciosMes[selectedMes]?.cargo_aeropuerto || settings.cargo_aeropuerto} onSave={(v) => handleAction('post', 'http://localhost:3001/api/admin/update-precio-mensual', {mes: selectedMes, anio: 2026, campo: 'cargo_aeropuerto', valor: v})} />
              <PriceBox label="GARANTÍA (ARS)" icon={<ShieldCheck size={16}/>} val={preciosMes[selectedMes]?.garantia_ars || settings.garantia_ars} onSave={(v) => handleAction('post', 'http://localhost:3001/api/admin/update-precio-mensual', {mes: selectedMes, anio: 2026, campo: 'garantia_ars', valor: v})} />
              <PriceBox label="GARANTÍA (USD)" icon={<ShieldCheck size={16}/>} val={preciosMes[selectedMes]?.garantia_usd || settings.garantia_usd} onSave={(v) => handleAction('post', 'http://localhost:3001/api/admin/update-precio-mensual', {mes: selectedMes, anio: 2026, campo: 'garantia_usd', valor: v})} />
            </div>
          </div>
        )}

        {/* 7. STAFF (RESTAURADO) */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-2 gap-12 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black italic uppercase mb-8">Invitar Colaborador</h3>
              <div className="space-y-4">
                <input placeholder="Nombre" className={inputStyle} value={newAdmin.nombre} onChange={e => setNewAdmin({...newAdmin, nombre: e.target.value})} />
                <input placeholder="Email" className={inputStyle} value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                <button onClick={() => handleAction('post', 'http://localhost:3001/api/admin/invite', newAdmin)} className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-lg hover:bg-yellow-500 hover:text-slate-900 transition-all flex items-center justify-center gap-3"><UserPlus size={20}/> Enviar Invitación</button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Equipo Activo</h3>
              {admins.map(adm => (
                <div key={adm.id} className="bg-white p-5 rounded-[1.5rem] flex justify-between items-center shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 uppercase">{adm.nombre.charAt(0)}</div>
                    <div><p className="font-black text-slate-900 uppercase italic text-sm">{adm.nombre}</p><p className="text-[9px] font-bold text-slate-400 lowercase">{adm.email}</p></div>
                  </div>
                  <button onClick={() => handleAction('delete', `http://localhost:3001/api/admin/users/${adm.id}`)} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES
function NavBtn({active, label, icon, onClick}) {
  return <button onClick={onClick} className={`w-full flex items-center gap-4 px-7 py-4 rounded-[1.2rem] transition-all font-black text-[10px] uppercase tracking-wider ${active ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>{icon} {label}</button>;
}

function StatCard({label, val, icon}) {
  return <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"><div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:bg-yellow-50 transition-colors">{icon}</div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">{val}</p></div>;
}

function PriceBox({label, val, onSave, icon}) {
  const [v, setV] = useState(val || 0);
  useEffect(() => { setV(val || 0); }, [val]);
  return <div className="bg-white p-6 rounded-[1.8rem] border border-slate-100 flex justify-between items-center shadow-sm"><div className="flex items-center gap-2"><span className="text-yellow-500">{icon}</span><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label></div><div className="flex gap-4 items-center"><input type="number" value={v} onChange={e=>setV(e.target.value)} className="w-32 text-right text-xl font-black text-slate-900 bg-slate-50 border-none rounded-xl px-4 py-2 outline-none" /><button onClick={()=>onSave(v)} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-yellow-500 transition-colors"><Save size={18}/></button></div></div>;
}

const inputStyle = "w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-100 font-black text-slate-900 outline-none focus:border-yellow-500 transition-colors";