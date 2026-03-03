import { TarjetaDocumento } from '../../Components/Tarjeta.js';
import { api } from '../../services/api.js';
import './Buscador.css';

// =============================================
// DATOS
// =============================================

const CATEGORIAS = ['Todas', 'Produccion', 'Clases/Reuniones', 'Activos/Mantenimiento'];


// =============================================
// COMPONENTES VISUALES
// =============================================

const crearInputBusqueda = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Buscar por título o etiqueta...';
    input.className = 'buscador-input';
    return input;
};

const crearSelectCategoria = () => {
    const select = document.createElement('select');
    select.className = 'buscador-input';
    
    CATEGORIAS.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat;
        select.append(option);
    });
    
    return select;
};

const crearPanelFiltros = (inputBusqueda, selectCategoria) => {
    const panel = document.createElement('div');
    panel.className = 'buscador-panel-filtros';

    const titulo = document.createElement('h3');
    titulo.innerText = 'Filtros de Búsqueda';
    titulo.style.marginBottom = '15px';

    panel.append(titulo, inputBusqueda, selectCategoria);
    return panel;
};

const crearPanelResultados = () => {
    const panel = document.createElement('div');
    panel.className = 'buscador-panel-resultados';
    return panel;
};

const crearMensajeCarga = () => {
    const mensaje = document.createElement('h3');
    mensaje.innerText = 'Cargando documentos... ⏳';
    return mensaje;
};

const crearMensajeVacio = () => {
    const mensaje = document.createElement('p');
    mensaje.className = 'buscador-vacio';
    mensaje.innerText = 'No se encontraron documentos.';
    return mensaje;
};


// =============================================
// LÓGICA DE NEGOCIO
// =============================================

const cumpleFiltroCategoria = (documento, categoriaSeleccionada) => {
    return categoriaSeleccionada === 'Todas' || documento.categoria === categoriaSeleccionada;
};

const cumpleFiltroTexto = (documento, textoBusqueda) => {
    const textoMinuscula = textoBusqueda.toLowerCase();
    
    const estaEnTitulo = documento.titulo.toLowerCase().includes(textoMinuscula);
    const estaEnEtiquetas = documento.etiquetas.some(tag => 
        tag.toLowerCase().includes(textoMinuscula)
    );
    
    return estaEnTitulo || estaEnEtiquetas;
};

const filtrarDocumentos = (documentos, textoBusqueda, categoriaSeleccionada) => {
    return documentos.filter(doc => {
        const pasaCategoria = cumpleFiltroCategoria(doc, categoriaSeleccionada);
        const pasaTexto = cumpleFiltroTexto(doc, textoBusqueda);
        return pasaCategoria && pasaTexto;
    });
};

const renderizarTarjetas = (documentos, panelResultados) => {
    panelResultados.innerHTML = '';

    if (documentos.length === 0) {
        panelResultados.append(crearMensajeVacio());
        return;
    }

    documentos.forEach(doc => {
        const tarjeta = TarjetaDocumento(doc);
        panelResultados.append(tarjeta);
    });
};

const aplicarFiltros = (documentos, inputBusqueda, selectCategoria, panelResultados) => {
    const textoBusqueda = inputBusqueda.value;
    const categoriaSeleccionada = selectCategoria.value;

    const filtrados = filtrarDocumentos(documentos, textoBusqueda, categoriaSeleccionada);
    renderizarTarjetas(filtrados, panelResultados);
};


// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Buscador = async () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'buscador-contenedor';

    // Mostrar mensaje de carga
    contenedorPrincipal.append(crearMensajeCarga());

    // Obtener documentos del servidor
    const documentos = await api.obtenerDocumentos();

    // Limpiar mensaje de carga
    contenedorPrincipal.innerHTML = '';

    // Crear componentes
    const inputBusqueda = crearInputBusqueda();
    const selectCategoria = crearSelectCategoria();
    const panelFiltros = crearPanelFiltros(inputBusqueda, selectCategoria);
    const panelResultados = crearPanelResultados();

    // Configurar event listeners
    inputBusqueda.addEventListener('keyup', () => {
        aplicarFiltros(documentos, inputBusqueda, selectCategoria, panelResultados);
    });

    selectCategoria.addEventListener('change', () => {
        aplicarFiltros(documentos, inputBusqueda, selectCategoria, panelResultados);
    });

    // Renderizar todos los documentos inicialmente
    renderizarTarjetas(documentos, panelResultados);

    // Ensamblar
    contenedorPrincipal.append(panelFiltros, panelResultados);
    
    return contenedorPrincipal;
};