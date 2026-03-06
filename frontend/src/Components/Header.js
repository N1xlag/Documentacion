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

    // === LAS DOS REGLAS DE SEGURIDAD ===
    const esAdmin = sessionStorage.getItem('isAdmin') === 'true'; 
    const esSuperAdmin = sessionStorage.getItem('adminRol') === 'SUPERADMIN'; 

    let btnPersonal = null;
    let btnPapelera = null;
    let btnAuditoria = null;

    // SOLO LOS JEFES VEN ESTO
    if (esSuperAdmin) {
        btnPersonal = document.createElement('button');
        btnPersonal.innerText = 'PERSONAL';
        btnPersonal.style.padding = '10px 20px';
        btnPersonal.style.fontWeight = 'bold';
        btnPersonal.style.background = '#eff6ff'; 
        btnPersonal.style.color = '#1d4ed8'; 
        btnPersonal.style.border = '2px solid white';
        btnPersonal.style.borderRadius = '4px';
        btnPersonal.style.cursor = 'pointer';
        btnPersonal.style.transition = 'all 0.2s';
        btnPersonal.onmouseover = () => { btnPersonal.style.background = 'white'; btnPersonal.style.transform = 'scale(1.05)'; };
        btnPersonal.onmouseout = () => { btnPersonal.style.background = '#eff6ff'; btnPersonal.style.transform = 'scale(1)'; };
        btnPersonal.addEventListener('click', () => onNavigate('personal'));
    }

    // TODOS LOS ADMINS Y JEFES VEN ESTO
    if (esAdmin) {
        btnPapelera = document.createElement('button');
        btnPapelera.innerText = 'PAPELERA';
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

        btnAuditoria = document.createElement('button');
        btnAuditoria.innerText = 'AUDITORÍA';
        btnAuditoria.style.padding = '10px 20px';
        btnAuditoria.style.fontWeight = 'bold';
        btnAuditoria.style.background = '#f0fdf4'; 
        btnAuditoria.style.color = '#166534'; 
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

    // === AGREGAMOS LOS BOTONES AL MENÚ ===
    cajaDerecha.append(btnInicio);
    if (btnPersonal) cajaDerecha.append(btnPersonal); 
    if (btnPapelera) cajaDerecha.append(btnPapelera); 
    if (btnAuditoria) cajaDerecha.append(btnAuditoria);
    cajaDerecha.append(btnAdmin);
    
    header.append(cajaIzquierda, cajaDerecha);
    return header;
};