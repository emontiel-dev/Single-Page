// src/modulos/venta/catalogo/catalogo.modal.js

// Este archivo se encargará de la lógica y renderizado del modal para detalles o adición de productos.

import { catalogoProductos } from './catalogo.datos.js'; // Importamos los datos del catálogo
import { addItemToCart } from '../carrito/carrito.js'; // Importamos la función para añadir al carrito
// Importamos las funciones de lógica del nuevo archivo
import { initModalLogic, resetModalLogic, updateModalContentForOption } from './modal.logica.js';
// Eliminamos la importación específica de closeEnvioModal
// import { closeEnvioModal } from '../envio/envio.modal.js';


// Variables de estado del modal (gestionadas aquí, pasadas a la lógica)
let currentProduct = null; // Variable para almacenar el producto actual en el modal
let selectedOptionId = null; // Almacena el ID de la opción (subproducto/especial/variante) seleccionada
let selectedPriceType = null; // Almacena el tipo de precio seleccionado ('publico', 'cocina', etc.)
// Remove the global selectedPersonalizations variable from here
// let selectedPersonalizations = {}; // Almacena las personalizaciones seleccionadas { grupoId: [opcionId1, opcionId2], ... }


// Función para crear y mostrar el modal
export async function openCatalogoModal(productId) {
    // --- Lógica para cerrar cualquier modal existente ---
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        // Si hay un modal abierto, lo removemos inmediatamente para evitar conflictos
        // Podríamos añadir una transición de salida si fuera necesario, pero para simplicidad lo removemos directo
        existingModal.remove();
        // Opcional: Limpiar la lógica asociada al modal cerrado si es necesario
        // Por ejemplo, si el modal de envío tuviera lógica que necesita limpieza
        // if (existingModal.id === 'envio-modal-container') { resetEnvioModalLogic(); } // Si tuviéramos una función así
    }
    // ----------------------------------------------------


    // Buscar el producto en los datos del catálogo
    const product = catalogoProductos.find(p => p.id === productId);

    if (!product) {
        console.error(`Producto con ID ${productId} no encontrado.`);
        return;
    }

    // Resetear estado al abrir un nuevo modal
    currentProduct = product;
    selectedOptionId = product.id; // Por defecto, la opción seleccionada es el producto principal
    selectedPriceType = null;
    // Initialize the state object that will be shared with modal.logica.js
    let initialSelectedPersonalizations = {};

    // --- Initialize default personalizations for the main product ---
    if (product.personalizaciones) {
        product.personalizaciones.forEach(grupo => {
            if (grupo.default && Array.isArray(grupo.default)) {
                // Copy default options to the state
                initialSelectedPersonalizations[grupo.grupo] = [...grupo.default];
            } else {
                 // Ensure the group exists in state even if no defaults
                 initialSelectedPersonalizations[grupo.grupo] = [];
            }
        });
    }
    console.log('Initial selected personalizations:', initialSelectedPersonalizations);
    // -------------------------------------------------------------


    // Cargar la plantilla HTML del modal
    const response = await fetch('src/views/venta/catalogo.modal.html');
    if (!response.ok) {
        console.error('Error loading catalogo modal template:', response.statusText);
        return;
    }
    const modalHtml = await response.text();

    // Crear un elemento div temporal para parsear el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    const modalElement = tempDiv.querySelector('#product-modal-container');

    if (!modalElement) {
        console.error('Modal container not found in template.');
        return;
    }

    // Obtener referencias a los elementos dentro del modal
    const productNameElement = modalElement.querySelector('#modal-product-name');
    const opcionesGrid = modalElement.querySelector('.opciones-grid');
    const preciosGrid = modalElement.querySelector('.precios-grid');
    // const registroInputs = modalElement.querySelector('.registro-inputs'); // No necesitamos la referencia al contenedor
    const cantidadInput = modalElement.querySelector('#cantidad-input');
    const costoInput = modalElement.querySelector('#costo-input'); // <-- Obtener referencia al input de costo
    const procesamientosGrid = modalElement.querySelector('.procesamientos-grid'); // Este es el contenedor donde renderizaremos las opciones
    const closeModalBtn = modalElement.querySelector('.close-modal-btn');
    const cancelarModalBtn = modalElement.querySelector('#cancelar-modal-btn');
    const addToOrderBtn = modalElement.querySelector('#add-to-order-btn');

    // Rellenar el modal con los datos del producto
    productNameElement.textContent = product.nombre;

    // Renderizar opciones (producto principal, subproductos, especiales, variantes)
    renderOpciones(opcionesGrid, product);

    // Renderizar tipos de precio para la opción inicial (producto principal)
    renderPrecios(preciosGrid, product.precios);

    // Renderizar personalizaciones (procesamientos) para la opción inicial
    // Pass the pre-filled initialSelectedPersonalizations state to renderPersonalizaciones
    renderPersonalizaciones(procesamientosGrid, product.personalizaciones, initialSelectedPersonalizations);


    // Inicializar la lógica del modal, pasando el estado, elementos UI y callbacks
    initModalLogic(
        { // Estado inicial
            currentProduct: currentProduct,
            selectedOptionId: selectedOptionId,
            selectedPriceType: selectedPriceType, // This will be null initially, selectDefaultPrice will set it
            selectedPersonalizations: initialSelectedPersonalizations // Pass the initialized state object
        },
        { // Elementos UI
            cantidadInput: cantidadInput,
            costoInput: costoInput,
            opcionesGrid: opcionesGrid,
            preciosGrid: preciosGrid,
            procesamientosGrid: procesamientosGrid,
            addToOrderBtn: addToOrderBtn,
            cancelarModalBtn: cancelarModalBtn,
            closeModalBtn: closeModalBtn
        },
        { // Callbacks
            renderPrecios: renderPrecios,
            renderPersonalizaciones: renderPersonalizaciones, // Pass the modified render function
            closeCatalogoModal: closeCatalogoModal,
        }
    );

    // Añadir el modal al cuerpo del documento y hacerlo visible
    document.body.appendChild(modalElement);
    // Usar setTimeout para permitir que el elemento se añada al DOM antes de aplicar la transición
    setTimeout(() => {
        modalElement.classList.add('visible');
        // Poner el foco en el input de costo después de que el modal sea visible
        if (costoInput) {
            costoInput.focus();
        }
    }, 10); // Un pequeño retraso es suficiente

    // Inicializar el estado de los botones (seleccionar el producto principal por defecto)
    const defaultOptionBtn = opcionesGrid.querySelector(`.modal-btn[data-option-id="${product.id}"]`);
    if (defaultOptionBtn) {
        defaultOptionBtn.classList.add('selected');
    }
}

