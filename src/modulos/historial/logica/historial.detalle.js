// filepath: src/modulos/historial/logica/historial.detalle.js
// MODIFICADO: Corregir la ruta relativa para apuntar a la ubicación correcta en el módulo 'caja'
import { ventasDelDia } from '../../caja/logica/caja.ventas.datos.js';
import { renderHistorial } from '../historial.js';

export async function renderVentaDetalle(container, ventaId) {
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

    // Renderizar las diferentes secciones (cliente, items, totales, pago)
    // (Esta lógica sería similar a la de `pedido.guardado.detalle.js` pero adaptada a los datos de la venta)
    renderClienteInfo(venta.cliente);
    renderItems(venta.items);
    renderTotales(venta);
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

function renderItems(items) {
    const container = document.getElementById('detalle-items-lista');
    if (!container) return;

    container.innerHTML = items.map(item => {
        let nombre = '';
        let detalles = '';

        // Lógica diferenciada para cada tipo de item
        if (item.productId === 'PA') {
            // Para Productos Adicionales, el nombre es la descripción
            nombre = (item.personalizations?.descripcion?.[0] || 'Producto Adicional').trim();
            detalles = item.optionName || '';
        } else if (item.productId === 'ENVIO' || item.productId === 'CARGO') {
            // Para Envío o Cargos, el nombre es fijo y el detalle es la descripción
            nombre = item.optionName;
            detalles = (item.personalizations?.descripcion?.[0] || '').trim();
        } else {
            // Lógica para productos normales del catálogo
            nombre = item.optionName || item.productId;
            
            const detallesPartes = [];
            // CORRECCIÓN: Usar 'quantity' y verificar que exista
            if (typeof item.quantity === 'number') {
                detallesPartes.push(`${item.quantity.toFixed(3)}(kg)`);
            }
            if (item.personalizations) {
                const allPersonalizations = Object.values(item.personalizations).flat().join(', ');
                if (allPersonalizations) {
                    detallesPartes.push(allPersonalizations);
                }
            }
            detalles = detallesPartes.join(' | ');
        }

        // Usar una estructura de renderizado más robusta y consistente
        return `
            <li class="item-row-ui">
                <div class="item-info">
                    <div class="name">${nombre}</div>
                    <div class="details">${detalles}</div>
                </div>
                <div class="item-price">$${item.cost.toFixed(2)}</div>
            </li>
        `;
    }).join('');
}

function renderTotales(venta) {
    const container = document.getElementById('detalle-totales');
    if (!container) return;
    container.innerHTML = `
        <div class="total-row-ui grand-total-ui">
            <span class="label">TOTAL</span>
            <span class="value">$${venta.total.toFixed(2)}</span>
        </div>
    `;
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