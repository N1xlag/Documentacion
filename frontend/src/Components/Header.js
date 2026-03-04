import { mostrarLoginAdmin } from './AdminLoginModal.js';

export const Header = (onNavigate) => {
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 25px';
    header.style.background = 'linear-gradient(135deg, var(--color-primario) 0%, var(--color-secundario) 100%)';
    header.style.boxShadow = 'var(--shadow-xl)';
    header.style.marginBottom = '20px';
    header.style.borderRadius = '8px'; 

    // ======== CAJA IZQUIERDA: Logo y Título ========
    const cajaIzquierda = document.createElement('div');
    cajaIzquierda.style.display = 'flex';
    cajaIzquierda.style.alignItems = 'center';
    cajaIzquierda.style.gap = '20px';

    const logo = document.createElement('div');
    logo.innerText = 'LOGO';
    logo.style.backgroundColor = 'white';
    logo.style.padding = '10px 15px';
    logo.style.fontWeight = 'bold';
    logo.style.borderRadius = '4px';
    logo.style.color = 'var(--color-tercero)';

    const titulo = document.createElement('h2');
    titulo.innerText = 'SISTEMA DOCUMENTAL - PPPI';
    titulo.style.color = 'white';
    titulo.style.margin = '0';
    titulo.style.letterSpacing = '2px';

    cajaIzquierda.append(logo, titulo);

    // ======== CAJA DERECHA: Botones de Inicio y Admin ========
    const cajaDerecha = document.createElement('div');
    cajaDerecha.style.display = 'flex';
    cajaDerecha.style.gap = '15px';

    // Botón Inicio
    const btnInicio = document.createElement('button');
    btnInicio.innerText = '🏠 INICIO';
    btnInicio.style.padding = '10px 20px';
    btnInicio.style.fontWeight = 'bold';
    btnInicio.style.background = 'rgba(255, 255, 255, 0.2)';
    btnInicio.style.color = 'white';
    btnInicio.style.border = '2px solid white';
    btnInicio.style.borderRadius = '4px';
    btnInicio.style.cursor = 'pointer';
    btnInicio.style.transition = 'all 0.2s';

    btnInicio.onmouseover = () => {
        btnInicio.style.background = 'white';
        btnInicio.style.color = 'var(--color-tercero)';
    };
    btnInicio.onmouseout = () => {
        btnInicio.style.background = 'rgba(255, 255, 255, 0.2)';
        btnInicio.style.color = 'white';
    };

    btnInicio.addEventListener('click', () => {
        onNavigate('home');
    });

    // Botón Admin
    const btnAdmin = document.createElement('button');
    const esAdmin = sessionStorage.getItem('isAdmin') === 'true'; 
    
    btnAdmin.innerText = esAdmin ? '🔓 SALIR' : '🔒 ADMIN';
    btnAdmin.style.padding = '10px 20px';
    btnAdmin.style.fontWeight = 'bold';
    btnAdmin.style.background = esAdmin ? '#bf2422' : 'transparent'; 
    btnAdmin.style.color = 'white';
    btnAdmin.style.border = '2px solid white';
    btnAdmin.style.borderRadius = '4px';
    btnAdmin.style.cursor = 'pointer';

    btnAdmin.addEventListener('click', () => {
        mostrarLoginAdmin(() => {
            window.location.reload(); // Recarga la página para aplicar el modo Dios
        });
    });

    cajaDerecha.append(btnInicio, btnAdmin);
    
    // Unimos todo al Header
    header.append(cajaIzquierda, cajaDerecha);

    return header;
};