// src/components/InputGenerico.js

export const InputGenerico = (texto, subtexto, tipo = 'text', opciones = []) => {
    const contenedor = document.createElement('div');
    contenedor.className = 'form-group'; 

    const label = document.createElement('label');
    label.innerText = texto;

    let input;
    if (tipo === 'select') {
        input = document.createElement('select');
        opciones.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.innerText = op;
            input.append(option);
        });
    } else {
        input = document.createElement('input');
        input.type = tipo;
        input.placeholder = subtexto;
    }
    
    input.className = 'form-input';
    input.dataset.nombre = texto; 

    contenedor.append(label, input);
    
    return { contenedor, input }; 
};