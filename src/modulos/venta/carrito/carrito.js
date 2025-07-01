// src/modulos/venta/carrito/carrito.js

// Este archivo maneja la lógica y renderizado del carrito de compras.

// No necesitamos importar carrito.detalle.js si eliminamos el modal de detalle
// import { openCarritoDetalleModal } from './carrito.detalle.js';

import { openCarritoVerItemsModal } from './carrito.ver.items.js'; // <-- Importar la función del nuevo modal


export let cartItems = []; // Array para almacenar los items del carrito - AHORA EXPORTADO

// Función para renderizar la plantilla HTML del carrito
export async function renderCarrito(container) {
    try {
        // Cargar el contenido de la plantilla HTML del carrito
        const response = await fetch('src/views/carrito.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const carritoHtml = await response.text();

        // Insertar el contenido en el contenedor proporcionado
        container.innerHTML = carritoHtml;

        // Añadir event listeners a los botones de acción
        // Ahora obtenemos la referencia al botón 'Ver todo'
        const btnVerItems = container.querySelector('#btn-ver-items');
        const btnCobrar = container.querySelector('#btn-cobrar');
        const btnGuardarPedido = container.querySelector('#btn-guardar-pedido');
        // Eliminamos la referencia a verTodosMensaje
        // const verTodosMensaje = container.querySelector('#ver-todos-mensaje'); // Obtener el elemento del mensaje
        const itemsListBody = container.querySelector('#carrito-items-list'); // Get the tbody for item list


        // --- MODIFICACIÓN: Añadir listener al botón 'Ver todo' ---
        if (btnVerItems) {
             btnVerItems.addEventListener('click', () => {
                 console.log('Botón "Ver todos los items" clicado.');
                 openCarritoVerItemsModal(); // Abrir el nuevo modal de detalle
             });
        }
        // --> Fin de la MODIFICACIÓN <--

        if (btnCobrar) btnCobrar.addEventListener('click', handleCobrar);
        if (btnGuardarPedido) btnGuardarPedido.addEventListener('click', handleGuardarPedido);
        // Eliminamos el listener del div verTodosMensaje
        // if (verTodosMensaje) verTodosMensaje.addEventListener('click', handleVerItems); // Add listener to the message too


        // Add event listener for remove buttons using event delegation on the tbody
        if (itemsListBody) {
            itemsListBody.addEventListener('click', handleItemAction);
        }


        // Renderizar el estado inicial del carrito
        updateCarritoDisplay();

    } catch (error) {
        console.error('Error loading carrito:', error);
        container.innerHTML = '<p>Error al cargar el carrito.</p>';
    }
}

// Function to handle clicks on item actions (like remove)
function handleItemAction(event) {
    const target = event.target;
    // Check if the clicked element or its parent is a remove button
    const removeButton = target.closest('.remove-item-btn');

    if (removeButton) {
        const itemRow = removeButton.closest('tr');
        if (itemRow) {
            // Obtenemos el índice del item desde el atributo data
            const itemIndex = parseInt(itemRow.dataset.itemIndex, 10);
            if (!isNaN(itemIndex)) {
                removeItemFromCart(itemIndex);
            }
        }
    }
}


// Función para añadir un item al carrito
export function addItemToCart(item) {
    // Aquí podrías añadir lógica para agrupar items si son iguales
    // Por ahora, simplemente añadimos el item tal cual
    cartItems.push(item);
    console.log('Item añadido al carrito:', item);
    updateCarritoDisplay(); // Actualizar la interfaz del carrito
}

// Función para remover un item del carrito por su índice
function removeItemFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
        const removedItem = cartItems.splice(index, 1);
        console.log('Item removido del carrito:', removedItem);
        updateCarritoDisplay(); // Actualizar la interfaz del carrito
    } else {
        console.warn('Intento de remover item con índice inválido:', index);
    }
}


