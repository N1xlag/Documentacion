// Importamos la conexión oficial que YA tiene el adaptador y las credenciales listas
const { prisma } = require('./src/db/prisma');

const crearAdminEmergencia = async () => {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(" USO INCORRECTO.");
        console.log(" Debes escribir: node emergencia.js <NUEVO_USUARIO> <CONTRASEÑA>");
        process.exit(1);
    }

    const nuevoUsuario = args[0];
    const nuevaClave = args[1];

    try {
        console.log(` Forzando apertura de la base de datos...`);
        
        await prisma.usuario.create({
            data: {
                nombre: "ADMIN DE EMERGENCIA",
                usuario: nuevoUsuario,
                password: nuevaClave,
                rol: "SUPERADMIN" 
            }
        });

        console.log(`¡ÉXITO! Protocolo de continuidad activado.`);
        console.log(`Ya puedes entrar al sistema con el usuario: "${nuevoUsuario}" y la clave que elegiste.`);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log(` El usuario "${nuevoUsuario}" ya existe en el sistema. Elige otro nombre.`);
        } else {
            console.error(" Error crítico:", error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
};

crearAdminEmergencia();