// frontend/src/services/api.js

// EL TRUCO MAESTRO: Detecta automáticamente la IP o el localhost
// Si entras desde 192.168.1.50, se conectará a 192.168.1.50:3001
const HOST = window.location.hostname;
const API_URL = `http://${HOST}:3001/api`;

export const api = {
    // Le pasamos los filtros a la URL para que el backend haga el trabajo sucio
    obtenerDocumentos: async (filtros = {}) => {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const respuesta = await fetch(`${API_URL}/documentos?${queryParams}`);
            
            // AGREGAMOS ESTA LÍNEA PARA EVITAR EL ERROR DEL .MAP()
            if (!respuesta.ok) throw new Error('El servidor falló al traer los datos'); 
            
            return await respuesta.json();
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            throw error; // Esto hará que Buscador.js atrape el error
        }
    },

    guardarDocumento: async (documento) => {
        const respuesta = await fetch(`${API_URL}/documentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documento)
        });
        if (!respuesta.ok) throw new Error('Falló al guardar en BD');
        return await respuesta.json();
    },

    editarDocumento: async (id, datosActualizados) => {
        const respuesta = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        if (!respuesta.ok) throw new Error('Falló al actualizar en BD');
        return await respuesta.json();
    },

    eliminarDocumento: async (id) => {
        const respuesta = await fetch(`${API_URL}/documentos/${id}`, { method: 'DELETE' });
        if (!respuesta.ok) throw new Error('Falló al eliminar');
        return await respuesta.json();
    },

    subirArchivoFisico: async (archivo) => {
        const formData = new FormData();
        formData.append('archivoFisico', archivo);
        
        const respuesta = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!respuesta.ok) throw new Error('Falló al subir archivo físico');
        const data = await respuesta.json();
        return data.url; 
    },

    // NUEVO: Función para limpiar basura si ocurre un error
    eliminarArchivoFisico: async (ruta) => {
        await fetch(`${API_URL}/upload`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruta })
        });
    }
};