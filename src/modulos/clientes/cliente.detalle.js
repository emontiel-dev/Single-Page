import { findClienteById, cargarClientes } from './clientes.data.js';
import { openEditClienteModal } from './cliente.añadir.modal.js';

/**
 * Renderiza la vista de detalle de un cliente específico.
 * @param {HTMLElement} container - El contenedor principal donde se renderizará la vista.
 * @param {number} clienteId - El ID del cliente a mostrar.
 * @param {Function} onVolverCallback - La función a llamar cuando se presiona el botón "Volver".
 */
export async function renderClienteDetalle(container, clienteId, onVolverCallback) {
    const cliente = findClienteById(clienteId);
    if (!cliente) {
        console.error(`Cliente con ID ${clienteId} no encontrado.`);
        container.innerHTML = `<p>Error: Cliente no encontrado.</p>`;
        return;
    }

    try {
        const response = await fetch('src/views/clientes/cliente.detalle.html');
        if (!response.ok) throw new Error('No se pudo cargar cliente.detalle.html');
        container.innerHTML = await response.text();

        // Poblar los datos del cliente
        document.getElementById('detalle-nombre').textContent = `${cliente.nombre} ${cliente.apellidos}`.trim();
        
        const aliasElement = document.getElementById('detalle-alias');
        if (cliente.alias) {
            aliasElement.textContent = `(${cliente.alias})`;
        } else {
            aliasElement.style.display = 'none'; // Ocultar el elemento si no hay alias
        }

        const telefonosLista = document.getElementById('detalle-telefonos-lista');
        telefonosLista.innerHTML = cliente.telefonos.length > 0
            ? cliente.telefonos.map(tel => `
                <div class="info-linea">
                    <span class="tipo">${tel.tipo}</span>
                    <span class="valor">${tel.numero}</span>
                </div>
            `).join('')
            : '<p class="no-items-mensaje">No hay teléfonos registrados.</p>';

        const direccionesLista = document.getElementById('detalle-direcciones-lista');
        direccionesLista.innerHTML = cliente.direcciones.length > 0
            ? cliente.direcciones.map(dir => `
                <div class="direccion-bloque">
                    <div class="info-linea">
                        <span class="tipo">${dir.tipo}</span>
                    </div>
                    <div class="valor">${dir.direccion}</div>
                    ${dir.referencias ? `<div class="referencias">${dir.referencias}</div>` : ''}
                </div>
            `).join('')
            : '<p class="no-items-mensaje">No hay direcciones registradas.</p>';

        // Añadir event listener para el botón de volver, usando el callback
        document.getElementById('btn-volver-lista').addEventListener('click', () => {
            if (typeof onVolverCallback === 'function') {
                onVolverCallback();
            }
        });

        // --- AÑADIDO: Event listener para el botón de editar ---
        document.getElementById('btn-editar-cliente').addEventListener('click', () => {
            openEditClienteModal(cliente, async () => {
                // Callback para recargar los datos y la vista después de editar
                await cargarClientes();
                renderClienteDetalle(container, clienteId, onVolverCallback);
            });
        });

    } catch (error) {
        console.error('Error al renderizar el detalle del cliente:', error);
        container.innerHTML = '<p>Error al cargar los detalles del cliente.</p>';
    }
}