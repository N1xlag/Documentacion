// backend/src/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const docService = require('../services/documentosService');

// GET: Obtener todos
router.get('/', async (req, res) => {
    try {
        const documentos = await docService.obtenerTodos();
        res.json(documentos);
    } catch (error) {
        console.error('Error al obtener:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});

// POST: Crear nuevo
router.post('/', async (req, res) => {
    try {
        const nuevoDoc = await docService.crearDocumento(req.body);
        res.status(201).json({ mensaje: 'Guardado con éxito', data: nuevoDoc });
    } catch (error) {
        console.error('Error al guardar:', error);
        res.status(500).json({ error: 'Error al guardar el documento' });
    }
});

// PUT: Actualizar
router.put('/:id', async (req, res) => {
    try {
        const docActualizado = await docService.actualizarDocumento(req.params.id, req.body);
        res.json({ mensaje: 'Actualizado con éxito', documento: docActualizado });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// DELETE: Eliminar
router.delete('/:id', async (req, res) => {
    try {
        await docService.eliminarDocumento(req.params.id);
        res.json({ mensaje: 'Eliminado para siempre' });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;