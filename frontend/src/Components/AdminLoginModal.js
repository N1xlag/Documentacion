import './AdminLoginModal.css';

// Recibimos una función "alIniciarSesion" para decirle a la app que recargue la vista
export const mostrarLoginAdmin = (alIniciarSesion) => {
    // Si ya es admin y hace clic, significa que quiere CERRAR sesión
    if (sessionStorage.getItem('isAdmin') === 'true') {
        sessionStorage.removeItem('isAdmin');
        alIniciarSesion(); // Recargamos para ocultar los botones
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';

    const caja = document.createElement('div');
    caja.className = 'admin-caja';

    const titulo = document.createElement('h2');
    titulo.innerText = '🔒 Acceso Administrador';
    titulo.style.marginBottom = '20px';

    const inputClave = document.createElement('input');
    inputClave.type = 'password';
    inputClave.placeholder = 'Ingrese la contraseña...';
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
    
    // LÓGICA DE VERIFICACIÓN
    btnIngresar.addEventListener('click', () => {
        if (inputClave.value === 'admin123') { // <-- CONTRASEÑA SECRETA
            sessionStorage.setItem('isAdmin', 'true'); // Guardamos el pase VIP
            overlay.remove();
            alIniciarSesion(); // Avisamos que ya entró
        } else {
            mensajeError.innerText = 'Contraseña incorrecta ❌';
            inputClave.value = ''; // Limpiamos el input
        }
    });

    cajaBotones.append(btnCancelar, btnIngresar);
    caja.append(titulo, inputClave, mensajeError, cajaBotones);
    overlay.append(caja);

    document.body.append(overlay);
};