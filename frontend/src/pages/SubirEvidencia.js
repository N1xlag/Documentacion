// src/pages/SubirEvidencia.js
import { api } from '../services/api.js';

// Función "fábrica" para crear inputs
const crearCampo = (texto, subtexto, tipo = 'text', opciones = []) => {
    const contenedor = document.createElement('div');
    contenedor.style.marginBottom = '15px';

    const label = document.createElement('label');
    label.innerText = texto;
    label.style.display = 'block';
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '5px';

    let input;
    if (tipo === 'select') {
        input = document.createElement('select');
        opciones.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.innerText = op;
            input.append(option);
        });
    } else {
        input = document.createElement('input');
        input.type = tipo;
        input.placeholder = subtexto;
    }
    input.className = 'form-input'; 
    input.dataset.nombre = texto; 
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ccc';

    contenedor.append(label, input);
    return { contenedor, input }; 
};

// Componente principal de la página
export const SubirEvidencia = () => {
    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.style.display = 'flex';
    contenedorPrincipal.style.gap = '40px';
    contenedorPrincipal.style.marginTop = '20px';
    contenedorPrincipal.style.background = 'white';
    contenedorPrincipal.style.padding = '30px';
    contenedorPrincipal.style.borderRadius = '8px';
    contenedorPrincipal.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

    // ======== LADO IZQUIERDO: ARCHIVOS ========
    const ladoIzq = document.createElement('div');
    ladoIzq.style.flex = '1';
    ladoIzq.style.background = '#e0e0e0';
    ladoIzq.style.padding = '40px';
    ladoIzq.style.textAlign = 'center';
    ladoIzq.style.borderRadius = '8px';
    ladoIzq.style.display = 'flex';
    ladoIzq.style.flexDirection = 'column';
    ladoIzq.style.justifyContent = 'center';

    const tituloArchivo = document.createElement('h3');
    tituloArchivo.innerText = 'Evidencia Visual/Documental';
    
    const inputArchivo = document.createElement('input');
    inputArchivo.type = 'file';
    inputArchivo.accept = '.pdf, .jpg, .png'; // Restringimos formatos
    inputArchivo.style.marginBottom = '15px';
    inputArchivo.style.padding = '10px';
    inputArchivo.style.background = 'white';
    inputArchivo.style.borderRadius = '4px';

    const textoO = document.createElement('p');
    textoO.innerText = '— O —';
    textoO.style.margin = '15px 0';
    
    const inputVideo = document.createElement('input');
    inputVideo.type = 'text';
    inputVideo.placeholder = 'Enlace de YouTube o Drive para videos...';
    inputVideo.style.width = '100%';
    inputVideo.style.padding = '8px';

    ladoIzq.append(tituloArchivo, inputArchivo, textoO, inputVideo);

    // ======== LADO DERECHO: FORMULARIO DINÁMICO ========
    const ladoDer = document.createElement('div');
    ladoDer.style.flex = '2';

    const categorias = ['Seleccione una...', 'Produccion', 'Clases/Reuniones', 'Activos/Mantenimiento'];
    
    const campoTitulo = crearCampo('Título del Documento', 'Ej: Informe Lote 45');
    const campoCategoria = crearCampo('Categoría', '', 'select', categorias);
    
    const hoy = new Date();
    const fechaString = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    const campoFecha = crearCampo('Fecha del Evento', '', 'date');
    campoFecha.input.value = fechaString;

    const campoEtiquetas = crearCampo('Etiquetas', 'Ej: bomba, falla, urgente (separadas por coma)');

    const contenedorDinamico = document.createElement('div');
    contenedorDinamico.style.background = '#f4f4f4';
    contenedorDinamico.style.padding = '15px';
    contenedorDinamico.style.borderRadius = '8px';
    contenedorDinamico.style.marginBottom = '15px';
    contenedorDinamico.style.display = 'none'; 

    campoCategoria.input.addEventListener('change', (e) => {
        const seleccion = e.target.value;
        contenedorDinamico.innerHTML = ''; 
        
        if(seleccion === 'Seleccione una...') {
            contenedorDinamico.style.display = 'none';
            return;
        }
        
        contenedorDinamico.style.display = 'block';

        if (seleccion === 'Produccion') {
            const cLote = crearCampo('Número de Lote', 'Ej: L-45');
            const cCantidad = crearCampo('Cantidad Producida', 'Ej: 500', 'number');
            const cResponsable = crearCampo('Responsable de Turno', 'Ej: Ing. Perez');
            contenedorDinamico.append(cLote.contenedor, cCantidad.contenedor, cResponsable.contenedor);
            
        } else if (seleccion === 'Clases/Reuniones') {
            const cMateria = crearCampo('Materia/Tema', 'Ej: IO2');
            const cAsistentes = crearCampo('N° Asistentes', 'Ej: 25', 'number');
            contenedorDinamico.append(cMateria.contenedor, cAsistentes.contenedor);
            
        } else if (seleccion === 'Activos/Mantenimiento') {
            const cEquipo = crearCampo('Equipo/Maquinaria', 'Ej: Bomba de Agua');
            const cEstado = crearCampo('Estado post-mantenimiento', '', 'select', ['Operativo', 'En Falla']);
            contenedorDinamico.append(cEquipo.contenedor, cEstado.contenedor);
        }
    });

    const btnGuardar = document.createElement('button');
    btnGuardar.innerText = 'GUARDAR REGISTRO';
    btnGuardar.style.padding = '12px 24px';
    btnGuardar.style.background = '#224251';
    btnGuardar.style.color = 'white';
    btnGuardar.style.border = 'none';
    btnGuardar.style.borderRadius = '4px';
    btnGuardar.style.cursor = 'pointer';
    btnGuardar.style.fontWeight = 'bold';
    btnGuardar.style.marginTop = '10px';

    // ======== LÓGICA DE GUARDADO (CON ARCHIVOS FÍSICOS) ========
    btnGuardar.addEventListener('click', async () => {
        if (!campoTitulo.input.value || campoCategoria.input.value === 'Seleccione una...') {
            alert('❌ Por favor, rellena el título y elige una categoría.');
            return;
        }

        const textoOriginal = btnGuardar.innerText;
        btnGuardar.innerText = 'Subiendo archivos... ⏳';
        btnGuardar.disabled = true;

        try {
            // 1. PRIMERO SUBIMOS EL ARCHIVO FÍSICO (SI ES QUE EL USUARIO ELIGIÓ UNO)
            let rutaArchivoSubido = '';
            // Verificamos si hay un archivo seleccionado en el input
            if (inputArchivo.files.length > 0) {
                const archivoReal = inputArchivo.files[0];
                rutaArchivoSubido = await api.subirArchivoFisico(archivoReal);
            }

            // 2. LUEGO RECOPILAMOS LOS DATOS DINÁMICOS
            const inputsDinamicos = contenedorDinamico.querySelectorAll('.form-input');
            const detallesEspecificos = {};
            inputsDinamicos.forEach(input => {
                detallesEspecificos[input.dataset.nombre] = input.value; 
            });

            // 3. ARMAMOS EL OBJETO (Incluyendo la ruta del archivo que nos dio el backend)
            const nuevoRegistro = {
                id: Date.now(), 
                titulo: campoTitulo.input.value,
                categoria: campoCategoria.input.value,
                fecha: campoFecha.input.value,
                archivoPdfImg: rutaArchivoSubido, // <--- AQUÍ SE GUARDA LA DIRECCIÓN (/uploads/...)
                enlaceVideo: inputVideo.value,
                etiquetas: campoEtiquetas.input.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                detalles: detallesEspecificos,
                fechaSubida: new Date().toISOString()
            };

            // 4. GUARDAMOS EL JSON EN EL SERVIDOR
            btnGuardar.innerText = 'Guardando datos...';
            await api.guardarDocumento(nuevoRegistro);
            
            alert('✅ Documento y archivos guardados exitosamente en el Servidor');
            
            // Limpieza
            campoTitulo.input.value = '';
            campoEtiquetas.input.value = '';
            inputVideo.value = '';
            inputArchivo.value = ''; // Limpiar el archivo
            campoCategoria.input.value = 'Seleccione una...';
            contenedorDinamico.innerHTML = '';
            contenedorDinamico.style.display = 'none';
        } catch (error) {
            alert('❌ Error al guardar el documento o subir el archivo.');
            console.error(error);
        } finally {
            btnGuardar.innerText = textoOriginal;
            btnGuardar.disabled = false;
        }
    });

    // ¡ESTAS SON LAS LÍNEAS QUE FALTABAN!
    // Agregar los campos a la columna derecha
    ladoDer.append(
        campoTitulo.contenedor, 
        campoCategoria.contenedor, 
        campoFecha.contenedor, 
        contenedorDinamico, 
        campoEtiquetas.contenedor, 
        btnGuardar
    );

    // Agregar las dos columnas al contenedor principal
    contenedorPrincipal.append(ladoIzq, ladoDer);
    
    return contenedorPrincipal;
};