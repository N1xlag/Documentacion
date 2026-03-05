import './AdminLoginModal.css';

export const mostrarLoginAdmin = (alIniciarSesion) => {
    // CERRAR SESIÓN: Si ya está logueado, borramos sus datos
    if (sessionStorage.getItem('isAdmin') === 'true') {
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('adminNombre');
        sessionStorage.removeItem('adminId');
        alIniciarSesion(); 
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';

    const caja = document.createElement('div');
    caja.className = 'admin-caja';

    const titulo = document.createElement('h2');
    titulo.innerText = '🔒 Acceso Administrador';
    titulo.style.marginBottom = '20px';

    // NUEVO: Pedimos también el usuario, no solo la clave
    const inputUsuario = document.createElement('input');
    inputUsuario.type = 'text';
    inputUsuario.placeholder = 'Nombre de usuario...';
    inputUsuario.className = 'admin-input';

    const inputClave = document.createElement('input');
    inputClave.type = 'password';
    inputClave.placeholder = 'Contraseña...';
    inputClave.className = 'admin-input';

    const mensajeError = document.createElement('p');
    mensajeError.className = 'admin-error';

    const cajaBotones = document.createElement('div');
    cajaBotones.className = 'admin-caja-botones';

    const btnCancelar = document.createElement('button');
    btnCancelar.innerText = 'Cancelar';
    btnCancelar.className = 'admin-btn admin-btn-cancelar';
    btnCancelar.addEventListener('click', () => overlay.remove());

    const btnIngresar = document.createElement('button');
    btnIngresar.innerText = 'Ingresar';
    btnIngresar.className = 'admin-btn admin-btn-ingresar';
    
    // LÓGICA DE VERIFICACIÓN CON LA BASE DE DATOS
    btnIngresar.addEventListener('click', async () => {
        btnIngresar.innerText = 'Verificando...';
        
        try {
            const respuesta = await fetch(`http://${window.location.hostname}:3001/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: inputUsuario.value,
                    password: inputClave.value
                })
            });

            if (!respuesta.ok) {
                mensajeError.innerText = 'Usuario o contraseña incorrectos ❌';
                inputClave.value = '';
                btnIngresar.innerText = 'Ingresar';
                return;
            }

            const datos = await respuesta.json(); // Obtenemos el nombre y el ID del backend

            // Guardamos el pase VIP y QUIÉN es el que entró
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('adminNombre', datos.nombre);
            sessionStorage.setItem('adminId', datos.id);
            
            overlay.remove();
            alIniciarSesion(); 
            alert(`¡Bienvenido, ${datos.nombre}!`); // Un saludo para confirmar que funcionó

        } catch (error) {
            mensajeError.innerText = 'Error al conectar con el servidor ❌';
            btnIngresar.innerText = 'Ingresar';
        }
    });

    cajaBotones.append(btnCancelar, btnIngresar);
    caja.append(titulo, inputUsuario, inputClave, mensajeError, cajaBotones);
    overlay.append(caja);

    document.body.append(overlay);
};