const express = require('express');
const router = express.Router();
const { prisma } = require('../db/prisma');
const crypto = require('crypto');


const generarHash = (texto) => {
    return crypto.createHash('sha256').update(texto + Date.now()).digest('hex');
};

const registrarAuditoriaUsuario = async (accion, usuarioId) => {
    const hash = generarHash(accion);
    
    await prisma.auditoria.create({
        data: {
            accion,
            hashSeguro: hash,
            usuarioId
        }
    });
};


const validarCredenciales = (admin, password) => {
    return admin && admin.password === password;
};

const esCuentaActiva = (admin) => {
    return admin.activo !== false;
};

const esSuperAdmin = (usuario) => {
    return usuario && usuario.rol === 'SUPERADMIN';
};



const construirNombreUsuarioInactivo = (nombreOriginal) => {
    return `${nombreOriginal}_inactivo_${Date.now()}`;
};

const ordenarUsuarios = (usuarios) => {
    return usuarios.sort((a, b) => (a.rol === 'SUPERADMIN' ? -1 : 1));
};

const construirRespuestaLogin = (admin) => {
    return {
        id: admin.id,
        nombre: admin.nombre,
        rol: admin.rol
    };
};



const buscarUsuario = async (nombreUsuario) => {
    return await prisma.usuario.findUnique({
        where: { usuario: nombreUsuario }
    });
};

const verificarAcceso = (admin, password) => {
    if (!validarCredenciales(admin, password)) {
        throw new Error('CREDENCIALES_INVALIDAS');
    }
    
    if (!esCuentaActiva(admin)) {
        throw new Error('CUENTA_DESACTIVADA');
    }
};



const verificarPermisoCreacion = async (creadorId) => {
    const creador = await prisma.usuario.findUnique({
        where: { id: creadorId }
    });
    
    if (!esSuperAdmin(creador)) {
        throw new Error('PERMISO_DENEGADO');
    }
};

const crearNuevoUsuario = async (nombre, usuario, password, rol) => {
    return await prisma.usuario.create({
        data: {
            nombre,
            usuario,
            password,
            rol,
            activo: true
        }
    });
};

const desactivarUsuario = async (id) => {
    const userViejo = await prisma.usuario.findUnique({
        where: { id }
    });
    
    const nuevoNombreUsuario = construirNombreUsuarioInactivo(userViejo.usuario);
    
    const userDesactivado = await prisma.usuario.update({
        where: { id },
        data: {
            activo: false,
            usuario: nuevoNombreUsuario
        }
    });
    
    return userDesactivado;
};


router.post('/login', async (req, res) => {
    try {
        const { usuario, password } = req.body;
        
        const admin = await buscarUsuario(usuario);
        verificarAcceso(admin, password);
        
        const respuesta = construirRespuestaLogin(admin);
        res.json(respuesta);
        
    } catch (error) {
        if (error.message === 'CREDENCIALES_INVALIDAS') {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        if (error.message === 'CUENTA_DESACTIVADA') {
            return res.status(403).json({
                error: 'Acceso Denegado: Tu cuenta ha sido desactivada por la administración.'
            });
        }
        
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            where: { activo: true },
            select: {
                id: true,
                nombre: true,
                usuario: true,
                rol: true,
                activo: true
            }
        });
        
        const usuariosOrdenados = ordenarUsuarios(usuarios);
        res.json(usuariosOrdenados);
        
    } catch (error) {
        console.error(" Error al traer usuarios:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post('/usuarios', async (req, res) => {
    try {
        const { creadorId, nombre, usuario, password, rol } = req.body;
        
        await verificarPermisoCreacion(creadorId);
        await crearNuevoUsuario(nombre, usuario, password, rol);
        
        const accionTexto = `CREÓ CUENTA: ${nombre} (${rol})`;
        await registrarAuditoriaUsuario(accionTexto, creadorId);
        
        res.json({ mensaje: 'Cuenta creada con éxito' });
        
    } catch (error) {
        if (error.message === 'PERMISO_DENEGADO') {
            return res.status(403).json({ error: 'Solo un JEFE puede crear cuentas.' });
        }
        
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ese usuario ya existe.' });
        }
        
        res.status(500).json({ error: 'Error al crear la cuenta' });
    }
});

router.delete('/usuarios/:id', async (req, res) => {
    try {
        const { creadorId } = req.query;
        
        await verificarPermisoCreacion(creadorId);
        const userDesactivado = await desactivarUsuario(req.params.id);
        
        const accionTexto = `DESACTIVÓ CUENTA: ${userDesactivado.nombre}`;
        await registrarAuditoriaUsuario(accionTexto, creadorId);
        
        res.json({ mensaje: 'Usuario desactivado y nombre de login liberado exitosamente.' });
        
    } catch (error) {
        if (error.message === 'PERMISO_DENEGADO') {
            return res.status(403).json({ error: ' Solo un JEFE puede desactivar cuentas.' });
        }
        
        console.log(error);
        res.status(500).json({ error: 'Error al desactivar la cuenta' });
    }
});

module.exports = router;