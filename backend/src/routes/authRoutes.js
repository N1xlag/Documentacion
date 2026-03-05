const express = require('express');
const router = express.Router();
const { prisma } = require('../db/prisma');

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
            select: { id: true, nombre: true, usuario: true, rol: true, activo: true }
        });
        
        // Ordenamos en memoria: Los activos arriba, los desactivados abajo (A prueba de fallos)
        usuarios.sort((a, b) => (a.activo === b.activo ? 0 : a.activo ? -1 : 1));
        
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
        await prisma.usuario.create({ data: { nombre, usuario, password, rol: rol, activo: true } });
        res.json({ mensaje: 'Cuenta creada con éxito' });
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Ese usuario ya existe.' });
        res.status(500).json({ error: 'Error al crear la cuenta' });
    }
});

// 4. "ELIMINAR" USUARIO (Soft Delete / Baneo)
router.delete('/usuarios/:id', async (req, res) => {
    const { creadorId } = req.query; 

    const creador = await prisma.usuario.findUnique({ where: { id: creadorId } });
    if (!creador || creador.rol !== 'SUPERADMIN') return res.status(403).json({ error: '❌ Solo un JEFE puede desactivar cuentas.' });

    try {
        // En lugar de usar "delete", usamos "update" para apagar el interruptor
        await prisma.usuario.update({ 
            where: { id: req.params.id },
            data: { activo: false } 
        });
        
        res.json({ mensaje: 'Usuario desactivado exitosamente. Su historial se mantiene intacto.' });
    } catch (error) { 
        res.status(500).json({ error: 'Error al desactivar la cuenta' }); 
    }
});

module.exports = router;