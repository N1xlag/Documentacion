// src/components/TarjetaDocumento.js

export const TarjetaDocumento = (doc) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-documento';

    const titulo = document.createElement('h3');
    titulo.innerText = doc.titulo;
    titulo.style.margin = '0 0 10px 0';

    const categoria = document.createElement('span');
    categoria.innerText = doc.categoria;
    // Estilo rápido para la etiqueta de categoría
    categoria.style.background = '#224251';
    categoria.style.color = 'white';
    categoria.style.padding = '3px 8px';
    categoria.style.borderRadius = '4px';
    categoria.style.fontSize = '12px';

    const fecha = document.createElement('p');
    fecha.className = 'fecha-texto';
    fecha.innerText = `📅 ${doc.fecha}`;

    tarjeta.append(titulo, categoria, fecha);

    // Detalles dinámicos (si existen)
    if (doc.detalles && Object.keys(doc.detalles).length > 0) {
        const detallesDiv = document.createElement('div');
        detallesDiv.className = 'detalles-caja';
        
        for (const [clave, valor] of Object.entries(doc.detalles)) {
            const p = document.createElement('p');
            p.innerText = `• ${clave}: ${valor}`;
            p.style.margin = '2px 0';
            detallesDiv.append(p);
        }
        tarjeta.append(detallesDiv);
    }

    // Botones de archivos
    const contenedorBotones = document.createElement('div');
    contenedorBotones.className = 'acciones-caja';

    if (doc.archivoPdfImg) {
        const btnArchivo = document.createElement('a');
        btnArchivo.href = `http://localhost:3001${doc.archivoPdfImg}`; 
        btnArchivo.target = '_blank';
        // Estilos del botón de archivo
        btnArchivo.style.background = '#f1a044';
        btnArchivo.style.color = 'white';
        btnArchivo.style.padding = '8px 12px';
        btnArchivo.style.textDecoration = 'none';
        btnArchivo.style.borderRadius = '4px';
        btnArchivo.style.fontSize = '13px';
        btnArchivo.style.fontWeight = 'bold';
        btnArchivo.innerText = '📄 Ver Archivo';
        contenedorBotones.append(btnArchivo);
    }

    if (doc.enlaceVideo) {
        const btnVideo = document.createElement('a');
        const linkCorregido = doc.enlaceVideo.startsWith('http') ? doc.enlaceVideo : `https://${doc.enlaceVideo}`;
        btnVideo.href = linkCorregido;
        btnVideo.target = '_blank';
        // Estilos del botón de video
        btnVideo.style.background = '#bf2422';
        btnVideo.style.color = 'white';
        btnVideo.style.padding = '8px 12px';
        btnVideo.style.textDecoration = 'none';
        btnVideo.style.borderRadius = '4px';
        btnVideo.style.fontSize = '13px';
        btnVideo.style.fontWeight = 'bold';
        btnVideo.innerText = '🎥 Ver Video';
        contenedorBotones.append(btnVideo);
    }

    if(contenedorBotones.hasChildNodes()) {
        tarjeta.append(contenedorBotones);
    }

    return tarjeta;
};