import { api } from '../../services/api.js';
import './Auditoria.css'; 

let registrosActuales = [];

const obtenerFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
};

const obtenerFechaHaceUnMes = () => {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setDate(hoy.getDate() - 30);
    return haceUnMes.toISOString().split('T')[0];
};

const formatearFechaAmigable = (fecha) => {
    return new Date(fecha).toLocaleString();
};

const obtenerColorAccion = (accion) => {
    if (accion.includes('CREÓ')) return '#10b981';
    if (accion.includes('BORRADO') || accion.includes('ELIMINADO') || accion.includes('DESACTIVÓ')) return '#ef4444';
    if (accion.includes('EDITÓ')) return '#f59e0b';
    if (accion.includes('CUENTA')) return '#3b82f6';
    return 'black';
};

const obtenerDocumentoAfectado = (registro) => {
    if (registro.documento) return registro.documento.titulo;
    if (registro.accion.includes('CUENTA')) return '<span style="color: var(--text-disabled); font-weight: bold;">-</span>';
    return '<span style="color: var(--text-disabled); font-style: italic; font-size: 12px;">(Histórico)</span>';
};

const crearFilaTabla = (registro) => {
    const fechaAmigable = formatearFechaAmigable(registro.fecha);
    const afectado = obtenerDocumentoAfectado(registro);
    const colorAccion = obtenerColorAccion(registro.accion);
    
    return `
        <tr class="auditoria-tabla-fila">
            <td class="auditoria-tabla-celda">${fechaAmigable}</td>
            <td class="auditoria-tabla-celda auditoria-celda-usuario">${registro.usuario.nombre}</td>
            <td class="auditoria-tabla-celda auditoria-celda-accion" style="color: ${colorAccion};">${registro.accion}</td>
            <td class="auditoria-tabla-celda">${afectado}</td>
            <td class="auditoria-tabla-celda auditoria-celda-firma">
                ${registro.hashSeguro}
            </td>
        </tr>
    `;
};

const crearCabeceraTabla = () => {
    return `
        <thead>
            <tr class="auditoria-tabla-cabecera">
                <th class="auditoria-tabla-th">Fecha y Hora Exacta</th>
                <th class="auditoria-tabla-th">Usuario</th>
                <th class="auditoria-tabla-th">Acción Realizada</th>
                <th class="auditoria-tabla-th">Doc Afectado</th>
                <th class="auditoria-tabla-th">Firma</th>
            </tr>
        </thead>
    `;
};

const crearTablaCompleta = (registros) => {
    let tablaHTML = `
        <table class="auditoria-tabla">
            ${crearCabeceraTabla()}
            <tbody>
    `;
    registros.forEach(registro => { tablaHTML += crearFilaTabla(registro); });
    tablaHTML += `</tbody></table>`;
    return tablaHTML;
};

const crearMensajeBuscando = () => '<p class="auditoria-mensaje-buscando">Buscando...</p>';
const crearMensajeVacio = () => '<p class="auditoria-mensaje-vacio">No hubo movimientos en esas fechas.</p>';
const crearMensajeError = (mensaje) => `<p class="auditoria-mensaje-error">Error: ${mensaje}</p>`;
const validarFechas = (inicio, fin) => inicio && fin;

const renderizarResultados = (registros, cajaResultados) => {
    if (registros.length === 0) {
        cajaResultados.innerHTML = crearMensajeVacio();
        return;
    }
    cajaResultados.innerHTML = crearTablaCompleta(registros);
};

const exportarExcel = () => {
    if (registrosActuales.length === 0) return;

    let csvContent = "\uFEFF";
    csvContent += "Fecha y Hora,Usuario,Accion Realizada,Documento Afectado,Firma Criptografica\n";

    registrosActuales.forEach(reg => {

        const fecha = formatearFechaAmigable(reg.fecha).replace(/,/g, '');
        const usuario = reg.usuario.nombre;
        const accion = reg.accion;
        
        let afectado = "N/A";
        if (reg.documento) afectado = reg.documento.titulo;
        else if (!reg.accion.includes('CUENTA')) afectado = "(Histórico)";

        const firma = reg.hashSeguro;


        const fila = `"${fecha}","${usuario}","${accion}","${afectado}","${firma}"`;
        csvContent += fila + "\n";
    });


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Auditoria_${obtenerFechaHoy()}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const buscarAuditoria = async (inicio, fin, cajaResultados, btnExcel) => {
    if (!validarFechas(inicio, fin)) return alert("Selecciona ambas fechas");
    
    cajaResultados.innerHTML = crearMensajeBuscando();
    btnExcel.style.display = 'none'; 
    
    try {
        const registros = await api.obtenerAuditoria(inicio, fin); 
        registrosActuales = registros; 
        
        renderizarResultados(registros, cajaResultados);
        
        if(registros.length > 0) {
            btnExcel.style.display = 'block';
        }
    } catch (error) {
        cajaResultados.innerHTML = crearMensajeError(error.message);
    }
};

const configurarFechasIniciales = (inputInicio, inputFin) => {
    inputFin.value = obtenerFechaHoy();
    inputInicio.value = obtenerFechaHaceUnMes();
};

const configurarEventos = (btnBuscar, btnExcel, inputInicio, inputFin, cajaResultados) => {
    btnBuscar.addEventListener('click', async () => {
        await buscarAuditoria(inputInicio.value, inputFin.value, cajaResultados, btnExcel);
    });
    
    btnExcel.addEventListener('click', exportarExcel);
};

const crearHTML = () => {
    return `
        <h2 class="auditoria-titulo">
             Registro Oficial de Movimientos (Auditoría)
        </h2>
        <p class="auditoria-descripcion">
            Este registro está protegido por criptografía (Hash). Cualquier manipulación manual en la base de datos invalidará estas firmas, garantizando que las fechas y acciones mostradas son 100% reales e inalterables.
        </p>
        
        <div class="auditoria-filtros">
            <div class="auditoria-grupo-input">
                <label class="auditoria-label">Fecha Inicio:</label>
                <input type="date" id="audit-inicio" class="auditoria-input">
            </div>
            <div class="auditoria-grupo-input">
                <label class="auditoria-label">Fecha Fin:</label>
                <input type="date" id="audit-fin" class="auditoria-input">
            </div>
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <button id="btn-buscar-audit" class="auditoria-btn-buscar" style="flex: 1;">
                    Generar
                </button>
                <button id="btn-descargar-excel" class="auditoria-btn-descargar" style="flex: 1; display: none;">
                    Descargar Excel
                </button>
            </div>
        </div>

        <div id="caja-resultados-audit" class="auditoria-caja-resultados"></div>
    `;
};

const inicializarComponente = () => {
    const btnBuscar = document.getElementById('btn-buscar-audit');
    const btnExcel = document.getElementById('btn-descargar-excel');
    const inputInicio = document.getElementById('audit-inicio');
    const inputFin = document.getElementById('audit-fin');
    const cajaResultados = document.getElementById('caja-resultados-audit');
    
    configurarFechasIniciales(inputInicio, inputFin);
    configurarEventos(btnBuscar, btnExcel, inputInicio, inputFin, cajaResultados);
};

export const Auditoria = () => {
    const contenedor = document.createElement('div');
    contenedor.className = 'auditoria-contenedor'; 
    contenedor.innerHTML = crearHTML();
    setTimeout(inicializarComponente, 100);
    return contenedor;
};