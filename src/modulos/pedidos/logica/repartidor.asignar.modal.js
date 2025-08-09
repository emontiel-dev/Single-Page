// filepath: src/modulos/pedidos/logica/repartidor.asignar.modal.js
import { trabajadoresDB as trabajadores } from '../../trabajadores/logica/trabajadores.datos.js';
import { FASES_PEDIDO } from '../logica/pedidos.fases.datos.js';
// --- MODIFICADO: Importar lógica de caja necesaria ---
import { registrarCambioParaEntrega, calcularCambioGreedy, denominacionColors } from '../../caja/logica/caja.logica.js';
import { renderDenominacionBotones, renderDenominacionSeleccion } from '../../caja/logica/caja.cobrar.modal.js';

let modalElement = null;
let currentPedido = null;
let onCompleteCallback = null;
let pagoSeleccionado = []; // <-- Renombrado de 'cambioSeleccionado' a 'pagoSeleccionado'

function closeAsignarModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
        pagoSeleccionado = []; // Limpiar estado
    }
}

// --- LÓGICA REFACTORIZADA ---
function updateAsignacionState() {
    const totalPedidoRaw = currentPedido.items.reduce((acc, item) => acc + item.cost, 0);
    const totalPedido = Math.round(totalPedidoRaw);
    const totalPagado = pagoSeleccionado.reduce((acc, val) => acc + val, 0);
    const cambio = totalPagado - totalPedido;

    modalElement.querySelector('#repartidor-total-pagado').textContent = `$${totalPagado.toFixed(2)}`;
    
    const confirmarBtn = modalElement.querySelector('#repartidor-asignar-modal-confirmar-btn');
    const alertaInsuficiente = modalElement.querySelector('#repartidor-cambio-insuficiente');
    const cambioGrid = modalElement.querySelector('#repartidor-cambio-grid');

    if (cambio < 0) {
        modalElement.querySelector('#repartidor-total-cambio').textContent = '$0.00';
        cambioGrid.innerHTML = '<p style="width: 100%; text-align: center; font-size: 0.9em; color: var(--gris-texto-secundario);">El pago es insuficiente.</p>';
        confirmarBtn.disabled = true;
        alertaInsuficiente.style.display = 'none';
        return;
    }

    modalElement.querySelector('#repartidor-total-cambio').textContent = `$${cambio.toFixed(2)}`;
    const resultadoCambio = calcularCambioGreedy(cambio);

    if (resultadoCambio.success) {
        renderCambioGrid(cambioGrid, resultadoCambio.cambioDenominaciones);
        alertaInsuficiente.style.display = 'none';
        confirmarBtn.disabled = false;
    } else {
        cambioGrid.innerHTML = '';
        alertaInsuficiente.style.display = 'block';
        confirmarBtn.disabled = true;
    }
}

function renderCambioGrid(grid, cambio) {
    grid.innerHTML = '';
    if (!cambio || Object.keys(cambio).length === 0) {
        grid.innerHTML = '<p style="width: 100%; text-align: center; font-size: 0.9em; color: var(--gris-texto-secundario);">No se requiere cambio.</p>';
        return;
    }
    // Lógica de renderizado (idéntica a caja.cobrar.modal.js)
    Object.entries(cambio).sort((a, b) => Number(b[0]) - Number(a[0])).forEach(([valor, cantidad]) => {
        const item = document.createElement('div');
        item.className = 'pago-seleccion-item';
        // --- AÑADIDO: Aplicar color de fondo ---
        item.style.backgroundColor = denominacionColors[valor] || '#7f8c8d';
        item.textContent = `${valor} x ${cantidad}`;
        grid.appendChild(item);
    });
}

function handleDenominacionClick(event) {
    const button = event.target.closest('.denominacion-btn');
    if (!button) return;
    pagoSeleccionado.push(parseFloat(button.dataset.valor));
    renderDenominacionSeleccion(modalElement.querySelector('#repartidor-pago-seleccion'), pagoSeleccionado);
    updateAsignacionState();
}

function handleRemoverDenominacionClick(event) {
    if (!event.target.classList.contains('remover-denominacion-btn')) return;
    const valor = parseFloat(event.target.dataset.valor);
    const index = pagoSeleccionado.lastIndexOf(valor);
    if (index > -1) pagoSeleccionado.splice(index, 1);
    renderDenominacionSeleccion(modalElement.querySelector('#repartidor-pago-seleccion'), pagoSeleccionado);
    updateAsignacionState();
}

async function handleConfirmarAsignacion() {
    const repartidorId = modalElement.querySelector('#repartidor-select').value;
    if (!repartidorId) {
        alert('Debe seleccionar un repartidor.');
        return;
    }

    const totalPedidoRaw = currentPedido.items.reduce((acc, item) => acc + item.cost, 0);
    const totalPedido = Math.round(totalPedidoRaw);
    const totalPagado = pagoSeleccionado.reduce((acc, val) => acc + val, 0);
    const cambio = totalPagado - totalPedido;
    const resultadoCambio = calcularCambioGreedy(cambio);

    if (cambio < 0 || !resultadoCambio.success) {
        alert('No se puede confirmar. Verifique el monto pagado o el cambio disponible en caja.');
        return;
    }

    // CORRECCIÓN: Usar '==' para comparar el ID del repartidor, ya que el valor del select es un string.
    const repartidor = trabajadores.find(t => t.id == repartidorId);

    // Guardar información en el pedido
    currentPedido.repartidorAsignado = { id: repartidor.id, nombre: repartidor.nombre };
    currentPedido.cambioPreparado = resultadoCambio.cambioDenominaciones;
    currentPedido.faseId = FASES_PEDIDO.EN_RUTA.id;

    // Registrar el egreso del cambio en caja
    registrarCambioParaEntrega(currentPedido, repartidor, resultadoCambio.cambioDenominaciones);

    if (onCompleteCallback) onCompleteCallback();
    closeAsignarModal();
}

export async function openAsignarRepartidorModal(pedido, callback) {
    currentPedido = pedido;
    onCompleteCallback = callback;

    try {
        const response = await fetch('src/modulos/pedidos/views/repartidor.asignar.modal.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista del modal.');
        
        document.body.insertAdjacentHTML('beforeend', await response.text());
        modalElement = document.getElementById('repartidor-asignar-modal-container');

        const totalPedido = currentPedido.items.reduce((acc, item) => acc + item.cost, 0);
        modalElement.querySelector('#repartidor-pedido-total').textContent = `$${Math.round(totalPedido).toFixed(2)}`;

        const select = modalElement.querySelector('#repartidor-select');
        const repartidores = trabajadores.filter(t => t.activo);
        repartidores.forEach(rep => {
            const option = document.createElement('option');
            option.value = rep.id;
            option.textContent = rep.nombre;
            select.appendChild(option);
        });

        renderDenominacionBotones(modalElement.querySelector('#repartidor-pago-grid'));
        updateAsignacionState();

        // Listeners
        modalElement.querySelector('#repartidor-pago-grid').addEventListener('click', handleDenominacionClick);
        modalElement.querySelector('#repartidor-pago-seleccion').addEventListener('click', handleRemoverDenominacionClick);
        modalElement.querySelector('#repartidor-asignar-modal-cerrar-btn').addEventListener('click', closeAsignarModal);
        modalElement.querySelector('#repartidor-asignar-modal-confirmar-btn').addEventListener('click', handleConfirmarAsignacion);

        modalElement.classList.add('visible');

    } catch (error) {
        console.error('Error al abrir el modal de asignación:', error);
    }
}