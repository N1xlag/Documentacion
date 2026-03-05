// backend/src/services/documentosService.js
const { prisma } = require('../db/prisma');
const fs = require('fs/promises'); // Usamos promesas para borrar archivos
const path = require('path');

// OPTIMIZACIÓN DEL BUSCADOR: Postgres hace el filtrado pesado
const obtenerTodos = async (filtros = {}) => {
    const where = {};
    
    // Si envían texto, buscamos en título o etiquetas
    if (filtros.texto) {
        where.OR = [
            { titulo: { contains: filtros.texto, mode: 'insensitive' } },
            { etiquetas: { has: filtros.texto } } // Busca dentro del array
        ];
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') where.categoria = filtros.categoria;
    if (filtros.gestion && filtros.gestion !== 'Todas') where.gestion = filtros.gestion;
    if (filtros.fInicio || filtros.fFin) {
        where.fecha = {};
        if (filtros.fInicio) where.fecha.gte = filtros.fInicio;
        if (filtros.fFin) where.fecha.lte = filtros.fFin;
    }

    const documentos = await prisma.documento.findMany({
        where: where,
        include: { archivos: true },
        orderBy: { fechaSubida: 'desc' },
        take: 100 // Límite de seguridad para no colgar la memoria
    });

    return documentos.map(doc => ({ ...doc, archivosAdjuntos: doc.archivos }));
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
                    ruta: archivo.ruta, nombreOriginal: archivo.nombreOriginal,
                    pesoBytes: archivo.pesoBytes, tipo: archivo.tipo
                }))
            }
        }
    });
};

const actualizarDocumento = async (id, data) => {
    const docViejo = await prisma.documento.findUnique({ where: { id }, include: { archivos: true } });
    if (!docViejo) throw new Error("Documento no encontrado");

    const docActualizado = await prisma.$transaction([
        prisma.archivoAdjunto.deleteMany({ where: { documentoId: id } }),
        prisma.documento.update({
            where: { id },
            data: {
                titulo: data.titulo, descripcion: data.descripcion, fecha: data.fecha,
                gestion: data.gestion, categoria: data.categoria, enlaceVideo: data.enlaceVideo,
                etiquetas: data.etiquetas, detalles: data.detalles,
                archivos: {
                    create: data.archivosAdjuntos.map(archivo => ({
                        ruta: archivo.ruta, nombreOriginal: archivo.nombreOriginal,
                        pesoBytes: archivo.pesoBytes, tipo: archivo.tipo
                    }))
                }
            }
        })
    ]);

    // CORRECCIÓN: Extraemos el nombre correcto antes de borrar
    const nuevasRutas = data.archivosAdjuntos.map(a => a.ruta);
    for (const archivoViejo of docViejo.archivos) {
        if (!nuevasRutas.includes(archivoViejo.ruta)) {
            const nombreArchivo = archivoViejo.ruta.split('/').pop(); 
            const rutaFisica = path.join(__dirname, '../../uploads', nombreArchivo);
            await fs.unlink(rutaFisica).catch(e => console.error(`Error al borrar: ${rutaFisica}`, e));
        }
    }

    return docActualizado;
};

const eliminarDocumento = async (id) => {
    // 1. Buscamos el documento y guardamos la lista de sus archivos físicos
    const doc = await prisma.documento.findUnique({ where: { id }, include: { archivos: true } });
    if (!doc) throw new Error("Documento no encontrado");

    // 2. MAGIA ANTI-BUGS: Borramos primero los registros hijos (archivos) de la base de datos
    await prisma.archivoAdjunto.deleteMany({ where: { documentoId: id } });
    
    // 3. Ahora sí, borramos el documento padre tranquilamente
    await prisma.documento.delete({ where: { id } });

    // 4. Limpieza del disco duro (como lo hicimos antes)
    for (const archivo of doc.archivos) {
        const nombreArchivo = archivo.ruta.split('/').pop();
        const rutaFisica = path.join(__dirname, '../../uploads', nombreArchivo);
        await fs.unlink(rutaFisica).catch(e => console.error(`Error al borrar físico: ${rutaFisica}`, e));
    }
    
    return doc;
};
module.exports = { obtenerTodos, crearDocumento, actualizarDocumento, eliminarDocumento };