// src/modulos/venta/envio/envio.modal.js

// Este archivo se encargará de la lógica y renderizado del modal para seleccionar el tipo de envío.

import { opcionesEnvio } from './envio.datos.js';
// MODIFICADO: Importar cartItems y updateCarritoDisplay
import { cartItems, updateCarritoDisplay } from '../carrito/carrito.js';
import { resetModalLogic as resetCatalogoModalLogic } from '../catalogo/modal.logica.js';


// Variable de estado para la opción de envío seleccionada
let selectedEnvioOption = null;


// Referencias a elementos UI del modal de envío
let envioModalElement = null;
let opcionesEnvioGrid = null;
let volverEnvioBtn = null; // Nuevo botón
let agregarEnvioBtn = null; // Nuevo botón
let descripcionEnvioManualInput = null;
let montoEnvioManualInput = null;


// Función para crear y mostrar el modal de envío
export async function openEnvioModal() {
    // --- Lógica para cerrar cualquier modal existente ---
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        // Opcional: Limpiar la lógica asociada al modal cerrado si es necesario
        if (existingModal.id === 'product-modal-container') { resetCatalogoModalLogic(); }
    }
    // ----------------------------------------------------


    // Si el modal ya existe en el DOM, no hacemos nada
    // Si ya existe, asumimos que el estado (selectedEnvioOption/manualEnvioDetails) ya está cargado
    envioModalElement = document.getElementById('envio-modal-container');
    if (envioModalElement) {
         console.log('Modal de envío ya está en el DOM.');
         if (!envioModalElement.classList.contains('visible')) {
             setTimeout(() => {
                 envioModalElement.classList.add('visible');
                 // Eliminamos la restauración del estado de los inputs manuales
                 // if (descripcionEnvioManualInput) descripcionEnvioManualInput.value = manualEnvioDetails.descripcion;
                 // if (montoEnvioManualInput) montoEnvioManualInput.value = manualEnvioDetails.monto > 0 ? manualEnvioDetails.monto : ''; // No mostrar 0 si es 0
                 // Asegurarse de que la UI refleje la selección actual (predefinida o manual)
                 updateSelectedEnvioUI(); // <-- Llamar aquí para asegurar el estado correcto de inputs/botones
             }, 10);
         }
         return;
    }


    // Cargar la plantilla HTML del modal de envío
    try {
        const response = await fetch('src/views/venta/envio.modal.html');
        if (!response.ok) {
            console.error('Error loading envio modal template:', response.statusText);
            return;
        }
        const modalHtml = await response.text();

        // Crear un elemento div temporal para parsear el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        envioModalElement = tempDiv.querySelector('#envio-modal-container');

        if (!envioModalElement) {
            console.error('Envio modal container not found in template.');
            return;
        }

        // Obtener referencias a los elementos dentro del modal
        opcionesEnvioGrid = envioModalElement.querySelector('.opciones-envio-grid');
        volverEnvioBtn = envioModalElement.querySelector('#volver-envio-btn'); // Nueva referencia
        agregarEnvioBtn = envioModalElement.querySelector('#agregar-envio-btn'); // Nueva referencia
        descripcionEnvioManualInput = envioModalElement.querySelector('#descripcion-envio-manual'); // Nueva referencia
        montoEnvioManualInput = envioModalElement.querySelector('#monto-envio-manual'); // Nueva referencia


        // Añadir event listeners
        if (volverEnvioBtn) volverEnvioBtn.addEventListener('click', closeEnvioModal); // Botón "volver" cierra el modal
        if (agregarEnvioBtn) agregarEnvioBtn.addEventListener('click', handleAgregarEnvio); // Botón "agregar" maneja la lógica de agregar
        if (opcionesEnvioGrid) opcionesEnvioGrid.addEventListener('click', handleEnvioOptionSelect);

        descripcionEnvioManualInput.addEventListener('input', handleManualInput);
        montoEnvioManualInput.addEventListener('input', handleManualInput);


        // Añadir el modal al cuerpo del documento
        document.body.appendChild(envioModalElement);

    } catch (error) {
        console.error('Error creating envio modal:', error);
        return;
    }

    // --- MODIFICACIÓN: Cargar estado del envío existente o usar por defecto ---
    const existingEnvioItem = cartItems.find(item => item.productId === 'ENVIO');
    if (existingEnvioItem) {
        // Si existe un envío, cargarlo para edición
        selectedEnvioOption = opcionesEnvio.find(op => op.id === existingEnvioItem.optionId) || null;
        if (!selectedEnvioOption) { // Era un envío manual
            descripcionEnvioManualInput.value = existingEnvioItem.optionName;
            montoEnvioManualInput.value = existingEnvioItem.cost > 0 ? existingEnvioItem.cost.toFixed(2) : '';
        }
    } else {
        // Si no existe, usar la opción por defecto
        selectedEnvioOption = opcionesEnvio.find(opcion => opcion.id === 'mostrador') || null;
    }
    // --- FIN DE LA MODIFICACIÓN ---


    // Renderizar las opciones de envío
    renderOpcionesEnvio(opcionesEnvioGrid, opcionesEnvio);

    // Marcar la opción seleccionada previamente si existe (predefinida o manual)
    updateSelectedEnvioUI(); // <-- Llamar aquí para establecer el estado inicial de inputs/botones


    // Hacer el modal visible con una pequeña demora para la transición
    setTimeout(() => {
        envioModalElement.classList.add('visible');
        // Poner el foco inicial basado en la selección por defecto
        if (selectedEnvioOption && opcionesEnvioGrid) {
             const selectedBtn = opcionesEnvioGrid.querySelector(`.envio-option-btn[data-envio-id="${selectedEnvioOption.id}"]`);
             if (selectedBtn) {
                 selectedBtn.focus();
             }
        } else {
             // Si no hay opción por defecto seleccionada, no ponemos foco en ningún input manual
             // ya que los hemos eliminado. Podríamos poner foco en el primer botón de opción si existe.
             const firstOptionBtn = opcionesEnvioGrid ? opcionesEnvioGrid.querySelector('.envio-option-btn') : null;
             if (firstOptionBtn) {
                 firstOptionBtn.focus();
             }
        }
    }, 10);
}

