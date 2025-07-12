import { findClienteById, cargarClientes } from './clientes.data.js';
import { openEditClienteModal } from './cliente.añadir.modal.js';

let staticMapInstances = {}; // Para almacenar las instancias de los mapas estáticos

/**
 * Inicializa un mapa estático de Leaflet para mostrar una ubicación.
 * @param {string} mapId - El ID del div que contendrá el mapa.
 * @param {number} lat - La latitud.
 * @param {number} long - La longitud.
 * @returns {L.Map} La instancia del mapa de Leaflet.
 */
function initializeStaticMap(mapId, lat, long) {
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer || mapContainer.classList.contains('leaflet-container')) return;

    const coords = [lat, long];
    const map = L.map(mapId, {
        center: coords,
        zoom: 16,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: false // Ocultar controles de zoom
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.marker(coords).addTo(map);
    return map; // <-- Devolver la instancia del mapa
}

/**
 * Renderiza la vista de detalle de un cliente específico.
 * @param {HTMLElement} container - El contenedor principal donde se renderizará la vista.
 * @param {number} clienteId - El ID del cliente a mostrar.
 * @param {Function} onVolverCallback - La función a llamar cuando se presiona el botón "Volver".
 */
export async function renderClienteDetalle(container, clienteId, onVolverCallback) {
    staticMapInstances = {}; // Limpiar instancias al renderizar
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
        const mapsToInitialize = []; // Guardar info de mapas a inicializar

        direccionesLista.innerHTML = cliente.direcciones.length > 0
            ? cliente.direcciones.map((dir, index) => {
                let mapHtml = '';
                const mapId = `map-detalle-${dir.id || index}`;
                // Si la dirección tiene lat y long, preparamos el contenedor del mapa
                if (dir.lat && dir.long) {
                    const actionsHtml = `
                        <div class="map-actions">
                            <a href="#" class="btn-map-action" data-mode="two-wheeler" data-lat="${dir.lat}" data-long="${dir.long}" title="Ruta en moto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 640 512"><path fill="#FFC107" d="M512.9 192c-14.9-.1-29.1 2.3-42.4 6.9L437.6 144H520c13.3 0 24-10.7 24-24V88c0-13.3-10.7-24-24-24h-45.3c-6.8 0-13.3 2.9-17.8 7.9l-37.5 41.7l-22.8-38C392.2 68.4 384.4 64 376 64h-80c-8.8 0-16 7.2-16 16v16c0 8.8 7.2 16 16 16h66.4l19.2 32H227.9c-17.7-23.1-44.9-40-99.9-40H72.5C59 104 47.7 115 48 128.5c.2 13 10.9 23.5 24 23.5h56c24.5 0 38.7 10.9 47.8 24.8l-11.3 20.5c-13-3.9-26.9-5.7-41.3-5.2C55.9 194.5 1.6 249.6 0 317c-1.6 72.1 56.3 131 128 131c59.6 0 109.7-40.8 124-96h84.2c13.7 0 24.6-11.4 24-25.1c-2.1-47.1 17.5-93.7 56.2-125l12.5 20.8c-27.6 23.7-45.1 58.9-44.8 98.2c.5 69.6 57.2 126.5 126.8 127.1c71.6.7 129.8-57.5 129.2-129.1c-.7-69.6-57.6-126.4-127.2-126.9zM128 400c-44.1 0-80-35.9-80-80s35.9-80 80-80c4.2 0 8.4.3 12.5 1L99 316.4c-8.8 16 2.8 35.6 21 35.6h81.3c-12.4 28.2-40.6 48-73.3 48zm463.9-75.6c-2.2 40.6-35 73.4-75.5 75.5c-46.1 2.5-84.4-34.3-84.4-79.9c0-21.4 8.4-40.8 22.1-55.1l49.4 82.4c4.5 7.6 14.4 10 22 5.5l13.7-8.2c7.6-4.5 10-14.4 5.5-22l-48.6-80.9c5.2-1.1 10.5-1.6 15.9-1.6c45.6-.1 82.3 38.2 79.9 84.3z"/></svg>
                            </a>
                            <a href="#" class="btn-map-action" data-mode="walking" data-lat="${dir.lat}" data-long="${dir.long}" title="Ruta a pie">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#FFC107" height="200px" width="200px" version="1.1" id="Layer_1" viewBox="0 0 128 128" xml:space="preserve"><path d="M67.9,22.6c5.7,0.4,10.8-3.8,11.3-9.7c0.4-5.7-3.8-10.8-9.7-11.3c-5.7-0.4-10.8,3.8-11.3,9.7C57.8,17.1,62.2,22.2,67.9,22.6  "/><path d="M59,26.9c2-1.5,4.5-2.3,7.3-2.2c3.5,0.3,6.6,2.5,8.3,5.1l10.5,20.9l14.3,10c1.2,1,2,2.5,1.9,4.1c-0.1,2.6-2.5,4.5-5.1,4.2  c-0.7,0-1.5-0.3-2.2-0.7L78.6,57.8c-0.4-0.4-0.9-0.9-1.2-1.5l-4-7.8l-4.7,20.8l18.6,22c0.4,0.7,0.7,1.5,0.9,2.2l5,26.5  c0,0.6,0,1,0,1.5c-0.3,4-3.7,6.7-7.6,6.6c-3.2-0.3-5.6-2.6-6.4-5.6l-4.7-24.7L59.4,81l-3.5,16.1c-0.1,0.7-1.2,2.3-1.5,2.9L40,124.5  c-1.5,2.2-3.8,3.7-6.6,3.4c-4-0.3-6.9-3.7-6.6-7.6c0.1-1.2,0.6-2.2,1-3.1l13.5-22.5L52.5,45l-7.3,5.9l-4,17.7c-0.4,2.2-2.6,4.1-5,4  c-2.6-0.1-4.5-2.5-4.4-5.1c0-0.1,0-0.4,0.1-0.6l4.5-20.6c0.3-0.9,0.7-1.6,1.5-2.2L59,26.9z"/></svg>
                            </a>
                        </div>
                    `;
                    // Ocultar el mapa por defecto y añadir los botones
                    mapHtml = `<div id="${mapId}" class="detalle-map-container" style="display: none;">${actionsHtml}</div>`;
                    mapsToInitialize.push({ id: mapId, lat: dir.lat, long: dir.long });
                }

                return `
                    <div class="direccion-bloque" data-map-id="${mapId}" style="cursor: pointer;">
                        <div class="info-linea">
                            <span class="tipo">${dir.tipo}</span>
                        </div>
                        <div class="valor">${dir.direccion}</div>
                        ${dir.referencias ? `<div class="referencias">${dir.referencias}</div>` : ''}
                        ${mapHtml}
                    </div>
                `;
            }).join('')
            : '<p class="no-items-mensaje">No hay direcciones registradas.</p>';

        // --- AÑADIDO: Event listener para mostrar/ocultar mapas al hacer clic ---
        direccionesLista.addEventListener('click', (event) => {
            const routeButton = event.target.closest('.btn-map-action');
            if (routeButton) {
                event.preventDefault();
                event.stopPropagation(); // Evita que el mapa se oculte al hacer clic en el botón

                const lat = routeButton.dataset.lat;
                const long = routeButton.dataset.long;
                const mode = routeButton.dataset.mode;

                if (lat && long && mode) {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&travelmode=${mode}`;
                    window.open(url, '_blank');
                }
                return;
            }

            const clickedBlock = event.target.closest('.direccion-bloque');
            if (!clickedBlock) return;

            const targetMapId = clickedBlock.dataset.mapId;
            if (!targetMapId) return;

            // Ocultar todos los mapas
            direccionesLista.querySelectorAll('.detalle-map-container').forEach(mapContainer => {
                mapContainer.style.display = 'none';
            });

            // Mostrar el mapa seleccionado y refrescarlo
            const targetMapContainer = document.getElementById(targetMapId);
            if (targetMapContainer) {
                const isVisible = targetMapContainer.style.display === 'block';
                targetMapContainer.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) {
                    const mapInstance = staticMapInstances[targetMapId];
                    if (mapInstance) {
                        setTimeout(() => mapInstance.invalidateSize(), 10);
                    }
                }
            }
        });

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

        // --- AÑADIDO: Inicializar todos los mapas después de renderizar el HTML ---
        mapsToInitialize.forEach(mapInfo => {
            // Guardar la instancia del mapa al inicializarlo
            staticMapInstances[mapInfo.id] = initializeStaticMap(mapInfo.id, mapInfo.lat, mapInfo.long);
        });

    } catch (error) {
        console.error('Error al renderizar el detalle del cliente:', error);
        container.innerHTML = '<p>Error al cargar los detalles del cliente.</p>';
    }
}