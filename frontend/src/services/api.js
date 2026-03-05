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
        // Le pegamos el ID del admin que inició sesión
        documento.usuarioId = sessionStorage.getItem('adminId'); 
        
        const respuesta = await fetch(`${API_URL}/documentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documento)
        });
        if (!respuesta.ok) throw new Error('Falló al guardar en BD');
        return await respuesta.json();
    },

    editarDocumento: async (id, datosActualizados) => {
        datosActualizados.usuarioId = sessionStorage.getItem('adminId');
        
        const respuesta = await fetch(`${API_URL}/documentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        if (!respuesta.ok) throw new Error('Falló al actualizar en BD');
        return await respuesta.json();
    },

    // Para eliminar, ahora enviamos el ID en el "cuerpo" del mensaje
    eliminarDocumento: async (id) => {
        const respuesta = await fetch(`${API_URL}/documentos/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: sessionStorage.getItem('adminId') })
        });
        
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Falló al eliminar');
        }
        return await respuesta.json();
    },

    obtenerPapelera: async () => {
        const respuesta = await fetch(`${API_URL}/documentos/estado/papelera`);
        if (!respuesta.ok) throw new Error('Falló al traer la papelera');
        return await respuesta.json();
    },

    votarPapelera: async (id, decision) => {
        const respuesta = await fetch(`${API_URL}/documentos/${id}/votar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: sessionStorage.getItem('adminId'),
                decision: decision
            })
        });
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error);
        }
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
    },

    obtenerAuditoria: async (inicio, fin) => {
        const respuesta = await fetch(`${API_URL}/documentos/estado/auditoria?inicio=${inicio}&fin=${fin}`);
        if (!respuesta.ok) throw new Error('Falló al traer la auditoría');
        return await respuesta.json();
    },

    // ======== GESTIÓN DE PERSONAL ========
    obtenerUsuarios: async () => {
        const respuesta = await fetch(`http://${window.location.hostname}:3001/api/auth/usuarios`);
        return await respuesta.json();
    },

    crearUsuario: async (datos) => {
        datos.creadorId = sessionStorage.getItem('adminId'); // Etiquetamos quién da la orden
        const respuesta = await fetch(`http://${window.location.hostname}:3001/api/auth/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.error);
        return data;
    },

    eliminarUsuario: async (id) => {
        // Pasamos el ID del Jefe en la URL por seguridad
        const creadorId = sessionStorage.getItem('adminId');
        const respuesta = await fetch(`http://${window.location.hostname}:3001/api/auth/usuarios/${id}?creadorId=${creadorId}`, { 
            method: 'DELETE' 
        });
        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.error);
        return data;
    }
};