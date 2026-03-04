import './Home.css';

// Recibimos la función "navegarA" para poder decirle a qué página ir al hacer clic
export const Home = (navegarA) => {
    const contenedor = document.createElement('div');
    contenedor.className = 'home-contenedor';

    // Creamos el contenedor central para los botones
    const grupoBotones = document.createElement('div');
    grupoBotones.className = 'home-grupo-botones';

    // Botón 1: Documentar
    const btnDocumentar = document.createElement('button');
    btnDocumentar.className = 'home-btn';
    btnDocumentar.innerText = 'DOCUMENTAR';
    btnDocumentar.addEventListener('click', () => {
        navegarA('documentar');
    });

    // Botón 2: Respaldos (Buscador)
    const btnRespaldos = document.createElement('button');
    btnRespaldos.className = 'home-btn';
    btnRespaldos.innerText = 'RESPALDOS';
    btnRespaldos.addEventListener('click', () => {
        navegarA('respaldos');
    });

    grupoBotones.append(btnDocumentar, btnRespaldos);
    contenedor.append(grupoBotones);

    return contenedor;
};