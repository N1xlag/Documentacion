const crypto = require('crypto'); // Herramienta para encriptación
const { prisma } = require('../db/prisma');
const fs = require('fs/promises');
const path = require('path');

// ======== 1. EL NOTARIO DIGITAL (HUELLA DE AUDITORÍA) ========
const registrarAuditoria = async (accion, documentoId, usuarioId) => {
    if (!usuarioId) return; // Si no hay usuario logueado, no registra
    
    // El código in-hackeable: Mezcla los datos con una palabra secreta y la hora exacta
    const secreto = `${accion}-${documentoId}-${usuarioId}-${new Date().toISOString()}-FirmaSecretaPPPI`;
    const hash = crypto.createHash('sha256').update(secreto).digest('hex');

    await prisma.auditoria.create({
        data: { accion, hashSeguro: hash, usuarioId, documentoId }
    });
};

// ======== 2. BUSCADOR ========
const obtenerTodos = async (filtros = {}) => {
    // TRUCO: Solo muestra documentos "ACTIVOS". Los que tienen votos para borrarse se vuelven invisibles.
    const where = { estado: 'ACTIVO' }; 
    
    if (filtros.texto) {
        where.OR = [
            { titulo: { contains: filtros.texto, mode: 'insensitive' } },
            { etiquetas: { has: filtros.texto } }
        ];
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') where.categoria = filtros.categoria;
    if (filtros.gestion && filtros.gestion !== 'Todas') where.gestion = filtros.gestion;

    const documentos = await prisma.documento.findMany({
        where: where, include: { archivos: true }, orderBy: { fechaSubida: 'desc' }, take: 100
    });
    return documentos.map(doc => ({ ...doc, archivosAdjuntos: doc.archivos }));
};

// ======== 3. CREAR ========
const crearDocumento = async (data) => {
    const nuevoDoc = await prisma.documento.create({
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
    });
    // El Notario anota quién lo creó
    await registrarAuditoria("CREÓ DOCUMENTO", nuevoDoc.id, data.usuarioId);
    return nuevoDoc;
};

// ======== 4. EDITAR ========
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

    const nuevasRutas = data.archivosAdjuntos.map(a => a.ruta);
    for (const archivoViejo of docViejo.archivos) {
        if (!nuevasRutas.includes(archivoViejo.ruta)) {
            const nombreArchivo = archivoViejo.ruta.split('/').pop(); 
            const rutaFisica = path.join(__dirname, '../../uploads', nombreArchivo);
            await fs.unlink(rutaFisica).catch(e => console.error(`Error al borrar: ${rutaFisica}`, e));
        }
    }

    // El Notario anota quién lo editó
    await registrarAuditoria("EDITÓ DOCUMENTO", id, data.usuarioId);
    return docActualizado;
};

// ======== 5. EL TRIBUNAL (REGLA DE LOS 3 VOTOS) ========
const eliminarDocumento = async (id, usuarioId) => {
    if (!usuarioId) throw new Error("Debes iniciar sesión como Administrador para borrar");

    // 1. El Notario anota el intento
    await registrarAuditoria("SOLICITÓ BORRADO", id, usuarioId);

    // 2. Metemos el voto en la urna (Si ya votó, Prisma lanzará un error automático)
    try {
        await prisma.votoEliminacion.create({ data: { usuarioId, documentoId: id } });
    } catch (e) {
        throw new Error("Ya emitiste tu voto para eliminar este documento. Faltan otros administradores.");
    }

    // 3. Contamos cuántos votos tiene en total este documento
    const totalVotos = await prisma.votoEliminacion.count({ where: { documentoId: id } });

    // 4. Si tiene 1 o 2 votos, NO lo borramos, solo lo ocultamos del buscador
    if (totalVotos < 3) {
        await prisma.documento.update({ where: { id }, data: { estado: 'PENDIENTE_BORRADO' } });
        return { borradoReal: false, mensaje: `Voto registrado (${totalVotos}/3). Documento ocultado temporalmente.` };
    }

    // 5. ¡LLEGARON A 3 VOTOS! Procedemos con la eliminación destructiva
    const doc = await prisma.documento.findUnique({ where: { id }, include: { archivos: true } });
    
    await prisma.archivoAdjunto.deleteMany({ where: { documentoId: id } });
    await prisma.documento.delete({ where: { id } }); // Al borrar, se borran sus votos automáticamente

    // Borramos los archivos físicos
    for (const archivo of doc.archivos) {
        const nombreArchivo = archivo.ruta.split('/').pop();
        const rutaFisica = path.join(__dirname, '../../uploads', nombreArchivo);
        await fs.unlink(rutaFisica).catch(e => console.error(`Error físico: ${rutaFisica}`, e));
    }
    
    // El Notario cierra el caso
    await registrarAuditoria("DESTRUCCIÓN DEFINITIVA APROBADA", null, usuarioId);
    return { borradoReal: true, mensaje: "3 votos alcanzados. Documento destruido permanentemente." };
};

// ======== OBTENER PAPELERA (Con trazabilidad) ========
const obtenerPapelera = async () => {
    return await prisma.documento.findMany({
        where: { estado: 'PENDIENTE_BORRADO' }, // <--- ¡AQUÍ ESTABA EL ERROR!
        include: {
            archivos: true,
            votosBorrados: {
                include: { usuario: { select: { nombre: true } } },
                orderBy: { fecha: 'asc' } 
            }
        }
    });
};

const procesarVotoPapelera = async (id, usuarioId, decision) => {
    if (!usuarioId) throw new Error("Debes iniciar sesión como Admin");

    if (decision === 'rechazar') {
        // EL VETO: Borramos los votos acumulados y lo devolvemos a la biblioteca
        await prisma.votoEliminacion.deleteMany({ where: { documentoId: id } });
        await prisma.documento.update({ where: { id }, data: { estado: 'ACTIVO' } });
        await registrarAuditoria("RESTAURÓ DOCUMENTO DE PAPELERA", id, usuarioId);
        return { mensaje: "Documento salvado y devuelto al Buscador Principal." };
    }

    if (decision === 'aprobar') {
        // Reutilizamos tu función de eliminar que ya tiene la regla de los 3 votos
        return await eliminarDocumento(id, usuarioId);
    }

    
};

// ======== 7. REPORTE DE AUDITORÍA ========
const obtenerReporteAuditoria = async (fechaInicio, fechaFin) => {
    // Ajustamos la fecha fin para que incluya todo ese día hasta las 23:59
    const finAjustado = new Date(fechaFin);
    finAjustado.setHours(23, 59, 59, 999);

    const registros = await prisma.auditoria.findMany({
        where: {
            fecha: {
                gte: new Date(fechaInicio), // gte = Mayor o igual que
                lte: finAjustado            // lte = Menor o igual que
            }
        },
        include: {
            usuario: { select: { nombre: true } },
            documento: { select: { titulo: true } } // Si el doc se borró, esto vendrá nulo
        },
        orderBy: { fecha: 'desc' }
    });

    return registros;
};

// ======== 8. RESPALDO TOTAL (BACKUP) ========
const generarBackupTotal = async () => {
    // Extraemos absolutamente todas las tablas
    const documentos = await prisma.documento.findMany({ include: { archivos: true, votosBorrados: true } });
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

module.exports = { obtenerTodos, crearDocumento, actualizarDocumento, eliminarDocumento, obtenerPapelera, procesarVotoPapelera, obtenerReporteAuditoria, generarBackupTotal };