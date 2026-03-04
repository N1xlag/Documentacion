// backend/src/services/documentosService.js
const { prisma } = require('../db/prisma');

const obtenerTodos = async () => {
    const documentos = await prisma.documento.findMany({
        include: { archivos: true },
        orderBy: { fechaSubida: 'desc' }
    });
    // Formateamos para que el frontend lo entienda igual que antes
    return documentos.map(doc => ({
        ...doc,
        archivosAdjuntos: doc.archivos 
    }));
};

const crearDocumento = async (data) => {
    return await prisma.documento.create({
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
};

const actualizarDocumento = async (id, data) => {
    // Borramos los archivos viejos y metemos los nuevos
    await prisma.archivoAdjunto.deleteMany({ where: { documentoId: id } });

    return await prisma.documento.update({
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
    });
};

const eliminarDocumento = async (id) => {
    return await prisma.documento.delete({
        where: { id }
    });
};

module.exports = {
    obtenerTodos,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento
};