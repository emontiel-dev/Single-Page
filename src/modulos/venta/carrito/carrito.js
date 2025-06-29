// src/modulos/venta/carrito/carrito.js

// Este archivo maneja la lógica y renderizado del carrito de compras.

// No necesitamos importar carrito.detalle.js si eliminamos el modal de detalle
// import { openCarritoDetalleModal } from './carrito.detalle.js';

let cartItems = []; // Array para almacenar los items del carrito

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
        // Eliminamos la referencia a btnVerItems y verTodosMensaje
        // const btnVerItems = container.querySelector('#btn-ver-items');
        const btnCobrar = container.querySelector('#btn-cobrar');
        const btnGuardarPedido = container.querySelector('#btn-guardar-pedido');
        // const verTodosMensaje = container.querySelector('#ver-todos-mensaje'); // Obtener el elemento del mensaje
        const itemsListBody = container.querySelector('#carrito-items-list'); // Get the tbody for item list


        // if (btnVerItems) btnVerItems.addEventListener('click', handleVerItems); // Eliminamos el listener
        if (btnCobrar) btnCobrar.addEventListener('click', handleCobrar);
        if (btnGuardarPedido) btnGuardarPedido.addEventListener('click', handleGuardarPedido);
        // El mensaje "Ver todos los items" ahora es menos relevante ya que la tabla es scrollable.
        // Podríamos eliminarlo o cambiar su propósito. Por ahora, lo ocultamos.
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
function updateCarritoDisplay() {
    const carritoContainer = document.getElementById('carrito-container');
    const itemsListBody = document.getElementById('carrito-items-list');
    const totalValueSpan = document.getElementById('carrito-total-value');
    const mainContent = document.getElementById('main-content'); // Obtener el contenedor principal del contenido
    // Eliminamos referencias a verTodosMensaje, itemCountSpan, btnVerItems
    // const verTodosMensaje = document.getElementById('ver-todos-mensaje'); // Obtener el elemento del mensaje
    // const itemCountSpan = document.getElementById('item-count'); // Obtener el span para el contador
    // const btnVerItems = document.getElementById('btn-ver-items'); // Get the 'Ver todos los items' button


    // Ajustamos la verificación de elementos encontrados
    if (!itemsListBody || !totalValueSpan || !carritoContainer || !mainContent) {
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

            // Celda de Producto
            const productCell = document.createElement('td');
            // Usar item.optionName si está disponible, de lo contrario item.optionId
            const optionNameDisplay = item.optionName || item.optionId;
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

            // Usar el precio por kg almacenado en el item si está disponible, de lo contrario calcularlo
            const unitPriceDisplay = item.pricePerKg !== undefined && item.pricePerKg !== null
                ? item.pricePerKg.toFixed(2) // Usar el precio del catálogo si está almacenado
                : (item.quantity > 0 ? (item.cost / item.quantity).toFixed(2) : '0.00'); // Fallback si no está almacenado o cantidad es 0


            // Combinar nombre, detalle de ID (si aplica) y personalizaciones en la primera línea
            const productNameLine = `<div class="item-nombre">${optionNameDisplay}${optionDetailId}${personalizationsString}</div>`;

            // Segunda línea con cantidad y precio unitario (usando el precio unitario para mostrar)
            const quantityPriceLine = `<div class="item-detalle">${item.quantity.toFixed(3)}(kg) * ($${unitPriceDisplay})</div>`;


            productCell.innerHTML = `
                ${productNameLine}
                ${quantityPriceLine}
            `;
            row.appendChild(productCell);

            // Celda de Subtotal
            const subtotalCell = document.createElement('td');
            subtotalCell.classList.add('item-subtotal');
            subtotalCell.textContent = `$${item.cost.toFixed(2)}`;
            row.appendChild(subtotalCell);

            // Celda de Acciones (Eliminar)
            const actionsCell = document.createElement('td');
            actionsCell.classList.add('item-acciones');
            actionsCell.innerHTML = `<button class="remove-item-btn" aria-label="Eliminar item">×</button>`; // Use × character for close/remove
            row.appendChild(actionsCell);


            itemsListBody.appendChild(row);

            total += item.cost; // Sumar al total
        });

        // Mostrar el carrito si hay items
        carritoContainer.classList.add('visible');

        // Ocultar el mensaje "Ver todos los items" ya que la tabla es scrollable
        // verTodosMensaje.classList.add('hidden'); // Eliminamos esta línea
        // itemCountSpan.textContent = cartItems.length; // Eliminamos esta línea


        // Calcular la altura del carrito y añadir padding al main content
        // Usamos getBoundingClientRect() para obtener la altura precisa, incluyendo padding y borde
        const cartHeight = carritoContainer.getBoundingClientRect().height;
        // Añadir un poco de padding extra para separación visual
        const rootStyles = getComputedStyle(document.documentElement);
        const extraPadding = parseFloat(rootStyles.getPropertyValue('--espacio-l')); // Usar --espacio-l para más separación

        mainContent.style.paddingBottom = `${cartHeight + extraPadding}px`;


    } else {
        // Ocultar el carrito si no hay items
        carritoContainer.classList.remove('visible');
        // verTodosMensaje.classList.add('hidden'); // Eliminamos esta línea

        // Restablecer el padding inferior del main content al valor por defecto del CSS
        mainContent.style.paddingBottom = '';
    }


    // Actualizar el total
    totalValueSpan.textContent = `$${total.toFixed(2)}`;
}

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