import { TarjetaDocumento } from '../../components/Tarjeta.js';
import { api } from '../../services/api.js';
import './Buscador.css';

export const Buscador = async () => {
    const contenedorPrincipal = document.createElement('div');
    // Usamos flexbox para que se adapte al ancho
    contenedorPrincipal.style.display = 'flex';
    contenedorPrincipal.style.flexWrap = 'wrap';
    contenedorPrincipal.style.gap = 'var(--spacing-lg)';
    contenedorPrincipal.style.padding = 'var(--spacing-xl)';
    contenedorPrincipal.style.maxWidth = '1300px';
    contenedorPrincipal.style.margin = '0 auto';
    contenedorPrincipal.style.alignItems = 'flex-start';

    let todosLosDocumentos = [];
    try {
        todosLosDocumentos = await api.obtenerDocumentos();
    } catch (error) {
        contenedorPrincipal.innerHTML = `<div class="alert alert-error" style="width: 100%;">Error al cargar la base de datos: ${error.message}</div>`;
        return contenedorPrincipal;
    }

    // ======== PANEL IZQUIERDO: FILTROS ========
    const panelFiltros = document.createElement('div');
    panelFiltros.className = 'card';
    panelFiltros.style.flex = '1';
    panelFiltros.style.minWidth = '280px';
    panelFiltros.style.padding = 'var(--spacing-lg)';

    const tituloFiltros = document.createElement('h3');
    tituloFiltros.innerText = 'Filtros de Búsqueda';
    tituloFiltros.style.color = 'var(--color-tercero)';
    tituloFiltros.style.borderBottom = '2px solid var(--border-color)';
    tituloFiltros.style.paddingBottom = 'var(--spacing-sm)';
    tituloFiltros.style.marginBottom = 'var(--spacing-md)';

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
            input.className = 'select'; // Del Design System
        } else {
            input = document.createElement('input');
            input.type = tipoInput;
            input.placeholder = placeholder;
            input.className = 'input'; // Del Design System
        }
        input.style.width = '100%';
        
        grupo.append(label, input);
        return { grupo, input };
    };

    const filtroTexto = crearFiltro('Búsqueda (Título/Etiquetas)', 'text', 'Buscar...');
    const filtroCategoria = crearFiltro('Filtrar por Categoría', 'select');
    const categoriasUnicas = ['Todas', ...new Set(todosLosDocumentos.map(doc => doc.categoria))];
    categoriasUnicas.forEach(cat => {
        const opcion = document.createElement('option');
        opcion.value = cat; opcion.innerText = cat;
        filtroCategoria.input.append(opcion);
    });

    const filtroGestion = crearFiltro('Filtrar por Gestión', 'select');
    const gestionesUnicas = ['Todas', ...new Set(todosLosDocumentos.map(doc => doc.gestion).filter(g => g))];
    gestionesUnicas.forEach(ges => {
        const opcion = document.createElement('option');
        opcion.value = ges; opcion.innerText = ges;
        filtroGestion.input.append(opcion);
    });

    const grupoFechas = document.createElement('div');
    grupoFechas.style.marginBottom = 'var(--spacing-md)';
    grupoFechas.innerHTML = `<label style="display: block; font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); color: var(--text-secundario);">Rango de Fechas</label>`;
    
    const cajaFechas = document.createElement('div');
    cajaFechas.style.display = 'flex';
    cajaFechas.style.gap = 'var(--spacing-sm)';
    
    const fechaInicio = document.createElement('input');
    fechaInicio.type = 'date'; fechaInicio.className = 'input'; fechaInicio.style.width = '100%';
    
    const fechaFin = document.createElement('input');
    fechaFin.type = 'date'; fechaFin.className = 'input'; fechaFin.style.width = '100%';
    
    cajaFechas.append(fechaInicio, fechaFin);
    grupoFechas.append(cajaFechas);

    panelFiltros.append(tituloFiltros, filtroTexto.grupo, filtroCategoria.grupo, filtroGestion.grupo, grupoFechas);

    // ======== PANEL DERECHO: RESULTADOS ========
    const panelResultados = document.createElement('div');
    panelResultados.style.flex = '3';
    panelResultados.style.minWidth = '300px';

    const tituloResultados = document.createElement('h2');
    tituloResultados.innerText = 'Documentos Respaldados';
    tituloResultados.style.color = 'var(--color-primario)';
    tituloResultados.style.marginBottom = 'var(--spacing-md)';

    const rejilla = document.createElement('div');
    // Usamos CSS Grid nativo para las tarjetas
    rejilla.style.display = 'grid';
    rejilla.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    rejilla.style.gap = 'var(--spacing-md)';

    const renderizarTarjetas = (documentosFiltrados) => {
        rejilla.innerHTML = ''; 
        if (documentosFiltrados.length === 0) {
            rejilla.innerHTML = `<div class="alert alert-info" style="grid-column: 1 / -1; padding: var(--spacing-lg); text-align: center;">No se encontraron documentos con esos filtros 🕵️‍♂️</div>`;
            return;
        }
        documentosFiltrados.forEach(doc => rejilla.append(TarjetaDocumento(doc)));
    };

    const aplicarFiltros = () => {
        const texto = filtroTexto.input.value.toLowerCase();
        const cat = filtroCategoria.input.value;
        const ges = filtroGestion.input.value;
        const fInicio = fechaInicio.value;
        const fFin = fechaFin.value;

        const filtrados = todosLosDocumentos.filter(doc => {
            const cumpleTexto = doc.titulo.toLowerCase().includes(texto) || (doc.etiquetas && doc.etiquetas.join(' ').toLowerCase().includes(texto));
            const cumpleCat = cat === 'Todas' || doc.categoria === cat;
            const cumpleGes = ges === 'Todas' || doc.gestion === ges;
            const cumpleInicio = fInicio === '' || doc.fecha >= fInicio;
            const cumpleFin = fFin === '' || doc.fecha <= fFin;
            return cumpleTexto && cumpleCat && cumpleGes && cumpleInicio && cumpleFin;
        });
        renderizarTarjetas(filtrados);
    };

    filtroTexto.input.addEventListener('input', aplicarFiltros);
    filtroCategoria.input.addEventListener('change', aplicarFiltros);
    filtroGestion.input.addEventListener('change', aplicarFiltros);
    fechaInicio.addEventListener('change', aplicarFiltros);
    fechaFin.addEventListener('change', aplicarFiltros);

    renderizarTarjetas(todosLosDocumentos);
    panelResultados.append(tituloResultados, rejilla);
    contenedorPrincipal.append(panelFiltros, panelResultados);
    return contenedorPrincipal;
};