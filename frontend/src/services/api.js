const HOST = window.location.hostname;
const API_URL = `http://${HOST}:3001/api`;
const AUTH_URL = `http://${HOST}:3001/api/auth`;


const obtenerUsuarioId = () => {
    return sessionStorage.getItem('adminId');
};

const construirQueryParams = (filtros) => {
    return new URLSearchParams(filtros).toString();
};

const manejarRespuesta = async (respuesta, mensajeError) => {
    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.error || mensajeError);
    }
    return await respuesta.json();
};


const obtenerDocumentos = async (filtros = {}) => {
    try {
        const queryParams = construirQueryParams(filtros);
        const respuesta = await fetch(`${API_URL}/documentos?${queryParams}`);
        return await manejarRespuesta(respuesta, 'El servidor falló al traer los datos');
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        throw error;
    }
};

const guardarDocumento = async (documento) => {
    documento.usuarioId = obtenerUsuarioId();
    
    const respuesta = await fetch(`${API_URL}/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documento)
    });
    
    return await manejarRespuesta(respuesta, 'Falló al guardar en BD');
};

const editarDocumento = async (id, datosActualizados) => {
    datosActualizados.usuarioId = obtenerUsuarioId();
    
    const respuesta = await fetch(`${API_URL}/documentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
    });
    
    return await manejarRespuesta(respuesta, 'Falló al actualizar en BD');
};

const eliminarDocumento = async (id) => {
    const respuesta = await fetch(`${API_URL}/documentos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: obtenerUsuarioId() })
    });
    
    return await manejarRespuesta(respuesta, 'Falló al eliminar');
};


const obtenerPapelera = async () => {
    const respuesta = await fetch(`${API_URL}/documentos/estado/papelera`);
    return await manejarRespuesta(respuesta, 'Falló al traer la papelera');
};

const votarPapelera = async (id, decision) => {
    const respuesta = await fetch(`${API_URL}/documentos/${id}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuarioId: obtenerUsuarioId(),
            decision: decision
        })
    });
    
    return await manejarRespuesta(respuesta, 'Falló al votar');
};



const subirArchivoFisico = async (archivo) => {
    const formData = new FormData();
    formData.append('archivoFisico', archivo);
    
    const respuesta = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
    });
    
    const data = await manejarRespuesta(respuesta, 'Falló al subir archivo físico');
    return data.url;
};

const eliminarArchivoFisico = async (ruta) => {
    await fetch(`${API_URL}/upload`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruta })
    });
};


const obtenerAuditoria = async (inicio, fin) => {
    const respuesta = await fetch(`${API_URL}/documentos/estado/auditoria?inicio=${inicio}&fin=${fin}`);
    return await manejarRespuesta(respuesta, 'Falló al traer la auditoría');
};

const obtenerGestionesUnicas = async () => {
    const respuesta = await fetch(`${API_URL}/documentos/estado/gestiones`);
    
    if (!respuesta.ok) return [];
    
    return await respuesta.json();
};


const obtenerUsuarios = async () => {
    const respuesta = await fetch(`${AUTH_URL}/usuarios`);
    return await respuesta.json();
};

const crearUsuario = async (datos) => {
    datos.creadorId = obtenerUsuarioId();
    
    const respuesta = await fetch(`${AUTH_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    
    return await manejarRespuesta(respuesta, 'Falló al crear usuario');
};

const eliminarUsuario = async (id) => {
    const creadorId = obtenerUsuarioId();
    const respuesta = await fetch(`${AUTH_URL}/usuarios/${id}?creadorId=${creadorId}`, {
        method: 'DELETE'
    });
    
    return await manejarRespuesta(respuesta, 'Falló al eliminar usuario');
};


export const api = {

    obtenerDocumentos,
    guardarDocumento,
    editarDocumento,
    eliminarDocumento,
    

    obtenerPapelera,
    votarPapelera,
    

    subirArchivoFisico,
    eliminarArchivoFisico,
    

    obtenerAuditoria,
    obtenerGestionesUnicas,
    

    obtenerUsuarios,
    crearUsuario,
    eliminarUsuario
};