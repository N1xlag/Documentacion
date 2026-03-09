import { TarjetaDocumento } from '../../components/Tarjeta.js';
import { api } from '../../services/api.js';
import './Buscador.css';


const extraerCategoriasUnicas = (documentos) => {
    const categorias = new Set(documentos.map(doc => doc.categoria));
    return ['Todas', ...categorias];
};

const extraerGestionesUnicas = (documentos) => {
    const gestiones = new Set(documentos.map(doc => doc.gestion).filter(g => g));
    return ['Todas', ...gestiones];
};


const cumpleFiltroTexto = (doc, texto) => {
    const textoMin = texto.toLowerCase();
    const enTitulo = doc.titulo.toLowerCase().includes(textoMin);
    const enEtiquetas = doc.etiquetas && doc.etiquetas.join(' ').toLowerCase().includes(textoMin);
    return enTitulo || enEtiquetas;
};

const cumpleFiltroCategoria = (doc, categoria) => {
    return categoria === 'Todas' || doc.categoria === categoria;
};

const cumpleFiltroGestion = (doc, gestion) => {
    return gestion === 'Todas' || doc.gestion === gestion;
};

const cumpleFiltroFechaInicio = (doc, fechaInicio) => {
    return fechaInicio === '' || doc.fecha >= fechaInicio;
};

const cumpleFiltroFechaFin = (doc, fechaFin) => {
    return fechaFin === '' || doc.fecha <= fechaFin;
};

const aplicarTodosFiltros = (documentos, filtros) => {
    return documentos.filter(doc => {
        return cumpleFiltroTexto(doc, filtros.texto) &&
               cumpleFiltroCategoria(doc, filtros.categoria) &&
               cumpleFiltroGestion(doc, filtros.gestion) &&
               cumpleFiltroFechaInicio(doc, filtros.fechaInicio) &&
               cumpleFiltroFechaFin(doc, filtros.fechaFin);
    });
};


const crearFiltro = (textoLabel, tipoInput, placeholder = '') => {
    const grupo = document.createElement('div');
    grupo.style.marginBottom = 'var(--spacing-md)';
    
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.fontWeight = 'var(--font-weight-semibold)';
    label.style.marginBottom = 'var(--spacing-xs)';
    label.style.color = 'var(--text-secundario)';
    label.innerText = textoLabel;
    
    let input;
    if (tipoInput === 'select') {
        input = document.createElement('select');
        input.className = 'select';
    } else {
        input = document.createElement('input');
        input.type = tipoInput;
        input.placeholder = placeholder;
        input.className = 'input';
    }
    input.style.width = '100%';
    
    grupo.append(label, input);
    return { grupo, input };
};

const crearSelectConOpciones = (textoLabel, opciones) => {
    const filtro = crearFiltro(textoLabel, 'select');
    
    opciones.forEach(opcion => {
        const elemento = document.createElement('option');
        elemento.value = opcion;
        elemento.innerText = opcion;
        filtro.input.append(elemento);
    });
    
    return filtro;
};

const crearFiltroFechas = () => {
    const grupo = document.createElement('div');
    grupo.className = 'buscador-grupo'; 
    
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.fontWeight = 'var(--font-weight-semibold)';
    label.style.marginBottom = 'var(--spacing-sm)';
    label.style.color = 'var(--text-secundario)';
    label.innerText = 'Rango de Fechas';
    
    const caja = document.createElement('div');
    caja.className = 'buscador-rango-fechas';

    const cajaInicio = document.createElement('div');
    const labelInicio = document.createElement('span');
    labelInicio.innerText = 'Desde:';
    labelInicio.style.fontSize = '12px';
    labelInicio.style.color = 'var(--text-disabled)';
    labelInicio.style.display = 'block';
    labelInicio.style.marginBottom = '4px';
    
    const fechaInicio = document.createElement('input');
    fechaInicio.type = 'date';
    fechaInicio.className = 'input';
    fechaInicio.style.width = '100%';
    fechaInicio.style.boxSizing = 'border-box';
    
    cajaInicio.append(labelInicio, fechaInicio);

    const cajaFin = document.createElement('div');
    const labelFin = document.createElement('span');
    labelFin.innerText = 'Hasta:';
    labelFin.style.fontSize = '12px';
    labelFin.style.color = 'var(--text-disabled)';
    labelFin.style.display = 'block';
    labelFin.style.marginBottom = '4px';
    
    const fechaFin = document.createElement('input');
    fechaFin.type = 'date';
    fechaFin.className = 'input';
    fechaFin.style.width = '100%';
    fechaFin.style.boxSizing = 'border-box';
    
    cajaFin.append(labelFin, fechaFin);
    
    caja.append(cajaInicio, cajaFin);
    grupo.append(label, caja);
    
    return { grupo, fechaInicio, fechaFin };
};

