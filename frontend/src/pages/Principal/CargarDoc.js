import { InputGenerico } from '../../Components/Input.js';
import { mostrarPopup } from '../../Components/Popup.js';
import { api } from '../../services/api.js';
import './CargarDoc.css';

const obtenerFechaHoy = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
};

const crearCamposProduccion = () => {
    const cLote = InputGenerico('Producto', 'Ej: Macetas Biodegradables');
    const cCantidad = InputGenerico('Cantidad', 'Ej: 50', 'number');
    const cResponsable = InputGenerico('Materia', 'Ej: IO 2');
    return [cLote.contenedor, cCantidad.contenedor, cResponsable.contenedor];
};

const crearCamposClases = () => {
    const cMateria = InputGenerico('Materia/Tema', 'Ej: IO2');
    const cAsistentes = InputGenerico('N° Asistentes', 'Ej: 25', 'number');
    return [cMateria.contenedor, cAsistentes.contenedor];
};

const crearCamposMantenimiento = () => {
    const cEquipo = InputGenerico('Equipo/Maquinaria', 'Ej: Bomba de Agua');
    const cEstado = InputGenerico('Estado post-mantenimiento', '', 'select', ['Operativo', 'En Falla']);
    return [cEquipo.contenedor, cEstado.contenedor];
};


const crearLadoIzquierdo = () => {
    const ladoIzq = document.createElement('div');
    ladoIzq.className = 'cargar-lado-izq';

    const titulo = document.createElement('h3');
    titulo.innerText = 'Subir Archivo';
    
    const inputArchivo = document.createElement('input');
    inputArchivo.type = 'file';
    inputArchivo.accept = '.pdf, .jpg, .png';
    inputArchivo.className = 'cargar-input-archivo';

    const textoO = document.createElement('p');
    textoO.innerText = '— O —';
    textoO.className = 'cargar-texto-separador';
    
    const inputVideo = document.createElement('input');
    inputVideo.type = 'text';
    inputVideo.placeholder = 'Enlace de Video';
    inputVideo.className = 'cargar-input-video';

    ladoIzq.append(titulo, inputArchivo, textoO, inputVideo);
    
    return { ladoIzq, inputArchivo, inputVideo };
};

const crearContenedorDinamico = () => {
    const contenedor = document.createElement('div');
    contenedor.className = 'cargar-dinamico';
    contenedor.style.display = 'none';
    return contenedor;
};

const crearBotonGuardar = () => {
    const btn = document.createElement('button');
    btn.innerText = 'GUARDAR RESPALDO';
    btn.className = 'btn btn-primary cargar-btn-guardar';
    return btn;
};


const manejarCambioCategoria = (categoria, contenedorDinamico) => {
    contenedorDinamico.innerHTML = '';
    
    if (categoria === 'Seleccione una...') {
        contenedorDinamico.style.display = 'none';
        return;
    }
    
    contenedorDinamico.style.display = 'block';

    if (categoria === 'Produccion') {
        contenedorDinamico.append(...crearCamposProduccion());
    } else if (categoria === 'Clases/Reuniones') {
        contenedorDinamico.append(...crearCamposClases());
    } else if (categoria === 'Activos/Mantenimiento') {
        contenedorDinamico.append(...crearCamposMantenimiento());
    }
};

const validarFormulario = (titulo, categoria) => {
    if (titulo === '' || categoria === 'Seleccione una...') {
        mostrarPopup('warning', 'Por favor, rellena el título y elige una categoría.');
        return false;
    }
    return true;
};

const recopilarDetallesDinamicos = (contenedorDinamico) => {
    const inputsDinamicos = contenedorDinamico.querySelectorAll('.form-input');
    const detalles = {};
    
    inputsDinamicos.forEach(input => {
        detalles[input.dataset.nombre] = input.value;
    });
    
    return detalles;
};

