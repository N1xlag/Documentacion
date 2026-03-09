export const mostrarPopup = (tipo, mensaje, autoCloseMs = 3000) => {

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';


    const popup = document.createElement('div');
    popup.className = `popup ${tipo}`;

    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    if (tipo === 'success') icon.innerText = '✓';
    if (tipo === 'error') icon.innerText = '✕';
    if (tipo === 'warning') icon.innerText = '⚠';


    const text = document.createElement('div');
    text.className = 'popup-message';
    text.innerText = mensaje;

    popup.append(icon, text);
    overlay.append(popup);

    overlay.addEventListener('click', () => overlay.remove());
    popup.addEventListener('click', (e) => e.stopPropagation()); 

    document.body.appendChild(overlay);

    if (autoCloseMs > 0) {
        setTimeout(() => {
            if (document.body.contains(overlay)) overlay.remove();
        }, autoCloseMs);
    }
};