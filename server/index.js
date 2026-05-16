const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs'); 
require('dotenv').config();

const db = require('./config/db');

// Rutas
const priceRoutes = require('./routes/prices');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin'); 
const authRoutes = require('./routes/auth');
const routesManagement = require('./routes/routes');

const app = express();

// --- 1. CREACIÓN AUTOMÁTICA DE CARPETAS (PUMA CODE SHIELD) ---
const uploadDirs = ['uploads/autos', 'uploads/routes'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Carpeta creada: ${dir}`);
    }
});

// --- 2. PARSING MIDDLEWARES ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 3. LOGGER PROFESIONAL ---
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
        console.log('Datos recibidos:', req.body); 
    }
    next();
});

// --- 4. SEGURIDAD Y ACCESO (CORS OPTIMIZADO PARA PRODUCCIÓN) ---
const allowedOrigins = [
    'http://localhost:5173', // Tu Mac local
    'https://good-trip-car-rentals.onrender.com' // Tu web en producción
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o apps móviles) o si están en la lista
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por políticas de CORS de Mendoza Rent-a-car'));
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

// --- 6. RUTAS API ---
app.use('/api/auth', authRoutes);     
app.use('/api/prices', priceRoutes);  
app.use('/api/chat', chatRoutes);     
app.use('/api/admin', adminRoutes); 
app.use('/api/routes', routesManagement);   

// --- 7. HEALTH CHECK ---
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ 
            status: 'ok', 
            database: 'connected',
            server: 'Mendoza Rent-a-Car API v1.2 (Railway Optimized)'
        });
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
    res.status(500).json({ 
        status: 'error', 
        message: 'Error interno en el servidor de Puma Code.',
        detail: err.message 
    });
});

// --- 9. ARRANQUE ---
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await db.query('SELECT 1');
        app.listen(PORT, () => {
            console.log(`
    *************************************************
    🚀 MENDOZA RENT-A-CAR API - SISTEMA ACTIVO
    📦 Directorios de carga: VERIFICADOS
    🔗 Puerto asignado por Render: ${PORT}
    *************************************************
            `);
        });
    } catch (error) {
        console.error('❌ ERROR AL INICIAR EL SERVIDOR:', error.message);
        process.exit(1); 
    }
};

startServer();