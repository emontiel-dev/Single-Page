// src/modulos/venta/descuento/descuento.modal.js

// Este archivo se encargará de la lógica y renderizado del modal para aplicar un descuento.

import { addItemToCart, cartItems, updateCarritoDisplay } from '../carrito/carrito.js'; // Importar funciones del carrito
import { resetModalLogic as resetCatalogoModalLogic } from '../catalogo/modal.logica.js'; // Importar la función de limpieza del modal de catálogo


// Referencias a elementos UI del modal de descuento
let descuentoModalElement = null;
let itemsCarritoGrid = null;
let descuentoCantidadInput = null;
let descuentoPorcentajeInput = null;
let precioKgInput = null; // <-- Nueva referencia al input de precio por kg
let selectedItemQuantityDisplay = null; // <-- Nueva referencia para mostrar la cantidad
let cancelarDescuentoBtn = null;
let aplicarDescuentoBtn = null;

// Variable de estado para el índice del ítem del carrito seleccionado para aplicar el descuento
let selectedCartItemIndex = null;


// Función para crear y mostrar el modal de descuento
export async function openDescuentoModal() {
    // --- Lógica para cerrar cualquier modal existente ---
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        // Opcional: Limpiar la lógica asociada al modal cerrado si es necesario
        if (existingModal.id === 'product-modal-container') { resetCatalogoModalLogic(); }
        // Si tuvieras un modal de envío o cargo abierto, también lo limpiarías aquí
        // if (existingModal.id === 'envio-modal-container') { resetEnvioModalLogic(); }
        // if (existingModal.id === 'cargo-modal-container') { resetCargoModalLogic(); }
    }
    // ----------------------------------------------------

    // Si el carrito está vacío, no abrimos el modal de descuento
    if (cartItems.length === 0) {
        alert('No hay items en el carrito para aplicar un descuento.');
        return;
    }


    // Si el modal ya existe en el DOM, no hacemos nada (o lo hacemos visible si estaba oculto)
    descuentoModalElement = document.getElementById('descuento-modal-container');
    if (descuentoModalElement) {
         console.log('Modal de descuento ya está en el DOM.');
         if (!descuentoModalElement.classList.contains('visible')) {
             setTimeout(() => {
                 descuentoModalElement.classList.add('visible');
                 // Renderizar los items del carrito actuales al reabrir
                 renderCartItemsForDiscount();
                 // Resetear inputs y selección al reabrir
                 resetModalState();
             }, 10);
         }
         return;
    }


    // Cargar la plantilla HTML del modal de descuento
    try {
        const response = await fetch('src/views/descuento.modal.html');
        if (!response.ok) {
            console.error('Error loading descuento modal template:', response.statusText);
            return;
        }
        const modalHtml = await response.text();

        // Crear un elemento div temporal para parsear el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        descuentoModalElement = tempDiv.querySelector('#descuento-modal-container');

        if (!descuentoModalElement) {
            console.error('Descuento modal container not found in template.');
            return;
        }

        // Obtener referencias a los elementos dentro del modal
        itemsCarritoGrid = descuentoModalElement.querySelector('.items-carrito-grid');
        descuentoCantidadInput = descuentoModalElement.querySelector('#descuento-cantidad-input');
        descuentoPorcentajeInput = descuentoModalElement.querySelector('#descuento-porcentaje-input');
        precioKgInput = descuentoModalElement.querySelector('#precio-kg-input'); // <-- Obtener referencia
        selectedItemQuantityDisplay = descuentoModalElement.querySelector('#selected-item-quantity'); // <-- Obtener referencia (Verificar que este ID exista en el HTML)
        cancelarDescuentoBtn = descuentoModalElement.querySelector('#cancelar-descuento-btn');
        aplicarDescuentoBtn = descuentoModalElement.querySelector('#aplicar-descuento-btn');


        // Añadir event listeners
        if (cancelarDescuentoBtn) cancelarDescuentoBtn.addEventListener('click', closeDescuentoModal);
        if (aplicarDescuentoBtn) aplicarDescuentoBtn.addEventListener('click', handleAplicarDescuento);

        // Añadir listeners para la selección de items del carrito usando delegación
        if (itemsCarritoGrid) itemsCarritoGrid.addEventListener('click', handleCartItemSelect);

        // Añadir listeners para los inputs de descuento
        if (descuentoCantidadInput) {
            descuentoCantidadInput.addEventListener('input', handleDescuentoCantidadInput);
            descuentoCantidadInput.addEventListener('keydown', handleInputKeyDown); // Para 'Enter'
        }
        if (descuentoPorcentajeInput) {
            descuentoPorcentajeInput.addEventListener('input', handleDescuentoPorcentajeInput);
            descuentoPorcentajeInput.addEventListener('keydown', handleInputKeyDown); // Para 'Enter'
        }
        // Añadir listeners para el nuevo input de precio por kg
        if (precioKgInput) {
            precioKgInput.addEventListener('input', handlePrecioKgInput);
            precioKgInput.addEventListener('keydown', handleInputKeyDown); // Para 'Enter'
        }


        // Opcional: Añadir listener para cerrar con la tecla Escape
        // document.addEventListener('keydown', handleEscapeKey); // Implementar si es necesario


        // Añadir el modal al cuerpo del documento
        document.body.appendChild(descuentoModalElement);

    } catch (error) {
        console.error('Error creating descuento modal:', error);
        return;
    }

    // Renderizar los items del carrito actuales
    renderCartItemsForDiscount();

    // Resetear estado inicial
    resetModalState();


    // Hacer el modal visible con una pequeña demora para la transición
    setTimeout(() => {
        descuentoModalElement.classList.add('visible');
        // Opcional: Poner el foco inicial en el primer input de descuento
        if (descuentoCantidadInput) {
            descuentoCantidadInput.focus();
        }
    }, 10);
}

