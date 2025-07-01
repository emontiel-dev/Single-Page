// src/modulos/venta/cargo/cargo.modal.js

// Este archivo se encargará de la lógica y renderizado del modal para agregar un cargo manual.

import { addItemToCart } from '../carrito/carrito.js'; // Importar la función para agregar ítems al carrito
import { resetModalLogic as resetCatalogoModalLogic } from '../catalogo/modal.logica.js'; // Importar la función de limpieza del modal de catálogo


// Referencias a elementos UI del modal de cargo
let cargoModalElement = null;
let descripcionCargoManualInput = null;
let montoCargoManualInput = null;
let cancelarCargoBtn = null;
let agregarCargoBtn = null;


// Función para crear y mostrar el modal de cargo
export async function openCargoModal() {
    // --- Lógica para cerrar cualquier modal existente ---
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        // Opcional: Limpiar la lógica asociada al modal cerrado si es necesario
        if (existingModal.id === 'product-modal-container') { resetCatalogoModalLogic(); }
        // Si tuvieras un modal de envío abierto, también lo limpiarías aquí
        // if (existingModal.id === 'envio-modal-container') { resetEnvioModalLogic(); } // Si tuvieras una función así
    }
    // ----------------------------------------------------


    // Si el modal ya existe en el DOM, no hacemos nada (o lo hacemos visible si estaba oculto)
    cargoModalElement = document.getElementById('cargo-modal-container');
    if (cargoModalElement) {
         console.log('Modal de cargo ya está en el DOM.');
         if (!cargoModalElement.classList.contains('visible')) {
             setTimeout(() => {
                 cargoModalElement.classList.add('visible');
                 // Opcional: Poner foco en el primer input al reabrir
                 if (descripcionCargoManualInput) descripcionCargoManualInput.focus();
             }, 10);
         }
         return;
    }


    // Cargar la plantilla HTML del modal de cargo
    try {
        const response = await fetch('src/views/cargo.modal.html');
        if (!response.ok) {
            console.error('Error loading cargo modal template:', response.statusText);
            return;
        }
        const modalHtml = await response.text();

        // Crear un elemento div temporal para parsear el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        cargoModalElement = tempDiv.querySelector('#cargo-modal-container');

        if (!cargoModalElement) {
            console.error('Cargo modal container not found in template.');
            return;
        }

        // Obtener referencias a los elementos dentro del modal
        descripcionCargoManualInput = cargoModalElement.querySelector('#descripcion-cargo-manual');
        montoCargoManualInput = cargoModalElement.querySelector('#monto-cargo-manual');
        cancelarCargoBtn = cargoModalElement.querySelector('#cancelar-cargo-btn');
        agregarCargoBtn = cargoModalElement.querySelector('#agregar-cargo-btn');


        // Añadir event listeners
        if (cancelarCargoBtn) cancelarCargoBtn.addEventListener('click', closeCargoModal);
        if (agregarCargoBtn) agregarCargoBtn.addEventListener('click', handleAgregarCargo);

        // Añadir listeners para la tecla 'Enter' en los inputs
        if (descripcionCargoManualInput) {
            descripcionCargoManualInput.addEventListener('keydown', handleCargoInputKeyDown);
        }
        if (montoCargoManualInput) {
            montoCargoManualInput.addEventListener('keydown', handleCargoInputKeyDown);
        }

        // Opcional: Añadir listener para cerrar con la tecla Escape
        // document.addEventListener('keydown', handleEscapeKey); // Implementar si es necesario


        // Añadir el modal al cuerpo del documento
        document.body.appendChild(cargoModalElement);

    } catch (error) {
        console.error('Error creating cargo modal:', error);
        return;
    }

    // Hacer el modal visible con una pequeña demora para la transición
    setTimeout(() => {
        cargoModalElement.classList.add('visible');
        // Poner el foco en el primer input al abrir
        if (descripcionCargoManualInput) {
            descripcionCargoManualInput.focus();
        }
    }, 10);
}

// Función para cerrar el modal de cargo
export function closeCargoModal() {
    if (cargoModalElement) {
        // Iniciar la transición de salida
        cargoModalElement.classList.remove('visible');
        // Eliminar el modal del DOM después de que termine la transición
        cargoModalElement.addEventListener('transitionend', () => {
            // Limpiar event listeners
            if (cancelarCargoBtn) cancelarCargoBtn.removeEventListener('click', closeCargoModal);
            if (agregarCargoBtn) agregarCargoBtn.removeEventListener('click', handleAgregarCargo);
            // Remover listeners de la tecla 'Enter'
            if (descripcionCargoManualInput) {
                descripcionCargoManualInput.removeEventListener('keydown', handleCargoInputKeyDown);
            }
            if (montoCargoManualInput) {
                montoCargoManualInput.removeEventListener('keydown', handleCargoInputKeyDown);
            }
            // document.removeEventListener('keydown', handleEscapeKey); // Remover listener de Escape

            cargoModalElement.remove();
            // Limpiar referencias
            cargoModalElement = null;
            descripcionCargoManualInput = null;
            montoCargoManualInput = null;
            cancelarCargoBtn = null;
            agregarCargoBtn = null;

            // Opcional: Limpiar la lógica asociada si fuera necesario
            // resetCargoModalLogic(); // Si tuvieras una función así
        }, { once: true }); // Asegura que el listener se elimine después de ejecutarse una vez
    }
}

// --- Handlers de Eventos ---

// Handler para la tecla 'Enter' en los inputs
function handleCargoInputKeyDown(event) {
    // Verificar si la tecla presionada es 'Enter' (código 13)
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevenir la acción por defecto (ej. enviar formulario, nueva línea)
        handleAgregarCargo(); // Llamar a la función para agregar el cargo
    }
}


function handleAgregarCargo() {
    const descripcion = descripcionCargoManualInput ? descripcionCargoManualInput.value.trim() : '';
    const monto = montoCargoManualInput ? parseFloat(montoCargoManualInput.value) || 0 : 0;

    // Validar que la descripción no esté vacía Y que el monto sea mayor a 0
    // La descripción es requerida por el HTML, pero validamos aquí también por si acaso.
    if (!descripcion || monto <= 0) { // <-- Modificada la validación
        alert('Por favor, ingresa una descripción y un monto mayor a cero para el cargo.'); // <-- Mensaje de validación actualizado
        return;
    }

    // Crear el objeto item para el cargo
    const cargoItem = {
        productId: 'CARGO', // Un identificador especial para cargos
        optionId: 'manual', // ID genérico para cargos manuales
        optionName: 'Cargo Manual', // <-- Nombre fijo para el tipo de ítem
        quantity: 1, // Siempre 1 para un cargo
        cost: monto,
        priceType: null,
        pricePerKg: null,
        personalizations: { descripcion: [descripcion] } // <-- Guardar la descripción ingresada aquí
    };

    console.log('Cargo manual a añadir al carrito:', cargoItem); // Log para depuración

    // Añadir el item de cargo al carrito
    addItemToCart(cargoItem);

    // Cerrar el modal después de agregar
    closeCargoModal();
}

// Opcional: Handler para cerrar con Escape
// function handleEscapeKey(event) {
//     if (event.key === 'Escape') {
//         closeCargoModal();
//     }
// }

// Opcional: Función para limpiar el estado si fuera necesario
// export function resetCargoModalLogic() {
//     // Limpiar variables de estado si las hubiera
// }