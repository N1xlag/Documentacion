const crypto = require('crypto');
const { prisma } = require('../db/prisma');
const fs = require('fs/promises');
const path = require('path');


const LIMITE_POR_PAGINA = 100;
const VOTOS_REQUERIDOS = 3;


const generarHashSeguro = (accion, documentoId, usuarioId) => {
    const secreto = `${accion}-${documentoId}-${usuarioId}-${new Date().toISOString()}-FirmaSecretaPPPI`;
    return crypto.createHash('sha256').update(secreto).digest('hex');
};

const registrarAuditoria = async (accion, documentoId, usuarioId) => {
    if (!usuarioId) return;
    
    const hash = generarHashSeguro(accion, documentoId, usuarioId);
    
    await prisma.auditoria.create({
        data: {
            accion,
            hashSeguro: hash,
            usuarioId,
            documentoId
        }
    });
};


const construirRutaFisica = (rutaArchivo) => {
    const nombreArchivo = rutaArchivo.split('/').pop();
    return path.join(__dirname, '../../uploads', nombreArchivo);
};

const eliminarArchivoFisico = async (ruta) => {
    const rutaFisica = construirRutaFisica(ruta);
    await fs.unlink(rutaFisica).catch(e => {
        console.error(`Error al borrar: ${rutaFisica}`, e);
    });
};

const eliminarArchivosNoUsados = async (archivosViejos, archivosNuevos) => {
    const nuevasRutas = archivosNuevos.map(a => a.ruta);
    
    for (const archivoViejo of archivosViejos) {
        if (!nuevasRutas.includes(archivoViejo.ruta)) {
            await eliminarArchivoFisico(archivoViejo.ruta);
        }
    }
};

const eliminarTodosLosArchivos = async (archivos) => {
    for (const archivo of archivos) {
        await eliminarArchivoFisico(archivo.ruta);
    }
};


const construirFechaExacta = (fecha, esInicio) => {
    const hora = esInicio ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
    return new Date(`${fecha}${hora}`);
};


const calcularSalto = (pagina) => {
    const paginaActual = pagina ? parseInt(pagina) : 1;
    return (paginaActual - 1) * LIMITE_POR_PAGINA;
};


const construirFiltrosWhere = (filtros) => {
    const where = { estado: 'ACTIVO' };
    
    if (filtros.texto) {
        where.OR = [
            { titulo: { contains: filtros.texto, mode: 'insensitive' } },
            { etiquetas: { has: filtros.texto } }
        ];
    }
    
    if (filtros.categoria && filtros.categoria !== 'Todas') {
        where.categoria = filtros.categoria;
    }
    
    if (filtros.gestion && filtros.gestion !== 'Todas') {
        where.gestion = filtros.gestion;
    }
    
    return where;
};


const formatearDocumento = (doc) => {
    return {
        ...doc,
        archivosAdjuntos: doc.archivos
    };
};

const formatearDocumentos = (documentos) => {
    return documentos.map(formatearDocumento);
};


const registrarVoto = async (documentoId, usuarioId) => {
    try {
        await prisma.votoEliminacion.create({
            data: { usuarioId, documentoId }
        });
    } catch (error) {
        throw new Error("Ya emitiste tu voto para eliminar este documento. Faltan otros administradores.");
    }
};

const contarVotos = async (documentoId) => {
    return await prisma.votoEliminacion.count({
        where: { documentoId }
    });
};

const marcarComoPendiente = async (documentoId) => {
    await prisma.documento.update({
        where: { id: documentoId },
        data: { estado: 'PENDIENTE_BORRADO' }
    });
};

const votosInsuficientes = (totalVotos) => {
    return totalVotos < VOTOS_REQUERIDOS;
};



const eliminarDocumentoDeBD = async (id) => {
    await prisma.archivoAdjunto.deleteMany({ where: { documentoId: id } });
    await prisma.documento.delete({ where: { id } });
};

const eliminarDocumentoCompleto = async (id) => {
    const doc = await prisma.documento.findUnique({
        where: { id },
        include: { archivos: true }
    });
    
    await eliminarDocumentoDeBD(id);
    await eliminarTodosLosArchivos(doc.archivos);
};



const obtenerTodos = async (filtros = {}) => {
    const where = construirFiltrosWhere(filtros);
    const saltar = calcularSalto(filtros.pagina);

    const documentos = await prisma.documento.findMany({
        where: where,
        include: { archivos: true },
        orderBy: { fechaSubida: 'desc' },
        take: LIMITE_POR_PAGINA,
        skip: saltar
    });
    
    return formatearDocumentos(documentos);
};

const obtenerGestiones = async () => {
    const resultados = await prisma.documento.findMany({
        where: { estado: 'ACTIVO' },
        select: { gestion: true },
        distinct: ['gestion'],
        orderBy: { gestion: 'desc' }
    });
    
    return resultados.map(r => r.gestion).filter(Boolean);
};

