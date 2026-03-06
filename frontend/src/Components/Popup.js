// frontend/src/Components/Popup.js

export const mostrarPopup = (tipo, mensaje, autoCloseMs = 3000) => {
    // Tipos válidos: 'success', 'error', 'warning'
    
    // 1. Crear el fondo oscuro
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    // 2. Crear la caja del popup
    const popup = document.createElement('div');
    popup.className = `popup ${tipo}`;

    // 3. Crear el ícono
    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    if (tipo === 'success') icon.innerText = '✓';
    if (tipo === 'error') icon.innerText = '✕';
    if (tipo === 'warning') icon.innerText = '⚠';

    // 4. Crear el texto
    const text = document.createElement('div');
    text.className = 'popup-message';
    text.innerText = mensaje;

    // 5. Ensamblar
    popup.append(icon, text);
    overlay.append(popup);

    // 6. Eventos para cerrar manual o automáticamente
    overlay.addEventListener('click', () => overlay.remove());
    popup.addEventListener('click', (e) => e.stopPropagation()); // Evita que se cierre al hacer clic en la caja

    // 7. Mostrar en pantalla
    document.body.appendChild(overlay);

    if (autoCloseMs > 0) {
        setTimeout(() => {
            if (document.body.contains(overlay)) overlay.remove();
        }, autoCloseMs);
    }
};