// Función para actualizar la visualización del carrito
export function updateCarritoDisplay() { // <-- Añadido 'export' aquí
    const carritoContainer = document.getElementById('carrito-container');
    const itemsListBody = document.getElementById('carrito-items-list');
    const totalValueSpan = document.getElementById('carrito-total-value');
    const mainContent = document.getElementById('main-content'); // Obtener el contenedor principal del contenido
    // Obtener referencias al span del contador (ahora dentro del botón)
    // Eliminamos la referencia a verTodosMensaje
    // const verTodosMensaje = document.getElementById('ver-todos-mensaje'); // Obtener el elemento del mensaje
    const itemCountSpan = document.getElementById('item-count'); // Obtener el span para el contador
    // const btnVerItems = document.getElementById('btn-ver-items'); // Get the 'Ver todos los items' button


    // Ajustamos la verificación de elementos encontrados
    // Eliminamos la verificación de verTodosMensaje
    if (!itemsListBody || !totalValueSpan || !carritoContainer || !mainContent || !itemCountSpan) {
        console.error('Elementos del carrito o main content no encontrados en el DOM.');
        return;
    }

    // Limpiar la lista actual
    itemsListBody.innerHTML = '';

    let total = 0;

    // Renderizar cada item en la lista
    if (cartItems.length > 0) {
        cartItems.forEach((item, index) => { // Use index to identify the item for removal
            const row = document.createElement('tr');
            row.dataset.itemIndex = index; // Add data attribute for index

            // Celda de Producto (renderizada por función auxiliar)
            let productCell;

            // --- DETECCIÓN Y RENDERIZADO POR TIPO DE ITEM ---
            if (item.productId === 'ENVIO') {
                productCell = renderEnvioItem(item);
            } else if (item.productId === 'CARGO') {
                productCell = renderCargoItem(item);
            } else if (item.productId === 'PA') { // <-- Añadida lógica para PA
                 productCell = renderPaItem(item);
            }
             else {
                // Asumimos que es un producto de pollo o un producto con descuento aplicado
                // La función renderProductItem ahora maneja la visualización de descuentos
                productCell = renderProductItem(item);
            }
            // TODO: Añadir lógica para 'producto adicional' aquí más adelante

            row.appendChild(productCell);

            // Celda de Subtotal (común a la mayoría de los items)
            const subtotalCell = document.createElement('td');
            subtotalCell.classList.add('item-subtotal');
            // Mostrar el costo con signo para descuentos (aunque ahora el costo del item ya es el final)
            // Si el item tiene descuento, mostramos el costo final. Si no, mostramos el costo normal.
            // La función renderProductItem se encargará de mostrar el detalle del descuento.
            subtotalCell.textContent = `$${item.cost.toFixed(2)}`; // <-- Mostrar el costo final del item
            row.appendChild(subtotalCell);

            // Celda de Acciones (Eliminar) (común a la mayoría de los items)
            const actionsCell = document.createElement('td');
            actionsCell.classList.add('item-acciones');
            actionsCell.innerHTML = `<button class="remove-item-btn" aria-label="Eliminar item"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></button>`; // Use × character for close/remove
            row.appendChild(actionsCell);


            itemsListBody.appendChild(row);

            total += item.cost; // Sumar al total (el costo del item ya es el final)
        });

        // Mostrar el carrito si hay items
        carritoContainer.classList.add('visible');

        // Actualizar el contador dentro del botón "Ver todo"
        itemCountSpan.textContent = cartItems.length;


        // Eliminar la lógica de padding inferior ya que el carrito no está fijo
        // const cartHeight = carritoContainer.getBoundingClientRect().height;
        // const rootStyles = getComputedStyle(document.documentElement);
        // const extraPadding = parseFloat(rootStyles.getPropertyValue('--espacio-l'));
        // mainContent.style.paddingBottom = `${cartHeight + extraPadding}px`;


    } else {
        // Ocultar el carrito si no hay items
        carritoContainer.classList.remove('visible');
        // El contador se ocultará junto con el botón "Ver todo" si el contenedor del carrito se oculta.
        // No necesitamos ocultar el span específicamente.


        // Restablecer el padding inferior del main content al valor por defecto del CSS
        mainContent.style.paddingBottom = '';
    }


    // Aplicar redondeo al total antes de mostrarlo
    const roundedTotal = Math.round(total);

    // Actualizar el total con el valor redondeado, formateado a dos decimales
    totalValueSpan.textContent = `${roundedTotal.toFixed(2)}`;
}

// --- Funciones Auxiliares de Renderizado de Items ---

// Renderiza un item de producto de pollo (ahora también maneja descuentos)
function renderProductItem(item) {
    const productCell = document.createElement('td');

    // Usar item.optionName si está disponible, de lo contrario item.optionId
    const optionNameDisplay = item.optionName || item.productId; // Usar productId como fallback si optionName no está definido
    // Asegurarse de que item.optionId exista y sea diferente del productId para mostrar el detalle del ID si es una variante/subproducto
    const optionDetailId = item.optionId && item.optionId !== item.productId ? ` (${item.optionId})` : ''; // Incluir paréntesis aquí

    // Construir el string de personalizaciones
    let personalizationsString = '';
    if (item.personalizations) {
        // Aplanar todos los nombres de personalización de todos los grupos
        const allPersonalizations = Object.values(item.personalizations).flat();
        if (allPersonalizations.length > 0) {
            // Unir las personalizaciones con coma y espacio, y encerrarlas en paréntesis
            personalizationsString = ` (${allPersonalizations.join(', ')})`;
        }
    }

    let itemHtml = '';

    // --- Lógica para mostrar descuento si existe ---
    if (item.discount) {
        // Mostrar formato detallado con descuento
        const originalCost = item.discount.originalCost;
        const originalUnitPrice = item.quantity > 0 ? (originalCost / item.quantity) : 0;
        const newUnitPrice = item.quantity > 0 ? (item.cost / item.quantity) : 0; // item.cost ya es el costo final

        itemHtml = `
            <div class="item-nombre">${optionNameDisplay}${personalizationsString}</div>
            <div class="item-detalle">${item.quantity.toFixed(3)}(kg) * $${originalUnitPrice.toFixed(2)}</div>
            <div class="item-detalle item-descuento-detalle" style="color: var(--rojo-error);">${item.discount.descripcion}</div> <!-- Estilo para descuento -->
            <div class="item-detalle">${item.quantity.toFixed(3)}(kg) * $${newUnitPrice.toFixed(2)}</div> <!-- Nuevo precio unitario -->
        `;
        // Nota: El subtotal final ($item.cost.toFixed(2)) se muestra en la celda .item-subtotal

    } else {
        // Mostrar formato estándar sin descuento
        const unitPriceDisplay = item.pricePerKg !== undefined && item.pricePerKg !== null
            ? item.pricePerKg.toFixed(2) // Usar el precio del catálogo si está almacenado
            : (item.quantity > 0 ? (item.cost / item.quantity).toFixed(2) : '0.00'); // Fallback si no está almacenado o cantidad es 0

        itemHtml = `
            <div class="item-nombre">${optionNameDisplay}${personalizationsString}</div>
            <div class="item-detalle">${item.quantity.toFixed(3)}(kg) * $${unitPriceDisplay}</div>
        `;
    }


    productCell.innerHTML = itemHtml;

    return productCell;
}

