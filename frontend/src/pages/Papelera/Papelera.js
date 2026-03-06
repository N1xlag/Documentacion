import { api } from '../../services/api.js';
import { mostrarPopup } from '../../components/Popup.js';

export const Papelera = async () => {
    const contenedor = document.createElement('div');
    contenedor.style.padding = 'var(--spacing-xl)';
    contenedor.style.maxWidth = '900px';
    contenedor.style.margin = '0 auto';

    const titulo = document.createElement('h2');
    titulo.innerText = 'Papelera de Seguridad';
    titulo.style.color = 'var(--color-secundario)'; 
    titulo.style.borderBottom = '2px solid var(--border-color)';
    titulo.style.paddingBottom = '10px';

    const subtitulo = document.createElement('p');
    subtitulo.innerText = 'Documentos en papelera. Se requieren 3 votos de administradores diferentes para su eliminacion total.';
    subtitulo.style.color = 'var(--text-secundario)';
    subtitulo.style.marginTop = '10px';

    const lista = document.createElement('div');
    lista.style.display = 'flex';
    lista.style.flexDirection = 'column';
    lista.style.gap = 'var(--spacing-md)';
    lista.style.marginTop = 'var(--spacing-lg)';

    try {
        const documentos = await api.obtenerPapelera();

        if (documentos.length === 0) {
            lista.innerHTML = `<div class="alert alert-info" style="text-align: center; padding: var(--spacing-lg);">La papelera está vacía. No hay documentos pendientes de borrado.</div>`;
        } else {
            documentos.forEach(doc => {
                // Tarjeta principal del documento
                const tarjeta = document.createElement('div');
                tarjeta.className = 'card';
                tarjeta.style.padding = 'var(--spacing-lg)';
                tarjeta.style.display = 'flex';
                tarjeta.style.justifyContent = 'space-between';
                tarjeta.style.alignItems = 'center';
                tarjeta.style.borderLeft = '4px solid var(--color-secundario)'; // Borde rojo a la izquierda para alertar

                const votosActuales = doc.votosBorrados ? doc.votosBorrados.length : 0;
                
                // Etiqueta de quién lo mandó a la papelera
                let infoIniciador = '';
                if (doc.votosBorrados && doc.votosBorrados.length > 0) {
                    const primerVoto = doc.votosBorrados[0];
                    const fechaAmigable = new Date(primerVoto.fecha).toLocaleString();
                    
                    infoIniciador = `
                        <div class="alert alert-error" style="display: inline-block; padding: var(--spacing-sm) var(--spacing-md); margin: var(--spacing-sm) 0;">
                            <b>Enviado por:</b> ${primerVoto.usuario?.nombre || 'Desconocido'} <br>
                            <span style="font-size: var(--font-size-xs);">${fechaAmigable}</span>
                        </div>
                    `;
                } else {
                    infoIniciador = `
                        <div class="alert alert-warning" style="display: inline-block; padding: var(--spacing-sm) var(--spacing-md); margin: var(--spacing-sm) 0;">
                            <b> Sistema Antiguo:</b> Autor Desconocido
                        </div>
                    `;
                }

                // Información del documento
                const info = document.createElement('div');
                info.style.flex = '1';
                info.innerHTML = `
                    <h3 style="margin: 0; color: var(--text-principal); display: flex; align-items: center; gap: var(--spacing-sm);">
                        ${doc.titulo} 
                        <span class="badge badge-faltante">En Papelera</span>
                    </h3>
                    <p style="color: var(--text-secundario); margin: var(--spacing-sm) 0; font-size: var(--font-size-sm);">${doc.descripcion || 'Sin descripción'}</p>
                    
                    ${infoIniciador}
                    
                    <p style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-secundario);">
                        Votos actuales para borrado permanente: ${votosActuales} / 3
                    </p>
                `;

                // Botones
                const cajaBotones = document.createElement('div');
                cajaBotones.style.display = 'flex';
                cajaBotones.style.gap = 'var(--spacing-sm)';
                cajaBotones.style.flexDirection = 'column'; // Apilamos los botones

                // Usamos botones del design system
                const btnRestaurar = document.createElement('button');
                btnRestaurar.innerText = 'Rechazar Borrado';
                btnRestaurar.className = 'btn btn-outline'; 
                
                const btnConfirmar = document.createElement('button');
                btnConfirmar.innerText = 'Confirmar Borrado';
                btnConfirmar.className = 'btn btn-secondary';

                btnRestaurar.addEventListener('click', async () => {
                    try {
                        const res = await api.votarPapelera(doc.id, 'rechazar');
                        mostrarPopup('success', res.mensaje);
                        tarjeta.remove(); 
                        if(lista.children.length === 0) lista.innerHTML = `<div class="alert alert-info">Papelera vacía.</div>`;
                    } catch (error) { mostrarPopup('error', error.message); }
                });

                btnConfirmar.addEventListener('click', async () => {
                    try {
                        const res = await api.votarPapelera(doc.id, 'aprobar');
                        mostrarPopup('success', res.mensaje);
                        if (res.borradoReal) {
                            tarjeta.remove(); 
                            if(lista.children.length === 0) lista.innerHTML = `<div class="alert alert-info">Papelera vacía.</div>`;
                        } else {
                            info.querySelector('p:last-child').innerText = `Votos actuales para borrado permanente: ${votosActuales + 1} / 3`;
                        }
                    } catch (error) { mostrarPopup('error', error.message); } 
                });

                cajaBotones.append(btnConfirmar, btnRestaurar);
                tarjeta.append(info, cajaBotones);
                lista.append(tarjeta);
            });
        }
    } catch (error) {
        lista.innerHTML = `<div class="alert alert-error">Error al cargar la papelera: ${error.message}</div>`;
    }

    contenedor.append(titulo, subtitulo, lista);
    return contenedor;
};