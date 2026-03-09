const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cron = require('node-cron');
const docService = require('./services/documentosService'); 

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
    const ext = path.extname(file.originalname).toLowerCase();
    
    const permitidos = [
        '.pdf', '.jpg', '.jpeg', '.png', 
        '.doc', '.docx', '.xls', '.xlsx', 
        '.ppt', '.pptx', '.txt', '.csv', 
        '.zip', '.rar'
    ];
    
    if (permitidos.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Formato no permitido (${ext}). Sube PDF, Office, Imágenes, TXT o Comprimidos.`));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use('/api/documentos', documentosRoutes);

app.post('/api/upload', (req, res) => {

    upload.single('archivoFisico')(req, res, function (err) {
        if (err) {
            console.error('Escudo de archivos activado:', err.message);
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        
        res.json({ url: `/uploads/${req.file.filename}` });
    });
});

app.delete('/api/upload', (req, res) => {
    const { ruta } = req.body;
    if (!ruta) return res.status(400).json({ error: 'Ruta no proporcionada' });
    
    const nombreArchivo = ruta.split('/').pop(); 
    const rutaFisica = path.join(__dirname, '../uploads', nombreArchivo);
    
    fs.unlink(rutaFisica, (err) => {
        if (err) console.error(`No se pudo borrar temporal: ${rutaFisica}`, err);
    });
    res.json({ mensaje: 'Archivo temporal eliminado' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const dirBackups = path.join(__dirname, '../backups_automaticos');
if (!fs.existsSync(dirBackups)){
    fs.mkdirSync(dirBackups);
}

cron.schedule('0 17 * * *', async () => {
    console.log('[5:00 PM] Iniciando Backup Automático del Sistema...');
    try {
        const backup = await docService.generarBackupTotal();
        const fechaHoy = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Respaldo_Seguridad_${fechaHoy}.json`;
        const rutaCompleta = path.join(dirBackups, nombreArchivo);
        
        fs.writeFileSync(rutaCompleta, JSON.stringify(backup, null, 2));
        
        console.log(` Backup Automático guardado con éxito en: ${rutaCompleta}`);
    } catch (error) {
        console.error(' Falla crítica en el Backup Automático:', error);
    }
});

app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Servidor Seguro corriendo en el puerto ${PORT}`);
});