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

    // ======== CAJA IZQUIERDA ========
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

    // ======== CAJA DERECHA ========
    const cajaDerecha = document.createElement('div');
    cajaDerecha.style.display = 'flex';
    cajaDerecha.style.gap = '15px';

    // Botón Inicio
    const btnInicio = document.createElement('button');
    btnInicio.innerText = 'INICIO';
    btnInicio.style.padding = '10px 20px';
    btnInicio.style.fontWeight = 'bold';
    btnInicio.style.background = 'rgba(255, 255, 255, 0.2)';
    btnInicio.style.color = 'white';
    btnInicio.style.border = '2px solid white';
    btnInicio.style.borderRadius = '4px';
    btnInicio.style.cursor = 'pointer';
    btnInicio.style.transition = 'all 0.2s';

    btnInicio.onmouseover = () => { btnInicio.style.background = 'white'; btnInicio.style.color = 'var(--color-tercero)'; };
    btnInicio.onmouseout = () => { btnInicio.style.background = 'rgba(255, 255, 255, 0.2)'; btnInicio.style.color = 'white'; };
    btnInicio.addEventListener('click', () => onNavigate('home'));

    const esAdmin = sessionStorage.getItem('isAdmin') === 'true'; 

    // === BOTONES EXCLUSIVOS PARA ADMINS ===
    let btnPapelera = null;
    let btnAuditoria = null;

    if (esAdmin) {
        // Botón Papelera
        btnPapelera = document.createElement('button');
        btnPapelera.innerText = '🗑️ PAPELERA';
        btnPapelera.style.padding = '10px 20px';
        btnPapelera.style.fontWeight = 'bold';
        btnPapelera.style.background = '#fef2f2'; 
        btnPapelera.style.color = '#b91c1c'; 
        btnPapelera.style.border = '2px solid white';
        btnPapelera.style.borderRadius = '4px';
        btnPapelera.style.cursor = 'pointer';
        btnPapelera.style.transition = 'all 0.2s';
        btnPapelera.onmouseover = () => { btnPapelera.style.background = 'white'; btnPapelera.style.transform = 'scale(1.05)'; };
        btnPapelera.onmouseout = () => { btnPapelera.style.background = '#fef2f2'; btnPapelera.style.transform = 'scale(1)'; };
        btnPapelera.addEventListener('click', () => onNavigate('papelera'));

        // Botón Auditoría (NUEVO)
        btnAuditoria = document.createElement('button');
        btnAuditoria.innerText = '🛡️ AUDITORÍA';
        btnAuditoria.style.padding = '10px 20px';
        btnAuditoria.style.fontWeight = 'bold';
        btnAuditoria.style.background = '#f0fdf4'; // Verde clarito
        btnAuditoria.style.color = '#166534'; // Verde oscuro
        btnAuditoria.style.border = '2px solid white';
        btnAuditoria.style.borderRadius = '4px';
        btnAuditoria.style.cursor = 'pointer';
        btnAuditoria.style.transition = 'all 0.2s';
        btnAuditoria.onmouseover = () => { btnAuditoria.style.background = 'white'; btnAuditoria.style.transform = 'scale(1.05)'; };
        btnAuditoria.onmouseout = () => { btnAuditoria.style.background = '#f0fdf4'; btnAuditoria.style.transform = 'scale(1)'; };
        btnAuditoria.addEventListener('click', () => onNavigate('auditoria'));
    }

    // Botón Admin / Salir
    const btnAdmin = document.createElement('button');
    btnAdmin.innerText = esAdmin ? 'SALIR' : 'ADMIN';
    btnAdmin.style.padding = '10px 20px';
    btnAdmin.style.fontWeight = 'bold';
    btnAdmin.style.background = esAdmin ? '#bf2422' : 'transparent'; 
    btnAdmin.style.color = 'white';
    btnAdmin.style.border = '2px solid white';
    btnAdmin.style.borderRadius = '4px';
    btnAdmin.style.cursor = 'pointer';

    btnAdmin.addEventListener('click', () => {
        mostrarLoginAdmin(() => { window.location.reload(); });
    });

    // Agregamos los botones en orden
    cajaDerecha.append(btnInicio);
    if (btnPapelera) cajaDerecha.append(btnPapelera); 
    if (btnAuditoria) cajaDerecha.append(btnAuditoria);
    cajaDerecha.append(btnAdmin);
    
    header.append(cajaIzquierda, cajaDerecha);
    return header;
};