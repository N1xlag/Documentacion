// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ======== SISTEMA DE LOGS ========
const logFile = fs.createWriteStream(path.join(__dirname, '../errores.log'), { flags: 'a' });
const originalError = console.error;
console.error = function (...args) {
    const fecha = new Date().toISOString();
    logFile.write(`[${fecha}] ERROR: ${args.join(' ')}\n`);
    originalError.apply(console, args);
};

const documentosRoutes = require('./routes/documentosRoutes');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// CORRECCIÓN 1: La carpeta uploads ahora se crea correctamente dentro de backend
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nombreUnico + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const permitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (permitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Formato de archivo no permitido. Solo PDF, JPG y PNG.'), false);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// ======== RUTAS ========
app.use('/api/documentos', documentosRoutes);

app.post('/api/upload', upload.single('archivoFisico'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
        res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        console.error('Error en Multer:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/upload', (req, res) => {
    const { ruta } = req.body;
    if (!ruta) return res.status(400).json({ error: 'Ruta no proporcionada' });
    
    // CORRECCIÓN 2: Extraemos solo el nombre del archivo para evitar confusiones de Windows
    const nombreArchivo = ruta.split('/').pop(); 
    const rutaFisica = path.join(__dirname, '../uploads', nombreArchivo);
    
    fs.unlink(rutaFisica, (err) => {
        if (err) console.error(`No se pudo borrar temporal: ${rutaFisica}`, err);
    });
    res.json({ mensaje: 'Archivo temporal eliminado' });
});

app.listen(PORT, '0.0.0.0', () => { 
    console.log(`🚀 Servidor Seguro corriendo en el puerto ${PORT}`);
});