// Función para cerrar el modal
export function closeCatalogoModal() {
    const modalElement = document.getElementById('product-modal-container');
    if (modalElement) {
        // Iniciar la transición de salida
        modalElement.classList.remove('visible');
        // Eliminar el modal del DOM después de que termine la transición
        modalElement.addEventListener('transitionend', () => {
            modalElement.remove();
            // Limpiar el estado y la lógica al cerrar el modal
            currentProduct = null;
            selectedOptionId = null;
            selectedPriceType = null;
            // selectedPersonalizations = {}; // No longer needed here
            resetModalLogic(); // Llama a la función de limpieza en la lógica
        }, { once: true }); // Asegura que el listener se elimine después de ejecutarse una vez
    }
}

// --- Funciones de Renderizado Dinámico (Permanecen aquí) ---

function renderOpciones(container, product) {
    container.innerHTML = ''; // Limpiar contenedor

    const opcionesSection = container.closest('.modal-section.opciones');
    let optionCount = 0;

    // Añadir el botón para el producto principal
    const mainProductBtn = createOptionButton(product.id, product.nombre);
    container.appendChild(mainProductBtn);
    optionCount++;

    // Añadir botones para subproductos
    if (product.subproductos && product.subproductos.length > 0) {
        product.subproductos.forEach(sub => {
            const subProductBtn = createOptionButton(sub.id, sub.nombre);
            container.appendChild(subProductBtn);
            optionCount++;
        });
    }

    // Añadir botones para especiales
    if (product.especiales && product.especiales.length > 0) {
        product.especiales.forEach(esp => {
            const especialBtn = createOptionButton(esp.id, esp.nombre);
            container.appendChild(especialBtn);
            optionCount++;
        });
    }

    // Añadir botones para variantes
    if (product.variantes && product.variantes.length > 0) {
        product.variantes.forEach(varnt => {
            const varianteBtn = createOptionButton(varnt.id, varnt.nombre);
            container.appendChild(varianteBtn);
            optionCount++;
        });
    }

    // Ocultar la sección si solo hay una opción (el producto principal)
    if (opcionesSection) {
        if (optionCount <= 1) { // Usamos <= 1 por si acaso no hay producto principal (aunque no debería pasar)
            opcionesSection.style.display = 'none';
        } else {
            opcionesSection.style.display = 'block';
        }
    }

    // Nota: Los event listeners para estos botones se añaden en initModalLogic usando delegación.
}

