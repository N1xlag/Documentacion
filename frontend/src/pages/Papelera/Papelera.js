import { api } from '../../services/api.js';
import { mostrarPopup } from '../../components/Popup.js';
import './Papelera.css';

const contarVotos = (doc) => {
    return doc.votosBorrados ? doc.votosBorrados.length : 0;
};

const obtenerPrimerVoto = (doc) => {
    if (doc.votosBorrados && doc.votosBorrados.length > 0) {
        return doc.votosBorrados[0];
    }
    return null;
};

const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString();
};

const listaEstaVacia = (lista) => {
    return lista.children.length === 0;
};

const crearMensajeVacio = () => {
    const div = document.createElement('div');
    div.className = 'alert alert-info papelera-mensaje-vacio';
    div.innerText = 'La papelera está vacía. No hay documentos pendientes de borrado.';
    return div;
};

const crearMensajeError = (mensaje) => {
    const div = document.createElement('div');
    div.className = 'alert alert-error';
    div.innerText = `Error al cargar la papelera: ${mensaje}`;
    return div;
};

const mostrarPapeleraVacia = (lista) => {
    lista.innerHTML = '';
    lista.append(crearMensajeVacio());
};

const crearInfoIniciadorConocido = (primerVoto) => {
    const fechaAmigable = formatearFecha(primerVoto.fecha);
    
    return `
        <div class="alert alert-error papelera-alerta-iniciador">
            <b>Enviado por:</b> ${primerVoto.usuario?.nombre || 'Desconocido'} <br>
            <span class="papelera-alerta-fecha">${fechaAmigable}</span>
        </div>
    `;
};

const crearInfoIniciadorDesconocido = () => {
    return `
        <div class="alert alert-warning papelera-alerta-iniciador">
            <b> Sistema Antiguo:</b> Autor Desconocido
        </div>
    `;
};

const crearInfoIniciador = (doc) => {
    const primerVoto = obtenerPrimerVoto(doc);
    if (primerVoto) {
        return crearInfoIniciadorConocido(primerVoto);
    }
    return crearInfoIniciadorDesconocido();
};

const crearInfoDocumento = (doc, votosActuales) => {
    const info = document.createElement('div');
    info.className = 'papelera-info';
    
    const infoIniciador = crearInfoIniciador(doc);
    
    info.innerHTML = `
        <h3 class="papelera-info-titulo">
            ${doc.titulo} 
            <span class="badge badge-faltante">En Papelera</span>
        </h3>
        <p class="papelera-info-descripcion">${doc.descripcion || 'Sin descripción'}</p>
        
        ${infoIniciador}
        
        <p class="papelera-info-votos">
            Votos actuales para borrado permanente: ${votosActuales} / 3
        </p>
    `;
    
    return info;
};

const actualizarContadorVotos = (info, votosActuales) => {
    const parrafo = info.querySelector('.papelera-info-votos');
    parrafo.innerText = `Votos actuales para borrado permanente: ${votosActuales + 1} / 3`;
};

const manejarRespuestaVoto = (res, tarjeta, lista, info, votosActuales) => {
    mostrarPopup('success', res.mensaje);
    
    if (res.borradoReal) {
        tarjeta.remove();
        if (listaEstaVacia(lista)) {
            mostrarPapeleraVacia(lista);
        }
    } else {
        actualizarContadorVotos(info, votosActuales);
    }
};

const restaurarDocumento = async (docId, tarjeta, lista) => {
    try {
        const res = await api.votarPapelera(docId, 'rechazar');
        mostrarPopup('success', res.mensaje);
        tarjeta.remove();
        
        if (listaEstaVacia(lista)) {
            mostrarPapeleraVacia(lista);
        }
    } catch (error) {
        mostrarPopup('error', error.message);
    }
};

const confirmarBorrado = async (docId, tarjeta, lista, info, votosActuales) => {
    try {
        const res = await api.votarPapelera(docId, 'aprobar');
        manejarRespuestaVoto(res, tarjeta, lista, info, votosActuales);
    } catch (error) {
        mostrarPopup('error', error.message);
    }
};

const crearBotonRestaurar = (docId, tarjeta, lista) => {
    const btn = document.createElement('button');
    btn.innerText = 'Rechazar Borrado';
    btn.className = 'btn btn-outline';
    
    btn.addEventListener('click', async () => {
        await restaurarDocumento(docId, tarjeta, lista);
    });
    
    return btn;
};

const crearBotonConfirmar = (docId, tarjeta, lista, info, votosActuales) => {
    const btn = document.createElement('button');
    btn.innerText = 'Confirmar Borrado';
    btn.className = 'btn btn-secondary';
    
    btn.addEventListener('click', async () => {
        await confirmarBorrado(docId, tarjeta, lista, info, votosActuales);
    });
    
    return btn;
};

const crearCajaBotones = (docId, tarjeta, lista, info, votosActuales) => {
    const caja = document.createElement('div');
    caja.className = 'papelera-caja-botones';
    
    const btnConfirmar = crearBotonConfirmar(docId, tarjeta, lista, info, votosActuales);
    const btnRestaurar = crearBotonRestaurar(docId, tarjeta, lista);
    
    caja.append(btnConfirmar, btnRestaurar);
    return caja;
};

const crearTarjetaDocumento = (doc, lista) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'card papelera-tarjeta';
    
    const votosActuales = contarVotos(doc);
    
    const info = crearInfoDocumento(doc, votosActuales);
    const cajaBotones = crearCajaBotones(doc.id, tarjeta, lista, info, votosActuales);
    
    tarjeta.append(info, cajaBotones);
    return tarjeta;
};

const crearTitulo = () => {
    const titulo = document.createElement('h2');
    titulo.innerText = 'Papelera de Seguridad';
    titulo.className = 'papelera-titulo';
    return titulo;
};

const crearSubtitulo = () => {
    const subtitulo = document.createElement('p');
    subtitulo.innerText = 'Documentos en papelera. Se requieren 3 votos de administradores diferentes para su eliminacion total.';
    subtitulo.className = 'papelera-subtitulo';
    return subtitulo;
};

const crearLista = () => {
    const lista = document.createElement('div');
    lista.className = 'papelera-lista';
    return lista;
};

const crearContenedorPrincipal = () => {
    const contenedor = document.createElement('div');
    contenedor.className = 'papelera-contenedor';
    return contenedor;
};

const renderizarDocumentos = (documentos, lista) => {
    if (documentos.length === 0) {
        lista.append(crearMensajeVacio());
        return;
    }
    
    documentos.forEach(doc => {
        const tarjeta = crearTarjetaDocumento(doc, lista);
        lista.append(tarjeta);
    });
};

export const Papelera = async () => {
    const contenedor = crearContenedorPrincipal();
    const titulo = crearTitulo();
    const subtitulo = crearSubtitulo();
    const lista = crearLista();
    
    try {
        const documentos = await api.obtenerPapelera();
        renderizarDocumentos(documentos, lista);
    } catch (error) {
        lista.append(crearMensajeError(error.message));
    }
    
    contenedor.append(titulo, subtitulo, lista);
    return contenedor;
};