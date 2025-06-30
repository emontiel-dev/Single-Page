// src/modulos/venta/catalogo/modal.logica.js

// Este archivo maneja la lógica interna del modal de catálogo.

import { catalogoProductos } from './catalogo.datos.js'; // Importamos los datos del catálogo
import { addItemToCart, cartItems, updateCarritoDisplay } from '../carrito/carrito.js'; // Asegúrate de que updateCarritoDisplay esté importado
import { opcionesEnvio } from '../envio/envio.datos.js'; // Importamos los datos de opciones de envío

// Variables de estado del modal (serán pasadas desde catalogo.modal.js)
let currentProduct = null;
let selectedOptionId = null;
let selectedPriceType = null;
let selectedPersonalizations = {}; // This variable holds the state shared with catalogo.modal.js

// Referencias a elementos UI (serán pasadas desde catalogo.modal.js)
let cantidadInput = null;
let costoInput = null;
let opcionesGrid = null;
let preciosGrid = null;
let procesamientosGrid = null;
let addToOrderBtn = null;
let cancelarModalBtn = null;
let closeModalBtn = null;

// Callbacks a funciones de renderizado o externas (serán pasadas desde catalogo.modal.js)
let renderPreciosCallback = null;
let renderPersonalizacionesCallback = null; // This callback now expects the state as an argument
let closeCatalogoModalCallback = null;
// updateModalContentForOptionCallback ya no es necesario pasarlo como callback, la lógica está aquí
// let updateModalContentForOptionCallback = null;


// Función para inicializar la lógica del modal, recibiendo las dependencias
export function initModalLogic(state, uiElements, callbacks) {
    // Asignar variables de estado
    currentProduct = state.currentProduct;
    selectedOptionId = state.selectedOptionId;
    selectedPriceType = state.selectedPriceType; // May be null initially
    selectedPersonalizations = state.selectedPersonalizations; // Assign the shared state object

    // Asignar referencias a elementos UI
    cantidadInput = uiElements.cantidadInput;
    costoInput = uiElements.costoInput;
    opcionesGrid = uiElements.opcionesGrid;
    preciosGrid = uiElements.preciosGrid;
    procesamientosGrid = uiElements.procesamientosGrid;
    addToOrderBtn = uiElements.addToOrderBtn;
    cancelarModalBtn = uiElements.cancelarModalBtn;
    closeModalBtn = uiElements.closeModalBtn;


    // Asignar callbacks
    renderPreciosCallback = callbacks.renderPrecios;
    renderPersonalizacionesCallback = callbacks.renderPersonalizaciones; // Store the callback
    closeCatalogoModalCallback = callbacks.closeCatalogoModal;
    // updateModalContentForOptionCallback = callbacks.updateModalContentForOption; // Ya no se pasa


    // Añadir event listeners (ahora en la lógica)
    if (closeModalBtn) closeModalBtn.addEventListener('click', handleCloseModal);
    if (cancelarModalBtn) cancelarModalBtn.addEventListener('click', handleCloseModal);
    if (addToOrderBtn) addToOrderBtn.addEventListener('click', handleAddToOrder);

    if (cantidadInput) {
        cantidadInput.addEventListener('input', handleCantidadInput);
        // Add keydown listener for Enter key
        cantidadInput.addEventListener('keydown', handleInputKeyDown);
    }
    if (costoInput) {
        costoInput.addEventListener('input', handleCostoInput);
        // Add keydown listener for Enter key
        costoInput.addEventListener('keydown', handleInputKeyDown);
    }


    // Event listeners para los grids usando delegación
    if (opcionesGrid) opcionesGrid.addEventListener('click', handleOptionSelect);
    if (preciosGrid) preciosGrid.addEventListener('click', handlePriceTypeSelect);
    if (procesamientosGrid) procesamientosGrid.addEventListener('change', handlePersonalizationSelect); // Change event is better for checkboxes/radios

    // --- Lógica de inicialización adicional ---
    // Seleccionar el precio 'publico' por defecto al abrir el modal
    const initialOptionData = findOptionData(selectedOptionId);
    if (initialOptionData) {
        selectDefaultPrice(initialOptionData);
    }
    // Personalizaciones por defecto ya se inicializaron en openCatalogoModal
    // and the shared selectedPersonalizations object was passed to initModalLogic
}

