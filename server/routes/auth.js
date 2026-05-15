const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE DE PROTECCIÓN (Solo admins pueden crear otros admins) ---
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET || 'PumaCode2026', (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// 🔐 LOGIN (Público)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
        const admin = rows[0];

        if (!admin) return res.status(401).json({ message: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: admin.id, role: admin.rol }, 
            process.env.JWT_SECRET || 'PumaCode2026', 
            { expiresIn: '24h' }
        );

        res.json({ token, username: admin.username, role: admin.rol });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
});

// ➕ AGREGAR NUEVO ADMIN (Protegido)
router.post('/register', verifyToken, async (req, res) => {
    const { nombre, username, email, password, rol } = req.body;

    try {
        // Encriptamos la contraseña antes de guardar
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO admins (nombre, username, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, username, email, hashedPass, rol || 'editor']
        );
        res.json({ status: 'success', message: 'Nuevo administrador creado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar (el usuario o email ya existe)' });
    }
});

// 📋 LISTAR ADMINS (Protegido)
router.get('/users', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nombre, username, email, rol, created_at FROM admins');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// 🗑️ ELIMINAR ADMIN (Protegido)
router.delete('/user/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Evitar que Mauricio se borre a sí mismo por error
        if (req.userId == id) return res.status(400).json({ message: "No podés borrar tu propia cuenta" });

        await db.query('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// 🛠️ SETUP INICIAL: Crear a Mauricio si la tabla está vacía
// Solo usar la primera vez, luego comentar o borrar por seguridad
router.post('/setup-root', async (req, res) => {
    const { pass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pass, salt);
        await db.query(
            'INSERT INTO admins (nombre, username, email, password_hash, rol) VALUES (?,?,?,?,?)',
            ['Mauricio Manoni', 'mauricio', 'mauricio@mendozarentacar.com.ar', hash, 'superadmin']
        );
        res.json({ message: "Root admin creado. Usuario: mauricio" });
    } catch (e) { res.status(500).send(e.message); }
});

module.exports = router;