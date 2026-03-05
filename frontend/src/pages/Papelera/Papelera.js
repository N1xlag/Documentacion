import { api } from '../../services/api.js';

export const Papelera = async () => {
    const contenedor = document.createElement('div');
    contenedor.style.padding = '30px';
    contenedor.style.maxWidth = '900px';
    contenedor.style.margin = '0 auto';

    const titulo = document.createElement('h2');
    titulo.innerText = '🗑️ Papelera de Seguridad (Requiere 3 Votos)';
    titulo.style.color = '#b91c1c'; // Rojo oscuro
    titulo.style.borderBottom = '2px solid #fca5a5';
    titulo.style.paddingBottom = '10px';

    const lista = document.createElement('div');
    lista.style.display = 'flex';
    lista.style.flexDirection = 'column';
    lista.style.gap = '15px';
    lista.style.marginTop = '20px';

    try {
        const documentos = await api.obtenerPapelera();

        if (documentos.length === 0) {
            lista.innerHTML = '<p style="color: #64748b; font-style: italic;">La papelera está vacía. No hay documentos pendientes de borrado.</p>';
        } else {
            documentos.forEach(doc => {
                const tarjeta = document.createElement('div');
                tarjeta.style.border = '1px solid #f87171';
                tarjeta.style.backgroundColor = '#fef2f2';
                tarjeta.style.borderRadius = '8px';
                tarjeta.style.padding = '15px 20px';
                tarjeta.style.display = 'flex';
                tarjeta.style.justifyContent = 'space-between';
                tarjeta.style.alignItems = 'center';

                // Info del documento
                const info = document.createElement('div');
                const numVotos = doc.votosBorrados ? doc.votosBorrados.length : 1;
                info.innerHTML = `
                    <h3 style="margin: 0 0 5px 0; color: #7f1d1d;">${doc.titulo}</h3>
                    <p style="margin: 0; font-size: 14px; color: #991b1b;">Categoría: ${doc.categoria} | Subido: ${doc.fecha}</p>
                    <p style="margin: 8px 0 0 0; font-weight: bold; color: #dc2626; font-size: 15px;">
                        ⚠️ Votos actuales para destruir: ${numVotos} / 3
                    </p>
                `;

                // Botones
                const cajaBotones = document.createElement('div');
                cajaBotones.style.display = 'flex';
                cajaBotones.style.gap = '10px';

                const btnRestaurar = document.createElement('button');
                btnRestaurar.innerText = '❌ No Borrar (Restaurar)';
                btnRestaurar.className = 'admin-btn'; // Usamos estilos que ya tienes
                btnRestaurar.style.backgroundColor = '#10b981';

                const btnConfirmar = document.createElement('button');
                btnConfirmar.innerText = '✅ Confirmar Borrado';
                btnConfirmar.className = 'admin-btn';
                btnConfirmar.style.backgroundColor = '#ef4444';

                // EVENTOS DE LOS BOTONES
                btnRestaurar.addEventListener('click', async () => {
                    try {
                        const res = await api.votarPapelera(doc.id, 'rechazar');
                        alert(res.mensaje);
                        tarjeta.remove(); // Desaparece de la papelera
                    } catch (error) { alert(error.message); }
                });

                btnConfirmar.addEventListener('click', async () => {
                    try {
                        const res = await api.votarPapelera(doc.id, 'aprobar');
                        alert(res.mensaje);
                        if (res.borradoReal) {
                            tarjeta.remove(); // Llegó a 3 y se destruyó
                        } else {
                            // Actualizamos el contador de votos visualmente
                            info.querySelector('p:last-child').innerText = `⚠️ Votos actuales para destruir: ${numVotos + 1} / 3`;
                        }
                    } catch (error) { alert(error.message); } // Avisa si el admin ya había votado
                });

                cajaBotones.append(btnRestaurar, btnConfirmar);
                tarjeta.append(info, cajaBotones);
                lista.append(tarjeta);
            });
        }
    } catch (error) {
        lista.innerHTML = '<p style="color: red;">Error de red al cargar la papelera.</p>';
    }

    contenedor.append(titulo, lista);
    return contenedor;
};