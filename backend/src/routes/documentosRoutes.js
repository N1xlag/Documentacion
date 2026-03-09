const express = require('express');
const router = express.Router();
const docService = require('../services/documentosService');


const validarCamposObligatorios = (body) => {
    return body.titulo && body.categoria;
};

const validarFechas = (inicio, fin) => {
    return inicio && fin;
};


const enviarError = (res, statusCode, mensaje) => {
    res.status(statusCode).json({ error: mensaje });
};

const enviarExito = (res, data, statusCode = 200) => {
    res.status(statusCode).json(data);
};


const configurarDescargaBackup = (res) => {
    const nombreArchivo = `Respaldo_Seguridad_PPPI_${Date.now()}.json`;
    res.setHeader('Content-disposition', `attachment; filename=${nombreArchivo}`);
    res.setHeader('Content-type', 'application/json');
};


const obtenerPapelera = async (req, res) => {
    try {
        const documentos = await docService.obtenerPapelera();
        enviarExito(res, documentos);
    } catch (error) {
        enviarError(res, 500, error.message);
    }
};

const votarPapelera = async (req, res) => {
    try {
        const { usuarioId, decision } = req.body;
        const resultado = await docService.procesarVotoPapelera(req.params.id, usuarioId, decision);
        enviarExito(res, resultado);
    } catch (error) {
        enviarError(res, 400, error.message);
    }
};



const obtenerAuditoria = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        
        if (!validarFechas(inicio, fin)) {
            return enviarError(res, 400, "Faltan fechas");
        }
        
        const reporte = await docService.obtenerReporteAuditoria(inicio, fin);
        enviarExito(res, reporte);
    } catch (error) {
        enviarError(res, 500, error.message);
    }
};

const descargarBackup = async (req, res) => {
    try {
        const backup = await docService.generarBackupTotal();
        
        configurarDescargaBackup(res);
        res.send(JSON.stringify(backup, null, 2));
    } catch (error) {
        enviarError(res, 500, error.message);
    }
};

const obtenerGestiones = async (req, res) => {
    try {
        const gestiones = await docService.obtenerGestiones();
        enviarExito(res, gestiones);
    } catch (error) {
        enviarError(res, 500, error.message);
    }
};



const obtenerDocumentos = async (req, res) => {
    try {
        const documentos = await docService.obtenerTodos(req.query);
        enviarExito(res, documentos);
    } catch (error) {
        console.error('Ruta GET / error:', error);
        enviarError(res, 500, 'Error al obtener documentos');
    }
};

const crearDocumento = async (req, res) => {
    try {
        if (!validarCamposObligatorios(req.body)) {
            return enviarError(res, 400, 'Faltan campos obligatorios');
        }
        
        const nuevoDoc = await docService.crearDocumento(req.body);
        enviarExito(res, { mensaje: 'Guardado con éxito', data: nuevoDoc }, 201);
    } catch (error) {
        console.error('Ruta POST / error:', error);
        enviarError(res, 500, 'Error al guardar el documento');
    }
};

const actualizarDocumento = async (req, res) => {
    try {
        const docActualizado = await docService.actualizarDocumento(req.params.id, req.body);
        enviarExito(res, { mensaje: 'Actualizado con éxito', documento: docActualizado });
    } catch (error) {
        console.error('Ruta PUT error:', error);
        enviarError(res, 500, 'Error al actualizar');
    }
};

const eliminarDocumento = async (req, res) => {
    try {
        const { usuarioId } = req.body;
        const resultado = await docService.eliminarDocumento(req.params.id, usuarioId);
        enviarExito(res, resultado);
    } catch (error) {
        console.error('Ruta DELETE error:', error.message);
        enviarError(res, 500, error.message);
    }
};



router.get('/estado/papelera', obtenerPapelera);
router.get('/estado/auditoria', obtenerAuditoria);
router.get('/estado/backup', descargarBackup);
router.get('/estado/gestiones', obtenerGestiones);

router.get('/', obtenerDocumentos);
router.post('/', crearDocumento);
router.put('/:id', actualizarDocumento);
router.delete('/:id', eliminarDocumento);


router.post('/:id/votar', votarPapelera);


module.exports = router;