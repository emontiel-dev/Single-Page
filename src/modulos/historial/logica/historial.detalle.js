// filepath: src/modulos/historial/logica/historial.detalle.js
// MODIFICADO: Corregir la ruta relativa para apuntar a la ubicación correcta en el módulo 'caja'
import { ventasDelDia } from '../../caja/logica/caja.ventas.datos.js';
import { renderHistorial } from '../historial.js';

// Referencias a los elementos del DOM
let containerElement;

export async function renderVentaDetalle(container, ventaId) {
    containerElement = container;
    const venta = ventasDelDia.find(v => v.id === ventaId);
    if (!venta) {
        alert('Venta no encontrada.');
        renderHistorial(container);
        return;
    }

    const response = await fetch('src/modulos/historial/views/historial.detalle.html');
    container.innerHTML = await response.text();

    document.getElementById('detalle-venta-id').textContent = `Detalle Venta: ${venta.id}`;
    document.getElementById('btn-volver-historial').addEventListener('click', () => renderHistorial(container));

    // Función principal que orquesta el renderizado del contenido
    renderDetalleContent(venta);
}

function renderDetalleContent(venta) {
    // Clasificar items
    const polloItems = [];
    const paItems = [];
    const cargoItems = [];
    let envioItem = null;

    venta.items.forEach(item => {
        if (item.productId === 'ENVIO') envioItem = item;
        else if (item.productId === 'CARGO') cargoItems.push(item);
        else if (item.productId === 'PA') paItems.push(item);
        else polloItems.push(item);
    });

    // Renderizar cada sección
    renderClienteInfo(venta.cliente);
    renderItemsSections(polloItems, paItems, cargoItems);
    renderTotales(venta.items, envioItem);
    renderPago(venta);
}

function renderClienteInfo(cliente) {
    const container = document.getElementById('detalle-cliente-info');
    if (!container) return;

    if (cliente) {
        container.innerHTML = `
            <h4>Cliente</h4>
            <p><strong>Nombre:</strong> ${cliente.nombre}</p>
            ${cliente.telefonos && cliente.telefonos.length > 0 ? `<p><strong>Teléfono:</strong> ${cliente.telefonos[0].numero}</p>` : ''}
        `;
    } else {
        container.innerHTML = `<h4>Cliente Mostrador</h4>`;
    }
}

function renderItemsSections(polloItems, paItems, cargoItems) {
    const polloSection = containerElement.querySelector('.items-section.pollo-items');
    const paSection = containerElement.querySelector('.items-section.pa-items');
    const cargoSection = containerElement.querySelector('.items-section.cargo-items');

    if (polloItems.length > 0 && polloSection) {
        const list = polloSection.querySelector('ul');
        list.innerHTML = '';
        polloItems.forEach(item => list.appendChild(renderPolloItemDetalle(item)));
        polloSection.classList.remove('hidden');
    }

    if (paItems.length > 0 && paSection) {
        const list = paSection.querySelector('ul');
        list.innerHTML = '';
        paItems.forEach(item => list.appendChild(renderPaItemDetalle(item)));
        paSection.classList.remove('hidden');
    }

    if (cargoItems.length > 0 && cargoSection) {
        const list = cargoSection.querySelector('ul');
        list.innerHTML = '';
        cargoItems.forEach(item => list.appendChild(renderCargoItemDetalle(item)));
        cargoSection.classList.remove('hidden');
    }
}

function renderTotales(items, envioItem) {
    const container = document.getElementById('detalle-totales');
    if (!container) return;
    container.innerHTML = '';

    const subtotal = items.reduce((acc, item) => (item.productId !== 'ENVIO' ? acc + item.cost : acc), 0);
    const total = items.reduce((acc, item) => acc + item.cost, 0);

    container.appendChild(createTotalRow('Subtotal', subtotal.toFixed(2)));
    if (envioItem) {
        container.appendChild(createTotalRow(envioItem.optionName, envioItem.cost.toFixed(2)));
    }
    container.appendChild(createTotalRow('TOTAL', Math.round(total).toFixed(2), true));
}

