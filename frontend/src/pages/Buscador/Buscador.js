import { TarjetaDocumento } from '../../components/Tarjeta.js';
import { api } from '../../services/api.js';
import './Buscador.css';

export const Buscador = async () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'buscador-contenedor';

    // Traemos los datos de PostgreSQL
    let todosLosDocumentos = [];
    try {
        todosLosDocumentos = await api.obtenerDocumentos();
    } catch (error) {
        console.error(error);
        contenedorPrincipal.innerHTML = '<h3 style="color:red; text-align:center;">Error al cargar la base de datos.</h3>';
        return contenedorPrincipal;
    }

    // ======== PANEL IZQUIERDO: FILTROS ========
    const panelFiltros = document.createElement('div');
    panelFiltros.className = 'buscador-panel-filtros';

    const tituloFiltros = document.createElement('h3');
    tituloFiltros.innerText = 'FILTROS';

    const crearFiltro = (textoLabel, tipoInput, placeholder = '') => {
        const grupo = document.createElement('div');
        grupo.className = 'buscador-grupo';
        
        const label = document.createElement('label');
        label.className = 'form-label'; 
        label.innerText = textoLabel;
        
        let input;
        if (tipoInput === 'select') {
            input = document.createElement('select');
        } else {
            input = document.createElement('input');
            input.type = tipoInput;
            input.placeholder = placeholder;
        }
        input.className = 'form-input'; 
        
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

    // Rango de fechas (Ahora se apilarán gracias al CSS)
    const grupoFechas = document.createElement('div');
    grupoFechas.className = 'buscador-grupo';
    
    const labelFechas = document.createElement('label');
    labelFechas.className = 'form-label';
    labelFechas.innerText = 'Rango de Fechas';
    
    const cajaFechas = document.createElement('div');
    cajaFechas.className = 'buscador-rango-fechas';
    
    const fechaInicio = document.createElement('input');
    fechaInicio.type = 'date'; 
    fechaInicio.className = 'form-input';
    
    const fechaFin = document.createElement('input');
    fechaFin.type = 'date'; 
    fechaFin.className = 'form-input';
    
    cajaFechas.append(fechaInicio, fechaFin);
    grupoFechas.append(labelFechas, cajaFechas);

    panelFiltros.append(tituloFiltros, filtroTexto.grupo, filtroCategoria.grupo, filtroGestion.grupo, grupoFechas);

    // ======== PANEL DERECHO: RESULTADOS ========
    const panelResultados = document.createElement('div');
    panelResultados.className = 'buscador-panel-resultados';

    const tituloResultados = document.createElement('h2');
    tituloResultados.className = 'buscador-titulo-resultados';
    tituloResultados.innerText = 'Documentos Respaldados';

    const rejilla = document.createElement('div');
    rejilla.className = 'buscador-rejilla';

    const renderizarTarjetas = (documentosFiltrados) => {
        rejilla.innerHTML = ''; 
        if (documentosFiltrados.length === 0) {
            const msj = document.createElement('div');
            msj.className = 'buscador-vacio';
            msj.innerText = 'No se encontraron documentos con esos filtros 🕵️‍♂️';
            rejilla.append(msj);
            return;
        }

        documentosFiltrados.forEach(doc => {
            rejilla.append(TarjetaDocumento(doc));
        });
    };

    // LÓGICA DE FILTRADO
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