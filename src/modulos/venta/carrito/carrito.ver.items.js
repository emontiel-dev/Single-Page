// src/modulos/venta/carrito/carrito.ver.items.js

// Este archivo se encargará de la lógica y renderizado del modal para ver el detalle del carrito como un ticket.

import { cartItems } from './carrito.js'; // Importar los items del carrito
import { resetModalLogic as resetCatalogoModalLogic } from '../catalogo/modal.logica.js'; // Importar limpieza modal catálogo
// Importar limpieza de otros modales si es necesario
// import { resetDescuentoModalLogic } from '../descuento/descuento.modal.js';
// import { resetCargoModalLogic } from '../cargo/cargo.modal.js';
// import { resetPaModalLogic } from '../pa/pa.modal.js';
// import { resetEnvioModalLogic } from '../envio/envio.modal.js';


// Referencias a elementos UI del modal de ver items
let carritoVerItemsModalElement = null;
let ticketDateElement = null;
let ticketTimeElement = null;
let ticketItemsPolloElement = null;
let ticketItemsPaElement = null;
let ticketItemsCargoElement = null;
let ticketItemEnvioElement = null;
let ticketTotalValueElement = null;
let cerrarVerItemsModalBtn = null;

// Referencias a las secciones para poder ocultarlas/mostrarlas
let sectionItemsPollo = null;
let sectionItemsPa = null;
let sectionItemsCargo = null;
let sectionItemEnvio = null;


// Función para crear y mostrar el modal de ver items
export async function openCarritoVerItemsModal() {
    // --- Lógica para cerrar cualquier modal existente ---
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        // Opcional: Limpiar la lógica asociada al modal cerrado si es necesario
        if (existingModal.id === 'product-modal-container') { resetCatalogoModalLogic(); }
        // if (existingModal.id === 'descuento-modal-container') { resetDescuentoModalLogic(); }
        // if (existingModal.id === 'cargo-modal-container') { resetCargoModalLogic(); }
        // if (existingModal.id === 'pa-modal-container') { resetPaModalLogic(); }
        // if (existingModal.id === 'envio-modal-container') { resetEnvioModalLogic(); }
    }
    // ----------------------------------------------------


    // Si el carrito está vacío, no abrimos el modal
    if (cartItems.length === 0) {
        alert('El carrito está vacío.');
        return;
    }


    // Si el modal ya existe en el DOM, no hacemos nada (o lo hacemos visible si estaba oculto)
    carritoVerItemsModalElement = document.getElementById('carrito-ver-items-modal-container');
    if (carritoVerItemsModalElement) {
         console.log('Modal de ver items ya está en el DOM.');
         if (!carritoVerItemsModalElement.classList.contains('visible')) {
             setTimeout(() => {
                 carritoVerItemsModalElement.classList.add('visible');
                 // Renderizar el contenido del ticket con los items actuales
                 renderTicketContent();
             }, 10);
         }
         return;
    }


    // Cargar la plantilla HTML del modal
    try {
        const response = await fetch('src/views/carrito.ver.items.html');
        if (!response.ok) {
            console.error('Error loading carrito.ver.items modal template:', response.statusText);
            return;
        }
        const modalHtml = await response.text();

        // Crear un elemento div temporal para parsear el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        carritoVerItemsModalElement = tempDiv.querySelector('#carrito-ver-items-modal-container');

        if (!carritoVerItemsModalElement) {
            console.error('Carrito ver items modal container not found in template.');
            return;
        }

        // Obtener referencias a los elementos dentro del modal
        ticketDateElement = carritoVerItemsModalElement.querySelector('#ticket-date');
        ticketTimeElement = carritoVerItemsModalElement.querySelector('#ticket-time');
        ticketItemsPolloElement = carritoVerItemsModalElement.querySelector('#ticket-items-pollo');
        ticketItemsPaElement = carritoVerItemsModalElement.querySelector('#ticket-items-pa');
        ticketItemsCargoElement = carritoVerItemsModalElement.querySelector('#ticket-items-cargo');
        ticketItemEnvioElement = carritoVerItemsModalElement.querySelector('#ticket-item-envio');
        ticketTotalValueElement = carritoVerItemsModalElement.querySelector('#ticket-total-value');
        cerrarVerItemsModalBtn = carritoVerItemsModalElement.querySelector('#cerrar-ver-items-modal-btn');

        // Obtener referencias a las secciones
        sectionItemsPollo = carritoVerItemsModalElement.querySelector('.ticket-section.items-pollo');
        sectionItemsPa = carritoVerItemsModalElement.querySelector('.ticket-section.items-pa');
        sectionItemsCargo = carritoVerItemsModalElement.querySelector('.ticket-section.items-cargo');
        sectionItemEnvio = carritoVerItemsModalElement.querySelector('.ticket-section.item-envio');


        // Añadir event listeners
        if (cerrarVerItemsModalBtn) cerrarVerItemsModalBtn.addEventListener('click', closeCarritoVerItemsModal);

        // Opcional: Añadir listener para cerrar con la tecla Escape
        // document.addEventListener('keydown', handleEscapeKey); // Implementar si es necesario


        // Añadir el modal al cuerpo del documento
        document.body.appendChild(carritoVerItemsModalElement);

    } catch (error) {
        console.error('Error creating carrito ver items modal:', error);
        return;
    }

    // Renderizar el contenido del ticket con los items actuales
    renderTicketContent();


    // Hacer el modal visible con una pequeña demora para la transición
    setTimeout(() => {
        carritoVerItemsModalElement.classList.add('visible');
    }, 10);
}