// Función para limpiar el estado y las referencias al cerrar el modal
export function resetModalLogic() {
    currentProduct = null;
    selectedOptionId = null;
    selectedPriceType = null;
    // Reset the shared state object
    selectedPersonalizations = {}; // This clears the object referenced by both files

    // Remove event listeners from inputs before clearing references
    if (cantidadInput) {
        cantidadInput.removeEventListener('input', handleCantidadInput);
        cantidadInput.removeEventListener('keydown', handleInputKeyDown);
    }
    if (costoInput) {
        costoInput.removeEventListener('input', handleCostoInput);
        costoInput.removeEventListener('keydown', handleInputKeyDown);
    }
     // Note: Other event listeners (closeModalBtn, cancelarModalBtn, addToOrderBtn,
     // and delegated listeners on grids) are removed automatically when the modal element
     // is removed from the DOM in closeCatalogoModal.

    cantidadInput = null;
    costoInput = null;
    opcionesGrid = null;
    preciosGrid = null;
    procesamientosGrid = null;
    addToOrderBtn = null;
    cancelarModalBtn = null;
    closeModalBtn = null;

    renderPreciosCallback = null;
    renderPersonalizacionesCallback = null;
    closeCatalogoModalCallback = null;
    // updateModalContentForOptionCallback = null; // Ya no se usa
}


// --- Handlers de Eventos ---

function handleCloseModal() {
    // Llama al callback para cerrar el modal en la capa de UI
    if (closeCatalogoModalCallback) {
        closeCatalogoModalCallback();
    }
}


function handleCantidadInput(event) {
    const cantidad = parseFloat(cantidadInput.value);

    // Limpiar el otro input y su placeholder
    costoInput.value = '';
    costoInput.placeholder = '0.00';


    if (isNaN(cantidad) || cantidad <= 0 || selectedPriceType === null) {
        // No calcular si la cantidad no es válida o no hay tipo de precio seleccionado
        costoInput.placeholder = '0.00'; // Asegurar que el placeholder se resetee
        return;
    }

    // Encontrar el precio por kg para el tipo de precio seleccionado
    const currentOption = findOptionData(selectedOptionId);
    if (!currentOption || !currentOption.precios || currentOption.precios[selectedPriceType] === null) {
         console.warn(`Precio para la opción ${selectedOptionId} y tipo ${selectedPriceType} no encontrado.`);
         costoInput.placeholder = 'Error'; // Indicar error en placeholder
         return;
    }

    const precioPorKg = currentOption.precios[selectedPriceType];
    const costoCalculado = cantidad * precioPorKg;

    // Mostrar el costo calculado en el placeholder del input de costo
    costoInput.placeholder = `$${costoCalculado.toFixed(2)}`;
}

function handleCostoInput(event) {
    const costo = parseFloat(costoInput.value);

    // Limpiar el otro input y su placeholder
    cantidadInput.value = '';
    cantidadInput.placeholder = '0.00';


    if (isNaN(costo) || costo <= 0 || selectedPriceType === null) {
        // No calcular si el costo no es válido o no hay tipo de precio seleccionado
        cantidadInput.placeholder = '0.00'; // Asegurar que el placeholder se resetee
        return;
    }

     // Encontrar el precio por kg para el tipo de precio seleccionado
    const currentOption = findOptionData(selectedOptionId);
    if (!currentOption || !currentOption.precios || currentOption.precios[selectedPriceType] === null) {
         console.warn(`Precio para la opción ${selectedOptionId} y tipo ${selectedPriceType}. No se puede calcular la cantidad.`);
         cantidadInput.placeholder = 'Error'; // Indicar error en placeholder
         return;
    }

    const precioPorKg = currentOption.precios[selectedPriceType];

    if (precioPorKg <= 0) {
        console.warn(`Precio por kg es cero o negativo para la opción ${selectedOptionId} y tipo ${selectedPriceType}. No se puede calcular la cantidad.`);
        cantidadInput.placeholder = 'Error'; // Indicar error en placeholder
        return;
    }

    const cantidadCalculada = costo / precioPorKg;

    // Mostrar la cantidad calculada en el placeholder del input de cantidad
    cantidadInput.placeholder = `${cantidadCalculada.toFixed(3)} kg`; // Mostrar 3 decimales para cantidad
}

