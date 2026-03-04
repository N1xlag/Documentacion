import './Tarjeta.css';
import { mostrarDetallesModal } from './DetallesModal.js';

export const TarjetaDocumento = (doc) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-doc';

    // 1. Burbuja de Categoría (Verde)
    const burbujaCat = document.createElement('div');
    burbujaCat.className = 'tarjeta-categoria-burbuja';
    burbujaCat.innerText = doc.categoria;

    // 2. Título y Subtítulo
    const titulo = document.createElement('h3');
    titulo.className = 'tarjeta-titulo';
    titulo.innerText = doc.titulo;

    const subtitulo = document.createElement('p');
    subtitulo.className = 'tarjeta-subtitulo';
    subtitulo.innerText = `${doc.fecha} | Gestión: ${doc.gestion || 'N/A'}`;

    // 3. Cajita gris de Detalles (Muestra máximo 3 para no alargar la tarjeta)
    const cajaDetalles = document.createElement('div');
    cajaDetalles.className = 'tarjeta-caja-detalles';
    
    if (doc.detalles && Object.keys(doc.detalles).length > 0) {
        let contador = 0;
        for (const [clave, valor] of Object.entries(doc.detalles)) {
            if (contador < 3 && valor && valor.trim() !== '') {
                const item = document.createElement('div');
                item.className = 'tarjeta-detalle-item';
                item.innerHTML = `<strong>${clave}:</strong> ${valor}`;
                cajaDetalles.append(item);
                contador++;
            }
        }
        // Si no hay detalles escritos, le ponemos un texto genérico
        if (cajaDetalles.innerHTML === '') {
            cajaDetalles.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Sin detalles específicos.</span>';
        }
    } else {
        cajaDetalles.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Sin detalles específicos.</span>';
    }

    // 4. Fila con cantidad de archivos y primera etiqueta
    const pieInfo = document.createElement('div');
    pieInfo.className = 'tarjeta-pie-info';

    const primeraEtiqueta = document.createElement('div');
    if (doc.etiquetas && doc.etiquetas.length > 0) {
        primeraEtiqueta.innerHTML = `<span style="background:#e2e8f0; padding:4px 8px; border-radius:4px;">${doc.etiquetas[0]}</span>`;
    }

    let cantidadArchivos = (doc.archivosAdjuntos ? doc.archivosAdjuntos.length : 0) + (doc.enlaceVideo ? 1 : 0);
    const textoArchivos = document.createElement('div');
    textoArchivos.style.fontWeight = 'bold';
    textoArchivos.innerText = cantidadArchivos === 1 ? '1 archivo' : `${cantidadArchivos} archivos`;

    pieInfo.append(primeraEtiqueta, textoArchivos);

    // 5. Botón Ver Detalles (Gris oscuro ancho)
    const btnDetalles = document.createElement('button');
    btnDetalles.className = 'tarjeta-btn-detalles';
    btnDetalles.innerText = 'Ver Detalles';
    btnDetalles.addEventListener('click', () => {
        mostrarDetallesModal(doc);
    });

    tarjeta.append(burbujaCat, titulo, subtitulo, cajaDetalles, pieInfo, btnDetalles);

    // ======== MODO ADMIN: BOTONES DE EDICIÓN ========
    if (sessionStorage.getItem('isAdmin') === 'true') {
        const cajaAdmin = document.createElement('div');
        cajaAdmin.style.display = 'flex';
        cajaAdmin.style.gap = '10px';
        cajaAdmin.style.marginTop = '15px';

        const btnEditar = document.createElement('button');
        btnEditar.innerText = 'Editar';
        btnEditar.style.flex = '1'; btnEditar.style.padding = '8px'; btnEditar.style.backgroundColor = '#f1a044'; btnEditar.style.color = 'white'; btnEditar.style.border = 'none'; btnEditar.style.borderRadius = '4px'; btnEditar.style.cursor = 'pointer';
        btnEditar.addEventListener('click', () => window.dispatchEvent(new CustomEvent('cambiarRuta', { detail: { ruta: 'editar', datos: doc } })));

        const btnEliminar = document.createElement('button');
        btnEliminar.innerText = 'Eliminar';
        btnEliminar.style.flex = '1'; btnEliminar.style.padding = '8px'; btnEliminar.style.backgroundColor = '#bf2422'; btnEliminar.style.color = 'white'; btnEliminar.style.border = 'none'; btnEliminar.style.borderRadius = '4px'; btnEliminar.style.cursor = 'pointer';
        btnEliminar.addEventListener('click', async () => {
            if (confirm(`¿Eliminar "${doc.titulo}" permanentemente?`)) {
                try {
                    await api.eliminarDocumento(doc.id);
                    tarjeta.remove();
                } catch (e) { alert('Error al eliminar'); }
            }
        });

        cajaAdmin.append(btnEditar, btnEliminar);
        tarjeta.append(cajaAdmin);
    }

    return tarjeta;
};