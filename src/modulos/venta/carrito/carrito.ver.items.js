// Reemplaza el contenido de tu archivo con este código
import { cartItems, selectedClient } from './carrito.js'; // <-- IMPORTAR selectedClient
import { resetModalLogic as resetCatalogoModalLogic } from '../catalogo/modal.logica.js';

// --- CAMBIOS CLAVE: Referencias a elementos UI del NUEVO modal ---
let carritoVerItemsModalElement = null;
let cerrarVerItemsModalBtn = null;
// Eliminamos receiptItemsList ya que ahora usaremos contenedores por sección
// let receiptItemsList = null;       // Contenedor para la lista de todos los items
let totalsSection = null;          // Contenedor para las filas de totales
let ticketDateTimeElement = null;  // Elemento para fecha y hora combinadas
let ticketIdElement = null;        // (Opcional) Para un futuro ID de ticket
let cobrarBtnTotalSpan = null;     // <-- AÑADIDO: Referencia al span del total en el botón Cobrar

// --- NUEVAS REFERENCIAS A CONTENEDORES POR SECCIÓN ---
let ticketItemsPolloElement = null;
let ticketItemsPaElement = null;
let ticketItemsCargoElement = null;
let ticketClienteInfoElement = null; // <-- NUEVA REFERENCIA

// Eliminamos la referencia al contenedor de envío ya que se renderiza en totales
// let ticketItemEnvioElement = null;

// --- NUEVAS REFERENCIAS A LAS SECCIONES COMPLETAS (para ocultar/mostrar) ---
let sectionItemsPollo = null;
let sectionItemsPa = null;
let sectionItemsCargo = null;
// Eliminamos la referencia a la sección de envío
// let sectionItemEnvio = null;


// Función para crear y mostrar el modal (Lógica principal sin cambios)
export async function openCarritoVerItemsModal() {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        if (existingModal.id === 'product-modal-container') { resetCatalogoModalLogic(); }
        // TODO: Añadir limpieza para otros modales si existen (descuento, cargo, pa, envio)
    }

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


    try {
        const response = await fetch('src/views/venta/carrito.ver.items.html');
        if (!response.ok) throw new Error(`Error loading modal template: ${response.statusText}`);

        const modalHtml = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        carritoVerItemsModalElement = tempDiv.querySelector('#carrito-ver-items-modal-container');

        if (!carritoVerItemsModalElement) throw new Error('Modal container not found in template.');

        // --- CAMBIOS CLAVE: Obtener referencias a los NUEVOS elementos ---
        cerrarVerItemsModalBtn = carritoVerItemsModalElement.querySelector('#cerrar-ver-items-modal-btn');
        // Eliminamos la referencia a receiptItemsList
        // receiptItemsList = carritoVerItemsModalElement.querySelector('#receipt-items-list');
        totalsSection = carritoVerItemsModalElement.querySelector('.totals-section');
        ticketDateTimeElement = carritoVerItemsModalElement.querySelector('#ticket-date-time');
        ticketIdElement = carritoVerItemsModalElement.querySelector('#ticket-id'); // Opcional

        // --- OBTENER REFERENCIAS A CONTENEDORES POR SECCIÓN ---
        ticketItemsPolloElement = carritoVerItemsModalElement.querySelector('#ticket-items-pollo');
        ticketItemsPaElement = carritoVerItemsModalElement.querySelector('#ticket-items-pa');
        ticketItemsCargoElement = carritoVerItemsModalElement.querySelector('#ticket-items-cargo');
        ticketClienteInfoElement = carritoVerItemsModalElement.querySelector('#ticket-cliente-info'); // <-- OBTENER REFERENCIA
        cobrarBtnTotalSpan = carritoVerItemsModalElement.querySelector('#btn-cobrar #carrito-total-value'); // <-- AÑADIDO: Obtener referencia

        // --- OBTENER REFERENCIAS A LAS SECCIONES COMPLETAS ---
        sectionItemsPollo = carritoVerItemsModalElement.querySelector('.items-section.pollo-items');
        sectionItemsPa = carritoVerItemsModalElement.querySelector('.items-section.pa-items');
        sectionItemsCargo = carritoVerItemsModalElement.querySelector('.items-section.cargo-items');
        // Eliminamos la referencia a la sección de envío
        //sectionItemEnvio = carritoVerItemsModalElement.querySelector('.items-section.envio-item');


        if (cerrarVerItemsModalBtn) cerrarVerItemsModalBtn.addEventListener('click', closeCarritoVerItemsModal);

        document.body.appendChild(carritoVerItemsModalElement);

    } catch (error) {
        console.error('Error creating receipt modal:', error);
        return;
    }

    renderTicketContent();

    setTimeout(() => {
        if(carritoVerItemsModalElement) carritoVerItemsModalElement.classList.add('visible');
    }, 10);
}

