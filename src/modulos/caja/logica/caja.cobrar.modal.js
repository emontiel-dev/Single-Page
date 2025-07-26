import { stockDenominaciones, registrarVenta, calcularCambioGreedy, denominacionColors } from './caja.logica.js';

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
let totalPedido = 0;
let denominacionesPago = {};
let denominacionesCambio = {};
let onVentaSuccessCallback = null;
let currentStep = 'pago';

function closeCobrarModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
        totalPedido = 0;
        denominacionesPago = {};
        denominacionesCambio = {};
        onVentaSuccessCallback = null;
        currentStep = 'pago';
    }
}

function updateTotalPagado() {
    let total = 0;
    denominacionesPago = {};
    denominaciones.forEach(valor => {
        const input = modalElement.querySelector(`#pago-denominacion-${String(valor).replace('.', '')}`);
        const cantidad = parseInt(input.value, 10) || 0;
        if (cantidad > 0) {
            total += cantidad * valor;
            denominacionesPago[valor] = cantidad;
        }
    });
    modalElement.querySelector('#cobrar-total-pagado').textContent = `$${total.toFixed(2)}`;
    return total;
}

function renderPagoInputs() {
    const grid = modalElement.querySelector('#cobrar-pago-grid');
    grid.innerHTML = '';
    denominaciones.forEach(valor => {
        const inputId = `pago-denominacion-${String(valor).replace('.', '')}`;
        const color = denominacionColors[valor] || '#7f8c8d';
        const group = document.createElement('div');
        group.className = 'denominacion-input-group';
        group.innerHTML = `
            <span class="denominacion-valor" style="background-color: ${color};">${valor}</span>
            <input type="number" id="${inputId}" placeholder="0" min="0" inputmode="numeric" pattern="[0-9]*">
        `;
        grid.appendChild(group);
    });
    grid.addEventListener('input', updateTotalPagado);
}

function handleSiguiente() {
    if (currentStep === 'pago') {
        const totalPagado = updateTotalPagado();
        if (totalPagado < totalPedido) {
            alert('El monto pagado es insuficiente.');
            return;
        }

        const cambio = totalPagado - totalPedido;
        modalElement.querySelector('#cobrar-total-cambio').textContent = `$${cambio.toFixed(2)}`;

        if (cambio > 0) {
            const resultadoCambio = calcularCambioGreedy(cambio);
            if (!resultadoCambio.success) {
                modalElement.querySelector('#cobrar-cambio-insuficiente').style.display = 'block';
                modalElement.querySelector('#cobrar-modal-siguiente-btn').disabled = true;
            } else {
                modalElement.querySelector('#cobrar-cambio-insuficiente').style.display = 'none';
                modalElement.querySelector('#cobrar-modal-siguiente-btn').disabled = false;
                denominacionesCambio = resultadoCambio.cambioDenominaciones;
                renderCambioGrid(denominacionesCambio);
            }
        } else {
            denominacionesCambio = {}; // No hay cambio
        }

        // Transition to next step
        currentStep = 'cambio';
        modalElement.querySelector('#cobrar-pago-section').style.display = 'none';
        modalElement.querySelector('#cobrar-cambio-section').style.display = 'block';
        modalElement.querySelector('#cobrar-modal-title').textContent = 'Confirmar Transacción';
        modalElement.querySelector('#cobrar-modal-siguiente-btn').textContent = 'Confirmar Venta';

    } else if (currentStep === 'cambio') {
        registrarVenta(totalPedido, denominacionesPago, denominacionesCambio);
        if (onVentaSuccessCallback) {
            onVentaSuccessCallback();
        }
        closeCobrarModal();
    }
}

function renderCambioGrid(cambio) {
    const grid = modalElement.querySelector('#cobrar-cambio-grid');
    grid.innerHTML = '';
    if (Object.keys(cambio).length === 0) {
        grid.innerHTML = '<p style="width: 100%; text-align: center;">No se requiere cambio (pago exacto).</p>';
        return;
    }
    // Ordenar de mayor a menor para una visualización más natural
    const sortedCambio = Object.entries(cambio).sort((a, b) => Number(b[0]) - Number(a[0]));

    for (const [valor, cantidad] of sortedCambio) {
        const color = denominacionColors[valor] || '#7f8c8d';
        const item = document.createElement('div');
        item.className = 'denominacion-info-item';
        item.style.backgroundColor = color;
        
        // MODIFICADO: Mostrar el valor y la cantidad en la píldora
        item.textContent = `${valor} x ${cantidad}`;
        
        grid.appendChild(item);
    }
}

export async function openCobrarModal(pedidoTotal, onVentaSuccess) {
    if (document.getElementById('caja-cobrar-modal-container')) return;
    totalPedido = pedidoTotal;
    onVentaSuccessCallback = onVentaSuccess;

    const response = await fetch('src/modulos/caja/views/caja.cobrar.modal.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('caja-cobrar-modal-container');

    modalElement.querySelector('#cobrar-total-pedido').textContent = `$${totalPedido.toFixed(2)}`;
    renderPagoInputs();

    modalElement.querySelector('#cobrar-modal-cancelar-btn').addEventListener('click', closeCobrarModal);
    modalElement.querySelector('#cobrar-modal-siguiente-btn').addEventListener('click', handleSiguiente);

    modalElement.classList.add('visible');
}