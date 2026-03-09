import './DetallesModal.css';


const formatearPeso = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1048576) return `(${(bytes / 1024).toFixed(1)} KB)`;
    return `(${(bytes / 1048576).toFixed(1)} MB)`;
};

const obtenerIconoPorTipo = (tipo) => {
    const iconos = {
        'pdf': '',
        'word': '',
        'excel': '',
        'powerpoint': '',
        'texto': '',
        'comprimido': ''
    };
    return iconos[tipo] || '';
};

const construirURLCompleta = (ruta) => {
    return `http://${window.location.hostname}:3001${ruta}`;
};

const normalizarURLVideo = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
};


const abrirVisorImagen = (rutaImagen) => {
    const fondoOscuro = document.createElement('div');
    fondoOscuro.className = 'visor-pantalla-completa';

    const imgGrande = document.createElement('img');
    imgGrande.src = rutaImagen;
    imgGrande.className = 'visor-imagen';

    fondoOscuro.append(imgGrande);
    fondoOscuro.addEventListener('click', () => fondoOscuro.remove());
    document.body.append(fondoOscuro);
};

const descargarArchivo = async (ruta, nombreArchivo, botonHTML) => {
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


const crearBotonCerrar = (overlay) => {
    const btn = document.createElement('button');
    btn.className = 'detalles-btn-cerrar';
    btn.innerText = ' X ';
    btn.addEventListener('click', () => overlay.remove());
    return btn;
};

const crearTitulo = (texto) => {
    const titulo = document.createElement('h1');
    titulo.innerText = texto;
    return titulo;
};

const crearInfoBase = (fecha, gestion, categoria) => {
    const info = document.createElement('p');
    info.className = 'detalles-info-base';
    info.innerText = `${fecha} | Gestión: ${gestion || 'N/A'} | Categoría: ${categoria}`;
    return info;
};

const crearCajaEtiquetas = (etiquetas) => {
    const caja = document.createElement('div');
    caja.className = 'detalles-etiquetas';
    
    if (etiquetas) {
        etiquetas.forEach(tag => {
            const span = document.createElement('span');
            span.innerText = tag;
            caja.append(span);
        });
    }
    
    return caja;
};

const crearDescripcion = (texto) => {
    const descripcion = document.createElement('p');
    descripcion.className = 'detalles-descripcion';
    descripcion.innerText = texto ? `${texto}` : 'Sin descripción.';
    return descripcion;
};

const crearEncabezado = (doc) => {
    const encabezado = document.createElement('div');
    encabezado.className = 'detalles-encabezado';
    
    const titulo = crearTitulo(doc.titulo);
    const infoBase = crearInfoBase(doc.fecha, doc.gestion, doc.categoria);
    const cajaEtiquetas = crearCajaEtiquetas(doc.etiquetas);
    const descripcion = crearDescripcion(doc.descripcion);
    
    encabezado.append(titulo, infoBase, cajaEtiquetas, descripcion);
    return encabezado;
};


const crearBloqueContexto = (detalles) => {
    const bloque = document.createElement('div');
    bloque.className = 'detalles-contexto';
    
    if (!detalles || Object.keys(detalles).length === 0) {
        return bloque;
    }
    
    const tituloContexto = document.createElement('h3');
    tituloContexto.innerText = 'Información Detallada';
    
    const cuadricula = document.createElement('div');
    cuadricula.className = 'detalles-cuadricula';

    for (const [clave, valor] of Object.entries(detalles)) {
        const item = document.createElement('div');
        item.className = 'detalles-item';
        
        const label = document.createElement('strong');
        label.innerText = `${clave}: `;
        
        const texto = document.createElement('span');
        texto.innerText = valor || 'N/A';
        
        item.append(label, texto);
        cuadricula.append(item);
    }
    
    bloque.append(tituloContexto, cuadricula);
    return bloque;
};


const crearCajaImagen = (imgData) => {
    const rutaCompleta = construirURLCompleta(imgData.ruta);
    
    const cajaImg = document.createElement('div');
    cajaImg.className = 'detalles-caja-img';
    cajaImg.style.cursor = 'pointer';
    cajaImg.title = 'Haz clic para ampliar la imagen';
    
    const img = document.createElement('img');
    img.src = rutaCompleta;
    img.addEventListener('click', () => abrirVisorImagen(rutaCompleta));

    const btnDescarga = document.createElement('button');
    btnDescarga.className = 'detalles-btn-descarga-img';
    btnDescarga.innerText = `Descargar ${formatearPeso(imgData.pesoBytes)}`;
    btnDescarga.addEventListener('click', (e) => {
        e.stopPropagation();
        descargarArchivo(rutaCompleta, imgData.nombreOriginal, btnDescarga);
    });

    cajaImg.append(img, btnDescarga);
    return cajaImg;
};

const crearGaleriaImagenes = (listaImagenes) => {
    const contenedor = document.createElement('div');
    
    if (listaImagenes.length === 0) return contenedor;
    
    const titulo = document.createElement('h3');
    titulo.innerText = 'Multimedia Visual';
    
    const galeria = document.createElement('div');
    galeria.className = 'detalles-galeria';

    listaImagenes.forEach(imgData => {
        const cajaImg = crearCajaImagen(imgData);
        galeria.append(cajaImg);
    });
    
    contenedor.append(titulo, galeria);
    return contenedor;
};


const crearFilaDocumento = (docData) => {
    const fila = document.createElement('div');
    fila.className = 'detalles-fila-doc';
    
    const icono = obtenerIconoPorTipo(docData.tipo);
    
    const iconoNombre = document.createElement('div');
    iconoNombre.innerHTML = `<strong>${icono}</strong> ${docData.nombreOriginal} <span style="color:#64748b; font-size:12px;">${formatearPeso(docData.pesoBytes)}</span>`;

    const btnDescarga = document.createElement('button');
    btnDescarga.className = 'detalles-btn-descarga-doc';
    btnDescarga.innerText = 'Descargar';
    btnDescarga.addEventListener('click', () => {
        const rutaCompleta = construirURLCompleta(docData.ruta);
        descargarArchivo(rutaCompleta, docData.nombreOriginal, btnDescarga);
    });

    fila.append(iconoNombre, btnDescarga);
    return fila;
};

const crearListaDocumentos = (listaDocumentos) => {
    const contenedor = document.createElement('div');
    
    if (listaDocumentos.length === 0) return contenedor;
    
    const titulo = document.createElement('h3');
    titulo.innerText = 'Documentos Adjuntos';
    
    const lista = document.createElement('div');
    lista.className = 'detalles-lista-docs';

    listaDocumentos.forEach(docData => {
        const fila = crearFilaDocumento(docData);
        lista.append(fila);
    });
    
    contenedor.append(titulo, lista);
    return contenedor;
};



const crearSeccionVideo = (enlaceVideo) => {
    const contenedor = document.createElement('div');
    
    if (!enlaceVideo || enlaceVideo.trim() === '') return contenedor;
    
    const titulo = document.createElement('h3');
    titulo.innerText = 'Video';
    
    const fila = document.createElement('div');
    fila.className = 'detalles-fila-doc';
    fila.style.justifyContent = 'center';
    
    const btnAbrirVideo = document.createElement('a');
    btnAbrirVideo.className = 'detalles-btn-descarga-doc';
    btnAbrirVideo.innerText = 'Ver Video';
    btnAbrirVideo.target = '_blank';
    btnAbrirVideo.style.textDecoration = 'none';
    btnAbrirVideo.style.padding = '10px 40px';
    btnAbrirVideo.style.fontSize = '15px';
    btnAbrirVideo.style.letterSpacing = '1px';
    btnAbrirVideo.href = normalizarURLVideo(enlaceVideo);

    fila.append(btnAbrirVideo);
    contenedor.append(titulo, fila);
    return contenedor;
};


const crearSeccionArchivos = (doc) => {
    const seccion = document.createElement('div');
    seccion.className = 'detalles-archivos';
    
    const archivos = doc.archivosAdjuntos || [];
    const listaImagenes = archivos.filter(a => a.tipo === 'imagen');
    const listaDocumentos = archivos.filter(a => a.tipo !== 'imagen');
    
    const galeriaImagenes = crearGaleriaImagenes(listaImagenes);
    const listaDocsElemento = crearListaDocumentos(listaDocumentos);
    const seccionVideo = crearSeccionVideo(doc.enlaceVideo);
    
    seccion.append(galeriaImagenes, listaDocsElemento, seccionVideo);
    return seccion;
};

export const mostrarDetallesModal = (doc) => {
    const modalPrevio = document.getElementById('modal-detalles');
    if (modalPrevio) modalPrevio.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-detalles';
    overlay.className = 'detalles-overlay';

    const cajaModal = document.createElement('div');
    cajaModal.className = 'detalles-caja';

    const btnCerrar = crearBotonCerrar(overlay);
    const encabezado = crearEncabezado(doc);
    const bloqueContexto = crearBloqueContexto(doc.detalles);
    const seccionArchivos = crearSeccionArchivos(doc);

    cajaModal.append(btnCerrar, encabezado, bloqueContexto, seccionArchivos);
    overlay.append(cajaModal);
    document.body.append(overlay);
};