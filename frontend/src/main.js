// src/main.js
import './index.css';
import './desing.css'; // Si ya copiaste los colores de tus compañeros
import { App } from './App.js';

const root = document.getElementById('app');

// Inicializamos la aplicación
const miAplicacion = App();
root.append(miAplicacion);