import { stockDenominaciones, registrarRecargaDenominaciones, denominacionColors } from './caja.logica.js';

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
let currentStep = 'egreso';
let egresoSeleccionado = [];
let ingresoSeleccionado = [];
let totalEgreso = 0;

function closeRecargaModal() {
    if (modalElement) {
        modalElement.classList.remove('visible');
        modalElement.addEventListener('transitionend', () => {
            modalElement.remove();
            modalElement = null;
            currentStep = 'egreso';
            egresoSeleccionado = [];
            ingresoSeleccionado = [];
            totalEgreso = 0;
        }, { once: true });
    }
}

function renderSeleccionActual() {
    const container = modalElement.querySelector('#recarga-pago-seleccion');
    const seleccionActual = currentStep === 'egreso' ? egresoSeleccionado : ingresoSeleccionado;
    container.innerHTML = '';
    const conteo = seleccionActual.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});

    Object.entries(conteo).sort((a, b) => b[0] - a[0]).forEach(([valor, cantidad]) => {
        const color = denominacionColors[valor] || '#7f8c8d';
        const pill = document.createElement('div');
        pill.className = 'pago-seleccion-item';
        pill.style.backgroundColor = color;
        pill.innerHTML = `
            <span>${valor} x ${cantidad}</span>
            <button class="remover-denominacion-btn" data-valor="${valor}">&times;</button>
        `;
        container.appendChild(pill);
    });
}

function updateStepTotal() {
    const seleccionActual = currentStep === 'egreso' ? egresoSeleccionado : ingresoSeleccionado;
    const total = seleccionActual.reduce((acc, valor) => acc + valor, 0);
    modalElement.querySelector('#recarga-total-paso').textContent = `$${total.toFixed(2)}`;
    return total;
}

function handleDenominacionClick(event) {
    const button = event.target.closest('.denominacion-btn');
    if (!button) return;
    const valor = parseFloat(button.dataset.valor);
    if (isNaN(valor)) return;
    if (currentStep === 'egreso') {
        egresoSeleccionado.push(valor);
    } else {
        ingresoSeleccionado.push(valor);
    }
    renderSeleccionActual();
    updateStepTotal();
}

function handleRemoverDenominacionClick(event) {
    if (!event.target.classList.contains('remover-denominacion-btn')) return;
    const valor = parseFloat(event.target.dataset.valor);
    const seleccionActual = currentStep === 'egreso' ? egresoSeleccionado : ingresoSeleccionado;
    const index = seleccionActual.lastIndexOf(valor);
    if (index > -1) {
        seleccionActual.splice(index, 1);
    }
    renderSeleccionActual();
    updateStepTotal();
}

function renderDenominacionBotones() {
    const grid = modalElement.querySelector('#recarga-denominaciones-grid');
    if (!grid) return;
    grid.innerHTML = '';
    denominaciones.forEach(valor => {
        const color = denominacionColors[valor] || '#7f8c8d';
        const button = document.createElement('button');
        button.className = 'denominacion-btn';
        button.dataset.valor = valor;
        button.style.backgroundColor = color;
        button.textContent = valor;
        grid.appendChild(button);
    });
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
    } else {
        titleEl.textContent = 'Paso 2: Efectivo que entra (Ingreso)';
        siguienteBtn.textContent = 'Guardar Cambio';
        atrasBtn.style.display = 'inline-block';
        infoEl.style.display = 'block';
        infoEl.innerHTML = `Total a ingresar: <strong>$${totalEgreso.toFixed(2)}</strong>`;
    }
    renderSeleccionActual();
    updateStepTotal();
}

function handlePrimaryAction() {
    if (currentStep === 'egreso') {
        const tempTotal = updateStepTotal();
        const tempDenominaciones = egresoSeleccionado.reduce((acc, valor) => {
            acc[valor] = (acc[valor] || 0) + 1;
            return acc;
        }, {});
        for (const valor in tempDenominaciones) {
            if (stockDenominaciones[valor] < tempDenominaciones[valor]) {
                alert(`No hay suficientes billetes/monedas de $${valor}. Stock actual: ${stockDenominaciones[valor]}.`);
                return;
            }
        }
        if (tempTotal === 0) {
            alert('Debe ingresar al menos una denominación que sale.');
            return;
        }
        totalEgreso = tempTotal;
        currentStep = 'ingreso';
        renderStep();
    } else {
        const totalIngreso = updateStepTotal();
        if (totalIngreso !== totalEgreso) {
            alert(`El total de ingreso ($${totalIngreso.toFixed(2)}) debe ser igual al total de egreso ($${totalEgreso.toFixed(2)}).`);
            return;
        }
        if (totalIngreso === 0) {
            alert('Debe ingresar al menos una denominación que entra.');
            return;
        }
        const denominacionesEgresoObj = egresoSeleccionado.reduce((acc, valor) => {
            acc[valor] = (acc[valor] || 0) + 1;
            return acc;
        }, {});
        const denominacionesIngresoObj = ingresoSeleccionado.reduce((acc, valor) => {
            acc[valor] = (acc[valor] || 0) + 1;
            return acc;
        }, {});
        registrarRecargaDenominaciones(denominacionesEgresoObj, denominacionesIngresoObj, totalEgreso);
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
        const response = await fetch('src/modulos/caja/views/caja.recargar.denominaciones.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-recarga-modal-container');
        renderDenominacionBotones();
        renderStep();
        modalElement.querySelector('#recarga-modal-cancelar-btn').addEventListener('click', closeRecargaModal);
        modalElement.querySelector('#recarga-modal-siguiente-btn').addEventListener('click', handlePrimaryAction);
        modalElement.querySelector('#recarga-modal-atras-btn').addEventListener('click', handleBackAction);
        modalElement.querySelector('#recarga-denominaciones-grid').addEventListener('click', handleDenominacionClick);
        modalElement.querySelector('#recarga-pago-seleccion').addEventListener('click', handleRemoverDenominacionClick);
        setTimeout(() => {
            if (modalElement) modalElement.classList.add('visible');
        }, 10);
    } catch (error) {
        console.error("Error al abrir el modal de recarga:", error);
    }
}