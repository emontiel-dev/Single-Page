import { registrarEgresoManual, denominacionColors, stockDenominaciones } from './caja.logica.js';

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
let egresoSeleccionado = [];
let cambioRecibidoSeleccionado = [];

function closeEgresoModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
        egresoSeleccionado = [];
        cambioRecibidoSeleccionado = [];
    }
}

function renderSeleccion(containerId, seleccion) {
    const container = modalElement.querySelector(containerId);
    container.innerHTML = '';
    const conteo = seleccion.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});
    Object.entries(conteo).sort((a, b) => b[0] - a[0]).forEach(([valor, cantidad]) => {
        const color = denominacionColors[valor] || '#7f8c8d';
        const pill = document.createElement('div');
        pill.className = 'pago-seleccion-item';
        pill.style.backgroundColor = color;
        pill.innerHTML = `<span>${valor} x ${cantidad}</span><button class="remover-denominacion-btn" data-valor="${valor}" data-container="${containerId}">&times;</button>`;
        container.appendChild(pill);
    });
}

function updateEgresoState() {
    const montoEgreso = parseFloat(modalElement.querySelector('#egreso-monto-input').value) || 0;
    const totalPagado = egresoSeleccionado.reduce((acc, valor) => acc + valor, 0);
    const totalCambioRecibido = cambioRecibidoSeleccionado.reduce((acc, valor) => acc + valor, 0);
    
    const balance = totalPagado - totalCambioRecibido;
    modalElement.querySelector('#egreso-balance-footer').textContent = `$${balance.toFixed(2)}`;

    const guardarBtn = modalElement.querySelector('#egreso-modal-guardar-btn');
    const alerta = modalElement.querySelector('#egreso-validacion');
    
    if (montoEgreso <= 0) {
        alerta.textContent = 'El monto del egreso debe ser mayor a cero.';
        alerta.style.display = 'block';
        guardarBtn.disabled = true;
        return;
    }

    if (balance !== montoEgreso) {
        alerta.textContent = `El balance ($${balance.toFixed(2)}) no coincide con el monto del egreso ($${montoEgreso.toFixed(2)}).`;
        alerta.style.display = 'block';
        guardarBtn.disabled = true;
    } else {
        alerta.style.display = 'none';
        guardarBtn.disabled = false;
    }
}

function handleDenominacionClick(event) {
    const button = event.target.closest('.denominacion-btn');
    if (!button) return;
    const valor = parseFloat(button.dataset.valor);
    if (button.parentElement.id === 'egreso-denominaciones-grid') {
        egresoSeleccionado.push(valor);
        renderSeleccion('#egreso-pago-seleccion', egresoSeleccionado);
    } else {
        cambioRecibidoSeleccionado.push(valor);
        renderSeleccion('#egreso-cambio-seleccion', cambioRecibidoSeleccionado);
    }
    updateEgresoState();
}

function handleRemoverDenominacionClick(event) {
    const button = event.target.closest('.remover-denominacion-btn');
    if (!button) return;
    const valor = parseFloat(button.dataset.valor);
    const containerId = button.dataset.container;
    const seleccion = (containerId === '#egreso-pago-seleccion') ? egresoSeleccionado : cambioRecibidoSeleccionado;
    const index = seleccion.lastIndexOf(valor);
    if (index > -1) {
        seleccion.splice(index, 1);
    }
    renderSeleccion(containerId, seleccion);
    updateEgresoState();
}

function handleGuardarEgreso() {
    const concepto = modalElement.querySelector('#egreso-concepto-input').value.trim();
    const montoEgreso = parseFloat(modalElement.querySelector('#egreso-monto-input').value) || 0;

    if (!concepto || montoEgreso <= 0) {
        alert('Por favor, complete el monto y el concepto del egreso.');
        return;
    }

    const denominacionesEgreso = egresoSeleccionado.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});
    
    const denominacionesIngreso = cambioRecibidoSeleccionado.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});

    registrarEgresoManual(concepto, montoEgreso, denominacionesEgreso, denominacionesIngreso);
    closeEgresoModal();
}

function renderDenominacionBotones(gridId) {
    const grid = modalElement.querySelector(`#${gridId}`);
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

export async function openAñadirEgresoModal() {
    if (document.getElementById('caja-egreso-modal-container')) return;
    const response = await fetch('src/modulos/caja/views/caja.añadir.egreso.modal.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('caja-egreso-modal-container');

    renderDenominacionBotones('egreso-denominaciones-grid');
    renderDenominacionBotones('egreso-cambio-grid');
    updateEgresoState();

    modalElement.querySelector('#egreso-monto-input').addEventListener('input', updateEgresoState);
    modalElement.querySelector('#egreso-modal-cancelar-btn').addEventListener('click', closeEgresoModal);
    modalElement.querySelector('#egreso-modal-guardar-btn').addEventListener('click', handleGuardarEgreso);
    modalElement.querySelector('#egreso-denominaciones-grid').addEventListener('click', handleDenominacionClick);
    modalElement.querySelector('#egreso-cambio-grid').addEventListener('click', handleDenominacionClick);
    modalElement.querySelector('#egreso-pago-seleccion').addEventListener('click', handleRemoverDenominacionClick);
    modalElement.querySelector('#egreso-cambio-seleccion').addEventListener('click', handleRemoverDenominacionClick);

    modalElement.classList.add('visible');
}