// backend/src/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const docService = require('../services/documentosService');

// GET: Obtener Papelera (Debe ir arriba para que no se confunda con un ID)
router.get('/estado/papelera', async (req, res) => {
    try {
        const documentos = await docService.obtenerPapelera();
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Votar en la papelera
router.post('/:id/votar', async (req, res) => {
    try {
        const { usuarioId, decision } = req.body;
        const resultado = await docService.procesarVotoPapelera(req.params.id, usuarioId, decision);
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET: Reporte de Auditoría
router.get('/estado/auditoria', async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        if (!inicio || !fin) return res.status(400).json({ error: "Faltan fechas" });
        
        const reporte = await docService.obtenerReporteAuditoria(inicio, fin);
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        // req.query contiene los filtros enviados por el frontend (?categoria=...&texto=...)
        const documentos = await docService.obtenerTodos(req.query);
        res.json(documentos);
    } catch (error) {
        console.error('Ruta GET / error:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});

// GET: Descargar Respaldo Total de la Base de Datos
router.get('/estado/backup', async (req, res) => {
    try {
        const backup = await docService.generarBackupTotal();
        
        // Estas dos líneas le dicen al navegador: "¡No leas esto, fuérzalo a descargar como archivo!"
        res.setHeader('Content-disposition', `attachment; filename=Respaldo_Seguridad_PPPI_${Date.now()}.json`);
        res.setHeader('Content-type', 'application/json');
        
        // Enviamos el archivo
        res.send(JSON.stringify(backup, null, 2));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.body.titulo || !req.body.categoria) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' }); // Validación básica
        }
        const nuevoDoc = await docService.crearDocumento(req.body);
        res.status(201).json({ mensaje: 'Guardado con éxito', data: nuevoDoc });
    } catch (error) {
        console.error('Ruta POST / error:', error);
        res.status(500).json({ error: 'Error al guardar el documento' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const docActualizado = await docService.actualizarDocumento(req.params.id, req.body);
        res.json({ mensaje: 'Actualizado con éxito', documento: docActualizado });
    } catch (error) {
        console.error('Ruta PUT error:', error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// DELETE: Eliminar (Ahora recibe quién quiere borrar)
router.delete('/:id', async (req, res) => {
    try {
        const { usuarioId } = req.body;
        // Le pasamos el ID del documento y el ID del usuario al servicio
        const resultado = await docService.eliminarDocumento(req.params.id, usuarioId);
        res.json(resultado);
    } catch (error) {
        console.error('Ruta DELETE error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;