import './Tarjeta.css';
import { mostrarDetallesModal } from './DetallesModal.js';
import { api } from '../services/api.js';
import { mostrarPopup } from './Popup.js';


const contarArchivos = (doc) => {
    const archivosAdjuntos = doc.archivosAdjuntos ? doc.archivosAdjuntos.length : 0;
    const enlaceVideo = doc.enlaceVideo ? 1 : 0;
    return archivosAdjuntos + enlaceVideo;
};

const formatearTextoArchivos = (cantidad) => {
    return cantidad === 1 ? '1 archivo' : `${cantidad} archivos`;
};


const crearBurbujaCategoria = (categoria) => {
    const burbuja = document.createElement('div');
    burbuja.className = 'tarjeta-categoria-burbuja';
    burbuja.innerText = categoria;
    return burbuja;
};

const crearTitulo = (texto) => {
    const titulo = document.createElement('h3');
    titulo.className = 'tarjeta-titulo';
    titulo.innerText = texto;
    return titulo;
};

const crearSubtitulo = (fecha, gestion) => {
    const subtitulo = document.createElement('p');
    subtitulo.className = 'tarjeta-subtitulo';
    let fechaFormateada = fecha;
    if (fecha && fecha.includes('-')) {
        const partes = fecha.split('-'); 
        if (partes.length === 3) {
            fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`; 
        }
    }
    subtitulo.innerText = `${fechaFormateada || 'Sin fecha'} | Gestión: ${gestion || 'N/A'}`;
    return subtitulo;
};

const crearCajaDetalles = (detalles) => {
    const caja = document.createElement('div');
    caja.className = 'tarjeta-caja-detalles';
    
    if (!detalles || Object.keys(detalles).length === 0) {
        caja.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Sin detalles específicos.</span>';
        return caja;
    }
    
    let contador = 0;
    for (const [clave, valor] of Object.entries(detalles)) {
        if (contador < 3 && valor && valor.trim() !== '') {
            const item = document.createElement('div');
            item.className = 'tarjeta-detalle-item';
            item.innerHTML = `<strong>${clave}:</strong> ${valor}`;
            caja.append(item);
            contador++;
        }
    }
    
    if (caja.innerHTML === '') {
        caja.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Sin detalles específicos.</span>';
    }
    
    return caja;
};

const crearEtiquetas = (etiquetas) => {
    const contenedor = document.createElement('div');
    contenedor.style.display = 'flex';
    contenedor.style.flexWrap = 'wrap'; 
    contenedor.style.gap = '5px'; 
    contenedor.style.flex = '1'; 
    
    if (etiquetas && etiquetas.length > 0) {
        etiquetas.forEach(tag => {
            const span = document.createElement('span');
            span.style.backgroundColor = '#f1f5f9';
            span.style.color = '#64748b';
            span.style.padding = '4px 8px';
            span.style.borderRadius = '12px';
            span.style.fontSize = '11px';
            span.style.border = '1px solid #e2e8f0';
            span.innerText = tag;
            contenedor.append(span);
        });
    } else {
        contenedor.innerHTML = '<span style="color: transparent; user-select: none;">-</span>'; 
    }
    
    return contenedor;
};

const crearTextoArchivos = (cantidad) => {
    const texto = document.createElement('div');
    texto.style.fontWeight = 'bold';
    texto.innerText = formatearTextoArchivos(cantidad);
    return texto;
};

const crearPieInfo = (etiquetas, cantidadArchivos) => {
    const pie = document.createElement('div');
    pie.className = 'tarjeta-pie-info';
    pie.style.display = 'flex';
    pie.style.justifyContent = 'space-between';
    pie.style.alignItems = 'flex-end'; 
    pie.style.gap = '10px';
    pie.style.marginTop = '15px';
    
    const cajaEtiquetas = crearEtiquetas(etiquetas);
    const textoArchivos = crearTextoArchivos(cantidadArchivos);
    
    textoArchivos.style.marginLeft = 'auto'; 
    textoArchivos.style.whiteSpace = 'nowrap';
    
    pie.append(cajaEtiquetas, textoArchivos);
    return pie;
};

const crearBotonDetalles = (doc) => {
    const btn = document.createElement('button');
    btn.className = 'tarjeta-btn-detalles';
    btn.innerText = 'Ver Detalles';
    
    btn.addEventListener('click', () => {
        mostrarDetallesModal(doc);
    });
    
    return btn;
};



const crearBotonEditar = (doc) => {
    const btn = document.createElement('button');
    btn.innerText = 'Editar';
    btn.style.flex = '1';
    btn.style.padding = '8px';
    btn.style.backgroundColor = '#f1a044';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    
    btn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('cambiarRuta', { 
            detail: { ruta: 'editar', datos: doc } 
        }));
    });
    
    return btn;
};

const crearBotonEliminar = (doc, tarjeta) => {
    const btn = document.createElement('button');
    btn.innerText = 'Eliminar';
    btn.style.flex = '1';
    btn.style.padding = '8px';
    btn.style.backgroundColor = '#bf2422';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    
    btn.addEventListener('click', async () => { 
        if (!confirm(`¿Estás totalmente seguro de eliminar el respaldo "${doc.titulo}" ?`)) {
            return;
        }
        
        const textoOriginal = btn.innerText;
        btn.innerText = 'Borrando...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
        
        try {
            await api.eliminarDocumento(doc.id);
            tarjeta.remove();
            mostrarPopup('success', 'Documento y archivos mandados a la papelera');
        } catch (error) {
            console.error("Error al eliminar:", error);
            mostrarPopup('error', 'Error de conexión al intentar eliminar');
            btn.innerText = textoOriginal;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });
    
    return btn;
};

const crearCajaAdmin = (doc, tarjeta) => {
    const caja = document.createElement('div');
    caja.style.display = 'flex';
    caja.style.gap = '10px';
    caja.style.marginTop = '15px';
    
    const btnEditar = crearBotonEditar(doc);
    const btnEliminar = crearBotonEliminar(doc, tarjeta);
    
    caja.append(btnEditar, btnEliminar);
    return caja;
};


export const TarjetaDocumento = (doc) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-doc';

    const burbujaCat = crearBurbujaCategoria(doc.categoria);
    const titulo = crearTitulo(doc.titulo);
    const subtitulo = crearSubtitulo(doc.fecha, doc.gestion);
    const cajaDetalles = crearCajaDetalles(doc.detalles);
    
    const cantidadArchivos = contarArchivos(doc);
    const pieInfo = crearPieInfo(doc.etiquetas, cantidadArchivos);
    
    const btnDetalles = crearBotonDetalles(doc);

    tarjeta.append(burbujaCat, titulo, subtitulo, cajaDetalles, pieInfo, btnDetalles);

  
    if (sessionStorage.getItem('isAdmin') === 'true') {
        const cajaAdmin = crearCajaAdmin(doc, tarjeta);
        tarjeta.append(cajaAdmin);
    }

    return tarjeta;
};