// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Importamos nuestras rutas limpias
const documentosRoutes = require('./routes/documentosRoutes');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Configuración de Multer (Archivos)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nombreUnico + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ======== CONEXIÓN DE RUTAS ========

// Toda petición a /api/documentos se va a nuestro archivo de rutas
app.use('/api/documentos', documentosRoutes);

// Ruta de subida de archivos (la dejamos aquí por simplicidad)
app.post('/api/upload', upload.single('archivoFisico'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
        res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al subir archivo' });
    }
});

// Arrancar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor JS Arquitectura Limpia en http://localhost:${PORT}`);
});