// src/components/Popup.js
import './Popup.css';

export const mostrarPopup = (tipo, mensaje, autoCloseMs = 3000) => {
    // 1. Si ya hay un popup abierto, lo borramos para no encimar
    const popupExistente = document.getElementById('sistema-popup');
    if (popupExistente) popupExistente.remove();

    // 2. Creamos el fondo oscuro (Overlay)
    const overlay = document.createElement('div');
    overlay.id = 'sistema-popup';
    overlay.className = 'popup-overlay';

    // 3. Creamos la caja blanca del mensaje
    const popupBox = document.createElement('div');
    popupBox.className = `popup ${tipo}`; // Agrega 'success', 'error' o 'warning'

    // 4. Creamos el icono
    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    if (tipo === 'success') icon.innerText = '✓';
    if (tipo === 'error') icon.innerText = '✕';
    if (tipo === 'warning') icon.innerText = '⚠';

    // 5. Creamos el texto
    const text = document.createElement('div');
    text.className = 'popup-message';
    text.innerText = mensaje;

    // Unimos todo
    popupBox.append(icon, text);
    overlay.append(popupBox);

    // Lógica para cerrar si hacen clic afuera de la caja blanca
    const cerrarPopup = () => overlay.remove();
    overlay.addEventListener('click', cerrarPopup);
    popupBox.addEventListener('click', (e) => e.stopPropagation()); // Evita que se cierre si tocan la caja blanca

    // Inyectamos el popup directamente en el body (por encima de todo el sistema)
    document.body.append(overlay);

    // Lógica para que se cierre solo después de unos segundos
    if (autoCloseMs > 0) {
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                cerrarPopup();
            }
        }, autoCloseMs);
    }
};