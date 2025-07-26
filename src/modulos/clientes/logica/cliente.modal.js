import { initSearchBar } from './clientes.barra.busqueda.js';
import { setCliente } from '../../venta/logica/carrito.js'; // <-- IMPORTAR setCliente

let modalElement = null;
let selectedClient = null;

// Función principal para abrir el modal
export async function openClienteModal() {
    if (document.getElementById('cliente-modal-container')) return;

    try {
        const response = await fetch('src/modulos/clientes/views/cliente.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('cliente-modal-container');

        // Inyectar y configurar la barra de búsqueda
        await setupSearch();

        // Configurar botones
        modalElement.querySelector('#cliente-modal-volver-btn').addEventListener('click', closeClienteModal);
        modalElement.querySelector('#cliente-modal-agregar-btn').addEventListener('click', handleAgregarCliente);

        setTimeout(() => modalElement.classList.add('visible'), 10);
    } catch (error) {
        console.error("Error al abrir el modal de cliente:", error);
    }
}

// Cierra y elimina el modal
function closeClienteModal() {
    if (!modalElement) return;
    modalElement.classList.remove('visible');
    modalElement.addEventListener('transitionend', () => modalElement.remove(), { once: true });
    selectedClient = null;
}

// Configura la barra de búsqueda reutilizando la lógica existente
async function setupSearch() {
    const searchArea = modalElement.querySelector('#cliente-modal-search-area');
    // El HTML de la barra de búsqueda ahora está directamente en cliente.modal.html
    const searchInput = searchArea.querySelector('#cliente-search-input');
    
    // Obtenemos los clientes desde el backend para la búsqueda
    const clientesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes`);
    if (!clientesResponse.ok) {
        console.error('No se pudo obtener la lista de clientes para el modal.');
        return;
    }
    const clientes = await clientesResponse.json();

    initSearchBar(searchInput, clientes, renderSearchResults);
}

// Renderiza los resultados de la búsqueda dentro del modal
function renderSearchResults(foundClients) {
    const resultsContainer = modalElement.querySelector('#cliente-modal-search-results');
    resultsContainer.innerHTML = '';
    
    foundClients.slice(0, 5).forEach(cliente => { // Limitar a 5 resultados para no saturar
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="nombre">${cliente.nombre} ${cliente.apellidos}</div>
            <div class="telefono">${cliente.telefonos.length > 0 ? cliente.telefonos[0].numero : 'Sin teléfono'}</div>
        `;
        item.addEventListener('click', () => selectClientFromSearch(cliente));
        resultsContainer.appendChild(item);
    });
}

// Al seleccionar un cliente de la búsqueda, rellena el formulario
function selectClientFromSearch(cliente) {
    selectedClient = cliente;
    modalElement.querySelector('#cliente-modal-nombre').value = `${cliente.nombre} ${cliente.apellidos}`.trim();
    
    const telefonoContainer = modalElement.querySelector('#cliente-modal-telefono-container');
    const direccionContainer = modalElement.querySelector('#cliente-modal-direccion-container');
    telefonoContainer.innerHTML = ''; // Limpiar
    direccionContainer.innerHTML = ''; // Limpiar

    // --- Lógica para Teléfono (Input o Select) ---
    if (cliente.telefonos.length > 1) {
        const select = document.createElement('select');
        select.id = 'cliente-modal-telefono';
        cliente.telefonos.forEach(tel => {
            const option = document.createElement('option');
            option.value = tel.numero;
            option.textContent = `${tel.numero} (${tel.tipo})`;
            select.appendChild(option);
        });
        telefonoContainer.appendChild(select);
    } else {
        const input = document.createElement('input');
        input.type = 'tel';
        input.id = 'cliente-modal-telefono';
        input.placeholder = 'Número de teléfono';
        input.value = cliente.telefonos.length > 0 ? cliente.telefonos[0].numero : '';
        telefonoContainer.appendChild(input);
    }

    // --- Lógica para Dirección (Textarea o Select) ---
    if (cliente.direcciones.length > 1) {
        const select = document.createElement('select');
        select.id = 'cliente-modal-direccion';
        cliente.direcciones.forEach(dir => {
            const option = document.createElement('option');
            option.value = dir.direccion;
            option.textContent = `${dir.direccion} (${dir.referencias || 'Sin ref.'})`;
            select.appendChild(option);
        });
        direccionContainer.appendChild(select);
    } else {
        const textarea = document.createElement('textarea');
        textarea.id = 'cliente-modal-direccion';
        textarea.rows = 3;
        textarea.placeholder = 'Dirección y referencias';
        textarea.value = cliente.direcciones.length > 0 ? cliente.direcciones[0].direccion : '';
        direccionContainer.appendChild(textarea);
    }

    modalElement.querySelector('#cliente-modal-search-results').innerHTML = ''; // Limpiar resultados
}

// Lógica para el botón "agregar"
function handleAgregarCliente() {
    let clienteParaVenta;

    const telefono = modalElement.querySelector('#cliente-modal-telefono').value.trim();
    const direccion = modalElement.querySelector('#cliente-modal-direccion').value.trim();

    if (selectedClient) {
        // Si se seleccionó un cliente, usar sus datos base pero con el tel/dir elegidos
        const telefonoSeleccionado = selectedClient.telefonos.find(t => t.numero === telefono) || { numero: telefono, tipo: 'Móvil' };
        const direccionSeleccionada = selectedClient.direcciones.find(d => d.direccion === direccion) || { direccion: direccion, referencias: '' };

        clienteParaVenta = {
            ...selectedClient, // Copia id, nombre, apellidos, alias
            telefonos: [telefonoSeleccionado],
            direcciones: [direccionSeleccionada]
        };
    } else {
        // Crear un cliente "rápido" con los datos del formulario
        clienteParaVenta = {
            nombre: modalElement.querySelector('#cliente-modal-nombre').value.trim(),
            telefonos: [{ numero: telefono, tipo: 'Móvil' }], // Asumir tipo por defecto
            direcciones: [{ direccion: direccion, referencias: '' }] // Asumir sin referencias
        };
    }

    if (!clienteParaVenta.nombre) {
        alert('Por favor, ingresa al menos un nombre para el cliente.');
        return;
    }

    // --- MODIFICACIÓN: Usar la función setCliente en lugar de la alerta ---
    setCliente(clienteParaVenta);
    
    closeClienteModal();
}