function createOptionButton(id, nombre) {
    const button = document.createElement('button');
    button.classList.add('modal-btn');
    button.dataset.optionId = id;
    button.textContent = nombre;
    return button;
}

// Esta función solo se encarga de renderizar los botones de precio
function renderPrecios(container, precios) {
    container.innerHTML = ''; // Limpiar contenedor

    // Iterar sobre los tipos de precio disponibles en el objeto precios
    for (const tipo in precios) {
        const precioValor = precios[tipo];
        // Solo renderizar si el precio no es null
        if (precioValor !== null) {
            const precioBtn = createPrecioButton(tipo, precioValor);
            container.appendChild(precioBtn);
        }
    }
     // Nota: Los event listeners para estos botones se añaden en initModalLogic usando delegación.
}

function createPrecioButton(tipo, valor) {
    const button = document.createElement('button');
    button.classList.add('modal-btn', 'precio-btn');
    button.dataset.priceType = tipo;
    button.innerHTML = `
        <span>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span> <!-- Capitalizar el tipo -->
        <span>$${valor.toFixed(2)}</span>
    `;
    return button;
}


// Modified to accept selectedPersonalizationsState as an argument
function renderPersonalizaciones(container, personalizaciones, selectedPersonalizationsState) { // container es .procesamientos-grid
    console.log('renderPersonalizaciones called with personalizaciones data:', personalizaciones); // Log personalizaciones data received
    console.log('Current selectedPersonalizations state (passed as argument):', selectedPersonalizationsState); // Log the state being used

    container.innerHTML = ''; // Limpiar contenedor

    const procesamientosSection = container.closest('.modal-section.procesamientos');

    if (!personalizaciones || personalizaciones.length === 0) {
        // Ocultar la sección si no hay personalizaciones
        if (procesamientosSection) procesamientosSection.style.display = 'none';
        return;
    } else {
         // Asegurarse de que la sección esté visible si hay personalizaciones
        if (procesamientosSection) procesamientosSection.style.display = 'block';
    }

    // Iterar sobre cada grupo de personalización
    personalizaciones.forEach(grupo => {
        // Iterar sobre las opciones dentro de cada grupo y renderizarlas
        grupo.options.forEach(opcion => {
            const inputId = `pers-${grupo.grupo.replace(/\s+/g, '-')}-${opcion.id}`; // ID único para el input
            // Verificar si la opción está seleccionada en el estado actual (selectedPersonalizationsState)
            const isSelected = (selectedPersonalizationsState[grupo.grupo] || []).includes(opcion.id); // <-- Use the passed state

            console.log(`Rendering option: ${opcion.id} in group ${grupo.grupo}. isSelected: ${isSelected}`); // Log each option's selection status

            // Crear el input (checkbox o radio)
            const input = document.createElement('input');
            input.type = grupo.tipo; // 'checkbox' o 'radio'
            input.id = inputId;
            input.name = grupo.grupo; // Usar el nombre del grupo para los radios
            input.value = opcion.id;
            input.checked = isSelected; // Usar el estado actual para marcar
            input.dataset.groupId = grupo.grupo; // Guardar el ID del grupo en el dataset

            // Crear el span que actuará como el botón visual
            const visualSpan = document.createElement('span');
            visualSpan.textContent = opcion.nombre;

            // Crear el label que envuelve el input y el span
            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.appendChild(input);
            label.appendChild(visualSpan);

            // Añadir la clase 'selected' al label si está seleccionado
            if (isSelected) {
                 label.classList.add('selected'); // <-- Aplicar 'selected' al label
            }

            // Añadir el label directamente al contenedor principal (.procesamientos-grid)
            container.appendChild(label);
        });
    });
}

// Nota: Las funciones handle... y findOptionData, updateModalContentForOption
// han sido movidas a modal.logica.js