// Función para cerrar el modal de ver items
export function closeCarritoVerItemsModal() {
    if (carritoVerItemsModalElement) {
        // Iniciar la transición de salida
        carritoVerItemsModalElement.classList.remove('visible');
        // Eliminar el modal del DOM después de que termine la transición
        carritoVerItemsModalElement.addEventListener('transitionend', () => {
            // Limpiar event listeners
            if (cerrarVerItemsModalBtn) cerrarVerItemsModalBtn.removeEventListener('click', closeCarritoVerItemsModal);
            // document.removeEventListener('keydown', handleEscapeKey); // Remover listener de Escape

            carritoVerItemsModalElement.remove();
            // Limpiar referencias
            carritoVerItemsModalElement = null;
            ticketDateElement = null;
            ticketTimeElement = null;
            ticketItemsPolloElement = null;
            ticketItemsPaElement = null;
            ticketItemsCargoElement = null;
            ticketItemEnvioElement = null;
            ticketTotalValueElement = null;
            cerrarVerItemsModalBtn = null;
            sectionItemsPollo = null;
            sectionItemsPa = null;
            sectionItemsCargo = null;
            sectionItemEnvio = null;

        }, { once: true }); // Asegura que el listener se elimine después de ejecutarse una vez
    }
}

// --- Funciones de Renderizado del Ticket ---

