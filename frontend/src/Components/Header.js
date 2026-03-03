// src/components/Header.js

export const Header = (onNavigate) => {
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.borderBottom = '2px solid #ccc';
    header.style.paddingBottom = '10px';
    header.style.marginBottom = '20px';

    const titulo = document.createElement('h1');
    titulo.innerText = 'SISTEMA DOCUMENTAL - PPPI';
    titulo.style.textTransform = 'uppercase';
    titulo.style.color = '#224251';

    const navButtons = document.createElement('div');
    navButtons.style.display = 'flex';
    navButtons.style.gap = '10px';

    const btnSubir = document.createElement('button');
    btnSubir.innerText = '➕ Subir Evidencia';
    
    const btnBuscar = document.createElement('button');
    btnBuscar.innerText = '🔍 Buscador';

    // Estilos base de los botones
    [btnSubir, btnBuscar].forEach(btn => {
        btn.style.padding = '10px 15px';
        btn.style.cursor = 'pointer';
        btn.style.border = '1px solid #224251';
        btn.style.background = 'white';
        btn.style.color = '#224251';
        btn.style.fontWeight = 'bold';
        btn.style.borderRadius = '4px';
    });

    // Función visual para resaltar el botón activo
    const actualizarBotones = (activo) => {
        btnSubir.style.background = activo === 'subir' ? '#224251' : 'white';
        btnSubir.style.color = activo === 'subir' ? 'white' : '#224251';
        btnBuscar.style.background = activo === 'buscar' ? '#224251' : 'white';
        btnBuscar.style.color = activo === 'buscar' ? 'white' : '#224251';
    };

    // Eventos de clic
    btnSubir.addEventListener('click', () => {
        actualizarBotones('subir');
        onNavigate('subir'); // Le avisamos al App que cambie la pantalla
    });

    btnBuscar.addEventListener('click', () => {
        actualizarBotones('buscar');
        onNavigate('buscar');
    });

    // Iniciamos con el botón "subir" encendido
    actualizarBotones('subir');

    navButtons.append(btnSubir, btnBuscar);
    header.append(titulo, navButtons);

    return header;
};