import { InputGenerico } from '../../components/Input.js'; // Asegura mayúscula si así está en tu carpeta
import { mostrarPopup } from '../../components/Popup.js';
import { api } from '../../services/api.js';
import './CargarDoc.css';

export const CargarDoc = () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.style.display = 'flex';
    contenedorPrincipal.style.flexWrap = 'wrap';
    contenedorPrincipal.style.gap = 'var(--spacing-lg)';
    contenedorPrincipal.style.padding = 'var(--spacing-xl)';
    contenedorPrincipal.style.maxWidth = '1300px';
    contenedorPrincipal.style.margin = '0 auto';
    contenedorPrincipal.style.alignItems = 'flex-start';

    // ======== LADO IZQUIERDO: ARCHIVOS ========
    const ladoIzq = document.createElement('div');
    ladoIzq.className = 'card';
    ladoIzq.style.flex = '1';
    ladoIzq.style.minWidth = '300px';
    ladoIzq.style.padding = 'var(--spacing-lg)';

    const tituloArchivo = document.createElement('h3');
    tituloArchivo.innerText = 'Subir Archivo';
    tituloArchivo.style.color = 'var(--color-tercero)';
    tituloArchivo.style.borderBottom = '2px solid var(--border-color)';
    tituloArchivo.style.paddingBottom = 'var(--spacing-sm)';
    tituloArchivo.style.marginBottom = 'var(--spacing-md)';
    
    let archivosParaSubir = [];

    const inputArchivo = document.createElement('input');
    inputArchivo.type = 'file';
    inputArchivo.accept = '.pdf, .jpg, .png'; 
    inputArchivo.className = 'input'; // Design System
    inputArchivo.multiple = true; 
    inputArchivo.style.width = '100%';
    inputArchivo.style.marginBottom = 'var(--spacing-md)';

    const contenedorListaArchivos = document.createElement('div');

    const actualizarListaVisual = () => {
        contenedorListaArchivos.innerHTML = ''; 
        archivosParaSubir.forEach((archivo, index) => {
            const item = document.createElement('div');
            // Diseño de "Cajita de archivo" profesional
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = 'var(--spacing-sm) var(--spacing-md)';
            item.style.backgroundColor = 'var(--bg-secundario)';
            item.style.border = '1px solid var(--border-color)';
            item.style.borderRadius = 'var(--border-radius-md)';
            item.style.marginBottom = 'var(--spacing-sm)';
            
            const icono = archivo.name.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️';
            const nombreArchivo = document.createElement('span');
            nombreArchivo.innerText = `${icono} ${archivo.name}`;
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
                archivosParaSubir.splice(index, 1); 
                actualizarListaVisual();
            });

            item.append(nombreArchivo, btnEliminar);
            contenedorListaArchivos.append(item);
        });
    };

    inputArchivo.addEventListener('change', (evento) => {
        const nuevosArchivos = Array.from(evento.target.files); 
        nuevosArchivos.forEach(archivo => archivosParaSubir.push(archivo));
        actualizarListaVisual(); 
        inputArchivo.value = ''; 
    });

    const textoO = document.createElement('p');
    textoO.innerText = '— Y/O —'; 
    textoO.style.textAlign = 'center';
    textoO.style.color = 'var(--text-disabled)';
    textoO.style.margin = 'var(--spacing-md) 0';
    
    const inputVideo = document.createElement('input');
    inputVideo.type = 'text';
    inputVideo.placeholder = 'Enlace de video (Opcional)...';
    inputVideo.className = 'input'; // Design System
    inputVideo.style.width = '100%';

    ladoIzq.append(tituloArchivo, inputArchivo, contenedorListaArchivos, textoO, inputVideo);

    // ======== LADO DERECHO: FORMULARIO DINÁMICO ========
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

    const categorias = ['Seleccione una...', 'Producción', 'Clases / Reuniones', 'Activos / Inventario', 'Administrativo / RRHH', 'Propio', 'Otros'];
    
    // Asumimos que InputGenerico ya devuelve los contenedores bien formateados.
    const campoTitulo = InputGenerico('Título del Documento', 'Ej: Informe del Primer Ciclo de Produccion');
    const campoDescripcion = InputGenerico('Descripción breve', 'Resumen corto del archivo');
    
    const hoy = new Date();
    const fechaString = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
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
    contenedorDinamico.style.display = 'none'; 
    contenedorDinamico.style.padding = 'var(--spacing-md)';
    contenedorDinamico.style.backgroundColor = 'var(--bg-secundario)';
    contenedorDinamico.style.borderRadius = 'var(--border-radius-md)';
    contenedorDinamico.style.marginTop = 'var(--spacing-md)';

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
    btnGuardar.className = 'btn btn-primary'; // Design System
    btnGuardar.style.width = '100%';
    btnGuardar.style.marginTop = 'var(--spacing-xl)';
    btnGuardar.style.fontSize = 'var(--font-size-md)';
    btnGuardar.style.padding = 'var(--spacing-md)';

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
                id: Date.now().toString(),
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
            mostrarPopup('error', 'Error de conexión. Cancelando subida...');
            console.error(error);
        } finally {
            btnGuardar.innerText = 'GUARDAR REGISTRO';
            btnGuardar.disabled = false;
        }
    });

    ladoDer.append(tituloFormulario, campoTitulo.contenedor, campoDescripcion.contenedor, campoFecha.contenedor, campoGestion.contenedor, campoEtiquetas.contenedor, campoCategoria.contenedor, contenedorDinamico, btnGuardar);
    contenedorPrincipal.append(ladoIzq, ladoDer);
    return contenedorPrincipal;
};