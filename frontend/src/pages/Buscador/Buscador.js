import { TarjetaDocumento } from '../../Components/Tarjeta.js';
import { api } from '../../services/api.js';
import './Buscador.css';

export const Buscador = async () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'buscador-contenedor';

    // Mostramos un mensaje temporal mientras el servidor responde
    contenedorPrincipal.innerHTML = '<h3>Cargando documentos... ⏳</h3>';

    // 1. Pedir los datos al backend con await
    let documentos = await api.obtenerDocumentos();

    // Limpiamos el mensaje de carga
    contenedorPrincipal.innerHTML = ''; 

    // ======== LADO IZQUIERDO: FILTROS ========
    const panelFiltros = document.createElement('div');
    panelFiltros.className = 'buscador-panel-filtros';

    const tituloFiltros = document.createElement('h3');
    tituloFiltros.innerText = 'Filtros de Búsqueda';
    tituloFiltros.style.marginBottom = '15px';

    const inputBusqueda = document.createElement('input');
    inputBusqueda.type = 'text';
    inputBusqueda.placeholder = 'Buscar por título o etiqueta...';
    inputBusqueda.className = 'buscador-input';

    const selectCategoria = document.createElement('select');
    selectCategoria.className = 'buscador-input';
    
    const categorias = ['Todas', 'Produccion', 'Clases/Reuniones', 'Activos/Mantenimiento'];
    categorias.forEach(cat => {
        const op = document.createElement('option');
        op.value = cat;
        op.innerText = cat;
        selectCategoria.append(op);
    });

    panelFiltros.append(tituloFiltros, inputBusqueda, selectCategoria);

    // ======== LADO DERECHO: RESULTADOS ========
    const panelResultados = document.createElement('div');
    panelResultados.className = 'buscador-panel-resultados';

    // Función que recibe un array (lista) y los dibuja en pantalla
    const renderizarTarjetas = (listaDeDatos) => {
        panelResultados.innerHTML = ''; // Borramos lo anterior

        if (listaDeDatos.length === 0) {
            panelResultados.innerHTML = '<p class="buscador-vacio">No se encontraron documentos.</p>';
            return;
        }

        // Recorremos la lista con forEach y usamos nuestro componente
        listaDeDatos.forEach(doc => {
            const tarjeta = TarjetaDocumento(doc); // Llamamos al componente
            panelResultados.append(tarjeta);
        });
    };

    // ======== MOTOR DE BÚSQUEDA (El filter de tus apuntes) ========
    const aplicarFiltros = () => {
        const textoBusqueda = inputBusqueda.value.toLowerCase();
        const categoriaSeleccionada = selectCategoria.value;

        // La magia: filtramos el array completo
        const filtrados = documentos.filter(doc => {
            // ¿Cumple la categoría?
            const pasaCategoria = categoriaSeleccionada === 'Todas' || doc.categoria === categoriaSeleccionada;
            
            // ¿Cumple el texto? (En el título o en alguna etiqueta usando .some())
            const pasaTexto = doc.titulo.toLowerCase().includes(textoBusqueda) || 
                              doc.etiquetas.some(tag => tag.toLowerCase().includes(textoBusqueda));

            // Solo si cumple ambos, se queda en la lista final
            return pasaCategoria && pasaTexto;
        });

        // Dibujamos la nueva lista filtrada
        renderizarTarjetas(filtrados);
    };

    // Escuchamos los eventos de los filtros
    inputBusqueda.addEventListener('keyup', aplicarFiltros);
    selectCategoria.addEventListener('change', aplicarFiltros);

    // Primera vez que carga la página: dibujamos todos los documentos
    renderizarTarjetas(documentos);

    // Unimos los dos paneles
    contenedorPrincipal.append(panelFiltros, panelResultados);
    
    return contenedorPrincipal;
};