// Función para cerrar el modal de descuento
export function closeDescuentoModal() {
    if (descuentoModalElement) {
        // Iniciar la transición de salida
        descuentoModalElement.classList.remove('visible');
        // Eliminar el modal del DOM después de que termine la transición
        descuentoModalElement.addEventListener('transitionend', () => {
            // Limpiar event listeners
            if (cancelarDescuentoBtn) cancelarDescuentoBtn.removeEventListener('click', closeDescuentoModal);
            if (aplicarDescuentoBtn) aplicarDescuentoBtn.removeEventListener('click', handleAplicarDescuento);
            if (itemsCarritoGrid) itemsCarritoGrid.removeEventListener('click', handleCartItemSelect);
            if (descuentoCantidadInput) {
                descuentoCantidadInput.removeEventListener('input', handleDescuentoCantidadInput);
                descuentoCantidadInput.removeEventListener('keydown', handleInputKeyDown);
            }
            if (descuentoPorcentajeInput) {
                descuentoPorcentajeInput.removeEventListener('input', handleDescuentoPorcentajeInput);
                descuentoPorcentajeInput.removeEventListener('keydown', handleInputKeyDown);
            }
            // Remover listeners del nuevo input de precio por kg
            if (precioKgInput) {
                precioKgInput.removeEventListener('input', handlePrecioKgInput);
                precioKgInput.removeEventListener('keydown', handleInputKeyDown);
            }
            // document.removeEventListener('keydown', handleEscapeKey); // Remover listener de Escape

            descuentoModalElement.remove();
            // Limpiar referencias
            descuentoModalElement = null;
            itemsCarritoGrid = null;
            descuentoCantidadInput = null;
            descuentoPorcentajeInput = null;
            precioKgInput = null; // <-- Limpiar referencia
            selectedItemQuantityDisplay = null; // <-- Limpiar referencia
            cancelarDescuentoBtn = null;
            aplicarDescuentoBtn = null;

            // Limpiar estado del modal
            resetModalState();

        }, { once: true }); // Asegura que el listener se elimine después de ejecutarse una vez
    }
}

// --- Handlers de Eventos ---