function renderTicketContent() {
    // Limpiar secciones antes de renderizar
    if (ticketItemsPolloElement) ticketItemsPolloElement.innerHTML = '';
    if (ticketItemsPaElement) ticketItemsPaElement.innerHTML = '';
    if (ticketItemsCargoElement) ticketItemsCargoElement.innerHTML = '';
    if (ticketItemEnvioElement) ticketItemEnvioElement.innerHTML = '';

    // Ocultar todas las secciones por defecto
    if (sectionItemsPollo) sectionItemsPollo.classList.add('hidden');
    if (sectionItemsPa) sectionItemsPa.classList.add('hidden');
    if (sectionItemsCargo) sectionItemsCargo.classList.add('hidden');
    if (sectionItemEnvio) sectionItemEnvio.classList.add('hidden');


    let total = 0;
    const polloItems = [];
    const paItems = [];
    const cargoItems = [];
    let envioItem = null; // Asumimos solo un item de envío


    // Clasificar los items del carrito
    cartItems.forEach(item => {
        if (item.productId === 'ENVIO') {
            envioItem = item; // Almacenar el item de envío
        } else if (item.productId === 'CARGO') {
            cargoItems.push(item); // Añadir a la lista de cargos
        } else if (item.productId === 'PA') {
            paItems.push(item); // Añadir a la lista de productos adicionales
        } else {
            // Asumimos que es un producto de pollo (o similar)
            polloItems.push(item);
        }
        total += item.cost; // Sumar al total (el costo del item ya es el final)
    });


    // Renderizar secciones si hay items
    if (polloItems.length > 0 && ticketItemsPolloElement) {
        polloItems.forEach(item => {
            ticketItemsPolloElement.appendChild(renderTicketItem(item));
        });
        if (sectionItemsPollo) sectionItemsPollo.classList.remove('hidden');
    }

    if (paItems.length > 0 && ticketItemsPaElement) {
        paItems.forEach(item => {
            ticketItemsPaElement.appendChild(renderTicketItem(item));
        });
        if (sectionItemsPa) sectionItemsPa.classList.remove('hidden');
    }

    if (cargoItems.length > 0 && ticketItemsCargoElement) {
        cargoItems.forEach(item => {
            ticketItemsCargoElement.appendChild(renderTicketItem(item));
        });
        if (sectionItemsCargo) sectionItemsCargo.classList.remove('hidden');
    }

    if (envioItem && ticketItemEnvioElement) {
        ticketItemEnvioElement.appendChild(renderTicketItem(envioItem));
        if (sectionItemEnvio) sectionItemEnvio.classList.remove('hidden');
    }


    // Actualizar fecha y hora
    const now = new Date();
    if (ticketDateElement) ticketDateElement.textContent = now.toLocaleDateString();
    if (ticketTimeElement) ticketTimeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


    // Actualizar total
    if (ticketTotalValueElement) {
        // --- MODIFICACIÓN: Aplicar redondeo al total antes de mostrarlo ---
        const roundedTotal = Math.round(total);
        ticketTotalValueElement.textContent = `$${roundedTotal.toFixed(2)}`;
        // --- Fin MODIFICACIÓN ---
    }
}

