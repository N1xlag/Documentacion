const express = require('express');
const router = express.Router();
const { prisma } = require('../db/prisma');
const crypto = require('crypto');

// 1. LOGIN (Rechaza a los baneados)
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    const admin = await prisma.usuario.findUnique({ where: { usuario: usuario } });

    if (!admin || admin.password !== password) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    // 🔥 EL NUEVO ESCUDO: Si está desactivado, lo pateamos
    if (admin.activo === false) return res.status(403).json({ error: '🚫 Acceso Denegado: Tu cuenta ha sido desactivada por la administración.' });

    res.json({ id: admin.id, nombre: admin.nombre, rol: admin.rol }); 
});

// 2. OBTENER USUARIOS
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({ 
            where: { activo: true },
            select: { id: true, nombre: true, usuario: true, rol: true, activo: true }
        });
        
        // Ordenamos en memoria: Los activos arriba, los desactivados abajo (A prueba de fallos)
        usuarios.sort((a, b) => (a.rol === 'SUPERADMIN' ? -1 : 1));
        
        res.json(usuarios);
    } catch (error) { 
        console.error("🔥 Error al traer usuarios:", error); // Por si acaso, que nos avise en la consola
        res.status(500).json({ error: 'Error del servidor' }); 
    }
});

// 3. CREAR USUARIO
router.post('/usuarios', async (req, res) => {
    const { creadorId, nombre, usuario, password, rol } = req.body;
    
    const creador = await prisma.usuario.findUnique({ where: { id: creadorId } });
    if (!creador || creador.rol !== 'SUPERADMIN') return res.status(403).json({ error: '❌ Solo un JEFE puede crear cuentas.' });

    try {
        const nuevoUser = await prisma.usuario.create({ data: { nombre, usuario, password, rol: rol, activo: true } });
        
        // --- FIRMAMOS LA CREACIÓN EN AUDITORÍA ---
        const accionTexto = `CREÓ CUENTA: ${nombre} (${rol})`;
        const hash = crypto.createHash('sha256').update(accionTexto + Date.now()).digest('hex');
        await prisma.auditoria.create({
            data: {
                accion: accionTexto,
                hashSeguro: hash,
                usuarioId: creadorId, // El SuperAdmin que lo creó
                // No mandamos documentoId porque es una acción sobre un usuario
            }
        });

        res.json({ mensaje: 'Cuenta creada con éxito' });
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Ese usuario ya existe.' });
        res.status(500).json({ error: 'Error al crear la cuenta' });
    }
});

// 4. "ELIMINAR" USUARIO (Soft Delete / Baneo y Liberación de Username)
router.delete('/usuarios/:id', async (req, res) => {
    const { creadorId } = req.query; 

    const creador = await prisma.usuario.findUnique({ where: { id: creadorId } });
    if (!creador || creador.rol !== 'SUPERADMIN') return res.status(403).json({ error: '❌ Solo un JEFE puede desactivar cuentas.' });

    try {
        // 1. Buscamos al usuario antes de desactivarlo para saber su nombre actual
        const userViejo = await prisma.usuario.findUnique({ where: { id: req.params.id } });

        // 2. Lo desactivamos y le CAMBIAMOS el username para que quede libre
        const userDesactivado = await prisma.usuario.update({ 
            where: { id: req.params.id },
            data: { 
                activo: false,
                usuario: `${userViejo.usuario}_inactivo_${Date.now()}` // <--- El Truco Mágico
            } 
        });
        
        // --- FIRMAMOS LA DESACTIVACIÓN EN AUDITORÍA ---
        const crypto = require('crypto');
        const accionTexto = `DESACTIVÓ CUENTA: ${userDesactivado.nombre}`;
        const hash = crypto.createHash('sha256').update(accionTexto + Date.now()).digest('hex');
        await prisma.auditoria.create({
            data: {
                accion: accionTexto,
                hashSeguro: hash,
                usuarioId: creadorId, 
            }
        });

        res.json({ mensaje: 'Usuario desactivado y nombre de login liberado exitosamente.' });
    } catch (error) { 
        console.log(error);
        res.status(500).json({ error: 'Error al desactivar la cuenta' }); 
    }
});

module.exports = router;