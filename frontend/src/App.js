import { Header } from './components/Header.js';
import { Home } from './pages/Opciones/Home.js'; 
import { CargarDoc } from './pages/Principal/CargarDoc.js'; 
import { EditarDoc } from './pages/Principal/EditarDoc.js';
import { Buscador } from './pages/Buscador/Buscador.js';

export const App = () => {
    const contenedorApp = document.createElement('div');
    const vistaActual = document.createElement('div');

    // Ahora navegarA puede recibir la página Y datos extra (como el documento a editar)
    const navegarA = async (pagina, datosExtra = null) => {
        vistaActual.innerHTML = ''; 
        
        if (pagina === 'home') {
            vistaActual.append(Home(navegarA)); 
        } 
        else if (pagina === 'documentar') {
            vistaActual.append(CargarDoc()); 
        } 
        else if (pagina === 'respaldos') {
            vistaActual.innerHTML = '<h3 style="color: var(--text-principal); text-align: center; margin-top: 50px;">Cargando La Biblioteca...</h3>';
            const pantallaBuscador = await Buscador();
            vistaActual.innerHTML = ''; 
            vistaActual.append(pantallaBuscador);
        }
        else if (pagina === 'editar') {
            // Le mandamos los datos del documento a nuestra nueva pantalla
            vistaActual.append(EditarDoc(datosExtra, navegarA));
        }
    };

    const headerComponent = Header(navegarA);
    contenedorApp.append(headerComponent, vistaActual);
    
    // El "Receptor del Walkie-Talkie"
    window.addEventListener('cambiarRuta', (evento) => {
        navegarA(evento.detail.ruta, evento.detail.datos);
    });

    navegarA('home');
    return contenedorApp;
};