import { Header } from './Components/Header.js';
import { Home } from './pages/Opciones/Home.js'; 
import { CargarDoc } from './pages/Principal/CargarDoc.js'; 
import { EditarDoc } from './pages/Principal/EditarDoc.js';
import { Buscador } from './pages/Buscador/Buscador.js';
import { Papelera } from './pages/Papelera/Papelera.js';
import { Auditoria } from './pages/Auditoria/Auditoria.js';
import { Personal } from './pages/Personal/Personal.js';

export const App = () => {
    const contenedorApp = document.createElement('div');
    const vistaActual = document.createElement('div');

    // Ahora navegarA puede recibir la página Y datos extra (como el documento a editar)
    const navegarA = async (pagina, datosExtra = null) => {
        vistaActual.innerHTML = '';
        
        // --- 1. GUARDAMOS LA MEMORIA DE FORMA SEGURA ---
        sessionStorage.setItem('ultimaPestaña', pagina);
        if (datosExtra) {
            // Si hay datos extra (ej. un documento para editar), lo convertimos a texto para guardarlo
            sessionStorage.setItem('ultimaPestañaDatos', JSON.stringify(datosExtra));
        } else {
            // Si no hay datos extra, limpiamos la memoria vieja
            sessionStorage.removeItem('ultimaPestañaDatos');
        }
        // -----------------------------------------------
        
        if (pagina === 'home') {
            vistaActual.append(Home(navegarA)); 
        } 
        else if (pagina === 'documentar') {
            vistaActual.append(CargarDoc()); 
        } 
        else if (pagina === 'respaldos') {
            vistaActual.innerHTML = '<h3 style="color: var(--color-primario); text-align: center; margin-top: 50px;">Cargando La Biblioteca...</h3>';
            const pantallaBuscador = await Buscador();
            vistaActual.innerHTML = ''; 
            vistaActual.append(pantallaBuscador);
        }
        else if (pagina === 'editar') {
            // Le mandamos los datos del documento a nuestra nueva pantalla
            vistaActual.append(EditarDoc(datosExtra, navegarA));
        }
        else if (pagina === 'papelera') {
            vistaActual.innerHTML = '<h3 style="color: #b91c1c; text-align: center; margin-top: 50px;">Abriendo Bóveda...</h3>';
            const pantallaPapelera = await Papelera();
            vistaActual.innerHTML = '';
            vistaActual.append(pantallaPapelera);
        }
        else if (pagina === 'auditoria') {
            vistaActual.append(Auditoria());
        }
        else if (pagina === 'personal') {
            vistaActual.append(Personal());
        }
    };

    const headerComponent = Header(navegarA);
    contenedorApp.append(headerComponent, vistaActual);
    
    // El "Receptor del Walkie-Talkie"
    window.addEventListener('cambiarRuta', (evento) => {
        navegarA(evento.detail.ruta, evento.detail.datos);
    });

    // --- 2. RECUPERAMOS LA MEMORIA AL INICIAR LA APP ---
    const pestañaGuardada = sessionStorage.getItem('ultimaPestaña');
    const datosGuardados = sessionStorage.getItem('ultimaPestañaDatos');
    
    if (pestañaGuardada) {
        let extra = null;
        if (datosGuardados) {
            try { extra = JSON.parse(datosGuardados); } catch (e) {} // Lo volvemos a convertir a objeto
        }
        navegarA(pestañaGuardada, extra);
    } else {
        navegarA('home'); // Si entra por primera vez, va a Inicio
    }

    return contenedorApp;
};