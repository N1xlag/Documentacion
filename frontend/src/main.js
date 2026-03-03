import './style.css';
import { SubirEvidencia } from './pages/SubirEvidencia.js';
import { Buscador } from './pages/Buscador.js';

const app = document.getElementById('app');

// ======== CREAR EL MENÚ DE NAVEGACIÓN ========
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
btnSubir.className = 'nav-btn'; // Usaremos esta clase luego si quieres darle estilos en CSS

const btnBuscar = document.createElement('button');
btnBuscar.innerText = '🔍 Buscador';
btnBuscar.className = 'nav-btn';

// Dando estilos básicos rápidos a los botones del menú
[btnSubir, btnBuscar].forEach(btn => {
    btn.style.padding = '10px 15px';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid #224251';
    btn.style.background = 'white';
    btn.style.color = '#224251';
    btn.style.fontWeight = 'bold';
    btn.style.borderRadius = '4px';
});

navButtons.append(btnSubir, btnBuscar);
header.append(titulo, navButtons);
app.append(header);

// ======== EL CONTENEDOR DONDE CAMBIAN LAS PÁGINAS ========
const vistaActual = document.createElement('div');
app.append(vistaActual);

// ======== LÓGICA DE NAVEGACIÓN ========
const navegarA = async (pagina) => { // <-- Agregar async aquí
    vistaActual.innerHTML = ''; 
    
    if (pagina === 'subir') {
        vistaActual.append(SubirEvidencia());
        btnSubir.style.background = '#224251';
        btnSubir.style.color = 'white';
        btnBuscar.style.background = 'white';
        btnBuscar.style.color = '#224251';
    } else if (pagina === 'buscar') {
        const pantallaBuscador = await Buscador(); 
        vistaActual.append(pantallaBuscador);
        btnBuscar.style.background = '#224251';
        btnBuscar.style.color = 'white';
        btnSubir.style.background = 'white';
        btnSubir.style.color = '#224251';
    }
};

// Conectamos los clics de los botones a la función de navegar
btnSubir.addEventListener('click', () => navegarA('subir'));
btnBuscar.addEventListener('click', () => navegarA('buscar'));

// Iniciamos la app en la pantalla de "Subir" por defecto
navegarA('subir');