const crearPanelFiltros = (documentos) => {
    const panel = document.createElement('div');
    panel.className = 'card';
    panel.style.flex = '1';
    panel.style.minWidth = '280px';
    panel.style.padding = 'var(--spacing-lg)';

    const titulo = document.createElement('h3');
    titulo.innerText = 'Filtros de Búsqueda';
    titulo.style.color = 'var(--color-tercero)';
    titulo.style.borderBottom = '2px solid var(--border-color)';
    titulo.style.paddingBottom = 'var(--spacing-sm)';
    titulo.style.marginBottom = 'var(--spacing-md)';

    const filtroTexto = crearFiltro('Búsqueda (Título/Etiquetas)', 'text', 'Buscar...');
    
    const categoriasUnicas = extraerCategoriasUnicas(documentos);
    const filtroCategoria = crearSelectConOpciones('Filtrar por Categoría', categoriasUnicas);
    
    const gestionesUnicas = extraerGestionesUnicas(documentos);
    const filtroGestion = crearSelectConOpciones('Filtrar por Gestión', gestionesUnicas);
    
    const filtroFechas = crearFiltroFechas();

    panel.append(
        titulo,
        filtroTexto.grupo,
        filtroCategoria.grupo,
        filtroGestion.grupo,
        filtroFechas.grupo
    );
    
    return {
        panel,
        inputs: {
            texto: filtroTexto.input,
            categoria: filtroCategoria.input,
            gestion: filtroGestion.input,
            fechaInicio: filtroFechas.fechaInicio,
            fechaFin: filtroFechas.fechaFin
        }
    };
};


const crearMensajeVacio = () => {
    const mensaje = document.createElement('div');
    mensaje.className = 'alert alert-info';
    mensaje.style.gridColumn = '1 / -1';
    mensaje.style.padding = 'var(--spacing-lg)';
    mensaje.style.textAlign = 'center';
    mensaje.innerText = 'No se encontraron documentos con esos filtros 🕵️‍♂️';
    return mensaje;
};

const crearRejillaTarjetas = () => {
    const rejilla = document.createElement('div');
    rejilla.style.display = 'grid';
    rejilla.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    rejilla.style.gap = 'var(--spacing-md)';
    return rejilla;
};

const crearPanelResultados = () => {
    const panel = document.createElement('div');
    panel.style.flex = '3';
    panel.style.minWidth = '300px';

    const titulo = document.createElement('h2');
    titulo.innerText = 'Documentos Respaldados';
    titulo.style.color = 'var(--color-primario)';
    titulo.style.marginBottom = 'var(--spacing-md)';

    const rejilla = crearRejillaTarjetas();

    panel.append(titulo, rejilla);
    return { panel, rejilla };
};



const renderizarTarjetas = (documentos, rejilla) => {
    rejilla.innerHTML = '';
    
    if (documentos.length === 0) {
        rejilla.append(crearMensajeVacio());
        return;
    }
    
    documentos.forEach(doc => {
        const tarjeta = TarjetaDocumento(doc);
        rejilla.append(tarjeta);
    });
};

const configurarFiltros = (inputs, documentos, rejilla) => {
    const aplicarFiltros = () => {
        const filtros = {
            texto: inputs.texto.value,
            categoria: inputs.categoria.value,
            gestion: inputs.gestion.value,
            fechaInicio: inputs.fechaInicio.value,
            fechaFin: inputs.fechaFin.value
        };
        
        const documentosFiltrados = aplicarTodosFiltros(documentos, filtros);
        renderizarTarjetas(documentosFiltrados, rejilla);
    };
    
    inputs.texto.addEventListener('input', aplicarFiltros);
    inputs.categoria.addEventListener('change', aplicarFiltros);
    inputs.gestion.addEventListener('change', aplicarFiltros);
    inputs.fechaInicio.addEventListener('change', aplicarFiltros);
    inputs.fechaFin.addEventListener('change', aplicarFiltros);
};


const crearContenedorPrincipal = () => {
    const contenedor = document.createElement('div');
    contenedor.style.display = 'flex';
    contenedor.style.flexWrap = 'wrap';
    contenedor.style.gap = 'var(--spacing-lg)';
    contenedor.style.padding = 'var(--spacing-xl)';
    contenedor.style.maxWidth = '1300px';
    contenedor.style.margin = '0 auto';
    contenedor.style.alignItems = 'flex-start';
    return contenedor;
};

const crearMensajeError = (mensaje) => {
    const div = document.createElement('div');
    div.className = 'alert alert-error';
    div.style.width = '100%';
    div.innerText = `Error al cargar la base de datos: ${mensaje}`;
    return div;
};


export const Buscador = async () => {
    const contenedorPrincipal = crearContenedorPrincipal();

    let documentos;
    try {
        documentos = await api.obtenerDocumentos();
    } catch (error) {
        contenedorPrincipal.append(crearMensajeError(error.message));
        return contenedorPrincipal;
    }

    const { panel: panelFiltros, inputs } = crearPanelFiltros(documentos);
    const { panel: panelResultados, rejilla } = crearPanelResultados();

    configurarFiltros(inputs, documentos, rejilla);

    renderizarTarjetas(documentos, rejilla);

    contenedorPrincipal.append(panelFiltros, panelResultados);
    
    return contenedorPrincipal;
};