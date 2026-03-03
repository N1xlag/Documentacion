// src/App.js

import { Header } from './Components/Header.js';
import { CargarDoc } from './pages/Principal/CargarDoc.js';
import { Buscador } from './pages/Buscador/Buscador.js';

export const App = () => {
    const contenedorApp = document.createElement('div');

    // Aquí es donde se dibujarán las páginas
    const vistaActual = document.createElement('div');

    // El motor de navegación
    const navegarA = async (pagina) => {
        vistaActual.innerHTML = ''; // Limpiamos la pantalla
        
        if (pagina === 'subir') {
            // Llamamos a la nueva función CargarDoc
            vistaActual.append(CargarDoc()); 
        } else if (pagina === 'buscar') {
            const pantallaBuscador = await Buscador();
            vistaActual.append(pantallaBuscador);
        }
    };

    // Creamos el Header y le pasamos la función de navegación
    const headerComponent = Header(navegarA);

    // Unimos todo
    contenedorApp.append(headerComponent, vistaActual);

    // Arrancamos la app en la pantalla de "subir"
    navegarA('subir');

    return contenedorApp;
};