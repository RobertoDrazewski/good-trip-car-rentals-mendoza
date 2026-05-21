const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs'); 
require('dotenv').config();

const db = require('./config/db');

// --- RUTAS ---
const priceRoutes = require('./routes/prices');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin'); 
const authRoutes = require('./routes/auth');
const routesManagement = require('./routes/routes');
const promoRoutes = require('./routes/promociones'); 
// ✅ NUEVO: Importamos la ruta de reservas para que el Front pueda guardar
const reservaRoutes = require('./routes/reservas'); 

const app = express();

// --- 1. CREACIÓN AUTOMÁTICA DE CARPETAS ---
const uploadDirs = ['uploads/autos', 'uploads/routes', 'uploads/banner', 'public/uploads'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Carpeta creada: ${fullPath}`);
    }
});

// --- 2. PARSING MIDDLEWARES ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. LOGGER PROFESIONAL ---
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// --- 4. SEGURIDAD Y ACCESO ---
const allowedOrigins = [
    'http://localhost:5173', 
    'https://good-trip-car-rentals.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    credentials: true
}));

app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

/// --- 5. ESTÁTICOS (CONFIGURACIÓN CRÍTICA) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 6. RUTAS API ---
app.use('/api/auth', authRoutes);     
app.use('/api/prices', priceRoutes);  
app.use('/api/chat', chatRoutes);     
app.use('/api/admin', adminRoutes); 
app.use('/api/routes', routesManagement);   
app.use('/api/promos', promoRoutes); 
// ✅ NUEVO: Conectamos la ruta para que escuche las peticiones del frontend
app.use('/api/reservas', reservaRoutes); 

// --- 7. HEALTH CHECK ---
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', server: 'Good Trip API v1.2' });
    } catch (e) {
        res.status(503).json({ status: 'error', detail: e.message });
    }
});

// --- 8. MANEJO DE ERRORES ---
app.use((req, res) => res.status(404).json({ message: "Ruta no encontrada" }));

app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(500).json({ message: 'Error interno.', detail: err.message });
});

// --- 9. ARRANQUE ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ESCUCHANDO EN PUERTO ${PORT}`);
});