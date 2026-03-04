import { InputGenerico } from '../../components/Input.js';
import { mostrarPopup } from '../../components/Popup.js';
import { api } from '../../services/api.js';
import './CargarDoc.css';

export const CargarDoc = () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'cargar-contenedor';

    // ======== LADO IZQUIERDO: ARCHIVOS ========
    const ladoIzq = document.createElement('div');
    ladoIzq.className = 'cargar-lado-izq';

    const tituloArchivo = document.createElement('h3');
    tituloArchivo.innerText = 'Subir Archivo';
    
    // 1. NUESTRO CARRITO DE ARCHIVOS
    let archivosParaSubir = [];

    const inputArchivo = document.createElement('input');
    inputArchivo.type = 'file';
    inputArchivo.accept = '.pdf, .jpg, .png'; 
    inputArchivo.className = 'cargar-input-archivo';
    inputArchivo.multiple = true; 

    // 2. LA CAJITA VISUAL PARA MOSTRAR LO QUE VAMOS AGREGANDO
    const contenedorListaArchivos = document.createElement('div');
    contenedorListaArchivos.className = 'cargar-lista-archivos-visual';

    const actualizarListaVisual = () => {
        contenedorListaArchivos.innerHTML = ''; 

        archivosParaSubir.forEach((archivo, index) => {
            const item = document.createElement('div');
            item.className = 'cargar-item-archivo';
            
            const icono = archivo.name.toLowerCase().endsWith('.pdf') ? '' : '';
            const nombreArchivo = document.createElement('span');
            nombreArchivo.innerText = `${icono} ${archivo.name}`;

            const btnEliminar = document.createElement('span');
            btnEliminar.innerText = ' X ';
            btnEliminar.className = 'cargar-btn-eliminar-archivo';
            
            btnEliminar.addEventListener('click', () => {
                archivosParaSubir.splice(index, 1); 
                actualizarListaVisual();
            });

            item.append(nombreArchivo, btnEliminar);
            contenedorListaArchivos.append(item);
        });
    };

    // 3. EVENTO: Cuando el usuario elige un archivo
    inputArchivo.addEventListener('change', (evento) => {
        const nuevosArchivos = Array.from(evento.target.files); 
        nuevosArchivos.forEach(archivo => archivosParaSubir.push(archivo));
        actualizarListaVisual(); 
        inputArchivo.value = ''; 
    });

    const textoO = document.createElement('p');
    textoO.innerText = '— Y/O —'; 
    textoO.className = 'cargar-texto-separador';
    
    const inputVideo = document.createElement('input');
    inputVideo.type = 'text';
    inputVideo.placeholder = 'Enlace de video...';
    inputVideo.className = 'cargar-input-video';

    ladoIzq.append(tituloArchivo, inputArchivo, contenedorListaArchivos, textoO, inputVideo);

    // ======== LADO DERECHO: FORMULARIO DINÁMICO ========
    const ladoDer = document.createElement('div');
    ladoDer.className = 'cargar-lado-der';

    const tituloFormulario = document.createElement('h3');
    tituloFormulario.innerText = 'Detalles';

    const categorias = ['Seleccione una...', 'Producción', 'Clases / Reuniones', 'Activos / Inventario', 'Administrativo / RRHH', 'Propio', 'Otros'];
    
    const campoTitulo = InputGenerico('Título del Documento', 'Ej: Informe del Primer Ciclo de Produccion');
    const campoDescripcion = InputGenerico('Descripción breve', 'Resumen corto del archivo');
    
    const hoy = new Date();
    const fechaString = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const campoFecha = InputGenerico('Fecha del Evento', '', 'date');
    campoFecha.input.value = fechaString; 

    const campoGestion = InputGenerico('Gestión', '');
    campoGestion.input.disabled = true;

    const calcularGestion = () => {
        const partes = campoFecha.input.value.split('-'); 
        if (partes.length === 3) {
            const anio = parseInt(partes[0]);
            const mes = parseInt(partes[1]);
            const dia = parseInt(partes[2]);
            
            if (mes === 1 || (mes === 2 && dia <= 15)) campoGestion.input.value = `3-${anio - 1}`;
            else if ((mes === 2 && dia > 15) || (mes >= 3 && mes <= 6) || (mes === 7 && dia <= 10)) campoGestion.input.value = `1-${anio}`;
            else if ((mes === 7 && dia > 10) || (mes === 8 && dia <= 10)) campoGestion.input.value = `4-${anio}`;
            else campoGestion.input.value = `2-${anio}`;
        }
    };
    campoFecha.input.addEventListener('change', calcularGestion);
    calcularGestion();

    const campoEtiquetas = InputGenerico('Etiquetas', 'Ej: urgente, IO2 (separadas por coma)');
    const campoCategoria = InputGenerico('Categoría', '', 'select', categorias);

    const contenedorDinamico = document.createElement('div');
    contenedorDinamico.className = 'cargar-dinamico';
    contenedorDinamico.style.display = 'none'; 

    campoCategoria.input.addEventListener('change', (evento) => {
        const seleccion = evento.target.value;
        contenedorDinamico.innerHTML = ''; 
        if (seleccion === 'Seleccione una...' || seleccion === 'Otros') {
            contenedorDinamico.style.display = 'none'; return; 
        }
        contenedorDinamico.style.display = 'block'; 

        if (seleccion === 'Producción') {
            contenedorDinamico.append(InputGenerico('Ciclo', 'Ej: Primer Ciclo').contenedor, InputGenerico('Producto', 'Ej: Macetas Biodegradables').contenedor, InputGenerico('Cantidad Producida', 'Ej: 50', 'number').contenedor, InputGenerico('Grupo', 'Ej: Grupo 3').contenedor, InputGenerico('Materia', 'Ej: Topicos Selectos').contenedor, InputGenerico('Observaciones', 'Ej: Les sobro mucho material').contenedor);
        } else if (seleccion === 'Clases / Reuniones') {
            contenedorDinamico.append(InputGenerico('Evento', '', 'select', ['Clase teórica', 'Clase práctica', 'Reunión', 'Conferencia', 'Otro']).contenedor, InputGenerico('Tema', 'Ej: Modelo de Asignacion').contenedor, InputGenerico('Encargado', 'Ej: Ing. Miguel').contenedor, InputGenerico('Area o Materia', 'Investigacion Operativa 2').contenedor, InputGenerico('Cantidad de Asistentes', 'Ej: 25', 'number').contenedor);
        } else if (seleccion === 'Activos / Inventario') {
            contenedorDinamico.append(InputGenerico('Area', 'Ej: Area B').contenedor, InputGenerico('Responsable', 'Nombre del encargado').contenedor);
        } else if (seleccion === 'Administrativo / RRHH') {
            contenedorDinamico.append(InputGenerico('Tipo', '', 'select', ['Registro de Asistencia', 'Horarios', 'Permisos', 'Reporte de Incidente', 'Otros']).contenedor, InputGenerico('Periodo', 'Ej: 3ra Semana de Marzo').contenedor, InputGenerico('Responsable', 'Quien lo aprueba').contenedor);
        } else if (seleccion === 'Propio') {
            contenedorDinamico.append(InputGenerico('Tipo', '', 'select', ['Investigación', 'Proyecto', 'Guia', 'Artículo', 'Manual']).contenedor, InputGenerico('Autor(es)', 'Quién(es) lo desarrolló').contenedor, InputGenerico('Área o Materia Vinculada', 'Ej: IO2').contenedor);
        }
    });

    const btnGuardar = document.createElement('button');
    btnGuardar.innerText = 'GUARDAR REGISTRO';
    btnGuardar.className = 'cargar-btn-guardar'; // Clase actualizada para el nuevo CSS

    // ======== LÓGICA DE GUARDADO ========
    btnGuardar.addEventListener('click', async () => {
        if (campoTitulo.input.value === '' || campoCategoria.input.value === 'Seleccione una...') {
            mostrarPopup('warning', 'Por favor, rellena el título y elige una categoría.'); return;
        }

        btnGuardar.innerText = 'Subiendo archivos...';
        btnGuardar.disabled = true;

        try {
            const listaArchivosSubidos = [];
            
            if (archivosParaSubir.length > 0) {
                for (const archivoFisico of archivosParaSubir) {
                    const rutaServidor = await api.subirArchivoFisico(archivoFisico);
                    listaArchivosSubidos.push({
                        ruta: rutaServidor,
                        nombreOriginal: archivoFisico.name, 
                        pesoBytes: archivoFisico.size,      
                        tipo: archivoFisico.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'imagen'
                    });
                }
            }

            const detallesEspecificos = {};
            contenedorDinamico.querySelectorAll('.form-input').forEach(input => {
                detallesEspecificos[input.dataset.nombre] = input.value; 
            });

            const nuevoRegistro = {
                id: Date.now().toString(), // Aseguramos que el ID sea string para Prisma
                titulo: campoTitulo.input.value,
                descripcion: campoDescripcion.input.value,
                fecha: campoFecha.input.value,
                gestion: campoGestion.input.value,
                categoria: campoCategoria.input.value,
                archivosAdjuntos: listaArchivosSubidos, 
                enlaceVideo: inputVideo.value,
                etiquetas: campoEtiquetas.input.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                detalles: detallesEspecificos,
                fechaSubida: new Date().toISOString()
            };

            await api.guardarDocumento(nuevoRegistro);
            mostrarPopup('success', 'Documento guardado exitosamente');
            
            // LIMPIEZA
            campoTitulo.input.value = ''; campoDescripcion.input.value = ''; campoEtiquetas.input.value = '';
            inputVideo.value = ''; 
            archivosParaSubir = [];
            actualizarListaVisual();
            campoCategoria.input.value = 'Seleccione una...';
            contenedorDinamico.innerHTML = ''; contenedorDinamico.style.display = 'none';
        } catch (error) {
            mostrarPopup('error', 'Error al guardar.');
            console.error(error);
        } finally {
            btnGuardar.innerText = 'GUARDAR REGISTRO';
            btnGuardar.disabled = false;
        }
    });

    // CAJA DE ACCIONES PARA ALINEAR EL BOTÓN (Diseño nuevo)
    const cajaAcciones = document.createElement('div');
    cajaAcciones.className = 'cargar-acciones';
    cajaAcciones.append(btnGuardar);

    ladoDer.append(tituloFormulario, campoTitulo.contenedor, campoDescripcion.contenedor, campoFecha.contenedor, campoGestion.contenedor, campoEtiquetas.contenedor, campoCategoria.contenedor, contenedorDinamico, cajaAcciones);
    contenedorPrincipal.append(ladoIzq, ladoDer);
    return contenedorPrincipal;
};