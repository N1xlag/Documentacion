import { api } from '../../services/api.js';
import { mostrarPopup } from '../../components/Popup.js';
import './Personal.css';

export const Personal = () => {
    const contenedor = document.createElement('div');
    contenedor.className = 'personal-contenedor';

    contenedor.innerHTML = `
        <h2 class="personal-titulo">
            Gestión de Personal (Administradores)
        </h2>
        <p class="personal-descripcion">
            Crea cuentas de acceso para nuevos encargados o revoca el acceso a personal inactivo.
        </p>

        <div class="personal-layout">
            
            <div class="card personal-panel-registro">
                <h3 class="personal-subtitulo">Registrar Nuevo Admin</h3>
                
                <label class="personal-label">Nombre Completo:</label>
                <input type="text" id="nuevo-nombre" class="input" placeholder="Ej. Ing. Carlos Pérez">

                <label class="personal-label">Nombre de Usuario:</label>
                <input type="text" id="nuevo-usuario" class="input" placeholder="Ej. carlos_admin">

                <label class="personal-label">Contraseña:</label>
                <input type="password" id="nuevo-clave" class="input" placeholder="Asigna una contraseña segura">

                <label class="personal-label">Nivel de Permisos:</label>
                <select id="nuevo-rol" class="select">
                    <option value="ADMIN">Encargado (No puede crear cuentas)</option>
                    <option value="SUPERADMIN">Jefe de Planta (Acceso Total)</option>
                </select>

                <button id="btn-crear-admin" class="btn btn-primary personal-btn-crear">
                    Crear Cuenta de Acceso
                </button>
            </div>

            <div class="personal-panel-lista">
                <h3 class="personal-subtitulo">Personal Autorizado Actualmente</h3>
                <div id="lista-usuarios" class="personal-caja-lista">
                    <p>Cargando personal...</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
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
                    tarjeta.className = `card personal-tarjeta ${esElMismo ? 'es-usuario-actual' : ''}`;

                    const claseNombre = usuario.activo ? 'activo' : 'inactivo';
                    const etiquetaTu = esElMismo ? '<span class="badge badge-presente personal-badge-margen">(Tú)</span>' : '';
                    const etiquetaInactivo = !usuario.activo ? '<span class="badge badge-faltante personal-badge-margen">INACTIVO</span>' : '';
                    const nivelTexto = usuario.rol === 'SUPERADMIN' ? 'Jefe' : 'Encargado';

                    tarjeta.innerHTML = `
                        <div>
                            <strong class="personal-info-nombre ${claseNombre}">
                                ${usuario.nombre}
                            </strong> 
                            ${etiquetaTu}
                            ${etiquetaInactivo}
                            <p class="personal-info-detalles">
                                Usuario: <b>${usuario.usuario}</b> | Nivel: ${nivelTexto}
                            </p>
                        </div>
                    `;

                    if (!esElMismo && usuario.activo) {
                        const btnBorrar = document.createElement('button');
                        btnBorrar.innerText = 'Bloquear';
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