// backend/src/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // <-- IMPORTAMOS MULTER

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Permitir que la carpeta "uploads" sea pública para poder ver los PDFs/Fotos después
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ======== CONFIGURACIÓN DE MULTER (CÓMO SE GUARDAN LOS ARCHIVOS) ========
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Le decimos que guarde todo en la carpeta "uploads" que creamos antes
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        // Le ponemos un número aleatorio al nombre para que no se sobrescriban archivos con el mismo nombre
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nombreUnico + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ======== RUTAS ========
const dbPath = path.join(__dirname, 'data', 'documentos.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));

app.get('/api/documentos', (req, res) => {
    const data = fs.readFileSync(dbPath, 'utf8');
    res.json(JSON.parse(data));
});

app.post('/api/documentos', (req, res) => {
    const nuevoDocumento = req.body;
    const data = fs.readFileSync(dbPath, 'utf8');
    const documentos = JSON.parse(data);
    documentos.push(nuevoDocumento);
    fs.writeFileSync(dbPath, JSON.stringify(documentos, null, 2));
    console.log(`✅ Nuevo registro guardado: ${nuevoDocumento.titulo}`);
    res.status(201).json({ mensaje: 'Guardado con éxito', data: nuevoDocumento });
});

// NUEVA RUTA: Recibe 1 solo archivo y devuelve la dirección donde se guardó
app.post('/api/upload', upload.single('archivoFisico'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    // Respondemos con la URL del archivo para que el frontend lo guarde en el JSON
    res.json({ url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});