// Renderiza un item de envío
function renderEnvioItem(item) {
    const productCell = document.createElement('td');

    // Mostrar solo el nombre y la descripción/monto
    const envioDesc = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
        ? item.personalizations.descripcion[0] // Asumimos que la descripción manual está en el primer elemento
        : item.descripcion || ''; // Fallback a la descripción original si no hay personalización

    productCell.innerHTML = `
        <div class="item-nombre">${item.optionName}</div>
        <div class="item-detalle">${envioDesc}</div>
    `;

    return productCell;
}

// Renderiza un item de cargo manual
function renderCargoItem(item) {
    const productCell = document.createElement('td');

    // Obtener la descripción ingresada por el usuario desde personalizations
    const cargoDescription = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
        ? item.personalizations.descripcion[0]
        : 'Cargo Manual'; // Usar 'Cargo Manual' como fallback si por alguna razón no hay descripción (aunque el input es requerido)

    productCell.innerHTML = `
        <div class="item-nombre">${cargoDescription}</div> <!-- Descripción ingresada por el usuario -->
        <div class="item-detalle">Cargo Manual</div> <!-- Nombre fijo como detalle -->
    `;

    return productCell;
}

// <-- NUEVA: Renderiza un item de Producto Adicional (PA) -->
function renderPaItem(item) {
    const productCell = document.createElement('td');

    // Obtener la descripción ingresada por el usuario desde personalizations
    const paDescription = item.personalizations && item.personalizations.descripcion && item.personalizations.descripcion.length > 0
        ? item.personalizations.descripcion[0]
        : 'Producto Adicional'; // Usar 'Producto Adicional' como fallback si no hay descripción

    // Mostrar la descripción y el costo (si tiene)
    // Eliminamos la lógica de añadir el costo aquí, ya que el costo total se muestra en la columna de subtotal
    // let paDetails = paDescription;
    // if (item.cost > 0) {
    //     paDetails += ` ($${item.cost.toFixed(2)})`;
    // }

    // --- MODIFICACIÓN: Intercambiar nombre y detalle ---
    productCell.innerHTML = `
        <div class="item-nombre">${paDescription}</div> <!-- Descripción ingresada por el usuario -->
        <div class="item-detalle">${item.optionName}</div> <!-- Nombre fijo: Producto Adicional -->
    `;
    // --> Fin de la MODIFICACIÓN <--


    return productCell;
}
// --> Fin de la NUEVA función <--


// --- Handlers de botones de acción ---

// Eliminamos la función handleVerItems ya que el botón fue removido
/*
function handleVerItems() {
    console.log('Botón "Ver todos los items" clicado.');
    // Dado que todos los items son visibles en la tabla scrollable, este botón es menos crítico para *ver*.
    // Podría usarse para abrir un modal de *gestión* de items (editar cantidad, añadir notas, etc.).
    // Por ahora, solo mostramos una alerta placeholder.
    alert('Funcionalidad "Ver todos los items" pendiente (todos los items son visibles en la tabla scrollable).');
    // Si decides implementar un modal de gestión más adelante, llamarías a una función aquí, por ejemplo:
    // openCarritoManagementModal(cartItems);
}
*/

function handleCobrar() {
    console.log('Botón "Cobrar" clicado.');
    // TODO: Implementar lógica para procesar el pago y finalizar la venta
    alert('Funcionalidad "Cobrar" pendiente.');
}

function handleGuardarPedido() {
    console.log('Botón "Guardar Pedido" clicado.');
    // TODO: Implementar lógica para guardar el estado actual del carrito como un pedido pendiente
    alert('Funcionalidad "Guardar Pedido" pendiente.');
}

// TODO: Considerar añadir funciones para editar cantidades de items directamente en la tabla o via un modal separado.