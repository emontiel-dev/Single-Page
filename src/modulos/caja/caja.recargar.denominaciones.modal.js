import { stockDenominaciones, registrarRecargaDenominaciones } from './caja.logica.js';

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];

// State for the two-step flow
let currentStep = 'egreso'; // 'egreso' or 'ingreso'
let denominacionesEgreso = {};
let totalEgreso = 0;

function closeRecargaModal() {
    if (modalElement) {
        modalElement.classList.remove('visible');
        modalElement.addEventListener('transitionend', () => {
            modalElement.remove();
            modalElement = null;
            // Reset state on close
            currentStep = 'egreso';
            denominacionesEgreso = {};
            totalEgreso = 0;
        }, { once: true });
    }
}

function updateStepTotal() {
    let total = 0;
    denominaciones.forEach(valor => {
        const input = modalElement.querySelector(`#recarga-denominacion-${String(valor).replace('.', '')}`);
        if (input) {
            total += (parseInt(input.value, 10) || 0) * valor;
        }
    });
    modalElement.querySelector('#recarga-total-paso').textContent = `$${total.toFixed(2)}`;
    return total;
}

function renderInputs(stepType) {
    const grid = modalElement.querySelector('#recarga-denominaciones-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const colorClass = stepType === 'egreso' ? 'egreso' : 'ingreso';
    const storedDenominations = stepType === 'egreso' ? denominacionesEgreso : {};

    denominaciones.forEach(valor => {
        const inputId = `recarga-denominacion-${String(valor).replace('.', '')}`;
        const group = document.createElement('div');
        group.className = 'denominacion-input-group';
        const cantidad = storedDenominations[valor] || '';
        
        group.innerHTML = `
            <span class="denominacion-valor ${colorClass}">${valor}</span>
            <input type="number" id="${inputId}" value="${cantidad}" placeholder="0" min="0" inputmode="numeric" pattern="[0-9]*">
        `;
        grid.appendChild(group);
    });
    updateStepTotal();
}

function renderStep() {
    const titleEl = modalElement.querySelector('#recarga-modal-title');
    const atrasBtn = modalElement.querySelector('#recarga-modal-atras-btn');
    const siguienteBtn = modalElement.querySelector('#recarga-modal-siguiente-btn');
    const infoEl = modalElement.querySelector('#recarga-info-total');

    if (currentStep === 'egreso') {
        titleEl.textContent = 'Paso 1: Efectivo que sale (Egreso)';
        siguienteBtn.textContent = 'Siguiente';
        atrasBtn.style.display = 'none';
        infoEl.style.display = 'none';
        renderInputs('egreso');
    } else { // 'ingreso' step
        titleEl.textContent = 'Paso 2: Efectivo que entra (Ingreso)';
        siguienteBtn.textContent = 'Guardar Cambio';
        atrasBtn.style.display = 'inline-block';
        infoEl.style.display = 'block';
        infoEl.innerHTML = `Total a ingresar: <strong>$${totalEgreso.toFixed(2)}</strong>`;
        renderInputs('ingreso');
    }
}

function handlePrimaryAction() {
    if (currentStep === 'egreso') {
        // --- Step 1: Process Egress and move to Ingress ---
        const tempDenominaciones = {};
        let tempTotal = 0;
        let validationFailed = false;

        denominaciones.forEach(valor => {
            if (validationFailed) return;
            const input = modalElement.querySelector(`#recarga-denominacion-${String(valor).replace('.', '')}`);
            const cantidad = parseInt(input.value, 10) || 0;
            if (cantidad > 0) {
                if (stockDenominaciones[valor] < cantidad) {
                    alert(`No hay suficientes billetes/monedas de $${valor}. Stock actual: ${stockDenominaciones[valor]}.`);
                    validationFailed = true;
                    return;
                }
                tempDenominaciones[valor] = cantidad;
                tempTotal += cantidad * valor;
            }
        });

        if (validationFailed) return;
        if (tempTotal === 0) {
            alert('Debe ingresar al menos una denominación que sale.');
            return;
        }

        // Save state and move to next step
        denominacionesEgreso = tempDenominaciones;
        totalEgreso = tempTotal;
        currentStep = 'ingreso';
        renderStep();

    } else {
        // --- Step 2: Process Ingress and Finalize ---
        const denominacionesIngreso = {};
        const totalIngreso = updateStepTotal();

        if (totalIngreso !== totalEgreso) {
            alert(`El total de ingreso ($${totalIngreso.toFixed(2)}) debe ser igual al total de egreso ($${totalEgreso.toFixed(2)}).`);
            return;
        }
        if (totalIngreso === 0) {
            alert('Debe ingresar al menos una denominación que entra.');
            return;
        }

        denominaciones.forEach(valor => {
            const input = modalElement.querySelector(`#recarga-denominacion-${String(valor).replace('.', '')}`);
            const cantidad = parseInt(input.value, 10) || 0;
            if (cantidad > 0) {
                denominacionesIngreso[valor] = cantidad;
            }
        });

        registrarRecargaDenominaciones(denominacionesEgreso, denominacionesIngreso, totalEgreso);
        closeRecargaModal();
    }
}

function handleBackAction() {
    if (currentStep === 'ingreso') {
        currentStep = 'egreso';
        renderStep();
    }
}

export async function openRecargarDenominacionesModal() {
    if (document.getElementById('caja-recarga-modal-container')) return;

    try {
        const response = await fetch('src/views/caja.recargar.denominaciones.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-recarga-modal-container');

        renderStep();

        modalElement.querySelector('#recarga-modal-cancelar-btn').addEventListener('click', closeRecargaModal);
        modalElement.querySelector('#recarga-modal-siguiente-btn').addEventListener('click', handlePrimaryAction);
        modalElement.querySelector('#recarga-modal-atras-btn').addEventListener('click', handleBackAction);
        modalElement.querySelector('.modal-body').addEventListener('input', updateStepTotal);

        setTimeout(() => {
            if (modalElement) {
                modalElement.classList.add('visible');
            }
        }, 10);

    } catch (error) {
        console.error("Error al abrir el modal de recarga:", error);
    }
}