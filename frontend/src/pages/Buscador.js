// src/pages/Buscador.js
import { api } from '../services/api.js';

// Transformamos la función a async
export const Buscador = async () => { 
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.style.display = 'flex';
    contenedorPrincipal.style.gap = '20px';
    contenedorPrincipal.style.marginTop = '20px';

    // Ponemos un mensaje de carga inicial
    contenedorPrincipal.innerHTML = '<h3>Cargando documentos desde el servidor... ⏳</h3>';

    // 1. PEDIR LOS DATOS AL BACKEND REAL
    let documentos = await api.obtenerDocumentos();

    // Limpiamos el mensaje de carga para dibujar la interfaz real
    contenedorPrincipal.innerHTML = '';

    // ======== LADO IZQUIERDO: FILTROS ========
    const panelFiltros = document.createElement('div');
    panelFiltros.style.flex = '1';
    panelFiltros.style.background = '#e0e0e0';
    panelFiltros.style.padding = '20px';
    panelFiltros.style.borderRadius = '8px';
    panelFiltros.style.minWidth = '250px';

    const tituloFiltros = document.createElement('h3');
    tituloFiltros.innerText = 'Filtros de Búsqueda';
    tituloFiltros.style.marginBottom = '15px';

    // Filtro por Texto (Título o Etiquetas)
    const inputBusqueda = document.createElement('input');
    inputBusqueda.type = 'text';
    inputBusqueda.placeholder = 'Buscar por título o etiqueta...';
    inputBusqueda.style.width = '100%';
    inputBusqueda.style.padding = '8px';
    inputBusqueda.style.marginBottom = '15px';

    // Filtro por Categoría
    const selectCategoria = document.createElement('select');
    const categorias = ['Todas', 'Produccion', 'Clases/Reuniones', 'Activos/Mantenimiento'];
    categorias.forEach(cat => {
        const op = document.createElement('option');
        op.value = cat;
        op.innerText = cat;
        selectCategoria.append(op);
    });
    selectCategoria.style.width = '100%';
    selectCategoria.style.padding = '8px';
    selectCategoria.style.marginBottom = '15px';

    panelFiltros.append(tituloFiltros, inputBusqueda, selectCategoria);

    // ======== LADO DERECHO: RESULTADOS ========
    const panelResultados = document.createElement('div');
    panelResultados.style.flex = '3';
    panelResultados.style.display = 'grid';
    panelResultados.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    panelResultados.style.gap = '15px';
    panelResultados.style.alignContent = 'start';

    // Función para dibujar las tarjetas
    const renderizarTarjetas = (datosFiltrados) => {
        panelResultados.innerHTML = ''; 

        if (datosFiltrados.length === 0) {
            panelResultados.innerHTML = '<p style="color: #666; font-style: italic;">No se encontraron documentos.</p>';
            return;
        }

        datosFiltrados.forEach(doc => {
            const tarjeta = document.createElement('div');
            tarjeta.style.background = 'white';
            tarjeta.style.padding = '15px';
            tarjeta.style.borderRadius = '8px';
            tarjeta.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            tarjeta.style.borderLeft = '4px solid #f1a044'; 

            const titulo = document.createElement('h3');
            titulo.innerText = doc.titulo;
            titulo.style.margin = '0 0 10px 0';

            const categoria = document.createElement('span');
            categoria.innerText = doc.categoria;
            categoria.style.background = '#224251';
            categoria.style.color = 'white';
            categoria.style.padding = '3px 8px';
            categoria.style.borderRadius = '4px';
            categoria.style.fontSize = '12px';

            const fecha = document.createElement('p');
            fecha.innerText = `📅 ${doc.fecha}`;
            fecha.style.margin = '10px 0 5px 0';
            fecha.style.fontSize = '14px';
            fecha.style.color = '#555';

            tarjeta.append(titulo, categoria, fecha);

            // Mostrar detalles dinámicos si existen
            if (doc.detalles && Object.keys(doc.detalles).length > 0) {
                const detallesDiv = document.createElement('div');
                detallesDiv.style.background = '#f4f4f4';
                detallesDiv.style.padding = '8px';
                detallesDiv.style.marginTop = '10px';
                detallesDiv.style.borderRadius = '4px';
                detallesDiv.style.fontSize = '13px';

                for (const [clave, valor] of Object.entries(doc.detalles)) {
                    const p = document.createElement('p');
                    p.innerText = `• ${clave}: ${valor}`;
                    p.style.margin = '2px 0';
                    detallesDiv.append(p);
                }
                tarjeta.append(detallesDiv);
            }

            // ======== ¡NUEVO! BOTONES PARA ABRIR ARCHIVOS ========
            const contenedorBotones = document.createElement('div');
            contenedorBotones.style.marginTop = '15px';
            contenedorBotones.style.display = 'flex';
            contenedorBotones.style.gap = '10px';

            // Si hay un archivo subido (PDF/Imagen)
            if (doc.archivoPdfImg) {
                const btnArchivo = document.createElement('a');
                // Apuntamos a la ruta de nuestro servidor backend
                btnArchivo.href = `http://localhost:3001${doc.archivoPdfImg}`; 
                btnArchivo.target = '_blank'; // Abre en nueva pestaña
                btnArchivo.innerText = '📄 Ver Archivo';
                btnArchivo.style.background = '#f1a044'; // Naranja
                btnArchivo.style.color = 'white';
                btnArchivo.style.padding = '8px 12px';
                btnArchivo.style.textDecoration = 'none';
                btnArchivo.style.borderRadius = '4px';
                btnArchivo.style.fontSize = '13px';
                btnArchivo.style.fontWeight = 'bold';
                contenedorBotones.append(btnArchivo);
            }

            // Si hay un enlace de video externo
            if (doc.enlaceVideo) {
                const btnVideo = document.createElement('a');
                // Ojo: Si el usuario no puso http://, se lo agregamos por seguridad
                const linkCorregido = doc.enlaceVideo.startsWith('http') ? doc.enlaceVideo : `https://${doc.enlaceVideo}`;
                btnVideo.href = linkCorregido;
                btnVideo.target = '_blank';
                btnVideo.innerText = '🎥 Ver Video';
                btnVideo.style.background = '#bf2422'; // Rojo
                btnVideo.style.color = 'white';
                btnVideo.style.padding = '8px 12px';
                btnVideo.style.textDecoration = 'none';
                btnVideo.style.borderRadius = '4px';
                btnVideo.style.fontSize = '13px';
                btnVideo.style.fontWeight = 'bold';
                contenedorBotones.append(btnVideo);
            }

            tarjeta.append(contenedorBotones);
            // ======================================================

            panelResultados.append(tarjeta);
        });
    };

    // ======== LÓGICA DE FILTRADO (El motor de búsqueda) ========
    const aplicarFiltros = () => {
        const textoBusqueda = inputBusqueda.value.toLowerCase();
        const categoriaSeleccionada = selectCategoria.value;

        const filtrados = documentos.filter(doc => {
            // 1. Validar Categoría
            const pasaCategoria = categoriaSeleccionada === 'Todas' || doc.categoria === categoriaSeleccionada;
            
            // 2. Validar Texto (Busca en título o en etiquetas)
            const pasaTexto = doc.titulo.toLowerCase().includes(textoBusqueda) || 
                              doc.etiquetas.some(tag => tag.toLowerCase().includes(textoBusqueda));

            return pasaCategoria && pasaTexto;
        });

        renderizarTarjetas(filtrados);
    };

    // Escuchar eventos en los filtros
    inputBusqueda.addEventListener('keyup', aplicarFiltros);
    selectCategoria.addEventListener('change', aplicarFiltros);

    // Dibujar las tarjetas por primera vez
    renderizarTarjetas(documentos);

    contenedorPrincipal.append(panelFiltros, panelResultados);
    return contenedorPrincipal;
};