// Función para cerrar el modal (Lógica sin cambios)
export function closeCarritoVerItemsModal() {
    if (carritoVerItemsModalElement) {
        carritoVerItemsModalElement.classList.remove('visible');
        carritoVerItemsModalElement.addEventListener('transitionend', () => {
            // Limpiar event listeners
            if (cerrarVerItemsModalBtn) cerrarVerItemsModalBtn.removeEventListener('click', closeCarritoVerItemsModal);

            carritoVerItemsModalElement.remove();
            // Limpiar referencias
            carritoVerItemsModalElement = null;
            cerrarVerItemsModalBtn = null;
            // Eliminamos receiptItemsList
            // receiptItemsList = null;
            totalsSection = null;
            ticketDateTimeElement = null;
            ticketIdElement = null;
            ticketItemsPolloElement = null;
            ticketItemsPaElement = null;
            ticketItemsCargoElement = null;
            // Eliminamos la limpieza de referencia del contenedor de envío
            // ticketItemEnvioElement = null;
            sectionItemsPollo = null;
            sectionItemsPa = null;
            sectionItemsCargo = null;
            // Eliminamos la limpieza de referencia de la sección de envío
            //sectionItemEnvio = null;

        }, { once: true });
    }
}

// --- CAMBIOS CLAVE: Función de renderizado completamente reescrita para el nuevo diseño ---
function renderTicketContent() {
    // Limpiar contenedores de secciones de items
    if (ticketItemsPolloElement) ticketItemsPolloElement.innerHTML = '';
    if (ticketItemsPaElement) ticketItemsPaElement.innerHTML = '';
    if (ticketItemsCargoElement) ticketItemsCargoElement.innerHTML = '';
    // Eliminamos la limpieza del contenedor de envío
    // if (ticketItemEnvioElement) ticketItemEnvioElement.innerHTML = '';
    // Limpiar contenedor de totales
    if (totalsSection) totalsSection.innerHTML = '';

    // Ocultar todas las secciones de items por defecto
    if (sectionItemsPollo) sectionItemsPollo.classList.add('hidden');
    if (sectionItemsPa) sectionItemsPa.classList.add('hidden');
    if (sectionItemsCargo) sectionItemsCargo.classList.add('hidden');
    // Eliminamos la ocultación de la sección de envío
    //if (sectionItemEnvio) sectionItemEnvio.classList.add('hidden');


    let subtotal = 0; // Este subtotal es la suma de *todos* los items antes de mostrar los totales
    const polloItems = [];
    const paItems = [];
    const cargoItems = [];
    let envioItem = null; // Asumimos solo un item de envío


    // Clasificar los items del carrito
    cartItems.forEach(item => {
        if (item.productId === 'ENVIO') {
            envioItem = item;
        } else if (item.productId === 'CARGO') {
            cargoItems.push(item);
        } else if (item.productId === 'PA') {
            paItems.push(item);
        } else {
            // Asumimos que es un producto de pollo (o similar)
            polloItems.push(item);
        }
        subtotal += item.cost; // Sumar al subtotal general
    });


    // --- MODIFICACIÓN: Renderizar sección del cliente con más estructura ---
    if (selectedClient && ticketClienteInfoElement) {
        const clienteDetails = ticketClienteInfoElement.querySelector('.cliente-details');
        
        // --- AÑADIDO: Lógica para incluir el alias ---
        let nombreMostrado = selectedClient.nombre;
        if (selectedClient.alias) {
            nombreMostrado += ` (${selectedClient.alias})`;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        let clienteHtml = `<div class="cliente-detail-item cliente-nombre">${nombreMostrado}</div>`;

        if (selectedClient.telefonos && selectedClient.telefonos[0]?.numero) {
            clienteHtml += `<div class="cliente-detail-item">
                                <span class="cliente-label">Tel:</span>
                                <span class="cliente-valor">${selectedClient.telefonos[0].numero}</span>
                            </div>`;
        }
        
        if (selectedClient.direcciones && selectedClient.direcciones[0]?.direccion) {
            clienteHtml += `<div class="cliente-detail-item">
                                <span class="cliente-label">Dir:</span>
                                <span class="cliente-valor">${selectedClient.direcciones[0].direccion}</span>
                            </div>`;
        }

        clienteDetails.innerHTML = clienteHtml;
        ticketClienteInfoElement.classList.remove('hidden');
    }
    // --- FIN DE LA MODIFICACIÓN ---


    // Renderizar secciones si hay items y mostrarlas
    if (polloItems.length > 0 && ticketItemsPolloElement) {
        polloItems.forEach(item => {
            ticketItemsPolloElement.appendChild(renderPolloItem(item)); // Usar función específica para Pollo
        });
        if (sectionItemsPollo) sectionItemsPollo.classList.remove('hidden');
    }

    if (paItems.length > 0 && ticketItemsPaElement) {
        paItems.forEach(item => {
            ticketItemsPaElement.appendChild(renderPaItemTicket(item)); // Usar función específica para PA
        });
        if (sectionItemsPa) sectionItemsPa.classList.remove('hidden');
    }

    if (cargoItems.length > 0 && ticketItemsCargoElement) {
        cargoItems.forEach(item => {
            ticketItemsCargoElement.appendChild(renderCargoItemTicket(item)); // Usar función específica para Cargo
        });
        if (sectionItemsCargo) sectionItemsCargo.classList.remove('hidden');
    }

    // Eliminamos la lógica de renderizado del item de envío en su propia sección
    // if (envioItem && ticketItemEnvioElement) {
    //     ticketItemEnvioElement.appendChild(renderEnvioItemTicket(envioItem)); // Usar función específica para Envío
    //     if (sectionItemEnvio) sectionItemEnvio.classList.remove('hidden');
    // }


    // Renderizar los totales en su sección
    if (totalsSection) {
        // Fila de Subtotal (suma de todos los items *antes* de envío/cargos si se manejan por separado)
        // En este caso, subtotal ya incluye todos los items, incluyendo cargos y PA.
        // Si quisieras un subtotal solo de productos de catálogo, necesitarías otra variable.
        // Basado en la imagen, parece que "Subtotal" es la suma de todo *antes* del total final.
        // Vamos a calcular un subtotal que excluya el envío para que coincida con la imagen.
        const subtotalExcludingEnvio = cartItems.reduce((acc, item) => {
            if (item.productId !== 'ENVIO') {
                return acc + item.cost;
            }
            return acc;
        }, 0);


        totalsSection.appendChild(
            createTotalRow('Subtotal', subtotalExcludingEnvio.toFixed(2))
        );

        // Fila de Envío (si existe)
        if (envioItem) {
             totalsSection.appendChild(
                createTotalRow(envioItem.optionName, envioItem.cost.toFixed(2))
            );
        }

        // Fila de TOTAL final (suma de todos los items)
        const finalTotal = cartItems.reduce((acc, item) => acc + item.cost, 0);
        totalsSection.appendChild(
            createTotalRow('TOTAL', Math.round(finalTotal).toFixed(2), true) // Aplicar redondeo aquí
        );

        // --- AÑADIDO: Actualizar el total en el botón de cobrar del modal ---
        if (cobrarBtnTotalSpan) {
            cobrarBtnTotalSpan.textContent = Math.round(finalTotal).toFixed(2);
        }
    }

    // Actualizar fecha y hora
    if (ticketDateTimeElement) {
        const now = new Date();
        ticketDateTimeElement.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // TODO: Actualizar ticket ID si se implementa
}

// --- Funciones Auxiliares de Renderizado de Items por Tipo ---

// Función auxiliar para crear la estructura base de una fila de item
function createBaseItemRow(item) {
    const li = document.createElement('li');
    li.className = 'item-row-ui';

    const itemInfoDiv = document.createElement('div');
    itemInfoDiv.classList.add('item-info');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    // El contenido del nombre se llenará en las funciones específicas

    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details');
    // El contenido de los detalles se llenará en las funciones específicas

    itemInfoDiv.appendChild(nameDiv);
    itemInfoDiv.appendChild(detailsContainer);
    li.appendChild(itemInfoDiv);

    const priceSpan = document.createElement('span');
    priceSpan.classList.add('item-price');
    priceSpan.textContent = `$${item.cost.toFixed(2)}`;
    li.appendChild(priceSpan);

    return { li, nameDiv, detailsContainer, priceSpan };
}


// Renderiza un item de Pollo (o producto de catálogo)
function renderPolloItem(item) {
    const { li, nameDiv, detailsContainer } = createBaseItemRow(item);

    const optionNameDisplay = item.optionName || item.productId;
    let nameText = optionNameDisplay;

    // Añadir personalizaciones al nombre SIEMPRE si existen
    if (item.personalizations) {
         const allPersonalizations = Object.values(item.personalizations).flat();
         if (allPersonalizations.length > 0) {
             nameText += ` | ${allPersonalizations.join(', ')}`;
         }
    }
    nameDiv.textContent = nameText;

    // Línea de detalle: Cantidad * Precio Unitario Original (Siempre mostrar esta línea)
    // Usamos item.pricePerKg si está disponible, de lo contrario calculamos desde el costo original del descuento o el costo final
    const originalUnitPrice = item.pricePerKg !== undefined && item.pricePerKg !== null
        ? item.pricePerKg
        : (item.discount && item.discount.originalCost && item.quantity > 0 ? (item.discount.originalCost / item.quantity) : (item.cost > 0 && item.quantity > 0 ? (item.cost / item.quantity) : 0));

    const quantityPriceLine = document.createElement('div');
    quantityPriceLine.textContent = `${item.quantity.toFixed(3)}(kg) * $${originalUnitPrice.toFixed(2)}`;
    detailsContainer.appendChild(quantityPriceLine);

    // --- Mostrar detalles del descuento según el tipo ---
    if (item.discount) {
        const discountType = item.discount.tipoDescuentoAplicado; // 'Cantidad', 'Porcentaje', o 'Precio por Kg'
        const originalCost = item.discount.originalCost; // Costo antes del descuento
        const discountAmount = item.discount.monto; // Monto del descuento
        const newPricePerKg = item.discount.newPricePerKg; // Nuevo precio por kg (si aplica)

        // Declare discountLabelLine and discountDetailsLine here, before the switch
        const discountLabelLine = document.createElement('div');
        discountLabelLine.classList.add('item-discount'); // Maintain class for styling
        detailsContainer.appendChild(discountLabelLine); // Append the label container

        // discountDetailsLine is used for a single line of detail in other cases.
        // For 'Precio por Kg', we have two separate detail lines.
        // We declare it here and append it, but clear its content in the 'Precio por Kg' case.
        const discountDetailsLine = document.createElement('div');
        detailsContainer.appendChild(discountDetailsLine); // Append the details container


        // Usamos un switch para manejar los diferentes tipos de descuento
        switch (discountType) {
            case 'Cantidad':
                discountLabelLine.textContent = 'Descuento por cantidad:';
                // Mostrar Original Subtotal - Descuento Monto
                // const finalCostCantidad = originalCost - discountAmount; // Not needed for display
                discountDetailsLine.textContent = `$${originalCost.toFixed(2)} - $${discountAmount.toFixed(2)}`;
                // discountDetailsLine was already appended before the switch.
                break;
            case 'Porcentaje':
                discountLabelLine.textContent = 'Descuento por porcentaje:';
                // Calcular el porcentaje aplicado: (monto del descuento / costo original) * 100
                const percentageApplied = originalCost > 0 ? (discountAmount / originalCost) * 100 : 0;
                // Mostrar Original Subtotal - Porcentaje
                discountDetailsLine.textContent = `$${originalCost.toFixed(2)} - ${percentageApplied.toFixed(2)}%`;
                 // discountDetailsLine was already appended before the switch.
                break;
            case 'Precio por Kg':
                 // --- IMPLEMENTACIÓN PARA DESCUENTO POR PRECIO POR KG ---
                discountLabelLine.textContent = 'Descuento por kg:';

                // Detalle 1: Precio Original > Precio Modificado
                const priceChangeLine = document.createElement('div');
                priceChangeLine.textContent = `$${originalUnitPrice.toFixed(2)} > $${newPricePerKg.toFixed(2)}`;
                detailsContainer.appendChild(priceChangeLine); // Append to detailsContainer

                // Detalle 2: Cantidad * Precio Modificado
                const newPriceCalculationLine = document.createElement('div');
                newPriceCalculationLine.textContent = `${item.quantity.toFixed(3)}(kg) * $${newPricePerKg.toFixed(2)}`;
                detailsContainer.appendChild(newPriceCalculationLine); // Append to detailsContainer

                // Clear the content of discountDetailsLine as it's not used for the specific details here
                discountDetailsLine.textContent = '';
                 // --- FIN IMPLEMENTACIÓN PARA DESCUENTO POR PRECIO POR KG ---
                break;
            default:
                // Fallback si el tipo de descuento no es reconocido o no está definido
                discountLabelLine.textContent = 'Descuento aplicado:';
                discountDetailsLine.textContent = item.discount.descripcion; // Mostrar la descripción original guardada

                // También mostrar las líneas de cambio de precio/subtotal si existen en el objeto de descuento original (fallback)
                if (item.discount.newPricePerKg !== undefined && item.discount.newPricePerKg !== null) {
                     const priceChangeLineFallback = document.createElement('div');
                     priceChangeLineFallback.textContent = `Precio por kg modificado: $${item.pricePerKg.toFixed(2)} -> $${item.discount.newPricePerKg.toFixed(2)}`;
                     detailsContainer.appendChild(priceChangeLineFallback);

                     const newCost = item.cost;
                     const subtotalChangeLineFallback = document.createElement('div');
                     subtotalChangeLineFallback.textContent = `Subtotal actualizado: $${originalCost.toFixed(2)} -> $${newCost.toFixed(2)}`;
                     detailsContainer.appendChild(subtotalChangeLineFallback);
                }
                // discountDetailsLine was already appended before the switch.
                break;
        }
    }

    return li;
}

// Renderiza un item de Producto Adicional (PA) para el ticket
function renderPaItemTicket(item) {
    const { li, nameDiv, detailsContainer } = createBaseItemRow(item);

    // Nombre: Descripción ingresada por el usuario
    nameDiv.textContent = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
        ? item.personalizations.descripcion[0]
        : 'Producto Adicional'; // Fallback

    // Detalle: Nombre fijo "Producto Adicional"
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('details');
    detailsDiv.textContent = item.optionName; // "Producto Adicional"
    //detailsContainer.appendChild(detailsDiv); // Añadir al detailsContainer // eliminados por redundancia de informacion, el tutilo de la seccion ya define el tipo de item

    return li;
}

// Renderiza un item de Cargo Manual para el ticket
function renderCargoItemTicket(item) {
    const { li, nameDiv, detailsContainer } = createBaseItemRow(item);

    // Nombre: Descripción ingresada por el usuario
    nameDiv.textContent = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
        ? item.personalizations.descripcion[0]
        : 'Cargo Manual'; // Fallback

    // Detalle: Nombre fijo "Cargo Manual"
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('details');
    detailsDiv.textContent = item.optionName; // "Cargo Manual"
    //detailsContainer.appendChild(detailsDiv); // Añadir al detailsContainer

    return li;
}

// Renderiza un item de Envío para el ticket
function renderEnvioItemTicket(item) {
     const { li, nameDiv, detailsContainer } = createBaseItemRow(item);

     // Nombre: Nombre de la opción de envío (ej. "Entrega Mostrador")
     nameDiv.textContent = item.optionName;

     // Detalle: Descripción del envío (ej. "Sin costo")
     const detailsDiv = document.createElement('div');
     detailsDiv.classList.add('details');
     detailsDiv.textContent = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
        ? item.personalizations.descripcion[0]
        : item.descripcion || ''; // Fallback a la descripción original
     detailsContainer.appendChild(detailsDiv); // Añadir al detailsContainer

     return li;
}


// --- Función auxiliar para crear filas de totales ---
function createTotalRow(label, value, isGrandTotal = false) {
    const row = document.createElement('div');
    row.className = isGrandTotal ? 'total-row-ui grand-total-ui' : 'total-row-ui';
    row.innerHTML = `
        <span class="label">${label}</span>
        <span class="value">$${value}</span>
    `;
    return row;
}