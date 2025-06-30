// src/modulos/venta/envio/envio.modal.js

// Este archivo se encargará de la lógica y renderizado del modal para seleccionar el tipo de envío.

import { opcionesEnvio } from './envio.datos.js'; // Importamos los datos de opciones de envío
import { addItemToCart } from '../carrito/carrito.js'; // Importar la función para agregar ítems al carrito
import { resetModalLogic as resetCatalogoModalLogic } from '../catalogo/modal.logica.js'; // Importar la función de limpieza del modal de catálogo


// Variable de estado para la opción de envío seleccionada (puede ser una opción predefinida o manual)
let selectedEnvioOption = null; // { id: 'mostrador', nombre: 'En Mostrador', costo: 0, descripcion: 'Sin costo' }
// Eliminamos la variable manualEnvioDetails
// let manualEnvioDetails = { // Estado para el registro manual
//     descripcion: '',
//     monto: 0
// };


// Referencias a elementos UI del modal de envío
let envioModalElement = null;
let opcionesEnvioGrid = null;
let closeEnvioModalBtn = null;
// Eliminamos las referencias a los inputs manuales
// let descripcionEnvioManualInput = null; // Nuevo input
// let montoEnvioManualInput = null; // Nuevo input
let volverEnvioBtn = null; // Nuevo botón
let agregarEnvioBtn = null; // Nuevo botón


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
        const response = await fetch('src/views/envio.modal.html');
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
        closeEnvioModalBtn = envioModalElement.querySelector('.close-modal-btn');
        // Eliminamos las referencias a los inputs manuales
        // descripcionEnvioManualInput = envioModalElement.querySelector('#descripcion-envio-manual'); // Nueva referencia
        // montoEnvioManualInput = envioModalElement.querySelector('#monto-envio-manual'); // Nueva referencia
        volverEnvioBtn = envioModalElement.querySelector('#volver-envio-btn'); // Nueva referencia
        agregarEnvioBtn = envioModalElement.querySelector('#agregar-envio-btn'); // Nueva referencia


        // Añadir event listeners
        if (closeEnvioModalBtn) closeEnvioModalBtn.addEventListener('click', closeEnvioModal);
        if (volverEnvioBtn) volverEnvioBtn.addEventListener('click', closeEnvioModal); // Botón "volver" cierra el modal
        if (agregarEnvioBtn) agregarEnvioBtn.addEventListener('click', handleAgregarEnvio); // Botón "agregar" maneja la lógica de agregar

        // Añadir listener para seleccionar opción de envío usando delegación
        if (opcionesEnvioGrid) opcionesEnvioGrid.addEventListener('click', handleEnvioOptionSelect);

        // Eliminamos los listeners de los inputs manuales
        // if (descripcionEnvioManualInput) {
        //     descripcionEnvioManualInput.addEventListener('input', handleManualInput);
        //     descripcionEnvioManualInput.addEventListener('focus', activateManualInputMode); // <-- Nuevo listener focus
        // }
        // if (montoEnvioManualInput) {
        //     montoEnvioManualInput.addEventListener('input', handleManualInput);
        //     montoEnvioManualInput.addEventListener('focus', activateManualInputMode); // <-- Nuevo listener focus
        // }


        // Añadir el modal al cuerpo del documento
        document.body.appendChild(envioModalElement);

    } catch (error) {
        console.error('Error creating envio modal:', error);
        return;
    }

    // --- Establecer la opción por defecto si no hay ninguna seleccionada ---
    // Esto solo ocurre la primera vez que se abre el modal o si se resetea el estado
    // Modificamos la condición para que solo se establezca si no hay ninguna opción seleccionada
    if (selectedEnvioOption === null) { // Eliminamos la verificación de manualEnvioDetails
        const defaultOption = opcionesEnvio.find(opcion => opcion.id === 'mostrador');
        if (defaultOption) {
            selectedEnvioOption = defaultOption;
            console.log('Opción de envío por defecto establecida:', selectedEnvioOption);
        }
    }
    // --------------------------------------------------------------------


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
            // Limpiar event listeners específicos si no usas delegación para todos
            if (closeEnvioModalBtn) closeEnvioModalBtn.removeEventListener('click', closeEnvioModal);
            if (volverEnvioBtn) volverEnvioBtn.removeEventListener('click', closeEnvioModal);
            if (agregarEnvioBtn) agregarEnvioBtn.removeEventListener('click', handleAgregarEnvio);
            if (opcionesEnvioGrid) opcionesEnvioGrid.removeEventListener('click', handleEnvioOptionSelect);
            // Eliminamos la remoción de listeners de los inputs manuales
            // if (descripcionEnvioManualInput) {
            //     descripcionEnvioManualInput.removeEventListener('input', handleManualInput);
            //     descripcionEnvioManualInput.removeEventListener('focus', activateManualInputMode); // <-- Remover listener
            // }
            // if (montoEnvioManualInput) {
            //     montoEnvioManualInput.removeEventListener('input', handleManualInput);
            //     montoEnvioManualInput.removeEventListener('focus', activateManualInputMode); // <-- Remover listener
            // }


            envioModalElement.remove();
            // Limpiar referencias
            envioModalElement = null;
            opcionesEnvioGrid = null;
            closeEnvioModalBtn = null;
            // Eliminamos la limpieza de referencias de los inputs manuales
            // descripcionEnvioManualInput = null;
            // montoEnvioManualInput = null;
            volverEnvioBtn = null;
            agregarEnvioBtn = null;

            // Opcional: Limpiar la lógica asociada si fuera necesario
            // resetEnvioModalLogic();
        }, { once: true });
    }
}

