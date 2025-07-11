import { initSearchBar } from './clientes.barra.busqueda.js';
import { renderClienteDetalle } from './cliente.detalle.js';
//import { openNuevoClienteModal } from './cliente.añadir.modal.js'; // <-- AÑADIR IMPORTACIÓN

// Referencias a elementos del DOM
let mainContainer = null;
let clientesListContainer = null;

// Función principal para renderizar la vista de clientes
export async function renderClientes(container) {
    mainContainer = container;
    try {
        // Cargar la plantilla principal de clientes
        const response = await fetch('src/views/clientes.html');
        if (!response.ok) throw new Error('No se pudo cargar clientes.html');
        container.innerHTML = await response.text();

        // --- NUEVO: Cargar datos desde el backend ---
        const clientesResponse = await fetch('http://localhost:3000/api/clientes');
        if (!clientesResponse.ok) throw new Error('No se pudo obtener la lista de clientes del backend.');
        const clientes = await clientesResponse.json();
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

        // --- AÑADIR: Event listener para el botón de nuevo cliente ---
        const btnAnadirCliente = container.querySelector('#btn-anadir-cliente');
        if (btnAnadirCliente) {
            btnAnadirCliente.addEventListener('click', () => {
                // El callback recarga la lista de clientes después de guardar
                openNuevoClienteModal(() => renderClientes(mainContainer));
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

// --- La función renderClienteDetalle ha sido refactorizada y movida a cliente.detalle.js ---