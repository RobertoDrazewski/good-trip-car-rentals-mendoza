const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs'); 
require('dotenv').config();

const db = require('./config/db');

// --- RUTAS (HE AGREGADO promoRoutes) ---
const priceRoutes = require('./routes/prices');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin'); 
const authRoutes = require('./routes/auth');
const routesManagement = require('./routes/routes');
const promoRoutes = require('./routes/promociones'); // <--- ESTO FALTABA

const app = express();

// --- 1. CREACIÓN AUTOMÁTICA DE CARPETAS ---
const uploadDirs = ['uploads/autos', 'uploads/routes', 'public/uploads'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Carpeta creada: ${dir}`);
    }
});

// --- 2. PARSING MIDDLEWARES ---
// IMPORTANTE: Esto debe ir antes de las rutas
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 3. LOGGER PROFESIONAL ---
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    // Si hay datos, los muestra; si es JSON, los procesa el middleware anterior
    if (req.method !== 'GET') {
        console.log('Datos recibidos:', req.body); 
    }
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

// --- 5. ESTÁTICOS ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 6. RUTAS API (INTEGRACIÓN) ---
app.use('/api/auth', authRoutes);     
app.use('/api/prices', priceRoutes);  
app.use('/api/chat', chatRoutes);     
app.use('/api/admin', adminRoutes); 
app.use('/api/routes', routesManagement);   
app.use('/api/promos', promoRoutes); // <--- AHORA TU BACKEND RECONOCE LAS PROMOS

// --- 7. HEALTH CHECK ---
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', server: 'Mendoza Rent-a-Car API v1.2' });
    } catch (e) {
        res.status(503).json({ status: 'error', database: 'disconnected', detail: e.message });
    }
});

// --- 8. MANEJO DE ERRORES ---
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
    console.error(`[Fatal Error] ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ status: 'error', message: 'Error interno en el servidor.', detail: err.message });
});

// --- 9. ARRANQUE ---
const PORT = process.env.PORT || 3001;
const startServer = async () => {
    try {
        await db.query('SELECT 1');
        app.listen(PORT, () => {
            console.log(`🚀 API CORRIENDO EN PUERTO ${PORT}`);
        });
    } catch (error) {
        console.error('❌ ERROR AL INICIAR:', error.message);
        process.exit(1); 
    }
};

startServer();