// Handler para seleccionar un ítem del carrito
function handleCartItemSelect(event) {
    const selectedButton = event.target.closest('.item-descuento-btn');
    if (!selectedButton) return;

    const itemIndex = parseInt(selectedButton.dataset.itemIndex, 10);

    // Desmarcar el botón previamente seleccionado
    if (itemsCarritoGrid) {
        itemsCarritoGrid.querySelectorAll('.item-descuento-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    // Marcar el botón seleccionado actualmente
    selectedButton.classList.add('selected');
    selectedCartItemIndex = itemIndex; // Almacenar el índice del ítem seleccionado

    console.log('Ítem del carrito seleccionado para descuento:', cartItems[selectedCartItemIndex]);

    // Resetear inputs y placeholders al seleccionar un nuevo ítem
    resetInputFields();

    // Mostrar la cantidad/peso del ítem seleccionado
    const item = cartItems[selectedCartItemIndex];
    if (selectedItemQuantityDisplay) { // <-- Verificar que la referencia existe
        if (item && item.quantity !== undefined && item.quantity !== null) {
            // Mostrar la cantidad formateada, asumiendo que es peso (kg)
            selectedItemQuantityDisplay.textContent = `Cantidad: ${item.quantity.toFixed(3)} kg`;
        } else {
            // Si el item no tiene cantidad (ej. cargo, envío), mostrar un mensaje alternativo
            selectedItemQuantityDisplay.textContent = 'Cantidad: N/A';
        }
    }


    // Si el ítem seleccionado tiene precio por kg, mostrarlo en el input correspondiente
    if (item && item.pricePerKg !== undefined && item.pricePerKg !== null) {
        if (precioKgInput) {
            precioKgInput.value = item.pricePerKg.toFixed(2);
            // Opcional: Calcular y mostrar el costo total actual en el placeholder
            if (item.quantity > 0) {
                 precioKgInput.placeholder = `$${(item.pricePerKg * item.quantity).toFixed(2)}`;
            } else {
                 precioKgInput.placeholder = '0.00';
            }
            // Asegurarse de que el input de precio por kg esté habilitado si el item es por peso
            // precioKgInput.disabled = false; // Descomentar si se llegó a deshabilitar
        }
    } else {
         // Si el ítem no tiene precio por kg (ej. cargo, envío, o producto por pieza), limpiar y deshabilitar el input de precio por kg
         if (precioKgInput) {
             precioKgInput.value = '';
             precioKgInput.placeholder = 'N/A';
             // precioKgInput.disabled = true; // Opcional: deshabilitar si no aplica
         }
    }
}

// Handler para el input de descuento por cantidad
function handleDescuentoCantidadInput() {
    const cantidad = parseFloat(descuentoCantidadInput.value);

    // Si se ingresa una cantidad, limpiar los otros inputs
    if (!isNaN(cantidad)) {
        if (descuentoPorcentajeInput) {
            descuentoPorcentajeInput.value = '';
            descuentoPorcentajeInput.placeholder = '0'; // Resetear placeholder
        }
        if (precioKgInput) { // <-- Limpiar input de precio por kg
            precioKgInput.value = '';
            // Restaurar placeholder original si aplica
            if (selectedCartItemIndex !== null && cartItems[selectedCartItemIndex] && cartItems[selectedCartItemIndex].pricePerKg !== undefined && cartItems[selectedCartItemIndex].pricePerKg !== null) {
                 if (cartItems[selectedCartItemIndex].quantity > 0) {
                      // Mostrar el costo total original en el placeholder del precio por kg
                      precioKgInput.placeholder = `$${(cartItems[selectedCartItemIndex].pricePerKg * cartItems[selectedCartItemIndex].quantity).toFixed(2)}`;
                 } else {
                      precioKgInput.placeholder = '0.00';
                 }
            } else {
                 precioKgInput.placeholder = 'N/A'; // Resetear a N/A si no aplica precio/kg
            }
        }
    } else {
         // Si el input de cantidad se vacía, resetear todos los placeholders
         resetInputPlaceholders();
    }

    // Opcional: Calcular y mostrar el porcentaje equivalente en el placeholder del input de porcentaje
    if (!isNaN(cantidad) && selectedCartItemIndex !== null && cartItems[selectedCartItemIndex]) {
        const itemCost = cartItems[selectedCartItemIndex].cost; // Usar el costo actual del ítem
        if (itemCost > 0 && descuentoPorcentajeInput) {
            const porcentajeCalculado = (cantidad / itemCost) * 100;
            descuentoPorcentajeInput.placeholder = `${porcentajeCalculado.toFixed(2)}%`;
        } else if (descuentoPorcentajeInput) {
             descuentoPorcentajeInput.placeholder = '0%';
        }
    }
}

// Handler para el input de descuento por porcentaje
function handleDescuentoPorcentajeInput() {
    const porcentaje = parseFloat(descuentoPorcentajeInput.value);

    // Si se ingresa un porcentaje, limpiar los otros inputs
    if (!isNaN(porcentaje)) {
        if (descuentoCantidadInput) {
            descuentoCantidadInput.value = '';
            descuentoCantidadInput.placeholder = '0.00'; // Resetear placeholder
        }
        if (precioKgInput) { // <-- Limpiar input de precio por kg
            precioKgInput.value = '';
            // Restaurar placeholder original si aplica
            if (selectedCartItemIndex !== null && cartItems[selectedCartItemIndex] && cartItems[selectedCartItemIndex].pricePerKg !== undefined && cartItems[selectedCartItemIndex].pricePerKg !== null) {
                 if (cartItems[selectedCartItemIndex].quantity > 0) {
                      // Mostrar el costo total original en el placeholder del precio por kg
                      precioKgInput.placeholder = `$${(cartItems[selectedCartItemIndex].pricePerKg * cartItems[selectedCartItemIndex].quantity).toFixed(2)}`;
                 } else {
                      precioKgInput.placeholder = '0.00';
                 }
            } else {
                 precioKgInput.placeholder = 'N/A'; // Resetear a N/A si no aplica precio/kg
            }
        }
    } else {
         // Si el input de porcentaje se vacía, resetear todos los placeholders
         resetInputPlaceholders();
    }

    // Opcional: Calcular y mostrar la cantidad equivalente en el placeholder del input de cantidad
    if (!isNaN(porcentaje) && selectedCartItemIndex !== null && cartItems[selectedCartItemIndex]) {
        const itemCost = cartItems[selectedCartItemIndex].cost; // Usar el costo actual del ítem
        const cantidadCalculada = (porcentaje / 100) * itemCost;
        if (descuentoCantidadInput) {
             descuentoCantidadInput.placeholder = `$${cantidadCalculada.toFixed(2)}`;
        }
    }
}

// <-- Modificado Handler para el input de precio por kg
function handlePrecioKgInput() {
    const nuevoPrecioKg = parseFloat(precioKgInput.value);

    // Limpiar los otros inputs
    if (descuentoCantidadInput) descuentoCantidadInputInput.value = '';
    if (descuentoPorcentajeInput) descuentoPorcentajeInput.value = '';

    // Si el valor no es un número válido o no hay ítem seleccionado, resetear placeholders y salir
    if (isNaN(nuevoPrecioKg) || selectedCartItemIndex === null || !cartItems[selectedCartItemIndex]) {
        resetInputPlaceholders();
        // Restaurar placeholder original del precio por kg si hay item seleccionado
        if (selectedCartItemIndex !== null && cartItems[selectedCartItemIndex] && cartItems[selectedCartItemIndex].pricePerKg !== undefined && cartItems[selectedCartItemIndex].pricePerKg !== null) {
             // Mostrar el precio por kg original en el placeholder
             if (precioKgInput) precioKgInput.placeholder = cartItems[selectedCartItemIndex].pricePerKg.toFixed(2);
        } else {
             if (precioKgInput) precioKgInput.placeholder = 'N/A';
        }
        return;
    }

    const item = cartItems[selectedCartItemIndex];

    // --- Validación más flexible: solo requiere cantidad > 0 y pricePerKg definido ---
    if (item.quantity <= 0 || item.pricePerKg === undefined || item.pricePerKg === null) {
         console.warn('Ítem seleccionado no tiene cantidad o precio por kg original. No se puede calcular descuento por precio/kg.');
         // Resetear placeholders de descuento y precio/kg si no aplica
         if (descuentoCantidadInput) descuentoCantidadInput.placeholder = '0.00';
         if (descuentoPorcentajeInput) descuentoPorcentajeInput.placeholder = '0';
         if (precioKgInput) precioKgInput.placeholder = 'N/A';
         return;
    }

    const originalCost = item.cost; // Costo total original del ítem
    const newCost = nuevoPrecioKg * item.quantity; // Nuevo costo total basado en el nuevo precio por kg
    const descuentoMonto = originalCost - newCost; // El descuento es la diferencia

    // Mostrar el descuento equivalente en los placeholders de cantidad y porcentaje
    if (descuentoCantidadInput) {
         descuentoCantidadInput.placeholder = `$${descuentoMonto.toFixed(2)}`;
    }

    if (originalCost > 0 && descuentoPorcentajeInput) {
        const descuentoPorcentaje = (descuentoMonto / originalCost) * 100;
        // --- CORRECCIÓN TYPO E1 ---
        descuentoPorcentajeInput.placeholder = `${descuentoPorcentaje.toFixed(2)}%`;
    } else if (descuentoPorcentajeInput) {
         descuentoPorcentajeInput.placeholder = '0%';
    }

    // --- CORRECCIÓN E4: Actualizar el placeholder del propio input de precio por kg con el NUEVO PRECIO POR KG ---
    if (precioKgInput) {
         precioKgInput.placeholder = nuevoPrecioKg.toFixed(2); // Mostrar el nuevo precio por kg
    }
}
// --> Fin del Handler modificado

// Handler para la tecla 'Enter' en los inputs
function handleInputKeyDown(event) {
    // Verificar si la tecla presionada es 'Enter' (código 13)
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevenir la acción por defecto
        handleAplicarDescuento(); // Llamar a la función para aplicar el descuento
    }
}


function handleAplicarDescuento() {
    const cantidadDescuentoInputVal = descuentoCantidadInput ? descuentoCantidadInput.value : '';
    const porcentajeDescuentoInputVal = descuentoPorcentajeInput ? descuentoPorcentajeInput.value : '';
    const precioKgInputVal = precioKgInput ? precioKgInput.value : ''; // <-- Obtener valor del input de precio/kg

    const cantidadDescuento = parseFloat(cantidadDescuentoInputVal) || 0;
    const porcentajeDescuento = parseFloat(porcentajeDescuentoInputVal) || 0;
    const nuevoPrecioKg = parseFloat(precioKgInputVal) || null; // <-- Obtener valor numérico o null


    // Validar que se haya seleccionado un ítem
    if (selectedCartItemIndex === null || !cartItems[selectedCartItemIndex]) {
        alert('Por favor, selecciona un item del carrito para aplicar el descuento.');
        return;
    }

    const itemToDiscount = cartItems[selectedCartItemIndex];
    let montoFinalDescuento = 0;
    let descripcionDescuento = '';
    let tipoDescuentoAplicado = ''; // Para la descripción
    let finalNewPricePerKg = null; // Para almacenar el nuevo precio por kg si se usó esa opción

    // --- Determinar qué tipo de descuento se aplicó ---
    if (cantidadDescuentoInputVal !== '') { // Si se usó el input de cantidad
        if (cantidadDescuento <= 0) {
             alert('Por favor, ingresa un monto de descuento mayor a cero.');
             return;
        }
        montoFinalDescuento = cantidadDescuento;
        tipoDescuentoAplicado = 'Cantidad';
        descripcionDescuento = `Desc. por Cantidad: $${montoFinalDescuento.toFixed(2)}`;
        // Opcional: Añadir el porcentaje equivalente a la descripción si se calculó
        if (itemToDiscount.cost > 0) {
             const porcentajeCalculado = (montoFinalDescuento / itemToDiscount.cost) * 100;
             descripcionDescuento += ` (${porcentajeCalculado.toFixed(2)}%)`;
        }

    } else if (porcentajeDescuentoInputVal !== '') { // Si se usó el input de porcentaje
        if (porcentajeDescuento <= 0) {
             alert('Por favor, ingresa un porcentaje de descuento mayor a cero.');
             return;
        }
        const itemCost = itemToDiscount.cost;
        montoFinalDescuento = (porcentajeDescuento / 100) * itemCost;
        tipoDescuentoAplicado = 'Porcentaje';
        // --- CORRECCIÓN TYPO E2 ---
        descripcionDescuento = `Desc. por Porcentaje: ${porcentajeDescuento.toFixed(2)}% ($${montoFinalDescuento.toFixed(2)})`;

    } else if (precioKgInputVal !== '' && nuevoPrecioKg !== null) { // <-- Si se usó el input de precio por kg
        // --- Validación más flexible: solo requiere cantidad > 0 y pricePerKg definido ---
        if (itemToDiscount.quantity <= 0 || itemToDiscount.pricePerKg === undefined || itemToDiscount.pricePerKg === null) {
             alert('No se puede modificar el precio por kg para este item.');
             return;
        }
        if (nuevoPrecioKg < 0) { // Permitir precio 0, pero no negativo
             alert('El precio por kg no puede ser negativo.');
             return;
        }

        const originalCost = itemToDiscount.cost;
        const newCost = nuevoPrecioKg * itemToDiscount.quantity;
        montoFinalDescuento = originalCost - newCost; // El descuento es la diferencia (puede ser 0 o negativo si el nuevo precio es mayor)

        // Si el "descuento" es cero o negativo (el precio subió o se mantuvo), no añadimos un item de descuento
        if (montoFinalDescuento <= 0) {
             alert('El nuevo precio por kg no resulta en un descuento.');
             // Si el precio subió o se mantuvo, no hay descuento que aplicar como item separado.
             // Podríamos actualizar el item original con el nuevo precio/kg si es necesario,
             // pero la solicitud actual es solo para descuentos.
             // Si quieres permitir subir el precio, necesitaríamos otra lógica aquí.
             closeDescuentoModal(); // Cerrar el modal si no hay descuento
             return; // No añadir item de descuento
        }

        tipoDescuentoAplicado = 'Precio por Kg';
        descripcionDescuento = `Precio por Kg modificado: $${itemToDiscount.pricePerKg.toFixed(2)} -> $${nuevoPrecioKg.toFixed(2)}`;
        finalNewPricePerKg = nuevoPrecioKg; // Almacenar el nuevo precio por kg
        // Opcional: Añadir el monto y porcentaje equivalente a la descripción
        if (itemToDiscount.cost > 0) {
             const porcentajeCalculado = (montoFinalDescuento / itemToDiscount.cost) * 100;
             descripcionDescuento += ` (Desc: $${montoFinalDescuento.toFixed(2)} / ${porcentajeCalculado.toFixed(2)}%)`;
        } else {
             descripcionDescuento += ` (Desc: $${montoFinalDescuento.toFixed(2)})`;
        }


    } else { // Si ninguno de los inputs de descuento/precio tiene valor
        alert('Por favor, ingresa un monto, porcentaje de descuento, o un nuevo precio por kg.');
        return;
    }


    // Asegurarse de que el monto del descuento no sea mayor que el costo del ítem (para evitar totales negativos inesperados)
    // Esto solo aplica si el descuento se calculó a partir de cantidad o porcentaje.
    // Si se calculó a partir de precio/kg, el monto ya es la diferencia y puede ser 0 o negativo.
    // Si el descuento es mayor que el costo original, limitarlo al costo original.
    const originalCostBeforeDiscount = itemToDiscount.cost; // Guardar el costo original antes de modificarlo
    if (montoFinalDescuento > originalCostBeforeDiscount) {
        montoFinalDescuento = originalCostBeforeDiscount; // Limitar el descuento al costo total del ítem
        alert(`El descuento aplicado se ha limitado al costo total del item ($${originalCostBeforeDiscount.toFixed(2)}).`);
        // Ajustar la descripción si se limitó el descuento
        descripcionDescuento += ' (Limitado al costo del item)';
    }

    // Calcular el nuevo costo del ítem
    const newCost = originalCostBeforeDiscount - montoFinalDescuento;


    // --- MODIFICACIÓN CLAVE: Actualizar el ítem original en lugar de añadir uno nuevo ---
    // Añadir la información del descuento al ítem original
    itemToDiscount.discount = {
        monto: montoFinalDescuento,
        descripcion: descripcionDescuento,
        originalCost: originalCostBeforeDiscount,
        newPricePerKg: finalNewPricePerKg // Guardar el nuevo precio por kg si se usó esa opción
    };

    // Actualizar el costo del ítem al nuevo costo descontado
    itemToDiscount.cost = newCost;

    console.log('Ítem del carrito actualizado con descuento:', itemToDiscount); // Log para depuración

    // --- Ya NO añadimos un nuevo item de descuento ---
    // addItemToCart(descuentoItem); // <-- Eliminar esta línea

    // Actualizar la visualización del carrito
    updateCarritoDisplay();

    // Cerrar el modal después de aplicar
    closeDescuentoModal();
}

// --- Funciones de Renderizado y UI ---

// Renderiza los items del carrito como botones seleccionables en el modal
function renderCartItemsForDiscount() {
    if (!itemsCarritoGrid) return;

    itemsCarritoGrid.innerHTML = ''; // Limpiar contenedor

    // Filtrar items que no sean ya descuentos, envíos, o Productos Adicionales (PA)
    // Tampoco mostrar ítems que ya tienen un descuento aplicado (para evitar aplicar doble descuento)
    cartItems.forEach((item, index) => {
        // --- MODIFICACIÓN: Excluir items de PA ---
        if (item.productId === 'DESCUENTO' || item.productId === 'ENVIO' || item.productId === 'PA' || item.discount) {
            return; // Saltar este ítem si es un descuento, envío, PA, o ya tiene descuento
        }
        // --> Fin de la MODIFICACIÓN <--

        const itemButton = document.createElement('button');
        itemButton.classList.add('item-descuento-btn');
        itemButton.dataset.itemIndex = index; // Guardar el índice del item en el dataset

        // Mostrar nombre y costo del item
        const itemName = item.optionName || item.productId; // Usar nombre o ID
        const itemCost = `$${item.cost.toFixed(2)}`;

        itemButton.innerHTML = `
            <span>${itemName}</span>
            <span>${itemCost}</span>
        `;

        itemsCarritoGrid.appendChild(itemButton);
    });
}

// Función para resetear el estado interno del modal
function resetModalState() {
    selectedCartItemIndex = null;
    if (itemsCarritoGrid) {
        itemsCarritoGrid.querySelectorAll('.item-descuento-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    resetInputFields(); // Usar la nueva función para limpiar inputs y placeholders
    // Limpiar la visualización de la cantidad del ítem seleccionado
    if (selectedItemQuantityDisplay) { // <-- Verificar que la referencia existe
        selectedItemQuantityDisplay.textContent = '';
    }
}

// Función auxiliar para limpiar los inputs y resetear placeholders
function resetInputFields() {
    if (descuentoCantidadInput) {
        descuentoCantidadInput.value = '';
    }
    if (descuentoPorcentajeInput) {
        descuentoPorcentajeInput.value = '';
    }
    if (precioKgInput) { // <-- Limpiar input de precio por kg
        precioKgInput.value = '';
    }
    resetInputPlaceholders(); // Resetear placeholders
}

// Función auxiliar para resetear solo los placeholders
function resetInputPlaceholders() {
     if (descuentoCantidadInput) descuentoCantidadInput.placeholder = '0.00';
     if (descuentoPorcentajeInput) descuentoPorcentajeInput.placeholder = '0';
     // El placeholder del precio por kg debe reflejar el precio original del item seleccionado, o N/A
     if (precioKgInput) {
         if (selectedCartItemIndex !== null && cartItems[selectedCartItemIndex] && cartItems[selectedCartItemIndex].pricePerKg !== undefined && cartItems[selectedCartItemIndex].pricePerKg !== null) {
             // Mostrar el precio por kg original en el placeholder
             precioKgInput.placeholder = cartItems[selectedCartItemIndex].pricePerKg.toFixed(2);
         } else {
             precioKgInput.placeholder = 'N/A';
         }
     }
}


// Opcional: Handler para cerrar con Escape
// function handleEscapeKey(event) {
//     if (event.key === 'Escape') {
//         closeDescuentoModal();
//     }
// }

// Opcional: Función para limpiar el estado si fuera necesario (ya incluida en closeDescuentoModal)
// export function resetDescuentoModalLogic() {
//     resetModalState();
// }