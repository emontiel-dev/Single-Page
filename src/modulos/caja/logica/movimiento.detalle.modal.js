// filepath: src/modulos/caja/logica/movimiento.detalle.modal.js
import { denominacionColors } from './caja.logica.js';

let modalElement = null;

function closeModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
}

function renderDenominaciones(titulo, denominaciones) {
    if (!denominaciones || Object.keys(denominaciones).length === 0) return '';
    
    const itemsHtml = Object.entries(denominaciones)
        .map(([valor, cant]) => `<li class="pago-seleccion-item" style="background-color: ${denominacionColors[valor] || '#95A5A6'};">${cant} x $${valor}</li>`)
        .join('');

    return `
        <div class="payment-section">
            <strong>${titulo}</strong>
            <ul>${itemsHtml}</ul>
        </div>
    `;
}

export async function openMovimientoDetalleModal(movimiento) {
    const response = await fetch('src/modulos/caja/views/movimiento.detalle.modal.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('movimiento-detalle-modal-container');

    const body = modalElement.querySelector('#movimiento-detalle-body');
    const detalles = movimiento.detalles || {};
    let contentHtml = '';

    contentHtml += renderDenominaciones('Pagado Con:', detalles.pagoCon);
    contentHtml += renderDenominaciones('Cambio Entregado:', detalles.cambioEntregado);
    contentHtml += renderDenominaciones('Egresado de Caja:', detalles.egresadoDeCaja);
    contentHtml += renderDenominaciones('Cambio Recibido:', detalles.cambioRecibido);

    if (!contentHtml) {
        contentHtml = '<p>Este movimiento no tiene un desglose de denominaciones.</p>';
    }

    body.innerHTML = contentHtml;
    modalElement.querySelector('#movimiento-detalle-cerrar-btn').addEventListener('click', closeModal);
    modalElement.classList.add('visible');
}