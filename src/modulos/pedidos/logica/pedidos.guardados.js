import { pedidosGuardados } from './pedidos.guardados.datos.js';
import { FASES_PEDIDO } from './pedidos.fases.datos.js';
import { findClienteById } from '../../clientes/logica/clientes.data.js'; // <-- MODIFICADO
import { cartItems, setCliente } from '../../venta/logica/carrito.js'; // Importar estado del carrito
import { router } from '../../../router.js'; // Importar el router
import { renderPedidoGuardadoDetalle } from './pedido.guardado.detalle.js'; // <-- AÑADIR IMPORTACIÓN
import { openAsignarRepartidorModal } from './repartidor.asignar.modal.js';
import { openLiquidarEntregaModal } from './repartidor.liquidar.modal.js';

// --- Función principal (modificada para inicializar acciones) ---
export async function renderPedidosGuardados(container) {
    try {
        const response = await fetch('src/modulos/pedidos/views/pedidos.guardados.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista de pedidos.');
        container.innerHTML = await response.text();

        const pedidosListBody = container.querySelector('#pedidos-list-body');
        if (pedidosListBody) {
            renderListaPedidos(pedidosListBody, pedidosGuardados);
            initSwipeAndLongPressActions(pedidosListBody); // <-- INICIALIZAR ACCIONES
        }

    } catch (error) {
        console.error('Error al renderizar pedidos guardados:', error);
        container.innerHTML = '<p>Error al cargar la sección de pedidos.</p>';
    }
}

// --- Lógica de Acciones ---

function getNextPhase(currentPhaseId) {
    const phaseOrder = [FASES_PEDIDO.GUARDADO.id, FASES_PEDIDO.PROCESANDO.id, FASES_PEDIDO.LISTO_PARA_ENTREGA.id, FASES_PEDIDO.EN_RUTA.id, FASES_PEDIDO.COMPLETADO.id];
    const currentIndex = phaseOrder.indexOf(currentPhaseId);
    return currentIndex !== -1 && currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
}

function handleEditPedido(pedidoId) {
    const pedidoIndex = pedidosGuardados.findIndex(p => p.id === pedidoId);
    if (pedidoIndex === -1) return;

    const [pedido] = pedidosGuardados.splice(pedidoIndex, 1); // Quitar el pedido de la lista de guardados

    // Cargar datos al carrito
    cartItems.length = 0; // Limpiar carrito actual
    pedido.items.forEach(item => cartItems.push(item));
    const cliente = pedido.clienteId ? findClienteById(pedido.clienteId) : null; // <-- MODIFICADO
    setCliente(cliente);

    // Navegar a la vista de venta
    router.navigate('/venta');
}

function handleAdvancePhase(pedidoId, itemElement) {
    const pedido = pedidosGuardados.find(p => p.id === pedidoId);
    if (!pedido) return;

    // Controlador de flujo basado en la fase actual
    switch (pedido.faseId) {
        case FASES_PEDIDO.LISTO_PARA_ENTREGA.id:
            // Pasamos una función callback para que el modal pueda refrescar la lista
            openAsignarRepartidorModal(pedido, () => {
                const pedidosListBody = document.querySelector('#pedidos-list-body');
                if (pedidosListBody) renderListaPedidos(pedidosListBody, pedidosGuardados);
            });
            return; // Detenemos para no ejecutar la lógica de avance de fase de abajo

        case FASES_PEDIDO.EN_RUTA.id:
            openLiquidarEntregaModal(pedido);
            return; // Detenemos para no ejecutar la lógica de avance de fase de abajo
    }

    // --- VALIDACIÓN AÑADIDA ---
    // Si el pedido está en 'Procesando', verificar que todos los items estén 'LISTO'.
    if (pedido.faseId === FASES_PEDIDO.PROCESANDO.id) {
        // Filtrar items que no son de envío o cargos, ya que esos no se procesan.
        const itemsAProcesar = pedido.items.filter(item => item.productId !== 'ENVIO' && item.productId !== 'CARGO');
        const todosListos = itemsAProcesar.every(item => item.estado === 'LISTO');

        if (!todosListos) {
            // MEJORA: Usar confirm para guiar al usuario a la pantalla de 'Items'.
            if (confirm('No se puede avanzar el pedido, aún hay productos pendientes. ¿Deseas ir a la pantalla de "Items" para procesarlos?')) {
                router.navigate('/items-tablajero');
            }
            return; // Detener la ejecución en cualquier caso.
        }
    }
    // --- FIN DE LA VALIDACIÓN ---

    const nextPhaseId = getNextPhase(pedido.faseId);
    if (nextPhaseId) {
        pedido.faseId = nextPhaseId;
        const fase = FASES_PEDIDO[nextPhaseId];
        
        // Actualizar la UI del item específico
        const badge = itemElement.querySelector('.estado-badge');
        badge.textContent = fase.nombre;
        badge.style.color = fase.color;
        badge.style.backgroundColor = fase.backgroundColor;
    } else {
        alert('El pedido ya está en su fase final o no se puede avanzar.');
    }
}

