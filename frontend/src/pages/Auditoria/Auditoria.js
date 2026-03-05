import { api } from '../../services/api.js';

export const Auditoria = () => {
    const contenedor = document.createElement('div');
    contenedor.style.padding = '30px';
    contenedor.style.maxWidth = '1000px';
    contenedor.style.margin = '0 auto';

    contenedor.innerHTML = `
        <h2 style="color: var(--color-secundario); border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
             Registro Oficial de Movimientos (Auditoría)
        </h2>
        <p style="color: #64748b; margin-bottom: 20px;">
            Este registro está protegido por criptografía (Hash). Cualquier manipulación manual en la base de datos invalidará estas firmas, garantizando que las fechas y acciones mostradas son 100% reales e inalterables.
        </p>
        
        <div style="display: flex; gap: 15px; align-items: flex-end; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 20px;">
            <div>
                <label style="display: block; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Fecha Inicio:</label>
                <input type="date" id="audit-inicio" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Fecha Fin:</label>
                <input type="date" id="audit-fin" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            </div>
            <button id="btn-buscar-audit" class="admin-btn" style="background: var(--color-primario); padding: 9px 20px; color: white; font-weight: bold; border-radius: 4px; cursor:pointer;">
                 Generar Reporte
            </button>
        </div>

        <div id="caja-resultados-audit" style="overflow-x: auto;">
            </div>
    `;

    // Lógica de búsqueda
    setTimeout(() => {
        const btnBuscar = document.getElementById('btn-buscar-audit');
        const inputInicio = document.getElementById('audit-inicio');
        const inputFin = document.getElementById('audit-fin');
        const cajaResultados = document.getElementById('caja-resultados-audit');

        // Ponemos la fecha de hoy por defecto en "Fin" y hace 30 días en "Inicio"
        const hoy = new Date();
        inputFin.value = hoy.toISOString().split('T')[0];
        const haceUnMes = new Date(); haceUnMes.setDate(hoy.getDate() - 30);
        inputInicio.value = haceUnMes.toISOString().split('T')[0];

        btnBuscar.addEventListener('click', async () => {
            if (!inputInicio.value || !inputFin.value) return alert("Selecciona ambas fechas");
            
            cajaResultados.innerHTML = '<p>Buscando en la bóveda de seguridad...</p>';
            
            try {
                const registros = await api.obtenerAuditoria(inputInicio.value, inputFin.value);
                
                if (registros.length === 0) {
                    cajaResultados.innerHTML = '<p style="color: #ef4444; font-weight:bold;">No hubo movimientos en esas fechas.</p>';
                    return;
                }

                // Armamos una tabla HTML clásica y profesional
                let tablaHTML = `
                    <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: #1e293b; color: white; text-align: left;">
                                <th style="padding: 12px; border: 1px solid #cbd5e1;">Fecha y Hora Exacta</th>
                                <th style="padding: 12px; border: 1px solid #cbd5e1;">Usuario</th>
                                <th style="padding: 12px; border: 1px solid #cbd5e1;">Acción Realizada</th>
                                <th style="padding: 12px; border: 1px solid #cbd5e1;">Documento Afectado</th>
                                <th style="padding: 12px; border: 1px solid #cbd5e1;">Firma Criptográfica (Inhackeable)</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                registros.forEach(reg => {
                    const fechaAmigable = new Date(reg.fecha).toLocaleString();
                    const nombreDoc = reg.documento ? reg.documento.titulo : '<i>Documento Destruido/No existe</i>';
                    
                    // Colorear las acciones para que sea más fácil leer
                    let colorAccion = 'black';
                    if (reg.accion.includes('CREÓ')) colorAccion = '#10b981'; // Verde
                    if (reg.accion.includes('BORRADO') || reg.accion.includes('DESTRUCCIÓN')) colorAccion = '#ef4444'; // Rojo
                    if (reg.accion.includes('EDITÓ')) colorAccion = '#f59e0b'; // Naranja

                    tablaHTML += `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px; font-size: 14px;">${fechaAmigable}</td>
                            <td style="padding: 10px; font-weight: bold; color: #334155;">${reg.usuario.nombre}</td>
                            <td style="padding: 10px; font-weight: bold; color: ${colorAccion};">${reg.accion}</td>
                            <td style="padding: 10px; font-size: 14px;">${nombreDoc}</td>
                            <td style="padding: 10px; font-family: monospace; font-size: 11px; color: #94a3b8; max-width: 200px; word-wrap: break-word;">
                                ${reg.hashSeguro}
                            </td>
                        </tr>
                    `;
                });

                tablaHTML += `</tbody></table>`;
                cajaResultados.innerHTML = tablaHTML;

            } catch (error) {
                cajaResultados.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        });
    }, 100); // Pequeño retraso para asegurar que el HTML se dibujó antes de buscar los IDs

    return contenedor;
};