// --- Handlers de Eventos ---

function handleEnvioOptionSelect(event) {
    const selectedButton = event.target.closest('.envio-option-btn');
    if (!selectedButton) return;

    const envioId = selectedButton.dataset.envioId;
    const selectedOption = opcionesEnvio.find(opcion => opcion.id === envioId);

    if (selectedOption) {
        // Si la opción ya estaba seleccionada, no hacer nada para evitar recálculos innecesarios
        if (selectedEnvioOption && selectedEnvioOption.id === selectedOption.id) {
            return;
        }

        selectedEnvioOption = selectedOption; // Almacenar la opción predefinida
        // Eliminamos la limpieza de detalles manuales
        // manualEnvioDetails = { descripcion: '', monto: 0 }; // Limpiar detalles manuales al seleccionar una opción

        console.log('Opción de envío predefinida seleccionada:', selectedEnvioOption);

        // Actualizar la UI para reflejar la selección (esto deshabilitará y limpiará los inputs manuales)
        updateSelectedEnvioUI();
    }
}

// Eliminamos la función handleManualInput
// Esta función se llama cuando se escribe en los inputs manuales
// function handleManualInput() {
//     // El cambio de modo (deseleccionar botón) ya se hizo en activateManualInputMode al hacer foco.
//     // Aquí solo actualizamos el estado de los detalles manuales.
//     manualEnvioDetails.descripcion = descripcionEnvioManualInput ? descripcionEnvioManualInput.value.trim() : '';
//     manualEnvioDetails.monto = montoEnvioManualInput ? parseFloat(montoEnvioManualInput.value) || 0 : 0;

//     console.log('Registro manual de envío:', manualEnvioDetails);
//     // No es necesario llamar a updateSelectedEnvioUI() aquí, ya que el estado visual (inputs habilitados) no cambia con cada tecla.
// }

// Eliminamos la función activateManualInputMode
// --- MEJORADO: Activa el modo de entrada manual de forma más flexible ---
// function activateManualInputMode() {
//     // Si ya estamos en modo manual (ninguna opción predefinida seleccionada), no hacer nada.
//     if (selectedEnvioOption === null) {
//         return;
//     }

//     console.log('Activando modo de entrada manual.');
//     selectedEnvioOption = null; // Deseleccionar cualquier opción predefinida

//     // Actualizar la UI para reflejar el cambio de modo (desmarcar botón, habilitar inputs).
//     // Los botones predefinidos permanecerán habilitados para poder volver a ellos.
//     updateSelectedEnvioUI();
// }
// ----------------------------------------------------


function handleAgregarEnvio() {
    let finalEnvioDetails = null;

    // Priorizar la opción predefinida si hay una seleccionada
    if (selectedEnvioOption) {
        finalEnvioDetails = selectedEnvioOption;
    } else { // Modificamos la lógica para que solo permita agregar si hay una opción predefinida
        alert('Por favor, selecciona una opción de envío.'); // Mensaje de validación actualizado
        return;
    }

    // --- Agregar al carrito como item especial de envío ---
    addItemToCart({
        productId: 'ENVIO', // Un identificador especial para envíos
        optionId: finalEnvioDetails.id,
        optionName: finalEnvioDetails.nombre,
        quantity: 1, // Siempre 1 para el envío
        cost: finalEnvioDetails.costo,
        priceType: null,
        pricePerKg: null,
        personalizations: { descripcion: [finalEnvioDetails.descripcion] }
    });

    // Cerrar el modal después de "agregar"
    closeEnvioModal();
}


// --- Funciones de Renderizado y UI ---

