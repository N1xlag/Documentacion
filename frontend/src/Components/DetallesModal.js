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
    btnCerrar.innerText = '✕';
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

    // --- MAGIA 1: EL VISOR DE IMÁGENES ---
    const abrirVisor = (rutaImagen) => {
        const fondoOscuro = document.createElement('div');
        fondoOscuro.className = 'visor-pantalla-completa';

        const imgGrande = document.createElement('img');
        imgGrande.src = rutaImagen;
        imgGrande.className = 'visor-imagen';

        fondoOscuro.append(imgGrande);

        // Si hacen clic en cualquier lado del fondo negro, se borra
        fondoOscuro.addEventListener('click', () => {
            fondoOscuro.remove();
        });

        document.body.append(fondoOscuro);
    };

    // --- MAGIA 2: FORZAR DESCARGA INSTANTÁNEA ---
    // Traemos el archivo en "crudo", creamos un link invisible y le damos clic automático
    const forzarDescarga = async (ruta, nombreArchivo, botonHTML) => {
        const textoOriginal = botonHTML.innerText;
        botonHTML.innerText = 'Descargando...';
        
        try {
            const respuesta = await fetch(ruta);
            const blob = await respuesta.blob(); // Convertimos a datos crudos (Blob)
            const urlTemporal = window.URL.createObjectURL(blob);
            
            const linkInvisible = document.createElement('a');
            linkInvisible.href = urlTemporal;
            linkInvisible.download = nombreArchivo; // Este atributo obliga a descargar
            document.body.appendChild(linkInvisible);
            linkInvisible.click(); // Hacemos el clic por código
            
            // Limpiamos la basura invisible
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
            const rutaCompleta = `http://localhost:3001${imgData.ruta}`;
            
            const cajaImg = document.createElement('div');
            cajaImg.className = 'detalles-caja-img';
            cajaImg.style.cursor = 'pointer'; // Manita de clic
            cajaImg.title = 'Haz clic para ampliar la imagen';
            
            const img = document.createElement('img');
            img.src = rutaCompleta;
            
            // Cuando le dan clic a la caja, abrimos el visor
            img.addEventListener('click', () => abrirVisor(rutaCompleta));

            // Botón de descarga
            const btnDescarga = document.createElement('button');
            btnDescarga.className = 'detalles-btn-descarga-img';
            btnDescarga.innerText = `Descargar ${formatearPeso(imgData.pesoBytes)}`;
            
            // Evento para forzar la descarga
            btnDescarga.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que se abra el visor al darle a descargar
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
                const rutaCompleta = `http://localhost:3001${pdfData.ruta}`;
                forzarDescarga(rutaCompleta, pdfData.nombreOriginal, btnDescargaDoc);
            });

            filaDoc.append(iconoNombre, btnDescargaDoc);
            listaDocs.append(filaDoc);
        });
        seccionArchivos.append(tituloDocs, listaDocs);
    }

    cajaModal.append(btnCerrar, encabezado, bloqueContexto, seccionArchivos);
    overlay.append(cajaModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.append(overlay);
};