// Función para cerrar el modal de envío
export function closeEnvioModal() {
    if (envioModalElement) {
        // Iniciar la transición de salida
        envioModalElement.classList.remove('visible');
        // Eliminar el modal del DOM después de que termine la transición
        envioModalElement.addEventListener('transitionend', () => {
            envioModalElement.remove();
            envioModalElement = null;
        }, { once: true });
    }
}

// --- Handlers de Eventos ---

function handleEnvioOptionSelect(event) {
    const selectedButton = event.target.closest('.envio-option-btn');
    if (!selectedButton) return;

    const envioId = selectedButton.dataset.envioId;
    selectedEnvioOption = opcionesEnvio.find(opcion => opcion.id === envioId) || null;
    
    updateSelectedEnvioUI();
}

function handleManualInput() {
    if (selectedEnvioOption) {
        selectedEnvioOption = null;
        updateSelectedEnvioUI();
    }
}

function handleAgregarEnvio() {
    const descripcion = descripcionEnvioManualInput.value.trim();
    const costo = parseFloat(montoEnvioManualInput.value) || 0;

    if (!descripcion) {
        alert('Por favor, ingresa una descripción para el envío.');
        return;
    }

    // --- MODIFICACIÓN: Lógica para reemplazar o añadir el item de envío ---
    const envioItem = {
        productId: 'ENVIO',
        optionId: selectedEnvioOption ? selectedEnvioOption.id : 'manual',
        optionName: descripcion,
        quantity: 1,
        cost: costo,
        priceType: null,
        pricePerKg: null,
        personalizations: { descripcion: [descripcion] }
    };

    const existingEnvioIndex = cartItems.findIndex(item => item.productId === 'ENVIO');

    if (existingEnvioIndex > -1) {
        // Si ya existe un envío, lo reemplazamos
        cartItems[existingEnvioIndex] = envioItem;
    } else {
        // Si no existe, lo añadimos
        cartItems.push(envioItem);
    }

    updateCarritoDisplay(); // Actualizar la UI del carrito principal
    // --- FIN DE LA MODIFICACIÓN ---

    closeEnvioModal();
}


// --- Funciones de Renderizado y UI ---

function renderOpcionesEnvio(container, opciones) {
    container.innerHTML = ''; // Limpiar contenedor

    opciones.forEach(opcion => {
        const button = document.createElement('button');
        button.className = 'envio-option-btn';
        button.dataset.envioId = opcion.id;
        button.innerHTML = `
            <span>${opcion.nombre}</span>
            <span>${opcion.costo > 0 ? `$${opcion.costo.toFixed(2)}` : 'Sin costo'}</span>
        `;
        container.appendChild(button);
    });
}

function updateSelectedEnvioUI() {
    opcionesEnvioGrid.querySelectorAll('.envio-option-btn').forEach(btn => {
        const isSelected = selectedEnvioOption && btn.dataset.envioId === selectedEnvioOption.id;
        btn.classList.toggle('selected', isSelected);
    });

    if (selectedEnvioOption) {
        descripcionEnvioManualInput.value = selectedEnvioOption.nombre;
        montoEnvioManualInput.value = selectedEnvioOption.costo > 0 ? selectedEnvioOption.costo.toFixed(2) : '';
    }
}