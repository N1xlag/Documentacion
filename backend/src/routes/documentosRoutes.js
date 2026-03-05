// backend/src/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const docService = require('../services/documentosService');

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

router.delete('/:id', async (req, res) => {
    try {
        await docService.eliminarDocumento(req.params.id);
        res.json({ mensaje: 'Eliminado para siempre' });
    } catch (error) {
        console.error('Ruta DELETE error:', error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;