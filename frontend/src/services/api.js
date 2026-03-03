// src/services/api.js
const API_URL = 'http://localhost:3001/api';

export const api = {
    obtenerDocumentos: async () => {
        try {
            const respuesta = await fetch(`${API_URL}/documentos`);
            if (!respuesta.ok) throw new Error('Error al conectar con el servidor');
            return await respuesta.json();
        } catch (error) {
            console.error('Error:', error);
            return []; 
        }
    },

    guardarDocumento: async (nuevoDocumento) => {
        try {
            const respuesta = await fetch(`${API_URL}/documentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoDocumento)
            });
            if (!respuesta.ok) throw new Error('Error al guardar');
            return await respuesta.json();
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },

    // ¡NUEVA FUNCIÓN PARA ARCHIVOS!
    subirArchivoFisico: async (archivoFile) => {
        // Creamos la "caja de encomienda"
        const formData = new FormData();
        formData.append('archivoFisico', archivoFile);

        try {
            const respuesta = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                // OJO: Con FormData el navegador pone el Content-Type automáticamente, no lo ponemos manual
                body: formData
            });
            if (!respuesta.ok) throw new Error('Error al subir el archivo');
            
            const resultado = await respuesta.json();
            return resultado.url; // Nos devuelve "/uploads/nombre-del-archivo.pdf"
        } catch (error) {
            console.error('Error al subir archivo:', error);
            throw error;
        }
    }
};