// New handler for keydown event on inputs
function handleInputKeyDown(event) {
    // Check if the pressed key is Enter (key code 13)
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevent default form submission or newline
        handleAddToOrder(); // Trigger the add to order function
    }
}


function handleOptionSelect(event) {
    const selectedButton = event.target.closest('.modal-btn');
    if (!selectedButton) return;

    const optionId = selectedButton.dataset.optionId;

    // Desmarcar el botón previamente seleccionado
    opcionesGrid.querySelectorAll('.modal-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Marcar el botón seleccionado actualmente
    selectedButton.classList.add('selected');
    selectedOptionId = optionId; // Actualizar la opción seleccionada

    console.log(`Opción seleccionada: ${selectedOptionId}`);

    // Actualizar precios y personalizaciones basados en la opción seleccionada
    updateModalContentForOption(selectedOptionId); // Llama a la función local
}


function handlePriceTypeSelect(event) {
    const selectedButton = event.target.closest('.modal-btn.precio-btn');
    if (!selectedButton) return;

    const priceType = selectedButton.dataset.priceType;

    // Desmarcar el botón previamente seleccionado
    preciosGrid.querySelectorAll('.modal-btn.precio-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Marcar el botón seleccionado actualmente
    selectedButton.classList.add('selected');
    selectedPriceType = priceType; // Actualizar el tipo de precio seleccionado

    console.log(`Tipo de precio seleccionado: ${selectedPriceType}`);

    // Resetear inputs al cambiar el tipo de precio
    cantidadInput.value = '';
    costoInput.value = '';
    cantidadInput.placeholder = '0.00';
    costoInput.placeholder = '0.00';
}


function handlePersonalizationSelect(event) {
    const input = event.target;
    // Asegurarse de que el evento proviene de un input dentro de un label en el grid de procesamientos
    if (!input.matches('.procesamientos-grid label input[type="checkbox"], .procesamientos-grid label input[type="radio"]')) {
        return;
    }

    const groupId = input.dataset.groupId; // Obtenemos el groupId del dataset
    const optionId = input.value;
    const parentLabel = input.closest('label'); // Obtener el label padre

    if (!selectedPersonalizations[groupId]) {
        selectedPersonalizations[groupId] = [];
    }

    if (input.type === 'checkbox') {
        if (input.checked) {
            if (!selectedPersonalizations[groupId].includes(optionId)) {
                selectedPersonalizations[groupId].push(optionId);
                if (parentLabel) parentLabel.classList.add('selected'); // Aplicar 'selected' al label
            }
        } else {
            selectedPersonalizations[groupId] = selectedPersonalizations[groupId].filter(id => id !== optionId);
            if (parentLabel) parentLabel.classList.remove('selected'); // Remover 'selected' del label
        }
    } else if (input.type === 'radio') {
        // Para radios, solo hay una opción seleccionada por grupo
        selectedPersonalizations[groupId] = [optionId];

        // Remover la clase 'selected' de todos los labels en este grupo
        if (procesamientosGrid) {
             // Buscar todos los labels dentro de este grid que contienen un input de radio con el mismo 'name' (groupId)
             const groupInputs = procesamientosGrid.querySelectorAll(`label input[type="radio"][name="${groupId}"]`);
             groupInputs.forEach(radioInput => {
                 const label = radioInput.closest('label'); // Encontrar el label padre para cada input de radio
                 if (label) label.classList.remove('selected'); // Remover 'selected' del label
             });
        }

        // Añadir la clase 'selected' al label del input seleccionado actualmente
        if (parentLabel) parentLabel.classList.add('selected'); // Aplicar 'selected' al label
    }

    console.log(`Personalizaciones seleccionadas:`, selectedPersonalizations);
}


function handleAddToOrder() {
    // Usar el valor del input si está lleno, de lo contrario usar el placeholder (el resultado del cálculo)
    // Asegurarse de que el placeholder tenga un valor numérico válido si se usó para el cálculo
    const cantidad = cantidadInput.value !== '' ? parseFloat(cantidadInput.value) : parseFloat(cantidadInput.placeholder.replace(' kg', '')); // Limpiar ' kg' del placeholder
    const costo = costoInput.value !== '' ? parseFloat(costoInput.value) : parseFloat(costoInput.placeholder.replace('$', '')); // Limpiar '$' del placeholder


    // Validar que se haya seleccionado una opción y un tipo de precio,
    // Y que al menos uno de los inputs (cantidad o costo) resulte en un valor numérico > 0
    if (selectedOptionId === null || selectedPriceType === null ||
        ((isNaN(cantidad) || cantidad <= 0) && (isNaN(costo) || costo <= 0)))
    {
        alert('Por favor, selecciona una opción, un tipo de precio y registra la cantidad o el costo.');
        return;
    }

    // Encontrar los datos completos de la opción seleccionada para obtener los nombres de las personalizaciones y el precio
    const optionData = findOptionData(selectedOptionId);
    if (!optionData) {
         console.error(`Datos para la opción ${selectedOptionId} no encontrados al añadir al carrito.`);
         alert('Error al añadir el producto. Inténtalo de nuevo.');
         return;
    }

    // Obtener el precio por kg del catálogo para el tipo de precio seleccionado
    const precioPorKg = optionData.precios ? optionData.precios[selectedPriceType] : null;
    if (precioPorKg === null) {
         console.error(`Precio por kg no encontrado para la opción ${selectedOptionId} y tipo ${selectedPriceType}.`);
         alert('Error al obtener el precio del producto. Inténtalo de nuevo.');
         return;
    }


    // Construir el objeto de personalizaciones con nombres
    const personalizationsWithNames = {};
    if (optionData.personalizaciones) {
        optionData.personalizaciones.forEach(grupo => {
            // Use the selectedPersonalizations state from modal.logica.js
            const selectedIdsInGroup = selectedPersonalizations[grupo.grupo] || [];
            if (selectedIdsInGroup.length > 0) {
                // Encontrar los nombres para los IDs seleccionados en este grupo
                const selectedNames = grupo.options
                    .filter(opt => selectedIdsInGroup.includes(opt.id))
                    .map(opt => opt.nombre);
                if (selectedNames.length > 0) {
                     personalizationsWithNames[grupo.grupo] = selectedNames;
                }
            }
        });
    }


    const itemToAdd = {
        productId: currentProduct.id, // ID del producto base
        optionId: selectedOptionId, // ID de la opción seleccionada (PECH, PP-PECH, PG, etc.)
        optionName: optionData.nombre, // Nombre de la opción seleccionada
        quantity: cantidad,
        cost: costo,
        priceType: selectedPriceType,
        pricePerKg: precioPorKg, // Añadimos el precio por kg del catálogo
        personalizations: personalizationsWithNames, // Usar el objeto con nombres
        // Puedes añadir más detalles si es necesario
    };

    console.log('Item a añadir al pedido:', itemToAdd);

    // --- MODIFICADO: Añadir item de envío por defecto si el carrito está vacío, *antes* del producto ---
    const wasCartEmpty = cartItems.length === 0;

    if (wasCartEmpty) {
        const defaultEnvioOption = opcionesEnvio.find(opcion => opcion.id === 'mostrador');
        if (defaultEnvioOption) {
            console.log('Carrito estaba vacío, añadiendo opción de envío por defecto:', defaultEnvioOption);
            const envioItem = {
                productId: 'ENVIO', // Identificador especial
                optionId: defaultEnvioOption.id,
                optionName: defaultEnvioOption.nombre,
                quantity: 1,
                cost: defaultEnvioOption.costo,
                priceType: null,
                pricePerKg: null,
                personalizations: { descripcion: [defaultEnvioOption.descripcion] }
            };
            // Añadir el item de envío al principio del array DIRECTAMENTE
            cartItems.unshift(envioItem);
        } else {
            console.warn('Opción de envío por defecto "mostrador" no encontrada en los datos.');
        }
    }

    // Añadir el item de producto al final del array DIRECTAMENTE
    cartItems.push(itemToAdd);

    // --- NUEVO: Llamar a updateCarritoDisplay UNA VEZ después de añadir ambos items ---
    updateCarritoDisplay();


    // Cerrar el modal después de añadir al pedido
    if (closeCatalogoModalCallback) {
        closeCatalogoModalCallback();
    }
}


// --- Funciones Auxiliares ---

// Función auxiliar para encontrar los datos de la opción seleccionada (producto principal, subproducto, especial, variante)
function findOptionData(optionId) {
    if (!currentProduct) return null;

    // Verificar si es el producto principal
    if (currentProduct.id === optionId) {
        return currentProduct;
    }

    // Verificar subproductos
    if (currentProduct.subproductos) {
        const sub = currentProduct.subproductos.find(s => s.id === optionId);
        if (sub) return sub;
    }

    // Verificar especiales
    if (currentProduct.especiales) {
        const esp = currentProduct.especiales.find(e => e.id === optionId);
        if (esp) return esp;
    }

    // Verificar variantes
    if (currentProduct.variantes) {
        const varnt = currentProduct.variantes.find(v => v.id === optionId);
        if (varnt) return varnt;
    }

    return null; // Opción no encontrada
}

// Función para actualizar las secciones de precios y personalizaciones cuando cambia la opción seleccionada
// Esta función ahora reside en modal.logica.js
export function updateModalContentForOption(optionId) {
    const optionData = findOptionData(optionId);
    console.log('updateModalContentForOption called for optionId:', optionId);
    console.log('Found optionData:', optionData); // Log optionData

    if (!optionData) {
        console.error(`Datos para la opción ${optionId} no encontrados.`);
        return;
    }

    // Actualizar precios usando el callback de renderizado
    if (renderPreciosCallback && preciosGrid) {
        renderPreciosCallback(preciosGrid, optionData.precios);
        // Seleccionar el precio 'publico' por defecto para la nueva opción
        selectDefaultPrice(optionData);
    }

    // Actualizar personalizaciones usando el callback de renderizado
    const procesamientosSection = procesamientosGrid ? procesamientosGrid.closest('.modal-section.procesamientos') : null;

    if (renderPersonalizacionesCallback && procesamientosGrid) {
        // --- Resetear y inicializar selectedPersonalizations para la nueva opción ---
        // Clear the existing object, maintaining the reference
        for (const key in selectedPersonalizations) {
            delete selectedPersonalizations[key];
        }
        console.log('Reset selectedPersonalizations:', selectedPersonalizations); // Log after reset

        console.log('Option personalizaciones data:', optionData.personalizaciones); // Log personalizaciones data from optionData

        if (optionData.personalizaciones) {
            optionData.personalizaciones.forEach(grupo => {
                if (grupo.default && Array.isArray(grupo.default)) {
                    selectedPersonalizations[grupo.grupo] = [...grupo.default];
                } else {
                    selectedPersonalizations[grupo.grupo] = [];
                }
            });
        }
        console.log('Selected personalizations updated for new option:', selectedPersonalizations); // Log after populating from defaults
        // -----------------------------------------------------------------------------

        // Pasamos el contenedor del grid de procesamientos Y el estado actualizado
        renderPersonalizacionesCallback(procesamientosGrid, optionData.personalizaciones, selectedPersonalizations); // <-- Pass the state
    } else if (procesamientosSection) {
         // Si no hay grid pero sí la sección, ocultarla si no hay personalizaciones
         if (!optionData.personalizaciones || optionData.personalizaciones.length === 0) {
             procesamientosSection.style.display = 'none';
         } else {
             procesamientosSection.style.display = 'block';
         }
    }


    // Resetear inputs de cantidad/costo
    if (cantidadInput) cantidadInput.value = '';
    if (costoInput) costoInput.value = '';
    if (cantidadInput) cantidadInput.placeholder = '0.00';
    if (costoInput) costoInput.placeholder = '0.00';
    // selectedPriceType ya se resetea o se establece en selectDefaultPrice
}

// Función auxiliar para seleccionar el precio 'publico' por defecto
function selectDefaultPrice(optionData) {
    // Resetear el tipo de precio seleccionado antes de intentar seleccionar uno nuevo
    selectedPriceType = null;

    // Desmarcar botones de precio seleccionados previamente
    if (preciosGrid) {
        preciosGrid.querySelectorAll('.modal-btn.precio-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    // Intentar seleccionar el precio 'publico' si existe para esta opción
    if (optionData && optionData.precios && optionData.precios['publico'] !== null) {
        const publicoBtn = preciosGrid.querySelector('.modal-btn.precio-btn[data-price-type="publico"]');
        if (publicoBtn) {
            publicoBtn.classList.add('selected');
            selectedPriceType = 'publico'; // Establecer el tipo de precio seleccionado
            console.log(`Tipo de precio seleccionado por defecto: ${selectedPriceType}`);
        }
    } else {
         console.log(`Opción ${optionData ? optionData.id : 'N/A'} no tiene precio 'publico' o datos no encontrados.`);
    }
}