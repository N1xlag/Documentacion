import { api } from '../../services/api.js';
import { mostrarPopup } from '../../components/Popup.js';

export const Personal = () => {
    const contenedor = document.createElement('div');
    // Usamos variables del design system para el espaciado
    contenedor.style.padding = 'var(--spacing-xl)';
    contenedor.style.maxWidth = '1000px';
    contenedor.style.margin = '0 auto';

    contenedor.innerHTML = `
        <h2 style="color: var(--color-secundario); border-bottom: 2px solid var(--border-color); padding-bottom: 10px;">
            Gestión de Personal (Administradores)
        </h2>
        <p style="color: var(--text-secundario); margin-bottom: 30px;">
            Crea cuentas de acceso para nuevos encargados o revoca el acceso a personal inactivo.
        </p>

        <div style="display: flex; gap: var(--spacing-lg); align-items: flex-start; flex-wrap: wrap;">
            
            <div class="card" style="flex: 1; min-width: 300px; padding: var(--spacing-lg);">
                <h3 style="margin-top: 0; color: var(--color-tercero);">Registrar Nuevo Admin</h3>
                
                <label style="display: block; font-weight: bold; margin-top: 15px;">Nombre Completo:</label>
                <input type="text" id="nuevo-nombre" class="input" placeholder="Ej. Ing. Carlos Pérez">

                <label style="display: block; font-weight: bold; margin-top: 15px;">Nombre de Usuario:</label>
                <input type="text" id="nuevo-usuario" class="input" placeholder="Ej. carlos_admin">

                <label style="display: block; font-weight: bold; margin-top: 15px;">Contraseña:</label>
                <input type="password" id="nuevo-clave" class="input" placeholder="Asigna una contraseña segura">

                <label style="display: block; font-weight: bold; margin-top: 15px;">Nivel de Permisos:</label>
                <select id="nuevo-rol" class="select">
                    <option value="ADMIN">Encargado (No puede crear cuentas)</option>
                    <option value="SUPERADMIN">Jefe de Planta (Acceso Total)</option>
                </select>

                <button id="btn-crear-admin" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                    Crear Cuenta de Acceso
                </button>
            </div>

            <div style="flex: 2; min-width: 350px;">
                <h3 style="margin-top: 0; color: var(--color-tercero);">Personal Autorizado Actualmente</h3>
                <div id="lista-usuarios" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
                    <p>Cargando personal...</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(async () => {
        const btnCrear = document.getElementById('btn-crear-admin');
        const listaUI = document.getElementById('lista-usuarios');

        const cargarLista = async () => {
            try {
                const usuarios = await api.obtenerUsuarios();
                listaUI.innerHTML = '';
                
                usuarios.forEach(usuario => {
                    const idUsuarioActual = sessionStorage.getItem('adminId');
                    const esElMismo = usuario.id === idUsuarioActual;

                    const tarjeta = document.createElement('div');
                    // Usamos la tarjeta del design system para que se vea profesional
                    tarjeta.className = 'card';
                    tarjeta.style.padding = 'var(--spacing-md)';
                    tarjeta.style.display = 'flex';
                    tarjeta.style.justifyContent = 'space-between';
                    tarjeta.style.alignItems = 'center';
                    if (esElMismo) tarjeta.style.border = '2px solid var(--color-presente)';

                    tarjeta.innerHTML = `
                        <div>
                            <strong style="color: ${usuario.activo ? 'var(--text-principal)' : 'var(--text-disabled)'}; font-size: 16px; text-decoration: ${usuario.activo ? 'none' : 'line-through'};">
                                ${usuario.nombre}
                            </strong> 
                            ${esElMismo ? '<span class="badge badge-presente" style="margin-left: 5px;">(Tú)</span>' : ''}
                            ${!usuario.activo ? '<span class="badge badge-faltante" style="margin-left: 5px;">INACTIVO</span>' : ''}
                            <p style="margin: 5px 0 0 0; color: var(--text-secundario); font-size: 14px;">
                                Usuario: <b>${usuario.usuario}</b> | Nivel: ${usuario.rol === 'SUPERADMIN' ? 'Jefe' : 'Encargado'}
                            </p>
                        </div>
                    `;

                    if (!esElMismo && usuario.activo) {
                        const btnBorrar = document.createElement('button');
                        btnBorrar.innerText = 'Revocar';
                        // Usamos el botón secundario (Rojo intenso en tu paleta)
                        btnBorrar.className = 'btn btn-secondary btn-sm';
                        
                        btnBorrar.addEventListener('click', async () => {
                            if(confirm(`¿Seguro que deseas bloquear a ${usuario.nombre}?`)) {
                                try {
                                    await api.eliminarUsuario(usuario.id);
                                    mostrarPopup('success', 'Usuario bloqueado correctamente');
                                    cargarLista();
                                } catch(e) { 
                                    mostrarPopup('error', e.message); 
                                }
                            }
                        });
                        tarjeta.append(btnBorrar);
                    }
                    listaUI.append(tarjeta);
                });
            } catch (error) {
                listaUI.innerHTML = `<div class="alert alert-error">Error al cargar: ${error.message}</div>`;
            }
        };

        btnCrear.addEventListener('click', async () => {
            const nombre = document.getElementById('nuevo-nombre').value;
            const usuario = document.getElementById('nuevo-usuario').value;
            const clave = document.getElementById('nuevo-clave').value;
            const rol = document.getElementById('nuevo-rol').value;

            if(!nombre || !usuario || !clave) {
                return mostrarPopup('warning', 'Por favor, llena todos los campos.');
            }

            const textoOriginal = btnCrear.innerText;
            btnCrear.innerText = 'Creando...';
            btnCrear.disabled = true;

            try {
                await api.crearUsuario({ nombre, usuario, password: clave, rol: rol });
                mostrarPopup('success', 'Cuenta creada con éxito.');
                document.getElementById('nuevo-nombre').value = '';
                document.getElementById('nuevo-usuario').value = '';
                document.getElementById('nuevo-clave').value = '';
                cargarLista();
            } catch(e) {
                mostrarPopup('error', e.message);
            } finally {
                btnCrear.innerText = textoOriginal;
                btnCrear.disabled = false;
            }
        });

        cargarLista();

    }, 100);

    return contenedor;
};