const express = require('express');
const router = express.Router();
const { prisma } = require('../db/prisma');

router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    
    // 1. Buscamos al usuario en la base de datos
    const admin = await prisma.usuario.findUnique({ where: { usuario: usuario } });

    // 2. Si no existe o la clave está mal, lo rebotamos
    if (!admin || admin.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Si todo está bien, devolvemos sus datos
    res.json({ id: admin.id, nombre: admin.nombre });
});

module.exports = router;