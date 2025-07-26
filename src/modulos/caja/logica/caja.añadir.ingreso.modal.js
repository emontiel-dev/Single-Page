import { registrarIngresoManual } from './caja.logica.js';

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
// AÑADIDO: Colores para mimetismo con la vista de caja
const denominacionColors = {
    1000: '#A774F2', 500: '#3498DB', 200: '#2ECC71', 100: '#E74C3C',
    50: '#F1C40F', 20: '#E67E22', 10: '#95A5A6', 5: '#7D3C98',
    2: '#1ABC9C', 1: '#34495E', 0.5: '#F39C12'
};

function closeIngresoModal() {
    if (modalElement) {
        modalElement.classList.remove('visible');
        modalElement.addEventListener('transitionend', () => {
            modalElement.remove();
            modalElement = null;
        }, { once: true });
    }
}

function handleGuardarIngreso() {
    const concepto = modalElement.querySelector('#ingreso-concepto-input').value.trim();
    if (!concepto) {
        alert('Por favor, ingrese un concepto para el ingreso.');
        return;
    }

    let totalMonto = 0;
    const ingresoDenominaciones = {};

    denominaciones.forEach(valor => {
        const inputId = `ingreso-denominacion-${String(valor).replace('.', '')}`;
        const input = modalElement.querySelector(`#${inputId}`);
        const cantidad = parseInt(input.value, 10) || 0;

        if (cantidad > 0) {
            totalMonto += valor * cantidad;
            ingresoDenominaciones[valor] = cantidad;
        }
    });

    if (totalMonto <= 0) {
        alert('Por favor, ingrese la cantidad de al menos una denominación.');
        return;
    }

    // Llamar a la función de la lógica de caja para registrar todo
    registrarIngresoManual(concepto, totalMonto, ingresoDenominaciones);

    console.log('Guardando ingreso:', { concepto, totalMonto, ingresoDenominaciones });
    closeIngresoModal();
}

function renderIngresoInputs() {
    const grid = modalElement.querySelector('#ingreso-denominaciones-grid');
    if (!grid) return;

    grid.innerHTML = '';
    denominaciones.forEach(valor => {
        const inputId = `ingreso-denominacion-${String(valor).replace('.', '')}`;
        const group = document.createElement('div');
        group.className = 'denominacion-input-group';
        const color = denominacionColors[valor] || '#7f8c8d';

        // MODIFICADO: Estructura para mimetismo con la vista de caja
        group.innerHTML = `
            <span class="denominacion-valor" style="background-color: ${color};">${valor}</span>
            <input type="number" id="${inputId}" placeholder="0" min="0" inputmode="numeric" pattern="[0-9]*">
        `;
        grid.appendChild(group);
    });
}

export async function openAñadirIngresoModal() {
    if (modalElement) return;

    try {
        const response = await fetch('src/modulos/caja/views/caja.añadir.ingreso.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-ingreso-modal-container');

        renderIngresoInputs();

        modalElement.querySelector('#ingreso-modal-cancelar-btn').addEventListener('click', closeIngresoModal);
        modalElement.querySelector('#ingreso-modal-guardar-btn').addEventListener('click', handleGuardarIngreso);

        setTimeout(() => {
            if (modalElement) {
                modalElement.classList.add('visible');
            }
        }, 10);

    } catch (error) {
        console.error("Error al abrir el modal de ingreso:", error);
    }
}