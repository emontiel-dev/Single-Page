// filepath: src/modulos/pedidos/logica/repartidor.asignar.modal.js
import { trabajadoresDB as trabajadores } from '../../trabajadores/logica/trabajadores.datos.js';
import { FASES_PEDIDO } from '../logica/pedidos.fases.datos.js';
import { registrarEgresoParaRepartidor } from '../../caja/logica/caja.logica.js';
// --- AÑADIR IMPORTACIONES DE LAS NUEVAS FUNCIONES REUTILIZABLES ---
import { renderDenominacionBotones, renderDenominacionSeleccion } from '../../caja/logica/caja.cobrar.modal.js';

let modalElement = null;
let currentPedido = null;
let onCompleteCallback = null;
let cambioSeleccionado = []; // <-- NUEVO: Estado para las denominaciones del cambio

function closeAsignarModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
        cambioSeleccionado = []; // Limpiar estado al cerrar
    }
}

// --- NUEVAS FUNCIONES PARA MANEJAR LA SELECCIÓN DE DENOMINACIONES ---
function updateTotalDisplay() {
    const total = cambioSeleccionado.reduce((acc, val) => acc + val, 0);
    modalElement.querySelector('#repartidor-cambio-total').textContent = `$${total.toFixed(2)}`;
}

function handleDenominacionClick(event) {
    const button = event.target.closest('.denominacion-btn');
    if (!button) return;
    cambioSeleccionado.push(parseFloat(button.dataset.valor));
    renderDenominacionSeleccion(modalElement.querySelector('#repartidor-cambio-seleccion'), cambioSeleccionado);
    updateTotalDisplay();
}

function handleRemoverDenominacionClick(event) {
    if (!event.target.classList.contains('remover-denominacion-btn')) return;
    const valor = parseFloat(event.target.dataset.valor);
    const index = cambioSeleccionado.lastIndexOf(valor);
    if (index > -1) {
        cambioSeleccionado.splice(index, 1);
    }
    renderDenominacionSeleccion(modalElement.querySelector('#repartidor-cambio-seleccion'), cambioSeleccionado);
    updateTotalDisplay();
}


async function handleConfirmarAsignacion() {
    const repartidorId = modalElement.querySelector('#repartidor-select').value;
    // --- MODIFICADO: Calcular el total desde el array de selección ---
    const cambioEntregado = cambioSeleccionado.reduce((acc, val) => acc + val, 0);
    const alerta = modalElement.querySelector('#repartidor-asignar-alerta');

    if (!repartidorId) {
        alerta.textContent = 'Debe seleccionar un repartidor.';
        alerta.style.display = 'block';
        return;
    }

    const repartidor = trabajadores.find(t => t.id === repartidorId);
    if (!repartidor) {
        alerta.textContent = 'El repartidor seleccionado no es válido.';
        alerta.style.display = 'block';
        return;
    }

    // Asignar repartidor y cambio al pedido
    currentPedido.repartidorAsignado = {
        id: repartidor.id,
        nombre: repartidor.nombre
    };
    currentPedido.cambioEntregado = cambioEntregado;
    currentPedido.faseId = FASES_PEDIDO.EN_RUTA.id;

    // Registrar el egreso del cambio en caja
    if (cambioEntregado > 0) {
        // --- NUEVO: Crear objeto de denominaciones para un registro preciso en caja ---
        const denominacionesEgreso = cambioSeleccionado.reduce((acc, valor) => {
            acc[valor] = (acc[valor] || 0) + 1;
            return acc;
        }, {});
        registrarEgresoParaRepartidor(repartidor, cambioEntregado, denominacionesEgreso);
    }

    // Ejecutar callback para refrescar la lista de pedidos
    if (onCompleteCallback) {
        onCompleteCallback();
    }

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

        // --- NUEVO: Calcular y mostrar el total del pedido ---
        const totalPedido = currentPedido.items.reduce((acc, item) => acc + item.cost, 0);
        modalElement.querySelector('#repartidor-pedido-total').textContent = `$${Math.round(totalPedido).toFixed(2)}`;

        // Poblar select con repartidores
        const select = modalElement.querySelector('#repartidor-select');
        const repartidores = trabajadores.filter(t => t.cargo === 'Repartidor' && t.activo);
        repartidores.forEach(rep => {
            const option = document.createElement('option');
            option.value = rep.id;
            option.textContent = rep.nombre;
            select.appendChild(option);
        });

        // --- NUEVO: Renderizar botones de denominaciones y añadir listeners ---
        renderDenominacionBotones(modalElement.querySelector('#repartidor-cambio-grid'));
        modalElement.querySelector('#repartidor-cambio-grid').addEventListener('click', handleDenominacionClick);
        modalElement.querySelector('#repartidor-cambio-seleccion').addEventListener('click', handleRemoverDenominacionClick);


        // Listeners
        modalElement.querySelector('#repartidor-asignar-modal-cerrar-btn').addEventListener('click', closeAsignarModal);
        modalElement.querySelector('#repartidor-asignar-modal-confirmar-btn').addEventListener('click', handleConfirmarAsignacion);

        modalElement.classList.add('visible');

    } catch (error) {
        console.error('Error al abrir el modal de asignación:', error);
    }
}