// src/modulos/venta/pa/pa.modal.js

// Este archivo se encargará de la lógica y renderizado del modal para agregar un Producto Adicional (PA).

import { addItemToCart } from './carrito.js'; // Importar la función para agregar ítems al carrito
import { resetModalLogic as resetCatalogoModalLogic } from './modal.logica.js'; // Importar la función de limpieza del modal de catálogo
// Importar la función de limpieza del modal de descuento si existiera
// import { resetDescuentoModalLogic } from '../descuento/descuento.modal.js';
// Importar la función de limpieza del modal de cargo si existiera
// import { resetCargoModalLogic } from '../cargo/cargo.modal.js';


// Referencias a elementos UI del modal de PA
let paModalElement = null;
let paDescripcionInput = null;
let paCostoInput = null;
let cancelarPaBtn = null;
let agregarPaBtn = null;


// Función para crear y mostrar el modal de PA
export async function openPaModal() {
    // --- Lógica para cerrar cualquier modal existente ---
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        if (existingModal.id === 'product-modal-container') { resetCatalogoModalLogic(); }
        // TODO: Añadir limpieza para otros modales si existen (descuento, cargo, envio)
    }

    // Cargar la plantilla HTML del modal
    const response = await fetch('src/modulos/venta/views/pa.modal.html');
    if (!response.ok) {
        console.error('Error loading pa modal template:', response.statusText);
        return;
    }
    const modalHtml = await response.text();

    // Crear un elemento div temporal para parsear el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    paModalElement = tempDiv.querySelector('#pa-modal-container');

    if (!paModalElement) {
        console.error('PA modal container not found in template.');
        return;
    }

    // Obtener referencias a los elementos dentro del modal
    paDescripcionInput = paModalElement.querySelector('#pa-descripcion-input');
    paCostoInput = paModalElement.querySelector('#pa-costo-input');
    cancelarPaBtn = paModalElement.querySelector('#cancelar-pa-btn');
    agregarPaBtn = paModalElement.querySelector('#agregar-pa-btn');


    // Añadir event listeners
    if (cancelarPaBtn) cancelarPaBtn.addEventListener('click', closePaModal);
    if (agregarPaBtn) agregarPaBtn.addEventListener('click', handleAgregarPa);

    // Añadir listeners para la tecla 'Enter' en los inputs
    if (paDescripcionInput) paDescripcionInput.addEventListener('keydown', handleInputKeyDown);
    if (paCostoInput) paCostoInput.addEventListener('keydown', handleInputKeyDown);


    // Opcional: Añadir listener para cerrar con la tecla Escape
    // document.addEventListener('keydown', handleEscapeKey); // Implementar si es necesario


    // Añadir el modal al cuerpo del documento
    document.body.appendChild(paModalElement);

    // Resetear estado inicial
    resetModalState();


    // Hacer el modal visible con una pequeña demora para la transición
    setTimeout(() => {
        paModalElement.classList.add('visible');
        // Poner el foco inicial en el input de descripción
        if (paDescripcionInput) {
            paDescripcionInput.focus();
        }
    }, 10);
}

// Función para cerrar el modal de PA
export function closePaModal() {
    if (paModalElement) {
        // Iniciar la transición de salida
        paModalElement.classList.remove('visible');
        // Eliminar el modal del DOM después de que termine la transición
        paModalElement.addEventListener('transitionend', () => {
            // Limpiar event listeners
            if (cancelarPaBtn) cancelarPaBtn.removeEventListener('click', closePaModal);
            if (agregarPaBtn) agregarPaBtn.removeEventListener('click', handleAgregarPa);
            if (paDescripcionInput) paDescripcionInput.removeEventListener('keydown', handleInputKeyDown);
            if (paCostoInput) paCostoInput.removeEventListener('keydown', handleInputKeyDown);
            // document.removeEventListener('keydown', handleEscapeKey); // Remover listener de Escape

            paModalElement.remove();
            // Limpiar referencias
            paModalElement = null;
            paDescripcionInput = null;
            paCostoInput = null;
            cancelarPaBtn = null;
            agregarPaBtn = null;

            // Limpiar estado del modal
            resetModalState();

        }, { once: true }); // Asegura que el listener se elimine después de ejecutarse una vez
    }
}

// --- Handlers de Eventos ---

// Handler para la tecla 'Enter' en los inputs
function handleInputKeyDown(event) {
    // Verificar si la tecla presionada es 'Enter' (código 13)
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevenir la acción por defecto
        handleAgregarPa(); // Llamar a la función para agregar el PA
    }
}


function handleAgregarPa() {
    const descripcion = paDescripcionInput ? paDescripcionInput.value.trim() : '';
    const costo = paCostoInput ? parseFloat(paCostoInput.value) || 0 : 0; // Costo es opcional, default 0

    // Validar que la descripción no esté vacía
    if (!descripcion) {
        alert('Por favor, ingresa una descripción para el Producto Adicional.');
        if (paDescripcionInput) paDescripcionInput.focus();
        return;
    }

    // --- Lógica de validación con IA (Diferida para futura iteración) ---
    // Aquí iría la llamada a la API de Gemini para clasificar la descripción
    // Si la clasificación no es "Abarrotes, Frutas o Verduras", mostrar advertencia
    // const isPaCategory = checkPaCategory(descripcion); // Función ficticia
    // if (!isPaCategory) {
    //     const confirmAdd = confirm('La descripción no parece ser de un Producto Adicional típico (Abarrotes, Frutas, Verduras). ¿Deseas agregarlo de todas formas?');
    //     if (!confirmAdd) {
    //         return; // El usuario canceló
    //     }
    // }
    // --------------------------------------------------------------------


    // Crear el objeto item para el Producto Adicional
    const paItem = {
        productId: 'PA', // Un identificador especial para Productos Adicionales
        optionId: 'manual', // ID genérico para PA manuales
        optionName: 'Producto Adicional', // Nombre fijo para el tipo de ítem
        quantity: 1, // Asumimos cantidad 1 por defecto para PA (se puede editar después si es necesario)
        cost: costo,
        priceType: null, // No aplica tipo de precio
        pricePerKg: null, // No aplica precio por kg
        personalizations: { descripcion: [descripcion] } // <-- Guardar la descripción ingresada aquí
    };

    console.log('Producto Adicional a añadir al carrito:', paItem); // Log para depuración

    // Añadir el item de PA al carrito
    addItemToCart(paItem);

    // Cerrar el modal después de agregar
    closePaModal();
}


// --- Funciones de UI ---

// Función para resetear el estado interno del modal (limpiar inputs)
function resetModalState() {
    if (paDescripcionInput) {
        paDescripcionInput.value = '';
        paDescripcionInput.placeholder = 'Ej: 1k de jitomate';
    }
    if (paCostoInput) {
        paCostoInput.value = '';
        paCostoInput.placeholder = '0.00';
    }
}


// Opcional: Handler para cerrar con Escape
// function handleEscapeKey(event) {
//     if (event.key === 'Escape') {
//         closePaModal();
//     }
// }

// Opcional: Función para limpiar el estado si fuera necesario (ya incluida en closePaModal)
// export function resetPaModalLogic() {
//     resetModalState();
// }