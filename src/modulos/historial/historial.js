// filepath: src/modulos/historial/historial.js
import { ventasDelDia } from '../caja/logica/caja.ventas.datos.js';
import { renderVentaDetalle } from './logica/historial.detalle.js';

export async function renderHistorial(container) {
    try {
        const response = await fetch('src/modulos/historial/views/historial.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista de historial.');
        container.innerHTML = await response.text();

        const listBody = container.querySelector('#historial-list-body');
        renderVentasLista(listBody);

        listBody.addEventListener('click', (e) => {
            const item = e.target.closest('.venta-item');
            if (item) {
                const ventaId = item.dataset.ventaId;
                renderVentaDetalle(container, ventaId);
            }
        });

    } catch (error) {
        console.error('Error al renderizar el historial:', error);
        container.innerHTML = '<p>Error al cargar el historial de ventas.</p>';
    }
}

function renderVentasLista(container) {
    if (ventasDelDia.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay ventas registradas en esta sesión.</p>';
        return;
    }

    container.innerHTML = ventasDelDia.map(venta => {
        const fecha = new Date(venta.fechaCompletado);
        const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        return `
            <div class="venta-item" data-venta-id="${venta.id}">
                <div class="venta-info">
                    <div class="linea-superior">
                        <span class="cliente-nombre">${venta.cliente ? venta.cliente.nombre : 'Cliente Mostrador'}</span>
                        <strong class="venta-total">$${venta.total.toFixed(2)}</strong>
                    </div>
                    <div class="linea-inferior">
                        <span class="venta-id">${venta.id}</span>
                        <span class="venta-hora">${hora}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}