import { initSearchBar } from './clientes.barra.busqueda.js';
import { renderClienteDetalle } from './cliente.detalle.js';
import { cargarClientes, getClientes, deleteClienteById } from './clientes.data.js';
import { openNuevoClienteModal } from './cliente.añadir.modal.js'; // <-- AÑADIR IMPORTACIÓN

// Referencias a elementos del DOM
let mainContainer = null;
let clientesListContainer = null;

// Función principal para renderizar la vista de clientes
export async function renderClientes(container) {
    mainContainer = container;
    try {
        // Cargar la plantilla principal de clientes
        const response = await fetch('src/views/clientes/clientes.html');
        if (!response.ok) throw new Error('No se pudo cargar clientes.html');
        container.innerHTML = await response.text();

        // --- NUEVO: Cargar datos desde el backend usando el gestor ---
        await cargarClientes();
        const clientes = getClientes();
        // --- FIN NUEVO ---

        // La barra de búsqueda ahora está integrada en clientes.html, no es necesario cargarla.

        // Obtener referencias a los elementos clave
        clientesListContainer = container.querySelector('#clientes-list-container');
        const clienteSearchInput = container.querySelector('#cliente-search-input');

        // Renderizar la lista inicial de clientes
        renderListaClientes(clientes);

        // Inicializar la barra de búsqueda
        initSearchBar(clienteSearchInput, clientes, renderListaClientes);

        // Añadir event listener para el click en la lista
        clientesListContainer.addEventListener('click', handleClienteClick);
        
        // --- AÑADIDO: Inicializar la lógica de pulsación larga para eliminar ---
        initLongPressActions(clientesListContainer);

        // --- AÑADIR: Event listener para el botón de nuevo cliente ---
        const btnAnadirCliente = container.querySelector('#btn-anadir-cliente');
        if (btnAnadirCliente) {
            btnAnadirCliente.addEventListener('click', () => {
                // El callback recarga la lista de clientes después de guardar
                openNuevoClienteModal(async () => {
                    await cargarClientes(); // Forzar la recarga de datos
                    renderClientes(mainContainer);
                });
            });
        }

    } catch (error) {
        console.error('Error al renderizar la vista de clientes:', error);
        container.innerHTML = '<p>Error al cargar la vista de clientes.</p>';
    }
}

// Renderiza la lista de clientes en el contenedor (sin cambios)
function renderListaClientes(clientesAMostrar) {
    if (!clientesListContainer) return;
    clientesListContainer.innerHTML = '';

    if (clientesAMostrar.length === 0) {
        clientesListContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No se encontraron clientes.</p>';
        return;
    }

    clientesAMostrar.forEach(cliente => {
        // --- INICIO DE LA MODIFICACIÓN ---

        // 1. Construir la línea de Nombre y Alias
        const nombreCompleto = `${cliente.nombre} ${cliente.apellidos}`.trim();
        const aliasSpan = cliente.alias ? ` <span class="alias">(${cliente.alias})</span>` : '';
        const nombreHtml = `<span class="nombre">${nombreCompleto}${aliasSpan}</span>`;

        // 2. Construir la línea de Teléfono
        let telefonoHtml = '';
        if (cliente.telefonos.length > 0) {
            const tel = cliente.telefonos[0];
            telefonoHtml = `<span class="telefono">${tel.numero} <span class="tipo-dato">(${tel.tipo})</span></span>`;
        } else {
            telefonoHtml = `<span class="telefono muted">Sin teléfono</span>`;
        }

        // 3. Construir la línea de Dirección
        let direccionHtml = '';
        if (cliente.direcciones.length > 0) {
            const dir = cliente.direcciones[0];
            const referenciaSpan = dir.referencias ? ` <span class="tipo-dato">(${dir.referencias})</span>` : '';
            direccionHtml = `<span class="direccion">${dir.direccion}${referenciaSpan}</span>`;
        }

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cliente-item');
        itemDiv.dataset.clienteId = cliente.id;
        itemDiv.innerHTML = `
            <div class="info">
                ${nombreHtml}
                ${telefonoHtml}
                ${direccionHtml}
            </div>
        `;
        // --- FIN DE LA MODIFICACIÓN ---
        clientesListContainer.appendChild(itemDiv);
    });
}

// Handler para el click en un cliente (navega a la vista de detalle)
function handleClienteClick(event) {
    const clienteItem = event.target.closest('.cliente-item');
    if (clienteItem) {
        const clienteId = parseInt(clienteItem.dataset.clienteId, 10);
        // --- MODIFICADO: Llamar a la función refactorizada ---
        // Pasamos el contenedor, el ID, y una función para volver.
        renderClienteDetalle(mainContainer, clienteId, () => renderClientes(mainContainer));
    }
}

// --- AÑADIDO: Lógica para manejar la pulsación larga y eliminar clientes ---
function initLongPressActions(container) {
    let longPressTimer;
    const LONG_PRESS_DURATION = 700; // 700ms para considerar una pulsación larga

    container.addEventListener('pointerdown', (e) => {
        const clienteItem = e.target.closest('.cliente-item');
        if (!clienteItem) return;

        // Iniciar el temporizador para la pulsación larga
        longPressTimer = setTimeout(() => {
            const clienteId = parseInt(clienteItem.dataset.clienteId, 10);
            handleDeleteCliente(clienteId);
        }, LONG_PRESS_DURATION);
    });

    const cancelLongPress = () => {
        clearTimeout(longPressTimer);
    };

    // Cancelar la pulsación larga si el puntero se levanta o se mueve
    container.addEventListener('pointerup', cancelLongPress);
    container.addEventListener('pointerleave', cancelLongPress);
    container.addEventListener('pointermove', cancelLongPress);
}

async function handleDeleteCliente(clienteId) {
    const cliente = getClientes().find(c => c.id === clienteId);
    const confirmMessage = `¿Estás seguro de que quieres eliminar a "${cliente ? cliente.nombre : 'este cliente'}"?\n\nEsta acción no se puede deshacer.`;

    if (confirm(confirmMessage)) {
        try {
            await deleteClienteById(clienteId);
            alert('Cliente eliminado con éxito.');
            // Recargar la vista para reflejar el cambio
            await renderClientes(mainContainer);
        } catch (error) {
            console.error('Fallo al eliminar cliente:', error);
            alert(`No se pudo eliminar el cliente: ${error.message}`);
        }
    }
}


// --- La función renderClienteDetalle ha sido refactorizada y movida a cliente.detalle.js ---