const obtenerPapelera = async () => {
    return await prisma.documento.findMany({
        where: { estado: 'PENDIENTE_BORRADO' },
        include: {
            archivos: true,
            votosBorrados: {
                include: { usuario: { select: { nombre: true } } },
                orderBy: { fecha: 'asc' }
            }
        }
    });
};

const obtenerReporteAuditoria = async (inicio, fin) => {
    const fechaInicio = construirFechaExacta(inicio, true);
    const fechaFin = construirFechaExacta(fin, false);

    return await prisma.auditoria.findMany({
        where: {
            fecha: {
                gte: fechaInicio,
                lte: fechaFin
            }
        },
        include: {
            usuario: { select: { nombre: true } },
            documento: { select: { titulo: true } }
        },
        orderBy: { fecha: 'desc' }
    });
};


const crearDocumento = async (data) => {
    const nuevoDoc = await prisma.documento.create({
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
    
    await registrarAuditoria("CREÓ DOCUMENTO", nuevoDoc.id, data.usuarioId);
    return nuevoDoc;
};

const actualizarDocumento = async (id, data) => {
    const docViejo = await prisma.documento.findUnique({
        where: { id },
        include: { archivos: true }
    });
    
    if (!docViejo) {
        throw new Error("Documento no encontrado");
    }

    const docActualizado = await prisma.$transaction([
        prisma.archivoAdjunto.deleteMany({ where: { documentoId: id } }),
        prisma.documento.update({
            where: { id },
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
        })
    ]);

    await eliminarArchivosNoUsados(docViejo.archivos, data.archivosAdjuntos);
    await registrarAuditoria("EDITÓ DOCUMENTO", id, data.usuarioId);
    
    return docActualizado;
};



const eliminarDocumento = async (id, usuarioId) => {
    if (!usuarioId) {
        throw new Error("Debes iniciar sesión como Administrador para borrar");
    }

    // 1. EL TRUCO: Leemos el nombre del documento ANTES de que desaparezca
    const docInfo = await prisma.documento.findUnique({ 
        where: { id }, 
        select: { titulo: true } 
    });
    const tituloDoc = docInfo ? docInfo.titulo : 'Documento Desconocido';

    // 2. Registramos el primer voto con el nombre inmortalizado
    await registrarAuditoria(`SOLICITÓ BORRADO: "${tituloDoc}"`, id, usuarioId);
    await registrarVoto(id, usuarioId);
    
    const totalVotos = await contarVotos(id);

    if (votosInsuficientes(totalVotos)) {
        await marcarComoPendiente(id);
        return {
            borradoReal: false,
            mensaje: `Voto registrado (${totalVotos}/3). Documento ocultado temporalmente.`
        };
    }

    // 3. Ejecutamos la destrucción física
    await eliminarDocumentoCompleto(id);
    
    // 4. Sellamos la acción final con el nombre escrito a mano (pasando null al ID porque ya no existe)
    await registrarAuditoria(`BORRADO PERMANENTE APROBADO: "${tituloDoc}"`, null, usuarioId);
    
    return {
        borradoReal: true,
        mensaje: "3 votos alcanzados. Documento eliminado permanentemente."
    };
};

const procesarVotoPapelera = async (id, usuarioId, decision) => {
    if (!usuarioId) {
        throw new Error("Debes iniciar sesión como Admin");
    }

    if (decision === 'rechazar') {
        await prisma.votoEliminacion.deleteMany({ where: { documentoId: id } });
        await prisma.documento.update({ where: { id }, data: { estado: 'ACTIVO' } });
        
        // Hacemos el mismo truco aquí para que quede impecable en la auditoría
        const docInfo = await prisma.documento.findUnique({ 
            where: { id }, 
            select: { titulo: true } 
        });
        const tituloDoc = docInfo ? docInfo.titulo : 'Documento Desconocido';
        
        await registrarAuditoria(`RESTAURÓ DE PAPELERA: "${tituloDoc}"`, id, usuarioId);
        
        return { mensaje: "Documento salvado y devuelto al Buscador Principal." };
    }

    if (decision === 'aprobar') {
        return await eliminarDocumento(id, usuarioId);
    }
};



const generarBackupTotal = async () => {
    const documentos = await prisma.documento.findMany({
        include: {
            archivos: true,
            votosBorrados: true
        }
    });
    
    const usuarios = await prisma.usuario.findMany();
    const auditoria = await prisma.auditoria.findMany();

    return {
        fechaGeneracion: new Date().toISOString(),
        totalDocumentos: documentos.length,
        datos: {
            usuarios,
            documentos,
            auditoria
        }
    };
};


module.exports = {
    obtenerTodos,
    obtenerGestiones,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento,
    obtenerPapelera,
    procesarVotoPapelera,
    obtenerReporteAuditoria,
    generarBackupTotal
};