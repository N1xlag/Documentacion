import { InputGenerico } from '../../components/Input.js';
import { mostrarPopup } from '../../components/Popup.js';
import { api } from '../../services/api.js';
import './CargarDoc.css';

const CATEGORIAS = [
    'Seleccione una...',
    'Producción',
    'Clases / Reuniones',
    'Activos / Inventario',
    'Administrativo / RRHH',
    'Propio',
    'Otros'
];

const TIPOS_ARCHIVO = {
    PDF: { icono: '', tipo: 'pdf', extensiones: ['.pdf'] },
    IMAGEN: { icono: '', tipo: 'imagen', extensiones: ['.jpg', '.jpeg', '.png'] },
    WORD: { icono: '', tipo: 'word', extensiones: ['.doc', '.docx'] },
    EXCEL: { icono: '', tipo: 'excel', extensiones: ['.xls', '.xlsx', '.csv'] },
    POWERPOINT: { icono: '', tipo: 'powerpoint', extensiones: ['.ppt', '.pptx'] },
    COMPRIMIDO: { icono: '', tipo: 'comprimido', extensiones: ['.zip', '.rar'] },
    TEXTO: { icono: '', tipo: 'texto', extensiones: ['.txt'] },
    OTRO: { icono: '', tipo: 'otro', extensiones: [] }
};