// Función auxiliar para renderizar un solo item en el ticket
function renderTicketItem(item) {
    // --- MODIFICACIÓN: Crear un contenedor para el grupo de item ---
    const itemGroupContainer = document.createElement('div');
    itemGroupContainer.classList.add('ticket-item-group');
    // --- Fin MODIFICACIÓN ---


    // Línea principal del item (nombre y subtotal)
    const mainLine = document.createElement('div');
    mainLine.classList.add('item-line');

    const itemNameSpan = document.createElement('span');
    itemNameSpan.classList.add('item-name');

    const itemPriceSpan = document.createElement('span');
    itemPriceSpan.classList.add('item-price');
    itemPriceSpan.textContent = `$${item.cost.toFixed(2)}`; // Mostrar el costo final del item

    mainLine.appendChild(itemNameSpan);
    mainLine.appendChild(itemPriceSpan);
    // --- MODIFICACIÓN: Añadir la línea principal al grupo ---
    itemGroupContainer.appendChild(mainLine);
    // --- Fin MODIFICACIÓN ---


    // --- MODIFICACIÓN: Crear un contenedor para los detalles ---
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('item-details-container');
    // --- Fin MODIFICACIÓN ---


    // Detalles del item (cantidad * precio unitario, personalizaciones, descripción PA/Cargo)
    // Ya no necesitamos la línea de detalle principal, los detalles irán dentro de detailsContainer
    // const detailLine = document.createElement('div');
    // detailLine.classList.add('item-line', 'item-detail');

    // let detailText = ''; // Ya no construimos un solo string de detalle aquí

    if (item.productId === 'ENVIO') {
        // Para envío, mostrar la descripción como detalle
        const envioDesc = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
            ? item.personalizations.descripcion[0]
            : item.descripcion || '';

        itemNameSpan.textContent = item.optionName; // Nombre fijo "Envío"

        // Añadir la descripción como una línea de detalle
        if (envioDesc) {
            const detailLine = document.createElement('div');
            detailLine.classList.add('item-detail');
            detailLine.textContent = envioDesc;
            detailsContainer.appendChild(detailLine);
        }

    } else if (item.productId === 'CARGO') {
        // Para cargo, obtener la descripción ingresada
        const cargoDescription = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
            ? item.personalizations.descripcion[0]
            : 'Cargo Manual'; // Fallback si no hay descripción

        // --- MODIFICACIÓN: Intercambiar nombre y detalle para Cargo ---
        itemNameSpan.textContent = cargoDescription; // Descripción ingresada como nombre
        const detailLine = document.createElement('div');
        detailLine.classList.add('item-detail');
        detailLine.textContent = item.optionName; // Nombre fijo "Cargo Manual" como detalle
        detailsContainer.appendChild(detailLine);
        // --- Fin MODIFICACIÓN ---

    } else if (item.productId === 'PA') {
         // Para PA, mostrar la descripción ingresada como nombre principal
         const paDescription = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
            ? item.personalizations.descripcion[0]
            : 'Producto Adicional';
         itemNameSpan.textContent = paDescription; // Descripción como nombre

         // Añadir el nombre fijo "Producto Adicional" como detalle
         const detailLine = document.createElement('div');
         detailLine.classList.add('item-detail');
         detailLine.textContent = item.optionName; // Nombre fijo "Producto Adicional"
         detailsContainer.appendChild(detailLine);

    }
     else {
        // Para productos de pollo (o similares)
        const optionNameDisplay = item.optionName || item.productId;
        itemNameSpan.textContent = optionNameDisplay; // Nombre del producto/opción

        // Línea de detalle: Cantidad * Precio Unitario
        const unitPriceDisplay = item.pricePerKg !== undefined && item.pricePerKg !== null
            ? item.pricePerKg.toFixed(2)
            : (item.quantity > 0 ? (item.cost / item.quantity).toFixed(2) : '0.00');

        const quantityPriceLine = document.createElement('div');
        quantityPriceLine.classList.add('item-detail');
        quantityPriceLine.textContent = `${item.quantity.toFixed(3)}(kg) * $${unitPriceDisplay}`;
        detailsContainer.appendChild(quantityPriceLine);


        // Añadir personalizaciones si existen como líneas de detalle separadas
        if (item.personalizations) {
            Object.values(item.personalizations).flat().forEach(pers => {
                const persLine = document.createElement('div');
                persLine.classList.add('item-detail');
                persLine.textContent = pers; // Mostrar cada personalización en una línea
                detailsContainer.appendChild(persLine);
            });
        }

        // Línea de descuento si existe (ahora dentro del contenedor de detalles)
        if (item.discount) {
            const discountLine = document.createElement('div');
            discountLine.classList.add('item-discount'); // Usar la clase específica para estilos de descuento
            discountLine.textContent = item.discount.descripcion; // Mostrar la descripción del descuento
            detailsContainer.appendChild(discountLine);
        }
    }

    // --- MODIFICACIÓN: Añadir el contenedor de detalles al grupo, solo si tiene contenido ---
    if (detailsContainer.hasChildNodes()) {
        itemGroupContainer.appendChild(detailsContainer);
    }
    // --- Fin MODIFICACIÓN ---


    // Retornar el contenedor del grupo de item
    return itemGroupContainer;
}


// Opcional: Handler para cerrar con Escape
// function handleEscapeKey(event) {
//     if (event.key === 'Escape') {
//         closeCarritoVerItemsModal();
//     }
// }