function renderOpcionesEnvio(container, opciones) {
    container.innerHTML = ''; // Limpiar contenedor

    opciones.forEach(opcion => {
        const optionBtn = createEnvioOptionButton(opcion);
        container.appendChild(optionBtn);
    });
}

function createEnvioOptionButton(opcion) {
    const button = document.createElement('button');
    button.classList.add('envio-option-btn');
    button.dataset.envioId = opcion.id;
    button.innerHTML = `
        <span>${opcion.nombre}</span>
        <span>${opcion.descripcion}</span>
    `;
    // Los botones se habilitan/deshabilitan en updateSelectedEnvioUI
    return button;
}

// Función para actualizar visualmente la opción de envío seleccionada y el estado de los inputs/botones
function updateSelectedEnvioUI() {
    // 1. Resetear el estado visual de los botones predefinidos
    if (opcionesEnvioGrid) {
        opcionesEnvioGrid.querySelectorAll('.envio-option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    // 2. Aplicar estado basado en si hay una opción predefinida seleccionada o no
    if (selectedEnvioOption) {
        // MODO: Opción Predefinida Seleccionada

        // Marcar el botón correcto como seleccionado
        const selectedBtn = opcionesEnvioGrid ? opcionesEnvioGrid.querySelector(`.envio-option-btn[data-envio-id="${selectedEnvioOption.id}"]`) : null;
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }

        // Eliminamos la lógica para deshabilitar y limpiar los inputs manuales
        // if (descripcionEnvioManualInput) {
        //     descripcionEnvioManualInput.value = ''; // Limpiar valor
        //     descripcionEnvioManualInput.disabled = true;
        // }
        // if (montoEnvioManualInput) {
        //     montoEnvioManualInput.value = ''; // Limpiar valor
        //     montoEnvioManualInput.disabled = true;
        // }

    } else {
        // MODO: Sin selección (ninguna opción predefinida seleccionada)
        // No hay inputs manuales que habilitar/deshabilitar.
        // Los botones predefinidos permanecen habilitados por defecto.
    }
}


// Función para obtener la opción de envío seleccionada desde fuera del modal
// Retorna la opción predefinida o los detalles manuales formateados
export function getSelectedEnvioOption() {
    // Solo retornamos la opción predefinida si existe
    if (selectedEnvioOption) {
        return selectedEnvioOption;
    }
    // Eliminamos la lógica para retornar detalles manuales
    // else if (manualEnvioDetails.descripcion || manualEnvioDetails.monto > 0) {
    //      // Retornar un objeto similar a las opciones predefinidas para consistencia
    //      return {
    //          id: 'manual', // Usar un ID genérico para manual
    //          nombre: manualEnvioDetails.descripcion || 'Envío Manual',
    //          costo: manualEnvioDetails.monto,
    //          descripcion: manualEnvioDetails.descripcion || `Monto: $${manualEnvioDetails.monto.toFixed(2)}`
    //      };
    // }
    return null; // No hay envío seleccionado
}

// Función para establecer la opción de envío seleccionada desde fuera (ej. al cargar un pedido guardado)
export function setSelectedEnvioOption(envioDetails) {
     if (!envioDetails) {
         selectedEnvioOption = null;
         // Eliminamos la limpieza de detalles manuales
         // manualEnvioDetails = { descripcion: '', monto: 0 };
     }
     // Eliminamos la lógica para manejar envíos manuales guardados
     // else if (envioDetails.id && envioDetails.id.startsWith('manual-')) { // Si es un envío manual guardado
     //     selectedEnvioOption = null; // No es una opción predefinida
     //     manualEnvioDetails = {
     //         descripcion: envioDetails.nombre === 'Envío Manual' ? '' : envioDetails.nombre, // No restaurar 'Envío Manual' si fue genérico
     //         monto: envioDetails.costo
     //     };
     // }
     else { // Si es una opción predefinida
         selectedEnvioOption = opcionesEnvio.find(opcion => opcion.id === envioDetails.id) || null;
         // Eliminamos la lógica para asumir manual si no se encuentra la opción predefinida
         // if (!selectedEnvioOption && envioDetails.costo > 0) { // Si no se encontró la opción predefinida pero tiene costo, asumir manual
         //      selectedEnvioOption = null;
         //      manualEnvioDetails = {
         //          descripcion: envioDetails.nombre || '',
         //          monto: envioDetails.costo
         //      };
         // } else { // Si se encontró la opción predefinida o no tiene costo
         //     manualEnvioDetails = { descripcion: '', monto: 0 };
         // }
     }

     // Si el modal está abierto, actualizar la UI
     if (envioModalElement && envioModalElement.classList.contains('visible')) {
         updateSelectedEnvioUI();
     }
}