const obtenerFechaHoy = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}-${mes}-${año}`;
};

const calcularGestionAcademica = (fecha) => {
    const partes = fecha.split('-');
    
    if (partes.length !== 3) return '';
    
    const año = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const dia = parseInt(partes[2]);
    
    if (mes === 1 || (mes === 2 && dia <= 15)) {
        return `3-${año - 1}`;
    } else if ((mes === 2 && dia > 15) || (mes >= 3 && mes <= 6) || (mes === 7 && dia <= 10)) {
        return `1-${año}`;
    } else if ((mes === 7 && dia > 10) || (mes === 8 && dia <= 10)) {
        return `4-${año}`;
    } else {
        return `2-${año}`;
    }
};

const obtenerInfoArchivo = (nombreArchivo) => {
    const nombreMin = nombreArchivo.toLowerCase();
    
    for (const [, info] of Object.entries(TIPOS_ARCHIVO)) {
        if (info.extensiones.some(ext => nombreMin.endsWith(ext))) {
            return { icono: info.icono, tipo: info.tipo };
        }
    }
    
    return { icono: TIPOS_ARCHIVO.OTRO.icono, tipo: TIPOS_ARCHIVO.OTRO.tipo };
};



const crearCamposProduccion = () => {
    return [
        InputGenerico('Ciclo', 'Ej: Primer Ciclo').contenedor,
        InputGenerico('Producto', 'Ej: Macetas Biodegradables').contenedor,
        InputGenerico('Cantidad Producida', 'Ej: 50', 'number').contenedor,
        InputGenerico('Grupo', 'Ej: Grupo 3').contenedor,
        InputGenerico('Materia', 'Ej: Topicos Selectos').contenedor,
        InputGenerico('Observaciones', 'Ej: Les sobro mucho material').contenedor
    ];
};

const crearCamposClases = () => {
    return [
        InputGenerico('Evento', '', 'select', ['Seleccione una...','Clase teórica', 'Clase práctica', 'Reunión', 'Conferencia', 'Otro']).contenedor,
        InputGenerico('Tema', 'Ej: Modelo de Asignacion').contenedor,
        InputGenerico('Encargado', 'Ej: Ing. Miguel').contenedor,
        InputGenerico('Area o Materia', 'Investigacion Operativa 2').contenedor,
        InputGenerico('Cantidad de Asistentes', 'Ej: 25', 'number').contenedor
    ];
};

const crearCamposActivos = () => {
    return [
        InputGenerico('Area', 'Ej: Area B').contenedor,
        InputGenerico('Responsable', 'Nombre del encargado').contenedor
    ];
};

const crearCamposAdministrativo = () => {
    return [
        InputGenerico('Tipo', '', 'select', ['Registro de Asistencia', 'Horarios', 'Permisos', 'Reporte de Incidente', 'Otros']).contenedor,
        InputGenerico('Periodo', 'Ej: 3ra Semana de Marzo').contenedor,
        InputGenerico('Responsable', 'Quien lo aprueba').contenedor
    ];
};

const crearCamposPropio = () => {
    return [
        InputGenerico('Tipo', '', 'select', ['Investigación', 'Proyecto', 'Guia', 'Artículo', 'Manual']).contenedor,
        InputGenerico('Autor(es)', 'Quién(es) lo desarrolló').contenedor,
        InputGenerico('Área o Materia Vinculada', 'Ej: IO2').contenedor
    ];
};



const crearItemArchivo = (archivo, index, archivosLista, actualizarCallback) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = 'var(--spacing-sm) var(--spacing-md)';
    item.style.backgroundColor = 'var(--bg-secundario)';
    item.style.border = '1px solid var(--border-color)';
    item.style.borderRadius = 'var(--border-radius-md)';
    item.style.marginBottom = 'var(--spacing-sm)';
    
    const infoArchivo = obtenerInfoArchivo(archivo.name);
    
    const nombreArchivo = document.createElement('span');
    nombreArchivo.innerText = `${infoArchivo.icono} ${archivo.name}`;
    nombreArchivo.style.fontSize = 'var(--font-size-sm)';
    nombreArchivo.style.color = 'var(--text-principal)';
    nombreArchivo.style.overflow = 'hidden';
    nombreArchivo.style.textOverflow = 'ellipsis';
    nombreArchivo.style.whiteSpace = 'nowrap';

    const btnEliminar = document.createElement('span');
    btnEliminar.innerText = '✕';
    btnEliminar.style.color = 'var(--color-error)';
    btnEliminar.style.cursor = 'pointer';
    btnEliminar.style.fontWeight = 'bold';
    
    btnEliminar.addEventListener('click', () => {
        archivosLista.splice(index, 1);
        actualizarCallback();
    });

    item.append(nombreArchivo, btnEliminar);
    return item;
};

const crearLadoArchivos = (archivosLista, contenedorLista, inputArchivo, inputVideo) => {
    const ladoIzq = document.createElement('div');
    ladoIzq.className = 'card';
    ladoIzq.style.flex = '1';
    ladoIzq.style.minWidth = '300px';
    ladoIzq.style.padding = 'var(--spacing-lg)';

    const titulo = document.createElement('h3');
    titulo.innerText = 'Subir Archivo';
    titulo.style.color = 'var(--color-tercero)';
    titulo.style.borderBottom = '2px solid var(--border-color)';
    titulo.style.paddingBottom = 'var(--spacing-sm)';
    titulo.style.marginBottom = 'var(--spacing-md)';

    const textoO = document.createElement('p');
    textoO.innerText = '— Y/O —';
    textoO.style.textAlign = 'center';
    textoO.style.color = 'var(--text-disabled)';
    textoO.style.margin = 'var(--spacing-md) 0';

    ladoIzq.append(titulo, inputArchivo, contenedorLista, textoO, inputVideo);
    return ladoIzq;
};

const crearInputArchivo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf, .jpg, .png, .jpeg, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .zip, .rar';
    input.className = 'input';
    input.multiple = true;
    input.style.width = '100%';
    input.style.marginBottom = 'var(--spacing-md)';
    return input;
};

const crearInputVideo = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enlace de video (Opcional)...';
    input.className = 'input';
    input.style.width = '100%';
    return input;
};

const crearContenedorDinamico = () => {
    const contenedor = document.createElement('div');
    contenedor.style.display = 'none';
    contenedor.style.padding = 'var(--spacing-md)';
    contenedor.style.backgroundColor = 'var(--bg-secundario)';
    contenedor.style.borderRadius = 'var(--border-radius-md)';
    contenedor.style.marginTop = 'var(--spacing-md)';
    return contenedor;
};

const crearBotonGuardar = () => {
    const btn = document.createElement('button');
    btn.innerText = 'GUARDAR REGISTRO';
    btn.className = 'btn btn-primary';
    btn.style.width = '100%';
    btn.style.marginTop = 'var(--spacing-xl)';
    btn.style.fontSize = 'var(--font-size-md)';
    btn.style.padding = 'var(--spacing-md)';
    return btn;
};


const manejarCambioCategoria = (categoria, contenedorDinamico) => {
    contenedorDinamico.innerHTML = '';
    
    if (categoria === 'Seleccione una...' || categoria === 'Otros') {
        contenedorDinamico.style.display = 'none';
        return;
    }
    
    contenedorDinamico.style.display = 'block';

    if (categoria === 'Producción') {
        contenedorDinamico.append(...crearCamposProduccion());
    } else if (categoria === 'Clases / Reuniones') {
        contenedorDinamico.append(...crearCamposClases());
    } else if (categoria === 'Activos / Inventario') {
        contenedorDinamico.append(...crearCamposActivos());
    } else if (categoria === 'Administrativo / RRHH') {
        contenedorDinamico.append(...crearCamposAdministrativo());
    } else if (categoria === 'Propio') {
        contenedorDinamico.append(...crearCamposPropio());
    }
};

const actualizarGestion = (campoFecha, campoGestion) => {
    const gestion = calcularGestionAcademica(campoFecha.input.value);
    campoGestion.input.value = gestion;
};

const validarFormulario = (titulo, categoria) => {
    if (titulo === '' || categoria === 'Seleccione una...') {
        mostrarPopup('warning', 'Por favor, rellena el título y elige una categoría.');
        return false;
    }
    return true;
};

const recopilarDetallesDinamicos = (contenedorDinamico) => {
    const detalles = {};
    contenedorDinamico.querySelectorAll('.form-input').forEach(input => {
        detalles[input.dataset.nombre] = input.value;
    });
    return detalles;
};

const subirArchivos = async (archivosLista) => {
    const archivosSubidos = [];
    
    for (const archivo of archivosLista) {
        const rutaServidor = await api.subirArchivoFisico(archivo);
        const infoArchivo = obtenerInfoArchivo(archivo.name);
        
        archivosSubidos.push({
            ruta: rutaServidor,
            nombreOriginal: archivo.name,
            pesoBytes: archivo.size,
            tipo: infoArchivo.tipo
        });
    }
    
    return archivosSubidos;
};

const limpiarFormulario = (campos, archivosLista, actualizarListaCallback, inputVideo, contenedorDinamico) => {
    campos.titulo.input.value = '';
    campos.descripcion.input.value = '';
    campos.etiquetas.input.value = '';
    inputVideo.value = '';
    archivosLista.length = 0;
    actualizarListaCallback();
    campos.categoria.input.value = 'Seleccione una...';
    contenedorDinamico.innerHTML = '';
    contenedorDinamico.style.display = 'none';
};

const guardarDocumento = async (campos, archivosLista, inputVideo, contenedorDinamico, btnGuardar, actualizarListaCallback) => {
    const titulo = campos.titulo.input.value;
    const categoria = campos.categoria.input.value;

    if (!validarFormulario(titulo, categoria)) return;

    btnGuardar.innerText = 'Subiendo archivos...';
    btnGuardar.disabled = true;

    try {
        const archivosSubidos = archivosLista.length > 0 ? await subirArchivos(archivosLista) : [];

        const detalles = recopilarDetallesDinamicos(contenedorDinamico);

        const nuevoRegistro = {
            titulo: titulo,
            descripcion: campos.descripcion.input.value,
            fecha: campos.fecha.input.value,
            gestion: campos.gestion.input.value,
            categoria: categoria,
            archivosAdjuntos: archivosSubidos,
            enlaceVideo: inputVideo.value || null,
            etiquetas: campos.etiquetas.input.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== ''),
            detalles: detalles
        };

        await api.guardarDocumento(nuevoRegistro);
        
        mostrarPopup('success', 'Documento guardado exitosamente');
        limpiarFormulario(campos, archivosLista, actualizarListaCallback, inputVideo, contenedorDinamico);

    } catch (error) {
        mostrarPopup('error', 'Error de conexión. Cancelando subida...');
        console.error(error);
    } finally {
        btnGuardar.innerText = 'GUARDAR REGISTRO';
        btnGuardar.disabled = false;
    }
};


export const CargarDoc = () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.style.display = 'flex';
    contenedorPrincipal.style.flexWrap = 'wrap';
    contenedorPrincipal.style.gap = 'var(--spacing-lg)';
    contenedorPrincipal.style.padding = 'var(--spacing-xl)';
    contenedorPrincipal.style.maxWidth = '1300px';
    contenedorPrincipal.style.margin = '0 auto';
    contenedorPrincipal.style.alignItems = 'flex-start';

    const archivosParaSubir = [];

    const inputArchivo = crearInputArchivo();
    const inputVideo = crearInputVideo();
    const contenedorListaArchivos = document.createElement('div');

    const actualizarListaVisual = () => {
        contenedorListaArchivos.innerHTML = '';
        archivosParaSubir.forEach((archivo, index) => {
            const item = crearItemArchivo(archivo, index, archivosParaSubir, actualizarListaVisual);
            contenedorListaArchivos.append(item);
        });
    };

    inputArchivo.addEventListener('change', (e) => {
        const nuevosArchivos = Array.from(e.target.files);
        nuevosArchivos.forEach(archivo => archivosParaSubir.push(archivo));
        actualizarListaVisual();
        inputArchivo.value = '';
    });

    const ladoIzq = crearLadoArchivos(archivosParaSubir, contenedorListaArchivos, inputArchivo, inputVideo);

    const ladoDer = document.createElement('div');
    ladoDer.className = 'card';
    ladoDer.style.flex = '2';
    ladoDer.style.minWidth = '400px';
    ladoDer.style.padding = 'var(--spacing-lg)';

    const tituloFormulario = document.createElement('h3');
    tituloFormulario.innerText = 'Detalles del Documento';
    tituloFormulario.style.color = 'var(--color-tercero)';
    tituloFormulario.style.borderBottom = '2px solid var(--border-color)';
    tituloFormulario.style.paddingBottom = 'var(--spacing-sm)';
    tituloFormulario.style.marginBottom = 'var(--spacing-md)';

    const campos = {
        titulo: InputGenerico('Título del Documento', 'Ej: Informe del Primer Ciclo de Produccion'),
        descripcion: InputGenerico('Descripción breve', 'Resumen corto del archivo'),
        fecha: InputGenerico('Fecha del Evento', '', 'date'),
        gestion: InputGenerico('Gestión', ''),
        etiquetas: InputGenerico('Etiquetas', 'Ej: urgente, IO2 (separadas por coma)'),
        categoria: InputGenerico('Categoría', '', 'select', CATEGORIAS)
    };

    campos.fecha.input.value = obtenerFechaHoy();
    campos.gestion.input.disabled = true;

    const contenedorDinamico = crearContenedorDinamico();
    const btnGuardar = crearBotonGuardar();

    campos.fecha.input.addEventListener('change', () => {
        actualizarGestion(campos.fecha, campos.gestion);
    });

    campos.categoria.input.addEventListener('change', (e) => {
        manejarCambioCategoria(e.target.value, contenedorDinamico);
    });

    btnGuardar.addEventListener('click', () => {
        guardarDocumento(campos, archivosParaSubir, inputVideo, contenedorDinamico, btnGuardar, actualizarListaVisual);
    });

    actualizarGestion(campos.fecha, campos.gestion);

    ladoDer.append(
        tituloFormulario,
        campos.titulo.contenedor,
        campos.descripcion.contenedor,
        campos.fecha.contenedor,
        campos.gestion.contenedor,
        campos.etiquetas.contenedor,
        campos.categoria.contenedor,
        contenedorDinamico,
        btnGuardar
    );

    contenedorPrincipal.append(ladoIzq, ladoDer);
    
    return contenedorPrincipal;
};