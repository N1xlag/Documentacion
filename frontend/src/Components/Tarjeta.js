import './Tarjeta.css';
import { mostrarDetallesModal } from './DetallesModal.js';

export const TarjetaDocumento = (doc) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-doc';

    // 1. ENCABEZADO (Badge, Título, Fecha y Gestión)
    const encabezado = document.createElement('div');
    encabezado.className = 'tarjeta-encabezado';

    const badge = document.createElement('span');
    badge.className = 'tarjeta-badge';
    badge.innerText = doc.categoria;
    
    // Le ponemos un color diferente según la categoría
    if (doc.categoria === 'Producción') badge.style.backgroundColor = '#28a745'; // Verde
    else if (doc.categoria === 'Clases / Reuniones') badge.style.backgroundColor = '#17a2b8'; // Azul
    else if (doc.categoria === 'Activos/Inventario') badge.style.backgroundColor = '#fd7e14'; // Naranja
    else if (doc.categoria === 'Administrativo / RRHH') badge.style.backgroundColor = '#6f42c1'; // Morado
    else if (doc.categoria === 'Propio') badge.style.backgroundColor = '#ffc107'; // Amarillo
    else badge.style.backgroundColor = '#6c757d'; // Gris para Otros

    const titulo = document.createElement('h3');
    titulo.className = 'tarjeta-titulo';
    titulo.innerText = doc.titulo;

    const subtitulo = document.createElement('p');
    subtitulo.className = 'tarjeta-subtitulo';
    subtitulo.innerText = `${doc.fecha} | Gestión: ${doc.gestion || 'N/A'}`;

    encabezado.append(badge, titulo, subtitulo);

    // 2. CUERPO DINÁMICO (Solo 2 o 3 datos rápidos)
    const cuerpo = document.createElement('div');
    cuerpo.className = 'tarjeta-cuerpo';

    // Función cortita para crear las líneas de texto del cuerpo
    const crearLinea = (texto) => {
        const p = document.createElement('p');
        p.innerText = `${texto}`;
        return p;
    };

    if (doc.detalles) {
        if (doc.categoria === 'Producción') {
            cuerpo.append(
                crearLinea(`Producto: ${doc.detalles['Producto'] || '-'}`),
                crearLinea(`Cantidad: ${doc.detalles['Cantidad Producida'] || '-'}`),
                crearLinea(`Ref: ${doc.detalles['Grupo'] || '-'}`)
            );
        } else if (doc.categoria === 'Clases / Reuniones') {
            cuerpo.append(
                crearLinea(`Evento: ${doc.detalles['Tipo de Evento'] || '-'}`),
                crearLinea(`Tema: ${doc.detalles['Tema'] || '-'}`),
                crearLinea(`Encargado: ${doc.detalles['Encargado'] || '-'}`)
            );
        } else if (doc.categoria === 'Activos/Inventario') {
            cuerpo.append(
                crearLinea(`Área: ${doc.detalles['Area'] || '-'}`),
                crearLinea(`Resp: ${doc.detalles['Responsable'] || '-'}`)
            );
        } else if (doc.categoria === 'Administrativo / RRHH') {
            cuerpo.append(
                crearLinea(`Documento: ${doc.detalles['Tipo'] || '-'}`),
                crearLinea(`Periodo: ${doc.detalles['Periodo'] || '-'}`)
            );
        } else if (doc.categoria === 'Propio') {
            cuerpo.append(
                crearLinea(`Archivo: ${doc.detalles['Tipo'] || '-'}`),
                crearLinea(`Materia: ${doc.detalles['Área o Materia Vinculada'] || '-'}`)
            );
        }
    }

    const pie = document.createElement('div');
    pie.className = 'tarjeta-pie';

    // Cajita para las etiquetas
    const cajaEtiquetas = document.createElement('div');
    cajaEtiquetas.className = 'tarjeta-etiquetas';
    if (doc.etiquetas && doc.etiquetas.length > 0) {
        doc.etiquetas.forEach(tag => {
            const spanTag = document.createElement('span');
            spanTag.innerText = tag;
            cajaEtiquetas.append(spanTag);
        });
    }

    // --- ¡AQUÍ ESTÁ EL CAMBIO DE LOS ARCHIVOS! ---
    const cajaArchivos = document.createElement('div');
    // Le damos un poco de estilo directo para que se vea como texto secundario
    cajaArchivos.style.fontSize = '12px';
    cajaArchivos.style.fontWeight = 'bold';
    cajaArchivos.style.color = '#6c757d'; 

    // Contamos cuántos archivos hay en total
    let cantidadTotal = 0;
    
    // 1. Sumamos los archivos físicos (PDFs, fotos) si es que existe el array
    if (doc.archivosAdjuntos && doc.archivosAdjuntos.length > 0) {
        cantidadTotal = cantidadTotal + doc.archivosAdjuntos.length; // El .length nos dice cuántos hay
    }
    
    // 2. Sumamos 1 más si es que dejaron un link de video
    if (doc.enlaceVideo && doc.enlaceVideo !== '') {
        cantidadTotal = cantidadTotal + 1;
    }

    // 3. Escribimos el texto dinámico según la cantidad
    if (cantidadTotal === 0) {
        cajaArchivos.innerText = 'Sin archivos';
    } else if (cantidadTotal === 1) {
        cajaArchivos.innerText = '1 archivo';
    } else {
        cajaArchivos.innerText = `${cantidadTotal} archivos`;
    }
    // ----------------------------------------------

    // Botón de Ver Detalles
    const btnDetalles = document.createElement('button');
    btnDetalles.className = 'tarjeta-btn-detalles';
    btnDetalles.innerText = 'Ver Detalles';
    btnDetalles.addEventListener('click', () => {
        mostrarDetallesModal(doc); // Abre nuestro modal gigante
    });

    // ======== MODO ADMIN: BOTONES DE EDICIÓN ========
    const esAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (esAdmin) {
        const cajaAdmin = document.createElement('div');
        cajaAdmin.style.display = 'flex';
        cajaAdmin.style.gap = '10px';
        cajaAdmin.style.marginTop = '15px';
        cajaAdmin.style.paddingTop = '15px';
        cajaAdmin.style.borderTop = '1px dashed #ccc'; // Línea separadora

        // Botón Editar
        const btnEditar = document.createElement('button');
        btnEditar.innerText = '✏️ Editar';
        btnEditar.style.flex = '1';
        btnEditar.style.padding = '8px';
        btnEditar.style.backgroundColor = '#f1a044'; // Naranja
        btnEditar.style.color = 'white';
        btnEditar.style.border = 'none';
        btnEditar.style.borderRadius = '4px';
        btnEditar.style.cursor = 'pointer';

        btnEditar.addEventListener('click', () => {
            // En vez de un alert, usamos el "Walkie-Talkie" del navegador para gritarle a App.js
            // que cambie a la pantalla 'editar' y le pasamos los datos del documento actual.
            window.dispatchEvent(new CustomEvent('cambiarRuta', { 
                detail: { ruta: 'editar', datos: doc } 
            }));
        });

        // Botón Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.innerText = '🗑️ Eliminar';
        btnEliminar.style.flex = '1';
        btnEliminar.style.padding = '8px';
        btnEliminar.style.backgroundColor = '#bf2422'; // Rojo
        btnEliminar.style.color = 'white';
        btnEliminar.style.border = 'none';
        btnEliminar.style.borderRadius = '4px';
        btnEliminar.style.cursor = 'pointer';

        btnEliminar.addEventListener('click', () => {
            const seguro = confirm(`⚠️ ¿Estás COMPLETAMENTE SEGURO de eliminar "${doc.titulo}"?\nEsta acción no se puede deshacer.`);
            if (seguro) {
                // Aquí luego conectaremos api.eliminarDocumento(doc.id)
                alert('¡BAM! Documento eliminado del servidor.');
                tarjeta.remove(); // Desaparecemos la tarjeta de la pantalla instantáneamente
            }
        });

        cajaAdmin.append(btnEditar, btnEliminar);
        tarjeta.append(cajaAdmin); // Lo agregamos al final de la tarjeta
    }

    // Juntamos las etiquetas y nuestro nuevo texto de archivos en el pie
    pie.append(cajaEtiquetas, cajaArchivos);
    
    // Armamos la tarjeta final
    tarjeta.append(encabezado, cuerpo, pie, btnDetalles);

    return tarjeta;
};