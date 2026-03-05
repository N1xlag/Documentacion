import './DetallesModal.css';

export const mostrarDetallesModal = (doc) => {
    const modalPrevio = document.getElementById('modal-detalles');
    if (modalPrevio) modalPrevio.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-detalles';
    overlay.className = 'detalles-overlay';

    const cajaModal = document.createElement('div');
    cajaModal.className = 'detalles-caja';

    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'detalles-btn-cerrar';
    btnCerrar.innerText = ' X ';
    btnCerrar.addEventListener('click', () => overlay.remove());

    // ======== 1. ENCABEZADO ========
    const encabezado = document.createElement('div');
    encabezado.className = 'detalles-encabezado';
    const titulo = document.createElement('h1');
    titulo.innerText = doc.titulo;
    const infoBase = document.createElement('p');
    infoBase.className = 'detalles-info-base';
    infoBase.innerText = `${doc.fecha} | Gestión: ${doc.gestion || 'N/A'} | Categoría: ${doc.categoria}`;

    const cajaEtiquetas = document.createElement('div');
    cajaEtiquetas.className = 'detalles-etiquetas';
    if (doc.etiquetas) {
        doc.etiquetas.forEach(tag => {
            const span = document.createElement('span'); span.innerText = tag; cajaEtiquetas.append(span);
        });
    }

    const descripcion = document.createElement('p');
    descripcion.className = 'detalles-descripcion';
    descripcion.innerText = doc.descripcion ? `${doc.descripcion}` : 'Sin descripción.';

    encabezado.append(titulo, infoBase, cajaEtiquetas, descripcion);

    // ======== 2. BLOQUE DE CONTEXTO ========
    const bloqueContexto = document.createElement('div');
    bloqueContexto.className = 'detalles-contexto';
    
    if (doc.detalles && Object.keys(doc.detalles).length > 0) {
        const tituloContexto = document.createElement('h3'); tituloContexto.innerText = 'Información Detallada';
        const cuadricula = document.createElement('div'); cuadricula.className = 'detalles-cuadricula';

        for (const [clave, valor] of Object.entries(doc.detalles)) {
            const item = document.createElement('div'); item.className = 'detalles-item';
            const label = document.createElement('strong'); label.innerText = `${clave}: `;
            const texto = document.createElement('span'); texto.innerText = valor || 'N/A';
            item.append(label, texto); cuadricula.append(item);
        }
        bloqueContexto.append(tituloContexto, cuadricula);
    }

    // ======== 3. SECCIÓN DE ARCHIVOS (MÚLTIPLES) ========
    const seccionArchivos = document.createElement('div');
    seccionArchivos.className = 'detalles-archivos';

    const formatearPeso = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1048576) return `(${(bytes / 1024).toFixed(1)} KB)`; 
        return `(${(bytes / 1048576).toFixed(1)} MB)`; 
    };

    const abrirVisor = (rutaImagen) => {
        const fondoOscuro = document.createElement('div');
        fondoOscuro.className = 'visor-pantalla-completa';

        const imgGrande = document.createElement('img');
        imgGrande.src = rutaImagen;
        imgGrande.className = 'visor-imagen';

        fondoOscuro.append(imgGrande);
        fondoOscuro.addEventListener('click', () => fondoOscuro.remove());
        document.body.append(fondoOscuro);
    };

    const forzarDescarga = async (ruta, nombreArchivo, botonHTML) => {
        const textoOriginal = botonHTML.innerText;
        botonHTML.innerText = 'Descargando...';
        
        try {
            const respuesta = await fetch(ruta);
            const blob = await respuesta.blob(); 
            const urlTemporal = window.URL.createObjectURL(blob);
            
            const linkInvisible = document.createElement('a');
            linkInvisible.href = urlTemporal;
            linkInvisible.download = nombreArchivo; 
            document.body.appendChild(linkInvisible);
            linkInvisible.click(); 
            
            linkInvisible.remove();
            window.URL.revokeObjectURL(urlTemporal);
        } catch (error) {
            console.error('Error al descargar:', error);
            alert('Hubo un error al intentar descargar el archivo.');
        } finally {
            botonHTML.innerText = textoOriginal;
        }
    };

    const archivos = doc.archivosAdjuntos || [];
    const listaImagenes = archivos.filter(a => a.tipo === 'imagen');
    const listaPdfs = archivos.filter(a => a.tipo === 'pdf');

    // -- GALERÍA VISUAL --
    if (listaImagenes.length > 0) {
        const tituloGaleria = document.createElement('h3'); 
        tituloGaleria.innerText = 'Multimedia Visual';
        const galeria = document.createElement('div'); 
        galeria.className = 'detalles-galeria';

        listaImagenes.forEach(imgData => {
            // CORRECCIÓN: Usamos window.location.hostname para que funcione en el celular
            const rutaCompleta = `http://${window.location.hostname}:3001${imgData.ruta}`;
            
            const cajaImg = document.createElement('div');
            cajaImg.className = 'detalles-caja-img';
            cajaImg.style.cursor = 'pointer'; 
            cajaImg.title = 'Haz clic para ampliar la imagen';
            
            const img = document.createElement('img');
            img.src = rutaCompleta;
            
            img.addEventListener('click', () => abrirVisor(rutaCompleta));

            const btnDescarga = document.createElement('button');
            btnDescarga.className = 'detalles-btn-descarga-img';
            btnDescarga.innerText = `Descargar ${formatearPeso(imgData.pesoBytes)}`;
            
            btnDescarga.addEventListener('click', (e) => {
                e.stopPropagation(); 
                forzarDescarga(rutaCompleta, imgData.nombreOriginal, btnDescarga);
            });

            cajaImg.append(img, btnDescarga);
            galeria.append(cajaImg);
        });
        seccionArchivos.append(tituloGaleria, galeria);
    }

    // -- LISTA DE PDFs --
    if (listaPdfs.length > 0) {
        const tituloDocs = document.createElement('h3'); 
        tituloDocs.innerText = 'Documentos Adjuntos';
        const listaDocs = document.createElement('div'); 
        listaDocs.className = 'detalles-lista-docs';

        listaPdfs.forEach(pdfData => {
            const filaDoc = document.createElement('div');
            filaDoc.className = 'detalles-fila-doc';
            
            const iconoNombre = document.createElement('div');
            iconoNombre.innerText = `${pdfData.nombreOriginal} ${formatearPeso(pdfData.pesoBytes)}`;

            const btnDescargaDoc = document.createElement('button');
            btnDescargaDoc.className = 'detalles-btn-descarga-doc';
            btnDescargaDoc.innerText = 'Descargar';

            btnDescargaDoc.addEventListener('click', () => {
                // CORRECCIÓN: Usamos window.location.hostname para que funcione en el celular
                const rutaCompleta = `http://${window.location.hostname}:3001${pdfData.ruta}`;
                forzarDescarga(rutaCompleta, pdfData.nombreOriginal, btnDescargaDoc);
            });

            filaDoc.append(iconoNombre, btnDescargaDoc);
            listaDocs.append(filaDoc);
        });
        seccionArchivos.append(tituloDocs, listaDocs);
    }

    // ======== 4. EL BOTÓN DEL VIDEO ========
    if (doc.enlaceVideo && doc.enlaceVideo.trim() !== '') {
        const tituloVideo = document.createElement('h3'); 
        tituloVideo.innerText = 'Video';
        
        // Usamos tu caja gris, pero centramos el contenido
        const filaVideo = document.createElement('div');
        filaVideo.className = 'detalles-fila-doc'; 
        filaVideo.style.justifyContent = 'center'; // Esto centra el botón
        
        // Creamos el botón directo
        const btnAbrirVideo = document.createElement('a');
        btnAbrirVideo.className = 'detalles-btn-descarga-doc'; 
        btnAbrirVideo.innerText = 'Ver Video';
        btnAbrirVideo.target = '_blank'; 
        btnAbrirVideo.style.textDecoration = 'none';
        // Lo hacemos un poco más ancho y vistoso
        btnAbrirVideo.style.padding = '10px 40px';
        btnAbrirVideo.style.fontSize = '15px';
        btnAbrirVideo.style.letterSpacing = '1px';
        
        let urlFinal = doc.enlaceVideo;
        if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
            urlFinal = 'https://' + urlFinal;
        }
        btnAbrirVideo.href = urlFinal;

        filaVideo.append(btnAbrirVideo);
        seccionArchivos.append(tituloVideo, filaVideo);
    }

    cajaModal.append(btnCerrar, encabezado, bloqueContexto, seccionArchivos);
    overlay.append(cajaModal);
    document.body.append(overlay);
};