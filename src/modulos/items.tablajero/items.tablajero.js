import { pedidosGuardados } from '../pedidos/pedidos.guardados.datos.js';
import { FASES_PEDIDO } from '../pedidos/pedidos.fases.datos.js';
import { findClienteById } from '../clientes/clientes.data.js'; // <-- MODIFICADO
import { findOptionData } from '../venta/catalogo/modal.logica.js';
import { catalogoProductos } from '../venta/catalogo/catalogo.datos.js';
import { openItemsTablajeroModal } from './items.tablajero.modal.js';

let mainContainer = null;

export async function renderItemsTablajero(container) {
    mainContainer = container;
    try {
        const response = await fetch('src/views/items.tablajero/items.tablajero.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista de tablajero.');
        container.innerHTML = await response.text();
        
        renderLista();

    } catch (error) {
        console.error('Error al renderizar vista de tablajero:', error);
        container.innerHTML = '<p>Error al cargar la sección del tablajero.</p>';
    }
}

function getTablajeroItems() {
    const itemsParaProcesar = [];
    pedidosGuardados
        .filter(p => p.faseId === FASES_PEDIDO.PROCESANDO.id)
        .forEach(pedido => {
            pedido.items.forEach((item, index) => {
                if (item.productId === 'ENVIO' || item.productId === 'CARGO') return;

                itemsParaProcesar.push({
                    ...item,
                    pedidoId: pedido.id,
                    itemIndexInPedido: index,
                    cliente: findClienteById(pedido.clienteId) // <-- MODIFICADO
                });
            });
        });
    return itemsParaProcesar.sort((a, b) => (a.estado === 'LISTO' ? 1 : -1));
}

// --- NUEVA FUNCIÓN DE UTILIDAD ---
// Centraliza la lógica para obtener los textos de visualización de un item.
// Se exporta para poder ser usada en otros módulos (ej. el modal) y mantener la consistencia.
export function getItemDisplayDetails(item) {
    const productData = catalogoProductos.find(p => p.id === item.productId);
    const optionData = findOptionData(item.optionId, productData);

    let displayName = '';
    let detailsString = '';

    if (item.productId === 'PA') {
        // Lógica para Productos Adicionales
        displayName = item.personalizations?.descripcion?.[0] || 'Producto Adicional';
        detailsString = `Costo: $${item.cost.toFixed(2)}`;
    } else {
        // Lógica para productos del catálogo
        const baseName = optionData ? optionData.nombre : (item.optionName || 'Producto Desconocido');
        
        // Las personalizaciones ya se guardan como nombres legibles. Solo necesitamos unirlas.
        const personalizaciones = item.personalizations ? Object.values(item.personalizations).flat().join(', ') : '';
        
        displayName = `${baseName}${personalizaciones ? ` | ${personalizaciones}` : ''}`;
        
        const quantityString = item.quantity ? `${item.quantity.toFixed(3)}(kg)` : '';
        const costString = `* ($${item.cost.toFixed(2)})`;
        detailsString = `${quantityString} ${costString}`.trim();
    }

    return { displayName, detailsString };
}


// --- FUNCIÓN DE RENDERIZADO REFACTORIZADA ---
function renderLista() {
    const container = mainContainer.querySelector('#tablajero-list-body');
    if (!container) return;
    container.innerHTML = '';

    const items = getTablajeroItems();
    items.forEach(item => {
        // Usar la nueva función de utilidad para obtener los textos
        const { displayName, detailsString } = getItemDisplayDetails(item);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'tablajero-item';
        if (item.estado === 'LISTO') {
            itemDiv.classList.add('listo');
        }
        itemDiv.dataset.pedidoId = item.pedidoId;
        itemDiv.dataset.itemIndex = item.itemIndexInPedido;

        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-cliente">${item.cliente ? item.cliente.nombre : 'Sin Cliente'}</div>
                <div class="item-producto">${displayName}</div>
                <div class="item-detalles">${detailsString}</div>
            </div>
            <div class="item-estado">
                <span class="estado-badge" style="background-color: ${item.estado === 'LISTO' ? 'var(--verde-exito)' : 'var(--amarillo-polleria)'}; color: ${item.estado === 'LISTO' ? 'white' : 'black'};">
                    ${item.estado === 'LISTO' ? 'Listo' : 'Pendiente'}
                </span>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    container.addEventListener('click', handleItemClick);
}

function handleItemClick(event) {
    const itemElement = event.target.closest('.tablajero-item');
    if (itemElement && !itemElement.classList.contains('listo')) {
        const { pedidoId, itemIndex } = itemElement.dataset;
        openItemsTablajeroModal(pedidoId, parseInt(itemIndex, 10), renderLista);
    }
}