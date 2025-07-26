import { registrarIngresoManual, denominacionColors, calcularCambioGreedy } from './caja.logica.js';

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
let ingresoSeleccionado = [];

function closeIngresoModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
        ingresoSeleccionado = [];
    }
}

function renderIngresoSeleccionado() {
    const container = modalElement.querySelector('#ingreso-pago-seleccion');
    container.innerHTML = '';
    const conteo = ingresoSeleccionado.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});
    Object.entries(conteo).sort((a, b) => b[0] - a[0]).forEach(([valor, cantidad]) => {
        const color = denominacionColors[valor] || '#7f8c8d';
        const pill = document.createElement('div');
        pill.className = 'pago-seleccion-item';
        pill.style.backgroundColor = color;
        pill.innerHTML = `<span>${valor} x ${cantidad}</span><button class="remover-denominacion-btn" data-valor="${valor}">&times;</button>`;
        container.appendChild(pill);
    });
}

function renderCambioGrid(cambio) {
    const grid = modalElement.querySelector('#ingreso-cambio-grid');
    grid.innerHTML = '';
    if (!cambio || Object.keys(cambio).length === 0) {
        grid.innerHTML = '<p class="no-change-text">No se requiere cambio.</p>';
        return;
    }
    Object.entries(cambio).sort((a, b) => Number(b[0]) - Number(a[0])).forEach(([valor, cantidad]) => {
        const color = denominacionColors[valor] || '#7f8c8d';
        const item = document.createElement('div');
        item.className = 'pago-seleccion-item';
        item.style.backgroundColor = color;
        item.textContent = `${valor} x ${cantidad}`;
        grid.appendChild(item);
    });
}

function updateIngresoState() {
    const montoIngreso = parseFloat(modalElement.querySelector('#ingreso-monto-input').value) || 0;
    const totalRecibido = ingresoSeleccionado.reduce((acc, valor) => acc + valor, 0);
    modalElement.querySelector('#ingreso-total-recibido').textContent = `$${totalRecibido.toFixed(2)}`;

    const cambio = totalRecibido - montoIngreso;
    const guardarBtn = modalElement.querySelector('#ingreso-modal-guardar-btn');
    const alertaInsuficiente = modalElement.querySelector('#ingreso-cambio-insuficiente');

    if (montoIngreso <= 0 || cambio < 0) {
        modalElement.querySelector('#ingreso-total-cambio').textContent = '$0.00';
        renderCambioGrid(null);
        guardarBtn.disabled = true;
        alertaInsuficiente.style.display = 'none';
        return;
    }

    modalElement.querySelector('#ingreso-total-cambio').textContent = `$${cambio.toFixed(2)}`;
    const resultadoCambio = calcularCambioGreedy(cambio);

    if (resultadoCambio.success) {
        renderCambioGrid(resultadoCambio.cambioDenominaciones);
        alertaInsuficiente.style.display = 'none';
        guardarBtn.disabled = false;
    } else {
        renderCambioGrid(null);
        alertaInsuficiente.style.display = 'block';
        guardarBtn.disabled = true;
    }
}

function handleDenominacionClick(event) {
    const button = event.target.closest('.denominacion-btn');
    if (!button) return;
    ingresoSeleccionado.push(parseFloat(button.dataset.valor));
    renderIngresoSeleccionado();
    updateIngresoState();
}

function handleRemoverDenominacionClick(event) {
    if (!event.target.classList.contains('remover-denominacion-btn')) return;
    const valor = parseFloat(event.target.dataset.valor);
    const index = ingresoSeleccionado.lastIndexOf(valor);
    if (index > -1) {
        ingresoSeleccionado.splice(index, 1);
    }
    renderIngresoSeleccionado();
    updateIngresoState();
}

function handleGuardarIngreso() {
    const concepto = modalElement.querySelector('#ingreso-concepto-input').value.trim();
    const montoIngreso = parseFloat(modalElement.querySelector('#ingreso-monto-input').value) || 0;
    
    if (!concepto || montoIngreso <= 0) {
        alert('Por favor, complete el monto y el concepto del ingreso.');
        return;
    }

    const totalRecibido = ingresoSeleccionado.reduce((acc, valor) => acc + valor, 0);
    const cambio = totalRecibido - montoIngreso;
    const resultadoCambio = calcularCambioGreedy(cambio);

    if (cambio < 0 || !resultadoCambio.success) {
        alert('No se puede guardar. Verifique el monto pagado o el cambio disponible.');
        return;
    }

    const denominacionesIngreso = ingresoSeleccionado.reduce((acc, valor) => {
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});

    registrarIngresoManual(concepto, montoIngreso, denominacionesIngreso, resultadoCambio.cambioDenominaciones);
    closeIngresoModal();
}

function renderDenominacionBotones() {
    const grid = modalElement.querySelector('#ingreso-denominaciones-grid');
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

export async function openAñadirIngresoModal() {
    if (document.getElementById('caja-ingreso-modal-container')) return;
    const response = await fetch('src/modulos/caja/views/caja.añadir.ingreso.modal.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('caja-ingreso-modal-container');
    
    renderDenominacionBotones();
    updateIngresoState();

    modalElement.querySelector('#ingreso-monto-input').addEventListener('input', updateIngresoState);
    modalElement.querySelector('#ingreso-modal-cancelar-btn').addEventListener('click', closeIngresoModal);
    modalElement.querySelector('#ingreso-modal-guardar-btn').addEventListener('click', handleGuardarIngreso);
    modalElement.querySelector('#ingreso-denominaciones-grid').addEventListener('click', handleDenominacionClick);
    modalElement.querySelector('#ingreso-pago-seleccion').addEventListener('click', handleRemoverDenominacionClick);
    
    modalElement.classList.add('visible');
}