const limpiarFormulario = (campos, inputArchivo, inputVideo, contenedorDinamico) => {
    campos.titulo.input.value = '';
    campos.etiquetas.input.value = '';
    inputVideo.value = '';
    inputArchivo.value = '';
    campos.categoria.input.value = 'Seleccione una...';
    contenedorDinamico.innerHTML = '';
    contenedorDinamico.style.display = 'none';
};

const guardarDocumento = async (campos, inputArchivo, inputVideo, contenedorDinamico, btnGuardar) => {
    const titulo = campos.titulo.input.value;
    const categoria = campos.categoria.input.value;

    if (!validarFormulario(titulo, categoria)) return;

    btnGuardar.innerText = 'Subiendo archivos... ⏳';
    btnGuardar.disabled = true;

    try {
        // 1. Subir archivo físico
        let rutaArchivoSubido = '';
        if (inputArchivo.files.length > 0) {
            const archivoReal = inputArchivo.files[0];
            rutaArchivoSubido = await api.subirArchivoFisico(archivoReal);
        }

        // 2. Recopilar detalles dinámicos
        const detallesEspecificos = recopilarDetallesDinamicos(contenedorDinamico);

        // 3. Crear objeto
        const nuevoRegistro = {
            id: Date.now(),
            titulo: titulo,
            categoria: categoria,
            fecha: campos.fecha.input.value,
            archivoPdfImg: rutaArchivoSubido,
            enlaceVideo: inputVideo.value,
            etiquetas: campos.etiquetas.input.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== ''),
            detalles: detallesEspecificos,
            fechaSubida: new Date().toISOString()
        };

        // 4. Guardar en servidor
        btnGuardar.innerText = 'Guardando datos...';
        await api.guardarDocumento(nuevoRegistro);
        
        mostrarPopup('success', 'Documento guardado exitosamente en el Servidor');
        limpiarFormulario(campos, inputArchivo, inputVideo, contenedorDinamico);

    } catch (error) {
        mostrarPopup('error', 'Error al guardar el documento o subir el archivo.');
        console.error(error);
    } finally {
        btnGuardar.innerText = 'GUARDAR REGISTRO';
        btnGuardar.disabled = false;
    }
};


// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const CargarDoc = () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'cargar-contenedor';

    // Crear lado izquierdo
    const { ladoIzq, inputArchivo, inputVideo } = crearLadoIzquierdo();

    // Crear lado derecho
    const ladoDer = document.createElement('div');
    ladoDer.className = 'cargar-lado-der';

    const categorias = ['Seleccione una...', 'Produccion', 'Clases/Reuniones', 'Activos/Mantenimiento'];
    
    const campos = {
        titulo: InputGenerico('Título del Documento', 'Ej: Informe Lote 45'),
        categoria: InputGenerico('Categoría', '', 'select', categorias),
        fecha: InputGenerico('Fecha del Evento', '', 'date'),
        etiquetas: InputGenerico('Etiquetas', 'Ej: bomba, falla, urgente (separadas por coma)')
    };

    campos.fecha.input.value = obtenerFechaHoy();

    const contenedorDinamico = crearContenedorDinamico();
    const btnGuardar = crearBotonGuardar();

    // Event listeners
    campos.categoria.input.addEventListener('change', (e) => {
        manejarCambioCategoria(e.target.value, contenedorDinamico);
    });

    btnGuardar.addEventListener('click', () => {
        guardarDocumento(campos, inputArchivo, inputVideo, contenedorDinamico, btnGuardar);
    });

    // Ensamblar lado derecho
    ladoDer.append(
        campos.titulo.contenedor,
        campos.categoria.contenedor,
        campos.fecha.contenedor,
        contenedorDinamico,
        campos.etiquetas.contenedor,
        btnGuardar
    );

    // Ensamblar contenedor final
    contenedorPrincipal.append(ladoIzq, ladoDer);
    
    return contenedorPrincipal;
};