import { InputGenerico } from '../../components/Input.js';
import { mostrarPopup } from '../../components/Popup.js';
import { api } from '../../services/api.js';
import './CargarDoc.css'; // Usa los mismos estilos

export const EditarDoc = (documentoOriginal, navegarA) => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.className = 'cargar-contenedor';

    // ======== LADO IZQUIERDO: GESTIÓN DE ARCHIVOS ========
    const ladoIzq = document.createElement('div');
    ladoIzq.className = 'cargar-lado-izq';

    const tituloArchivo = document.createElement('h3');
    tituloArchivo.innerText = '⚙️ Gestión de Archivos';
    
    // --- ARCHIVOS VIEJOS ---
    let archivosExistentes = documentoOriginal.archivosAdjuntos ? [...documentoOriginal.archivosAdjuntos] : [];
    
    const contenedorArchivosViejos = document.createElement('div');
    contenedorArchivosViejos.style.marginBottom = '30px';

    const renderizarArchivosExistentes = () => {
        contenedorArchivosViejos.innerHTML = '<p class="form-label">Archivos Guardados Actualmente:</p>';
        
        if (archivosExistentes.length === 0) {
            contenedorArchivosViejos.innerHTML += '<p style="font-size:13px; color:#64748b; font-style:italic;">No hay archivos guardados.</p>';
        } else {
            const lista = document.createElement('div');
            lista.className = 'cargar-lista-archivos-visual';
            
            archivosExistentes.forEach((archivo, index) => {
                const item = document.createElement('div');
                item.className = 'cargar-item-archivo';
                
                const icono = archivo.tipo === 'pdf' ? '📄' : '🖼️';
                const nombre = document.createElement('span');
                nombre.innerText = `${icono} ${archivo.nombreOriginal}`;

                const btnEliminar = document.createElement('span');
                btnEliminar.innerText = ' ❌';
                btnEliminar.className = 'cargar-btn-eliminar-archivo';
                btnEliminar.title = "Eliminar este archivo";
                
                btnEliminar.addEventListener('click', () => {
                    archivosExistentes.splice(index, 1);
                    renderizarArchivosExistentes();
                });

                item.append(nombre, btnEliminar);
                lista.append(item);
            });
            contenedorArchivosViejos.append(lista);
        }
    };
    renderizarArchivosExistentes();

    // --- ARCHIVOS NUEVOS ---
    let archivosParaSubir = [];
    
    const tituloNuevos = document.createElement('p');
    tituloNuevos.innerText = 'Agregar Nuevos Archivos:';
    tituloNuevos.className = 'form-label';

    const inputArchivo = document.createElement('input');
    inputArchivo.type = 'file';
    inputArchivo.accept = '.pdf, .jpg, .png'; 
    inputArchivo.className = 'cargar-input-archivo';
    inputArchivo.multiple = true; 

    const contenedorListaArchivos = document.createElement('div');
    contenedorListaArchivos.className = 'cargar-lista-archivos-visual';

    const actualizarListaVisual = () => {
        contenedorListaArchivos.innerHTML = ''; 
        archivosParaSubir.forEach((archivo, index) => {
            const item = document.createElement('div');
            item.className = 'cargar-item-archivo';
            const icono = archivo.name.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️';
            const nombreArchivo = document.createElement('span');
            nombreArchivo.innerText = `${icono} ${archivo.name}`;

            const btnEliminar = document.createElement('span');
            btnEliminar.innerText = ' ❌';
            btnEliminar.className = 'cargar-btn-eliminar-archivo';
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
    textoO.className = 'cargar-texto-separador';
    
    const inputVideo = document.createElement('input');
    inputVideo.type = 'text';
    inputVideo.placeholder = 'Enlace de YouTube o Drive para videos...';
    inputVideo.className = 'cargar-input-video';
    inputVideo.value = documentoOriginal.enlaceVideo || ''; 

    ladoIzq.append(tituloArchivo, contenedorArchivosViejos, tituloNuevos, inputArchivo, contenedorListaArchivos, textoO, inputVideo);

    // ======== LADO DERECHO: FORMULARIO DINÁMICO ========
    const ladoDer = document.createElement('div');
    ladoDer.className = 'cargar-lado-der';

    const tituloFormulario = document.createElement('h3');
    tituloFormulario.innerText = '✏️ Editar Registro';

    const categorias = ['Seleccione una...', 'Producción', 'Clases / Reuniones', 'Activos / Inventario', 'Administrativo / RRHH', 'Propio', 'Otros'];
    
    const campoTitulo = InputGenerico('Título del Documento', 'Ej: Informe del Primer Ciclo de Produccion');
    campoTitulo.input.value = documentoOriginal.titulo || '';

    const campoDescripcion = InputGenerico('Descripción breve', 'Resumen corto del archivo');
    campoDescripcion.input.value = documentoOriginal.descripcion || '';
    
    const campoFecha = InputGenerico('Fecha del Evento', '', 'date');
    campoFecha.input.value = documentoOriginal.fecha || '';

    const campoGestion = InputGenerico('Gestión', '');
    campoGestion.input.disabled = true;
    campoGestion.input.value = documentoOriginal.gestion || '';

    const calcularGestion = () => {
        const partes = campoFecha.input.value.split('-'); 
        if (partes.length === 3) {
            const anio = parseInt(partes[0]); const mes = parseInt(partes[1]); const dia = parseInt(partes[2]);
            if (mes === 1 || (mes === 2 && dia <= 15)) campoGestion.input.value = `3-${anio - 1}`;
            else if ((mes === 2 && dia > 15) || (mes >= 3 && mes <= 6) || (mes === 7 && dia <= 10)) campoGestion.input.value = `1-${anio}`;
            else if ((mes === 7 && dia > 10) || (mes === 8 && dia <= 10)) campoGestion.input.value = `4-${anio}`;
            else campoGestion.input.value = `2-${anio}`;
        }
    };
    campoFecha.input.addEventListener('change', calcularGestion);

    const campoEtiquetas = InputGenerico('Etiquetas', 'Ej: urgente, IO2 (separadas por coma)');
    campoEtiquetas.input.value = documentoOriginal.etiquetas ? documentoOriginal.etiquetas.join(', ') : '';

    const campoCategoria = InputGenerico('Categoría', '', 'select', categorias);
    campoCategoria.input.value = documentoOriginal.categoria || '';

    const contenedorDinamico = document.createElement('div');
    contenedorDinamico.className = 'cargar-dinamico';

    const renderizarCamposDinamicos = (seleccion) => {
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
        
        const inputsDinamicos = contenedorDinamico.querySelectorAll('.form-input');
        inputsDinamicos.forEach(input => {
            const nombreCampo = input.dataset.nombre;
            if (documentoOriginal.detalles && documentoOriginal.detalles[nombreCampo]) {
                input.value = documentoOriginal.detalles[nombreCampo];
            }
        });
    };

    campoCategoria.input.addEventListener('change', (e) => renderizarCamposDinamicos(e.target.value));
    renderizarCamposDinamicos(documentoOriginal.categoria);

    // Botones
    const btnGuardar = document.createElement('button');
    btnGuardar.innerText = 'ACTUALIZAR REGISTRO';
    btnGuardar.className = 'cargar-btn-guardar';

    const btnCancelar = document.createElement('button');
    btnCancelar.innerText = 'CANCELAR';
    btnCancelar.className = 'cargar-btn-guardar';
    btnCancelar.style.background = '#64748b'; // Color gris para cancelar
    btnCancelar.style.boxShadow = 'none';
    btnCancelar.addEventListener('click', () => navegarA('respaldos'));

    // ======== LÓGICA DE ACTUALIZACIÓN ========
    btnGuardar.addEventListener('click', async () => {
        if (campoTitulo.input.value === '' || campoCategoria.input.value === 'Seleccione una...') {
            mostrarPopup('warning', 'Título y categoría son obligatorios.'); return;
        }

        btnGuardar.innerText = 'Actualizando... ⏳';
        btnGuardar.disabled = true;

        try {
            const listaArchivosNuevos = [];
            
            if (archivosParaSubir.length > 0) {
                for (const archivoFisico of archivosParaSubir) {
                    const rutaServidor = await api.subirArchivoFisico(archivoFisico);
                    listaArchivosNuevos.push({
                        ruta: rutaServidor, nombreOriginal: archivoFisico.name, 
                        pesoBytes: archivoFisico.size, tipo: archivoFisico.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'imagen'
                    });
                }
            }

            const todosLosArchivos = [...archivosExistentes, ...listaArchivosNuevos];

            const detallesEspecificos = {};
            contenedorDinamico.querySelectorAll('.form-input').forEach(input => {
                detallesEspecificos[input.dataset.nombre] = input.value; 
            });

            const registroActualizado = {
                id: documentoOriginal.id, 
                titulo: campoTitulo.input.value,
                descripcion: campoDescripcion.input.value,
                fecha: campoFecha.input.value,
                gestion: campoGestion.input.value,
                categoria: campoCategoria.input.value,
                archivosAdjuntos: todosLosArchivos,
                enlaceVideo: inputVideo.value,
                etiquetas: campoEtiquetas.input.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                detalles: detallesEspecificos,
                fechaSubida: documentoOriginal.fechaSubida 
            };

            await api.editarDocumento(documentoOriginal.id, registroActualizado);
            mostrarPopup('success', 'Documento actualizado con éxito');
            
            setTimeout(() => {
                navegarA('respaldos');
            }, 1000);

        } catch (error) {
            mostrarPopup('error', 'Error al actualizar.');
            console.error(error);
        } finally {
            btnGuardar.innerText = 'ACTUALIZAR REGISTRO';
            btnGuardar.disabled = false;
        }
    });

    // CAJA DE ACCIONES PARA ALINEAR LOS BOTONES A LA DERECHA
    const cajaAcciones = document.createElement('div');
    cajaAcciones.className = 'cargar-acciones';
    cajaAcciones.append(btnCancelar, btnGuardar);

    ladoDer.append(tituloFormulario, campoTitulo.contenedor, campoDescripcion.contenedor, campoFecha.contenedor, campoGestion.contenedor, campoEtiquetas.contenedor, campoCategoria.contenedor, contenedorDinamico, cajaAcciones);
    contenedorPrincipal.append(ladoIzq, ladoDer);
    return contenedorPrincipal;
};