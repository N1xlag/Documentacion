import { TarjetaDocumento } from '../../components/Tarjeta.js';
import { api } from '../../services/api.js';
import './Buscador.css';

export const Buscador = async () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'buscador-contenedor';

    contenedorPrincipal.innerHTML = '<h3>Cargando La Biblioteca...</h3>';
    let documentos = await api.obtenerDocumentos();
    contenedorPrincipal.innerHTML = ''; 

    // ======== LADO IZQUIERDO: FILTROS ========
    const panelFiltros = document.createElement('div');
    panelFiltros.className = 'buscador-panel-filtros';

    const tituloFiltros = document.createElement('h3');
    tituloFiltros.innerText = 'Filtros';
    tituloFiltros.style.marginBottom = '20px';

    // 1. Filtro de Texto
    const labelBusqueda = document.createElement('label');
    labelBusqueda.innerText = 'Búsqueda (Título/Etiquetas)';
    const inputBusqueda = document.createElement('input');
    inputBusqueda.type = 'text';
    inputBusqueda.placeholder = 'Buscar';
    inputBusqueda.className = 'buscador-input';

    // 2. Filtro de Categoría
    const labelCategoria = document.createElement('label');
    labelCategoria.innerText = 'Filtro por Categoría';
    const selectCategoria = document.createElement('select');
    selectCategoria.className = 'buscador-input';
    const categorias = ['Todas', 'Producción', 'Clases / Reuniones', 'Activos / Inventario', 'Administrativo / RRHH', 'Propio', 'Otros'];
    categorias.forEach(cat => {
        const op = document.createElement('option');
        op.value = cat;
        op.innerText = cat;
        selectCategoria.append(op);
    });

    // 3. Filtro de Gestión (¡Automático!)
    const labelGestion = document.createElement('label');
    labelGestion.innerText = 'Filtro por Gestión / Semestre';
    const selectGestion = document.createElement('select');
    selectGestion.className = 'buscador-input';

    // Siempre agregamos la opción "Todas" primero
    const opcionTodas = document.createElement('option');
    opcionTodas.value = 'Todas';
    opcionTodas.innerText = 'Todas';
    selectGestion.append(opcionTodas);

    // Array vacío para ir guardando las gestiones que vayamos encontrando
    const gestionesEncontradas = [];

    // Recorremos todos los documentos que vinieron del servidor
    documentos.forEach(doc => {
        // Si el documento tiene gestión, y TODAVÍA no la hemos guardado en nuestro array
        if (doc.gestion && !gestionesEncontradas.includes(doc.gestion)) {
            gestionesEncontradas.push(doc.gestion); // La agregamos
        }
    });

    // Ordenamos el array para que quede bonito (Ej: 1-2025, 2-2025, 1-2026...)
    // El .reverse() es para poner los más nuevos arriba
    gestionesEncontradas.sort().reverse(); 

    // Finalmente, convertimos ese array en etiquetas <option>
    gestionesEncontradas.forEach(g => {
        const op = document.createElement('option');
        op.value = g;
        op.innerText = g;
        selectGestion.append(op);
    });

    // 4. Filtro por Rango de Fechas
    const labelFechas = document.createElement('label');
    labelFechas.innerText = 'Filtro por Rango de Fechas';
    
    const cajaFechas = document.createElement('div');
    cajaFechas.style.display = 'flex';
    cajaFechas.style.gap = '10px';
    cajaFechas.style.marginBottom = '15px';

    const inputDesde = document.createElement('input');
    inputDesde.type = 'date';
    inputDesde.className = 'buscador-input';
    inputDesde.style.marginBottom = '0';

    const inputHasta = document.createElement('input');
    inputHasta.type = 'date';
    inputHasta.className = 'buscador-input';
    inputHasta.style.marginBottom = '0';

    cajaFechas.append(inputDesde, inputHasta);

    // Agregamos todo al panel izquierdo
    panelFiltros.append(
        tituloFiltros, 
        labelBusqueda, inputBusqueda, 
        labelCategoria, selectCategoria, 
        labelGestion, selectGestion, 
        labelFechas, cajaFechas
    );

    // ======== LADO DERECHO: RESULTADOS ========
    const panelResultados = document.createElement('div');
    panelResultados.className = 'buscador-panel-resultados';

    const renderizarTarjetas = (listaDeDatos) => {
        panelResultados.innerHTML = ''; 
        if (listaDeDatos.length === 0) {
            panelResultados.innerHTML = '<p class="buscador-vacio">No se encontraron documentos.</p>';
            return;
        }
        listaDeDatos.forEach(doc => {
            panelResultados.append(TarjetaDocumento(doc));
        });
    };

    // ======== MOTOR DE BÚSQUEDA AVANZADO ========
    const aplicarFiltros = () => {
        const fTexto = inputBusqueda.value.toLowerCase();
        const fCat = selectCategoria.value;
        const fGest = selectGestion.value;
        const fDesde = inputDesde.value;
        const fHasta = inputHasta.value;

        const filtrados = documentos.filter(doc => {
            // 1. Filtro Categoría
            const pasaCat = fCat === 'Todas' || doc.categoria === fCat;
            
            // 2. Filtro Gestión
            const pasaGest = fGest === 'Todas' || doc.gestion === fGest;

            // 3. Filtro Texto (Solo Título y Etiquetas como pediste)
            const titulo = doc.titulo ? doc.titulo.toLowerCase() : '';
            const pasaTexto = fTexto === '' || 
                              titulo.includes(fTexto) ||
                              (doc.etiquetas && doc.etiquetas.some(tag => tag.toLowerCase().includes(fTexto)));

            // 4. Filtro Fechas (Matemática simple comparando los strings YYYY-MM-DD)
            let pasaFechas = true;
            if (fDesde !== '' && doc.fecha < fDesde) pasaFechas = false;
            if (fHasta !== '' && doc.fecha > fHasta) pasaFechas = false;

            // Retorna true solo si cumple TODOS los filtros a la vez
            return pasaCat && pasaGest && pasaTexto && pasaFechas;
        });

        renderizarTarjetas(filtrados);
    };

    // Escuchamos los cambios en TODOS los filtros
    inputBusqueda.addEventListener('keyup', aplicarFiltros);
    selectCategoria.addEventListener('change', aplicarFiltros);
    selectGestion.addEventListener('change', aplicarFiltros);
    inputDesde.addEventListener('change', aplicarFiltros);
    inputHasta.addEventListener('change', aplicarFiltros);

    // Carga inicial
    renderizarTarjetas(documentos);

    contenedorPrincipal.append(panelFiltros, panelResultados);
    return contenedorPrincipal;
};