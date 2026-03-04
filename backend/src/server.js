// backend/src/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 1. IMPORTAMOS PRISMA
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ======== CONFIGURACIÓN DE MULTER (Se queda igual) ========
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

// ======== RUTAS CON PRISMA ========

// 1. OBTENER TODOS LOS DOCUMENTOS (GET)
app.get('/api/documentos', async (req, res) => {
    try {
        // Prisma busca todos los documentos E INCLUYE sus archivos adjuntos
        const documentos = await prisma.documento.findMany({
            include: { archivos: true },
            orderBy: { fechaSubida: 'desc' } // Los más nuevos primero
        });

        // Le damos el formato exacto que tu Frontend ya conoce
        const docsFormateados = documentos.map(doc => ({
            ...doc,
            archivosAdjuntos: doc.archivos // Renombramos para que el frontend no se rompa
        }));
        
        res.json(docsFormateados);
    } catch (error) {
        console.error('Error al leer de BD:', error);
        res.status(500).json({ error: 'Error al leer documentos' });
    }
});

// 2. CREAR UN DOCUMENTO (POST)
app.post('/api/documentos', async (req, res) => {
    try {
        const data = req.body;
        
        // Prisma crea el documento y sus archivos al mismo tiempo (Nested Writes)
        const nuevoDoc = await prisma.documento.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                fecha: data.fecha,
                gestion: data.gestion,
                categoria: data.categoria,
                enlaceVideo: data.enlaceVideo,
                etiquetas: data.etiquetas,
                detalles: data.detalles, // Postgres guarda esto como un JSON nativo
                archivos: {
                    create: data.archivosAdjuntos.map(archivo => ({
                        ruta: archivo.ruta,
                        nombreOriginal: archivo.nombreOriginal,
                        pesoBytes: archivo.pesoBytes,
                        tipo: archivo.tipo
                    }))
                }
            }
        });
        
        console.log(`✅ Nuevo registro guardado: ${nuevoDoc.titulo}`);
        res.status(201).json({ mensaje: 'Guardado con éxito', data: nuevoDoc });
    } catch (error) {
        console.error('Error al guardar en BD:', error);
        res.status(500).json({ error: 'Error al guardar el documento' });
    }
});

// 3. EDITAR UN DOCUMENTO (PUT)
app.put('/documentos/:id', async (req, res) => {
    try {
        const idAEditar = req.params.id;
        const data = req.body;

        // Primero borramos los archivos viejos de la BD para meter la lista nueva y limpia
        await prisma.archivoAdjunto.deleteMany({
            where: { documentoId: idAEditar }
        });

        // Actualizamos el documento con la nueva información
        const docActualizado = await prisma.documento.update({
            where: { id: idAEditar },
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                fecha: data.fecha,
                gestion: data.gestion,
                categoria: data.categoria,
                enlaceVideo: data.enlaceVideo,
                etiquetas: data.etiquetas,
                detalles: data.detalles,
                archivos: {
                    create: data.archivosAdjuntos.map(archivo => ({
                        ruta: archivo.ruta,
                        nombreOriginal: archivo.nombreOriginal,
                        pesoBytes: archivo.pesoBytes,
                        tipo: archivo.tipo
                    }))
                }
            }
        });

        res.json({ mensaje: 'Documento actualizado con éxito', documento: docActualizado });
    } catch (error) {
        console.error('Error al editar en BD:', error);
        res.status(500).json({ error: 'Error interno al editar' });
    }
});

// 4. ELIMINAR UN DOCUMENTO (DELETE)
app.delete('/documentos/:id', async (req, res) => {
    try {
        const idAEliminar = req.params.id;

        // Gracias al "onDelete: Cascade" de nuestro schema, 
        // al borrar el documento, Postgres borra sus archivos automáticamente.
        await prisma.documento.delete({
            where: { id: idAEliminar }
        });

        res.json({ mensaje: 'Documento eliminado para siempre' });
    } catch (error) {
        console.error('Error al eliminar en BD:', error);
        res.status(500).json({ error: 'Error interno al eliminar' });
    }
});

// SUBIR ARCHIVOS FÍSICOS (Se queda igual porque guarda en la carpeta /uploads)
app.post('/api/upload', upload.single('archivoFisico'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
        res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al subir archivo' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend conectado a PostgreSQL corriendo en http://localhost:${PORT}`);
});