function renderPago(venta) {
    const container = document.getElementById('detalle-pago');
    if (!container) return;

    const pagoConHtml = Object.entries(venta.pagoCon).map(([valor, cant]) => `<li>${cant} x $${valor}</li>`).join('');
    const cambioHtml = Object.entries(venta.cambioEntregado).map(([valor, cant]) => `<li>${cant} x $${valor}</li>`).join('');
    const totalPagado = Object.entries(venta.pagoCon).reduce((acc, [valor, cant]) => acc + (valor * cant), 0);

    container.innerHTML = `
        <div class="payment-section">
            <strong>Pagó con: $${totalPagado.toFixed(2)}</strong>
            <ul>${pagoConHtml}</ul>
        </div>
        <div class="payment-section">
            <strong>Cambio entregado: $${(totalPagado - venta.total).toFixed(2)}</strong>
            <ul>${cambioHtml}</ul>
        </div>
    `;
}

// --- Funciones Auxiliares de Renderizado de Items (Inspiradas en carrito.ver.items.js) ---

function createBaseItemRow(item) {
    const li = document.createElement('li');
    li.className = 'item-row-ui';
    li.innerHTML = `
        <div class="item-info">
            <div class="name"></div>
            <div class="details"></div>
        </div>
        <span class="item-price">$${item.cost.toFixed(2)}</span>
    `;
    return li;
}

function renderPolloItemDetalle(item) {
    const li = createBaseItemRow(item);
    const nameDiv = li.querySelector('.name');
    const detailsDiv = li.querySelector('.details');

    let nameText = item.optionName || item.productId;
    if (item.personalizations) {
        const allPersonalizations = Object.values(item.personalizations).flat().join(', ');
        if (allPersonalizations) nameText += ` | ${allPersonalizations}`;
    }
    nameDiv.textContent = nameText;

    // --- LÓGICA MEJORADA PARA MOSTRAR DESCUENTOS ---

    // 1. Calcular el precio unitario original (antes de cualquier descuento)
    const originalUnitPrice = item.pricePerKg !== undefined && item.pricePerKg !== null
        ? item.pricePerKg
        : (item.discount && item.discount.originalCost && item.quantity > 0 ? (item.discount.originalCost / item.quantity) : (item.cost > 0 && item.quantity > 0 ? (item.cost / item.quantity) : 0));

    // 2. Mostrar siempre la línea de cantidad y precio original
    detailsDiv.innerHTML = `<div>${item.quantity.toFixed(3)}(kg) * $${originalUnitPrice.toFixed(2)}</div>`;

    // 3. Si hay un descuento, renderizar sus detalles
    if (item.discount) {
        const discountType = item.discount.tipoDescuentoAplicado;
        const originalCost = item.discount.originalCost;
        const discountAmount = item.discount.monto;
        const newPricePerKg = item.discount.newPricePerKg;

        const discountLabelLine = document.createElement('div');
        discountLabelLine.className = 'item-discount';
        detailsDiv.appendChild(discountLabelLine);

        switch (discountType) {
            case 'Cantidad':
                discountLabelLine.textContent = `Descuento por cantidad: $${originalCost.toFixed(2)} - $${discountAmount.toFixed(2)}`;
                break;
            case 'Porcentaje':
                const percentageApplied = originalCost > 0 ? (discountAmount / originalCost) * 100 : 0;
                discountLabelLine.textContent = `Descuento por porcentaje: $${originalCost.toFixed(2)} - ${percentageApplied.toFixed(2)}%`;
                break;
            case 'Precio por Kg':
                discountLabelLine.textContent = 'Descuento por kg:';
                const priceChangeLine = document.createElement('div');
                priceChangeLine.textContent = `$${originalUnitPrice.toFixed(2)} > $${newPricePerKg.toFixed(2)}`;
                detailsDiv.appendChild(priceChangeLine);
                break;
            default:
                discountLabelLine.textContent = `Descuento: ${item.discount.descripcion}`;
        }
    }

    return li;
}

function renderPaItemDetalle(item) {
    const li = createBaseItemRow(item);
    li.querySelector('.name').textContent = item.personalizations?.descripcion?.[0] || 'Producto Adicional';
    li.querySelector('.details').textContent = item.optionName;
    return li;
}

function renderCargoItemDetalle(item) {
    const li = createBaseItemRow(item);
    li.querySelector('.name').textContent = item.personalizations?.descripcion?.[0] || 'Cargo Manual';
    li.querySelector('.details').textContent = item.optionName;
    return li;
}

function createTotalRow(label, value, isGrandTotal = false) {
    const row = document.createElement('div');
    row.className = isGrandTotal ? 'total-row-ui grand-total-ui' : 'total-row-ui';
    row.innerHTML = `
        <span class="label">${label}</span>
        <span class="value">$${value}</span>
    `;
    return row;
}