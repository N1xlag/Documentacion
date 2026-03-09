import './Home.css';

export const Home = (navegarA) => {
    const contenedor = document.createElement('div');

    contenedor.style.display = 'flex';
    contenedor.style.justifyContent = 'center';
    contenedor.style.alignItems = 'center';
    contenedor.style.minHeight = '75vh';
    contenedor.style.padding = 'var(--spacing-xl)';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'card';
    tarjeta.style.width = '100%';
    tarjeta.style.maxWidth = '500px';
    tarjeta.style.padding = 'var(--spacing-xl)';
    tarjeta.style.textAlign = 'center';
    tarjeta.style.display = 'flex';
    tarjeta.style.flexDirection = 'column';
    tarjeta.style.gap = 'var(--spacing-lg)';


    tarjeta.innerHTML = `
        <div>
            <h1 style="color: var(--color-primario); margin-bottom: var(--spacing-sm); font-size: 28px;">Bienvenido al Sistema</h1>
            <p style="color: var(--text-secundario); font-size: var(--font-size-md);">¿Qué acción deseas realizar hoy?</p>
        </div>
    `;


    const grupoBotones = document.createElement('div');
    grupoBotones.style.display = 'flex';
    grupoBotones.style.flexDirection = 'column';
    grupoBotones.style.gap = 'var(--spacing-md)';


    const btnDocumentar = document.createElement('button');
    btnDocumentar.className = 'btn btn-primary'; 
    btnDocumentar.style.padding = 'var(--spacing-md)';
    btnDocumentar.style.fontSize = 'var(--font-size-md)';
    btnDocumentar.innerText = ' DOCUMENTAR NUEVO';
    btnDocumentar.addEventListener('click', () => {
        navegarA('documentar');
    });


    const btnRespaldos = document.createElement('button');
    btnRespaldos.className = 'btn btn-secondary';
    btnRespaldos.style.padding = 'var(--spacing-md)';
    btnRespaldos.style.fontSize = 'var(--font-size-md)';
    btnRespaldos.innerText = 'BUSCAR RESPALDOS';
    btnRespaldos.addEventListener('click', () => {
        navegarA('respaldos');
    });

    grupoBotones.append(btnDocumentar, btnRespaldos);
    tarjeta.append(grupoBotones);
    contenedor.append(tarjeta);

    const esAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (esAdmin) {
        const btnDump = document.createElement('button');
        btnDump.innerText = 'Respaldo DB'; 
        
      
        Object.assign(btnDump.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            backgroundColor: 'var(--color-error)', 
            color: 'white',
            border: 'none',
            borderRadius: '50px', 
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            zIndex: '1000',
            transition: 'background-color var(--transition-fast)'
        });

     
        btnDump.addEventListener('mouseover', () => btnDump.style.backgroundColor = '#b91c1c'); // Un rojo más oscuro
        btnDump.addEventListener('mouseout', () => btnDump.style.backgroundColor = 'var(--color-error)');

      
        btnDump.addEventListener('click', () => {
            if (confirm('¿Generar y descargar un Dump completo del sistema?')) {
                const HOST = window.location.hostname;
                window.open(`http://${HOST}:3001/api/documentos/estado/backup`, '_blank');
            }
        });

        
        contenedor.append(btnDump);
    }

    return contenedor;
};