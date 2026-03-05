// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cron = require('node-cron');
const docService = require('./services/documentosService'); // Importamos tu servicio

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

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ======== ROBOT DE BACKUPS AUTOMÁTICOS ========
// 1. Asegurarnos de que exista una carpeta secreta llamada "backups_automaticos"
const dirBackups = path.join(__dirname, '../backups_automaticos');
if (!fs.existsSync(dirBackups)){
    fs.mkdirSync(dirBackups);
}

// 2. Programar la alarma: '0 17 * * *' significa "Todos los días a las 17:00 (5 PM)"
cron.schedule('0 17 * * *', async () => {
    console.log('⏳ [5:00 PM] Iniciando Backup Automático del Sistema...');
    try {
        // Le pedimos al cerebro que junte todos los datos
        const backup = await docService.generarBackupTotal();
        
        // Creamos un nombre con la fecha de hoy (Ej: Respaldo_2026-03-05.json)
        const fechaHoy = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Respaldo_Seguridad_${fechaHoy}.json`;
        const rutaCompleta = path.join(dirBackups, nombreArchivo);
        
        // Escribimos el archivo físicamente en el disco duro
        fs.writeFileSync(rutaCompleta, JSON.stringify(backup, null, 2));
        
        console.log(`✅ Backup Automático guardado con éxito en: ${rutaCompleta}`);
    } catch (error) {
        console.error('❌ Falla crítica en el Backup Automático:', error);
    }
});

app.listen(PORT, '0.0.0.0', () => { 
    console.log(`🚀 Servidor Seguro corriendo en el puerto ${PORT}`);
});