function handleDeletePedido(pedidoId, itemElement) {
    const pedidoIndex = pedidosGuardados.findIndex(p => p.id === pedidoId);
    if (pedidoIndex === -1) return;

    const pedido = pedidosGuardados[pedidoIndex];
    if (pedido.faseId !== FASES_PEDIDO.GUARDADO.id) {
        alert('Solo se pueden eliminar pedidos en estado "Guardado".');
        return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este pedido guardado?')) {
        pedidosGuardados.splice(pedidoIndex, 1);
        itemElement.remove(); // Eliminar el elemento del DOM
    }
}

// --- Renderizado y Lógica de Gestos ---

function renderListaPedidos(container, pedidos) {
    const pedidosListBody = container;
    pedidosListBody.innerHTML = '';

    pedidos.forEach(pedido => {
        const cliente = pedido.clienteId ? findClienteById(pedido.clienteId) : null; // <-- MODIFICADO
        const fase = FASES_PEDIDO[pedido.faseId] || FASES_PEDIDO.GUARDADO;
        
        // --- CORRECCIÓN ---
        // Calcular el costo total y el número de items visibles.
        const totalCosto = pedido.items.reduce((acc, item) => acc + (item.cost || 0), 0);
        const totalItems = pedido.items.filter(item => item.productId !== 'ENVIO' && item.productId !== 'CARGO').length;
        // --- FIN DE LA CORRECCIÓN ---

        const fecha = new Date(pedido.fechaCreacion);
        const horaRegistro = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const itemDiv = document.createElement('div');
        itemDiv.className = 'pedido-item';
        itemDiv.dataset.pedidoId = pedido.id;

        // --- ESTRUCTURA HTML MODIFICADA ---
        itemDiv.innerHTML = `
            <div class="swipe-action-bg swipe-right-bg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Editar</span>
            </div>
            <div class="swipe-action-bg swipe-left-bg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span>Avanzar</span>
            </div>
            <div class="pedido-item-content">
                <div class="pedido-info">
                    <div class="linea-superior">
                        <span class="cliente-nombre">${cliente ? cliente.nombre : 'Sin Cliente'}</span>
                        <span class="estado-badge" style="color: ${fase.color}; background-color: ${fase.backgroundColor};">${fase.nombre}</span>
                    </div>
                    <div class="linea-inferior">
                        <span class="resumen-pedido">${totalItems} item${totalItems !== 1 ? 's' : ''} - <strong>$${Math.round(totalCosto).toFixed(2)}</strong></span>
                        <span class="hora-registro">${horaRegistro}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

function initSwipeAndLongPressActions(container) {
    const items = container.querySelectorAll('.pedido-item');
    const LONG_PRESS_DURATION = 700; // ms

    items.forEach(item => {
        const content = item.querySelector('.pedido-item-content');
        const pedidoId = item.dataset.pedidoId;
        let isPointerDown = false, hasMoved = false;
        let startX = 0, currentTranslateX = 0;
        let longPressTimer;

        const onPointerMove = (e) => {
            if (!isPointerDown) return;
            const deltaX = e.clientX - startX;
            if (!hasMoved && Math.abs(deltaX) > 10) {
                hasMoved = true;
                clearTimeout(longPressTimer);
            }
            currentTranslateX = deltaX;
            content.style.transform = `translateX(${currentTranslateX}px)`;
        };

        const onPointerUp = () => {
            if (!isPointerDown) return;
            isPointerDown = false;
            clearTimeout(longPressTimer);

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            item.classList.remove('swiping');
            const SWIPE_THRESHOLD = 80;

            if (hasMoved) {
                if (currentTranslateX > SWIPE_THRESHOLD) {
                    handleEditPedido(pedidoId);
                } else if (currentTranslateX < -SWIPE_THRESHOLD) {
                    handleAdvancePhase(pedidoId, item);
                }
                // Animar de vuelta a la posición original para swipes
                content.style.transform = 'translateX(0px)';
            } else {
                // --- ACCIÓN DE TAP ---
                const mainContainer = document.getElementById('main-content');
                renderPedidoGuardadoDetalle(mainContainer, pedidoId, () => renderPedidosGuardados(mainContainer));
            }
            currentTranslateX = 0;
        };

        const onPointerDown = (e) => {
            if (e.button !== 0) return;
            isPointerDown = true;
            hasMoved = false;
            startX = e.clientX;
            item.classList.add('swiping');

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);

            longPressTimer = setTimeout(() => {
                if (!hasMoved) {
                    onPointerUp(); 
                    handleDeletePedido(pedidoId, item);
                }
            }, LONG_PRESS_DURATION);
        };

        content.addEventListener('pointerdown', onPointerDown);
    });
}