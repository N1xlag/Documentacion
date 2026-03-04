// backend/src/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nombreUnico + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Asegurar que exista la carpeta data y el archivo JSON
const dbPath = path.join(__dirname, 'data', 'documentos.json');
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}
if (!fs.existsSync(dbPath) || fs.readFileSync(dbPath, 'utf8').trim() === '') {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

// ======== RUTAS ========

app.get('/api/documentos', (req, res) => {
    try {
        let documentos = [];
        const data = fs.readFileSync(dbPath, 'utf8');
        
        if (data.trim() !== '') {
            documentos = JSON.parse(data);
        }
        
        res.json(documentos);
    } catch (error) {
        console.error('Error al leer:', error);
        res.status(500).json({ error: 'Error al leer documentos', detalles: error.message });
    }
});

app.post('/api/documentos', (req, res) => {
    try {
        const nuevoDocumento = req.body;
        
        let documentos = [];
        const data = fs.readFileSync(dbPath, 'utf8');
        
        if (data.trim() !== '') {
            documentos = JSON.parse(data);
        }
        
        documentos.push(nuevoDocumento);
        fs.writeFileSync(dbPath, JSON.stringify(documentos, null, 2));
        
        console.log(`Nuevo registro guardado: ${nuevoDocumento.titulo}`);
        res.status(201).json({ mensaje: 'Guardado con éxito', data: nuevoDocumento });
        
    } catch (error) {
        console.error('Error al guardar:', error);
        res.status(500).json({ error: 'Error al guardar el documento', detalles: error.message });
    }
});

// RUTA PARA SUBIR ARCHIVOS
app.post('/api/upload', upload.single('archivoFisico'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        console.log(`Archivo subido: ${req.file.filename}`);
        res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        console.error('Error al subir archivo:', error);
        res.status(500).json({ error: 'Error al subir archivo', detalles: error.message });
    }
});

// ======== RUTA PARA EDITAR (PUT) ========
app.put('/documentos/:id', (req, res) => {
    try {
        const idAEditar = req.params.id;
        const datosNuevos = req.body;

        // 1. Leer la base de datos usando tu dbPath
        const rawData = fs.readFileSync(dbPath, 'utf8');
        let bd = [];
        if (rawData.trim() !== '') {
            bd = JSON.parse(rawData);
        }

        // 2. Encontrar el documento
        const index = bd.findIndex(doc => doc.id == idAEditar); 

        if (index !== -1) {
            // 3. Reemplazar y guardar
            bd[index] = datosNuevos;
            fs.writeFileSync(dbPath, JSON.stringify(bd, null, 2));
            res.json({ mensaje: 'Documento actualizado con éxito', documento: datosNuevos });
        } else {
            res.status(404).json({ error: 'Documento no encontrado en la base de datos' });
        }
    } catch (error) {
        console.error('Error al editar:', error);
        res.status(500).json({ error: 'Error interno del servidor al editar', detalles: error.message });
    }
});

// ======== RUTA PARA ELIMINAR (DELETE) ========
app.delete('/documentos/:id', (req, res) => {
    try {
        const idAEliminar = req.params.id;

        // 1. Leer la base de datos usando tu dbPath
        const rawData = fs.readFileSync(dbPath, 'utf8');
        let bd = [];
        if (rawData.trim() !== '') {
            bd = JSON.parse(rawData);
        }

        // 2. Encontrar el documento
        const index = bd.findIndex(doc => doc.id == idAEliminar);

        if (index !== -1) {
            // 3. Eliminar y guardar
            bd.splice(index, 1);
            fs.writeFileSync(dbPath, JSON.stringify(bd, null, 2));
            res.json({ mensaje: 'Documento eliminado para siempre' });
        } else {
            res.status(404).json({ error: 'Documento no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar', detalles: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});