import { pedidosGuardados } from './pedidos.guardados.datos.js';
import { clientes } from '../clientes/clientes.datos.js';
import { catalogoProductos } from '../venta/catalogo/catalogo.datos.js';
import { findOptionData } from '../venta/catalogo/modal.logica.js';

export async function renderPedidoGuardadoDetalle(container, pedidoId, onVolverCallback) {
    try {
        const response = await fetch('src/views/pedido.guardado.detalle.html');
        container.innerHTML = await response.text();

        const pedido = pedidosGuardados.find(p => p.id === pedidoId);
        if (!pedido) throw new Error(`Pedido con ID ${pedidoId} no encontrado.`);

        // Configurar botón de volver
        document.getElementById('btn-volver-pedidos').addEventListener('click', onVolverCallback);
        document.getElementById('detalle-pedido-id').textContent = pedido.id;

        // Renderizar información
        renderCliente(pedido.clienteId);
        renderItems(pedido.items);
        renderTotales(pedido.items);

    } catch (error) {
        console.error('Error al renderizar el detalle del pedido:', error);
        container.innerHTML = `<p>Error al cargar el detalle. <a href="#" id="volver-link">Volver</a></p>`;
        container.querySelector('#volver-link').addEventListener('click', (e) => {
            e.preventDefault();
            onVolverCallback();
        });
    }
}

function renderCliente(clienteId) {
    const container = document.getElementById('detalle-cliente-info');
    const cliente = clienteId ? clientes.find(c => c.id === clienteId) : null;

    if (cliente) {
        let nombreMostrado = `${cliente.nombre} ${cliente.apellidos || ''}`.trim();
        if (cliente.alias) nombreMostrado += ` (${cliente.alias})`;
        container.innerHTML = `<h4>Cliente</h4><p>${nombreMostrado}</p>`;
    } else {
        container.innerHTML = `<h4>Cliente</h4><p>Sin cliente asignado</p>`;
    }
}

function renderItems(items) {
    const container = document.getElementById('detalle-items-lista');
    container.innerHTML = '';

    items.forEach(item => {
        if (item.productId === 'ENVIO') return;

        const li = document.createElement('li');
        li.className = 'item-row-ui';

        let nombre = '';
        let detalles = '';

        // --- MODIFICACIÓN: Lógica diferenciada para Productos Adicionales (PA) ---
        if (item.productId === 'PA') {
            // Para PA, el nombre es la descripción y el detalle es "Producto Adicional".
            nombre = (item.personalizations?.descripcion?.[0] || 'Producto Adicional').trim();
            detalles = item.optionName || ''; // Muestra "Producto Adicional" como subtítulo
        } else {
            // Lógica existente para productos del catálogo
            const optionData = findOptionData(item.optionId, catalogoProductos.find(p => p.id === item.productId));
            nombre = optionData ? optionData.nombre : (item.optionName || item.productId);
            
            const detallesPartes = [];
            if (item.quantity) {
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

        li.innerHTML = `
            <div class="item-info">
                <div class="name">${nombre}</div>
                <div class="details">${detalles}</div>
            </div>
            <div class="item-price">$${item.cost.toFixed(2)}</div>
        `;
        container.appendChild(li);
    });
}

// --- REEMPLAZAR ESTA FUNCIÓN COMPLETA ---
function renderTotales(items) {
    const container = document.getElementById('detalle-totales');
    container.innerHTML = '';

    const envioItem = items.find(item => item.productId === 'ENVIO');
    const subtotal = items.reduce((acc, item) => {
        return item.productId !== 'ENVIO' ? acc + item.cost : acc;
    }, 0);
    const total = items.reduce((acc, item) => acc + item.cost, 0);

    // Función auxiliar para crear filas de totales
    const createTotalRow = (label, value, isGrandTotal = false) => {
        const row = document.createElement('div');
        row.className = isGrandTotal ? 'total-row-ui grand-total-ui' : 'total-row-ui';
        row.innerHTML = `
            <span class="label">${label}</span>
            <span class="value">$${value}</span>
        `;
        return row;
    };

    // Renderizar Subtotal
    container.appendChild(createTotalRow('SUBTOTAL', subtotal.toFixed(2)));

    // Renderizar Envío si existe
    if (envioItem) {
        container.appendChild(createTotalRow(envioItem.optionName, envioItem.cost.toFixed(2)));
    }

    // Renderizar TOTAL
    container.appendChild(createTotalRow('TOTAL', Math.round(total).toFixed(2), true));
}