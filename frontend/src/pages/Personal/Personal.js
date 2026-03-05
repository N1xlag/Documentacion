import { api } from '../../services/api.js';

export const Personal = () => {
    const contenedor = document.createElement('div');
    contenedor.style.padding = '30px';
    contenedor.style.maxWidth = '1000px';
    contenedor.style.margin = '0 auto';

    contenedor.innerHTML = `
        <h2 style="color: var(--color-secundario); border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            Gestión de Personal (Administradores)
        </h2>
        <p style="color: #64748b; margin-bottom: 30px;">
            Crea cuentas de acceso para nuevos encargados o revoca el acceso a personal inactivo.
        </p>

        <div style="display: flex; gap: 30px; align-items: flex-start; flex-wrap: wrap;">
            
            <div style="flex: 1; min-width: 300px; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #334155;">Registrar Nuevo Admin</h3>
                
                <label style="display: block; font-weight: bold; margin-top: 15px; font-size: 14px;">Nombre Completo:</label>
                <input type="text" id="nuevo-nombre" placeholder="Ej. Ing. Carlos Pérez" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #cbd5e1; border-radius: 4px;">

                <label style="display: block; font-weight: bold; margin-top: 15px; font-size: 14px;">Nombre de Usuario (Para Login):</label>
                <input type="text" id="nuevo-usuario" placeholder="Ej. carlos_admin" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #cbd5e1; border-radius: 4px;">

                <label style="display: block; font-weight: bold; margin-top: 15px; font-size: 14px;">Contraseña:</label>
                <input type="password" id="nuevo-clave" placeholder="Asigna una contraseña segura" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #cbd5e1; border-radius: 4px;">

                <label style="display: block; font-weight: bold; margin-top: 15px; font-size: 14px;">Nivel de Permisos:</label>
                <select id="nuevo-rol" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #cbd5e1; border-radius: 4px;">
                    <option value="ADMIN">👷‍♂️ Encargado (No puede crear cuentas)</option>
                    <option value="SUPERADMIN">👑 Jefe de Planta (Acceso Total)</option>
                </select>

                <button id="btn-crear-admin" style="width: 100%; margin-top: 20px; background: var(--color-primario); color: white; padding: 12px; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;">
                    Crear Cuenta de Acceso
                </button>
            </div>

            <div style="flex: 2; min-width: 350px;">
                <h3 style="margin-top: 0; color: #334155;">Personal Autorizado Actualmente</h3>
                <div id="lista-usuarios" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    <p>Cargando personal...</p>
                </div>
            </div>
        </div>
    `;

    // ========== LÓGICA DE LA PANTALLA ==========
    setTimeout(async () => {
        const btnCrear = document.getElementById('btn-crear-admin');
        const listaUI = document.getElementById('lista-usuarios');

        // Función para dibujar la lista
        const cargarLista = async () => {
            try {
                const usuarios = await api.obtenerUsuarios();
                listaUI.innerHTML = '';
                
                usuarios.forEach(user => {
                    const idUsuarioActual = sessionStorage.getItem('adminId');
                    const esElMismo = user.id === idUsuarioActual;

                    const tarjeta = document.createElement('div');
                    tarjeta.style.background = esElMismo ? '#f0fdf4' : 'white';
                    tarjeta.style.border = esElMismo ? '1px solid #22c55e' : '1px solid #cbd5e1';
                    tarjeta.style.padding = '15px';
                    tarjeta.style.borderRadius = '6px';
                    tarjeta.style.display = 'flex';
                    tarjeta.style.justifyContent = 'space-between';
                    tarjeta.style.alignItems = 'center';

                    // 1. Extraemos al iniciador del borrado (El primer voto)
                    let infoIniciador = '';
                    if (doc.votosBorrados && doc.votosBorrados.length > 0) {
                        const primerVoto = doc.votosBorrados[0];
                        
                        // Buscamos la fecha (por si la llamaste 'fecha' o 'createdAt' en tu BD)
                        const fechaRaw = primerVoto.fecha || primerVoto.createdAt || new Date(); 
                        const fechaAmigable = new Date(fechaRaw).toLocaleString();
                        
                        infoIniciador = `
                            <div style="background: #fef2f2; border: 1px dashed #ef4444; color: #b91c1c; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-top: 10px; margin-bottom: 10px; display: inline-block;">
                                🛑 <b>Enviado a papelera por:</b> ${primerVoto.usuario?.nombre || 'Usuario Desconocido'} <br>
                                🕒 <b>Fecha de envío:</b> ${fechaAmigable}
                            </div>
                        `;
                    }

                    tarjeta.innerHTML = `
                        <div style="flex: 1;">
                            <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                📄 ${doc.titulo} 
                                <span style="font-size: 12px; background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 12px;">En Papelera</span>
                            </h3>
                            <p style="color: #64748b; margin: 5px 0 10px 0; font-size: 14px;">${doc.descripcion}</p>
                            
                            ${infoIniciador}
                            
                            <p style="margin: 0; font-size: 14px; font-weight: bold; color: ${faltan === 0 ? '#ef4444' : '#f59e0b'};">
                                Votos para destrucción: ${votosActuales} / 3
                            </p>
                        </div>
                    `;

                    // Botón de Eliminar (No te puedes borrar a ti mismo desde aquí por seguridad)
                    if (!esElMismo && user.activo) {
                        const btnBorrar = document.createElement('button');
                        btnBorrar.innerText = 'Revocar Acceso';
                        btnBorrar.style.background = '#ef4444';
                        btnBorrar.style.color = 'white';
                        btnBorrar.style.border = 'none';
                        btnBorrar.style.padding = '8px 12px';
                        btnBorrar.style.borderRadius = '4px';
                        btnBorrar.style.cursor = 'pointer';
                        
                        btnBorrar.addEventListener('click', async () => {
                            if(confirm(`⚠️ ¿Seguro que deseas bloquear a ${user.nombre}? No podrá volver a iniciar sesión, pero su historial en la Auditoría se conservará.`)) {
                                try {
                                    await api.eliminarUsuario(user.id);
                                    cargarLista(); // Recargamos la lista
                                } catch(e) { alert(e.message); }
                            }
                        });
                        tarjeta.append(btnBorrar);
                    }
                    listaUI.append(tarjeta);
                });
            } catch (error) {
                listaUI.innerHTML = `<p style="color: red;">Error al cargar: ${error.message}</p>`;
            }
        };

        // Función para Crear
        btnCrear.addEventListener('click', async () => {
            const nombre = document.getElementById('nuevo-nombre').value;
            const usuario = document.getElementById('nuevo-usuario').value;
            const clave = document.getElementById('nuevo-clave').value;
            const rol = document.getElementById('nuevo-rol').value; // <-- NUEVO

            if(!nombre || !usuario || !clave) return alert("Por favor, llena todos los campos.");

            const textoOriginal = btnCrear.innerText;
            btnCrear.innerText = 'Creando...';
            try {
                await api.crearUsuario({ nombre, usuario, password: clave, rol: rol });
                alert("✅ Cuenta creada con éxito. Ya puede iniciar sesión.");
                // Limpiamos los campos
                document.getElementById('nuevo-nombre').value = '';
                document.getElementById('nuevo-usuario').value = '';
                document.getElementById('nuevo-clave').value = '';
                cargarLista(); // Actualizamos la vista
            } catch(e) {
                alert(`❌ Error: ${e.message}`);
            } finally {
                btnCrear.innerText = textoOriginal;
            }
        });

        // Iniciamos cargando la lista
        cargarLista();

    }, 100);

    return contenedor;
};