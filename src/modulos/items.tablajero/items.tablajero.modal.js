import { pedidosGuardados } from '../pedidos/pedidos.guardados.datos.js';
import { findOptionData } from '../venta/catalogo/modal.logica.js';
import { catalogoProductos } from '../venta/catalogo/catalogo.datos.js';
import { findClienteById } from '../clientes/clientes.data.js'; // <-- MODIFICADO
import { getItemDisplayDetails } from './items.tablajero.js';
import { FASES_PEDIDO } from '../pedidos/pedidos.fases.datos.js'; // <-- AÑADIR IMPORTACIÓN

let modalElement = null;
let onCompleteCallback = null;
let currentPedido = null;
let currentItemIndex = -1;

export async function openItemsTablajeroModal(pedidoId, itemIndex, callback) {
    onCompleteCallback = callback;
    currentItemIndex = itemIndex;
    currentPedido = pedidosGuardados.find(p => p.id === pedidoId);
    if (!currentPedido) return;

    const item = currentPedido.items[itemIndex];
    if (!item) return;

    const response = await fetch('src/views/items.tablajero.modal.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('items-tablajero-modal-container');

    // Poblar y configurar el modal
    populateModal(item);
    setupEventListeners();

    setTimeout(() => modalElement.classList.add('visible'), 10);
}

// --- FUNCIÓN REFACTORIZADA ---
function populateModal(item) {
    // --- REFACTORIZACIÓN: Usar la función de utilidad compartida ---
    // La lógica compleja para formatear el nombre ahora está centralizada.
    const { displayName } = getItemDisplayDetails(item);
    // --- FIN DE LA REFACTORIZACIÓN ---

    // Poblar título y cliente (sin cambios)
    const cliente = findClienteById(currentPedido.clienteId); // <-- MODIFICADO
    const itemsRelevantes = currentPedido.items.filter(i => i.productId !== 'ENVIO' && i.productId !== 'CARGO');
    const itemActualNumero = itemsRelevantes.findIndex(i => i.optionId === item.optionId && i.cost === item.cost) + 1;

    modalElement.querySelector('#tablajero-modal-title').textContent = `Item ${itemActualNumero} de ${itemsRelevantes.length}`;
    modalElement.querySelector('#tablajero-modal-cliente').textContent = cliente ? cliente.nombre : 'Sin Cliente';
    
    // Usar el nombre formateado de la función de utilidad
    modalElement.querySelector('#tablajero-modal-producto-nombre').textContent = displayName;
    modalElement.querySelector('#tablajero-modal-producto-detalles').textContent = ''; // Este ya no se usa

    // Lógica para mostrar inputs de cantidad/costo (sin cambios)
    const optionData = findOptionData(item.optionId, catalogoProductos.find(p => p.id === item.productId));
    const cantidadGroup = modalElement.querySelector('#tablajero-modal-cantidad-group');
    const costoGroup = modalElement.querySelector('#tablajero-modal-costo-group');
    const cantidadInput = modalElement.querySelector('#tablajero-modal-cantidad');
    const costoInput = modalElement.querySelector('#tablajero-modal-costo');

    if (optionData && optionData.tipoVenta === 'peso') {
        cantidadGroup.style.display = 'block';
        costoGroup.style.display = 'none';
        cantidadInput.value = item.quantity;
    } else {
        cantidadGroup.style.display = 'none';
        costoGroup.style.display = 'block';
        costoInput.value = item.cost;
    }
}

function setupEventListeners() {
    modalElement.querySelector('#tablajero-modal-volver-btn').addEventListener('click', closeItemsTablajeroModal);
    modalElement.querySelector('#tablajero-modal-listo-btn').addEventListener('click', handleMarcarComoListo);
}

function handleMarcarComoListo() {
    const item = currentPedido.items[currentItemIndex];
    const optionData = findOptionData(item.optionId, catalogoProductos.find(p => p.id === item.productId));

    if (optionData && optionData.tipoVenta === 'peso') {
        const cantidadInput = modalElement.querySelector('#tablajero-modal-cantidad');
        const nuevaCantidad = parseFloat(cantidadInput.value);
        if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
            item.quantity = nuevaCantidad;
            
            // --- CORRECCIÓN FINAL: Lógica de recálculo a prueba de fallos ---
            let precioPorKg = item.pricePerKg;

            // 2. Si no existe, buscarlo usando el tipo de precio guardado.
            if (!precioPorKg && item.priceType && optionData.precios) {
                precioPorKg = optionData.precios[item.priceType];
            }

            // 3. Si AÚN no existe (para pedidos antiguos sin priceType), usar el precio 'publico' como fallback.
            if (!precioPorKg && optionData.precios) {
                precioPorKg = optionData.precios['publico'];
            }

            // 4. Recalcular el costo si se encontró un precio.
            if (precioPorKg) {
                item.cost = nuevaCantidad * precioPorKg;
            } else {
                console.warn(`No se pudo determinar el precio/kg para el item ${item.productId}. El costo no fue recalculado.`);
            }
        }
    } else {
        const costoInput = modalElement.querySelector('#tablajero-modal-costo');
        const nuevoCosto = parseFloat(costoInput.value);
        if (!isNaN(nuevoCosto)) {
            item.cost = nuevoCosto;
        }
    }

    item.estado = 'LISTO';
    if (onCompleteCallback) onCompleteCallback();

    // --- NUEVA LÓGICA: Verificar si todos los items están listos para cambiar la fase del pedido ---
    const itemsAProcesar = currentPedido.items.filter(i => i.productId !== 'ENVIO' && i.productId !== 'CARGO');
    const todosListos = itemsAProcesar.every(i => i.estado === 'LISTO');

    if (todosListos && currentPedido.faseId === FASES_PEDIDO.PROCESANDO.id) {
        currentPedido.faseId = FASES_PEDIDO.LISTO_PARA_ENTREGA.id;
        console.log(`Pedido ${currentPedido.id} actualizado automáticamente a ${FASES_PEDIDO.LISTO_PARA_ENTREGA.id}`);
    }
    // --- FIN DE LA NUEVA LÓGICA ---

    closeItemsTablajeroModal();
}

function closeItemsTablajeroModal() {
    if (!modalElement) return;

    // --- CORRECCIÓN: Evitar la condición de carrera ---
    // 1. Guardar la referencia al modal actual en una variable local.
    const elementToRemove = modalElement;

    // 2. Poner la variable global a null INMEDIATAMENTE.
    //    Esto previene que futuras llamadas a open/close interactúen con un modal
    //    que ya está en proceso de cierre.
    modalElement = null;

    // 3. Iniciar la transición de salida en el elemento guardado.
    elementToRemove.classList.remove('visible');

    // 4. Añadir el listener al elemento guardado. La clausura ahora usa 'elementToRemove',
    //    que no será null cuando se ejecute el callback.
    elementToRemove.addEventListener('transitionend', () => {
        elementToRemove.remove();
    }, { once: true });
}