let modalElement = null;
let onSaveComplete = null;
let mapInstances = {}; // <-- NUEVO: Para almacenar las instancias de los mapas

/**
 * Cierra y elimina el modal del DOM.
 */
function closeAndRemoveModal() {
    if (modalElement) {
        modalElement.classList.remove('visible');
        modalElement.addEventListener('transitionend', () => {
            modalElement.remove();
            modalElement = null;
        }, { once: true });
    }
    mapInstances = {}; // Limpiar las instancias de mapa al cerrar
}

/**
 * Crea un grupo de campos para un nuevo teléfono.
 * @returns {HTMLElement} El elemento del grupo de campos.
 */
function createTelefonoField() {
    const div = document.createElement('div');
    div.className = 'dynamic-field-group';
    div.innerHTML = `
        <div class="form-group">
            <input type="tel" placeholder="No de teléfono" data-field="numero" class="form-control">
        </div>
        <div class="form-group form-group-telefono-tipo">
            <select data-field="tipo" class="form-control">
                <option value="Móvil" selected>Móvil</option>
                <option value="Casa">Casa</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Otro">Otro</option>
            </select>
        </div>
        <button type="button" class="btn-remove-field" aria-label="Eliminar teléfono">-</button>
    `;
    return div;
}

/**
 * Inicializa un mapa de Leaflet en el contenedor especificado.
 * @param {string} mapId - El ID del div contenedor del mapa.
 */
function initializeMap(mapId) {
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer || mapContainer.classList.contains('leaflet-container')) return;

    const latInput = mapContainer.closest('.dynamic-field-group').querySelector('[data-field="latitud"]');
    const lngInput = mapContainer.closest('.dynamic-field-group').querySelector('[data-field="longitud"]');

    const defaultCoords = [18.3000, -98.6039]; // Chiautla de Tapia como vista inicial
    const map = L.map(mapId).setView(defaultCoords, 13);
    mapInstances[mapId] = map; // Guardar la instancia del mapa

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker(defaultCoords, { draggable: true }).addTo(map);

    function updateInputs(latlng) {
        latInput.value = latlng.lat.toFixed(6);
        lngInput.value = latlng.lng.toFixed(6);
    }

    // --- MODIFICADO: Lógica de Geolocalización mejorada ---
    function setMapToUserLocation(position) {
        const userCoords = [position.coords.latitude, position.coords.longitude];
        map.setView(userCoords, 16); // Zoom más cercano para la ubicación del usuario
        marker.setLatLng(userCoords);
        updateInputs(L.latLng(userCoords));
    }

    function useDefaultLocation(reason) {
        console.warn(`${reason}. Usando la ubicación por defecto.`);
        // CORREGIDO: No se deben actualizar los inputs con la ubicación por defecto.
        // Los inputs solo se llenan con una ubicación real del usuario o una interacción manual.
    }

    function findUser(isExplicitRequest) {
        if (navigator.geolocation) {
            const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
            navigator.geolocation.getCurrentPosition(
                setMapToUserLocation,
                (error) => {
                    useDefaultLocation(`Error al obtener la ubicación: ${error.message}`);
                    if (isExplicitRequest) { // Solo mostrar alerta si el usuario hizo clic
                        alert(`No se pudo obtener la ubicación: ${error.message}`);
                    }
                },
                geoOptions
            );
        } else {
            useDefaultLocation('La geolocalización no es soportada por este navegador');
            if (isExplicitRequest) {
                alert('Tu navegador no soporta geolocalización.');
            }
        }
    }

    // --- CORRECCIÓN: Lógica para decidir si usar coordenadas existentes o buscar la ubicación ---
    const initialLat = parseFloat(latInput.value);
    const initialLng = parseFloat(lngInput.value);

    if (!isNaN(initialLat) && !isNaN(initialLng)) {
        // Si ya hay coordenadas en los inputs (modo edición), usarlas.
        const existingCoords = [initialLat, initialLng];
        map.setView(existingCoords, 16);
        marker.setLatLng(existingCoords);
    } else {
        // Si no hay coordenadas (modo nuevo), intentar geolocalizar.
        findUser(false);
    }

    // --- AÑADIDO: Botón de "Mi Ubicación" ---
    const LocateControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            const link = L.DomUtil.create('a', 'leaflet-control-locate', container);
            link.href = '#';
            link.title = 'Mi Ubicación';
            link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="22" x2="12" y2="18"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="2" y1="12" x2="6" y2="12"/></svg>`;

            L.DomEvent.on(link, 'click', (e) => {
                L.DomEvent.stop(e);
                findUser(true); // Es una solicitud explícita del usuario
            });

            return container;
        }
    });
    map.addControl(new LocateControl());
    // --- FIN AÑADIDO ---

    // --- AÑADIDO: Botón de "Resetear Ubicación" ---
    const ResetControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            const link = L.DomUtil.create('a', 'leaflet-control-reset', container);
            link.href = '#';
            link.title = 'Quitar Ubicación';
            link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

            L.DomEvent.on(link, 'click', (e) => {
                L.DomEvent.stop(e);
                // Limpiar los inputs de coordenadas
                latInput.value = '';
                lngInput.value = '';
                // Resetear la vista del mapa a la ubicación por defecto para feedback visual
                map.setView(defaultCoords, 13);
                marker.setLatLng(defaultCoords);
                alert('Ubicación quitada. La dirección se guardará sin coordenadas.');
            });

            return container;
        }
    });
    map.addControl(new ResetControl());
    // --- FIN AÑADIDO ---

    marker.on('dragend', (event) => {
        updateInputs(event.target.getLatLng());
    });

    map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        updateInputs(e.latlng);
    });
}

/**
 * Crea un grupo de campos para una nueva dirección.
 * @returns {HTMLElement} El elemento del grupo de campos.
 */
function createDireccionField() {
    const uniqueId = `map-${Date.now()}`;
    const div = document.createElement('div');
    div.className = 'dynamic-field-group';
    div.innerHTML = `
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: var(--espacio-s);">
            <div style="display: flex; gap: var(--espacio-s);">
                <div class="form-group mb-0" style="flex-grow: 1;">
                    <input type="text" placeholder="Dirección completa" data-field="direccion" class="form-control">
                </div>
                <div class="form-group mb-0 form-group-direccion-tipo">
                    <select data-field="tipo" class="form-control">
                        <option value="Casa" selected>Casa</option>
                        <option value="Trabajo">Trabajo</option>
                        <option value="Negocio">Negocio</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
            </div>
            <div class="form-group mb-0">
                <input type="text" placeholder="Referencias" data-field="referencias" class="form-control">
            </div>
            
            <!-- Contenedor del Mapa -->
            <div id="${uniqueId}" class="map-container"></div>

            <!-- MODIFICADO: Contenedor de inputs oculto -->
            <div style="display: none;">
                <input type="number" data-field="latitud" readonly>
                <input type="number" data-field="longitud" readonly>
            </div>
        </div>
        <button type="button" class="btn-remove-field" aria-label="Eliminar dirección">-</button>
    `;

    // CORREGIDO: Ya no se inicializa el mapa aquí. Se hará después de poblar los datos.
    return div;
}

/**
 * Abre y configura el modal para EDITAR un cliente existente.
 * @param {Object} cliente - El objeto del cliente a editar.
 * @param {Function} callback - Función a ejecutar después de guardar exitosamente.
 */
export async function openEditClienteModal(cliente, callback) {
    if (document.getElementById('cliente-anadir-modal-container')) return;

    onSaveComplete = callback;

    try {
        const response = await fetch('src/views/clientes/cliente.añadir.modal.html');
        if (!response.ok) throw new Error('No se pudo cargar la plantilla del modal.');
        
        document.body.insertAdjacentHTML('beforeend', await response.text());
        modalElement = document.getElementById('cliente-anadir-modal-container');

        // --- Poblar el modal con los datos del cliente ---
        const headerTitle = modalElement.querySelector('.modal-header h3');
        if (headerTitle) headerTitle.textContent = 'Editar Cliente';
        
        const saveButton = modalElement.querySelector('#anadir-cliente-guardar-btn');
        if (saveButton) saveButton.textContent = 'Guardar Cambios';

        modalElement.querySelector('#cliente-nombre').value = cliente.nombre || '';
        modalElement.querySelector('#cliente-apellidos').value = cliente.apellidos || '';
        modalElement.querySelector('#cliente-alias').value = cliente.alias || '';

        const telefonosContainer = modalElement.querySelector('#telefonos-container');
        telefonosContainer.innerHTML = ''; // Limpiar campos por defecto
        if (cliente.telefonos && cliente.telefonos.length > 0) {
            cliente.telefonos.forEach(tel => {
                const field = createTelefonoField();
                field.querySelector('[data-field="numero"]').value = tel.numero;
                field.querySelector('[data-field="tipo"]').value = tel.tipo;
                telefonosContainer.appendChild(field);
            });
        }

        const direccionesContainer = modalElement.querySelector('#direcciones-container');
        direccionesContainer.innerHTML = ''; // Limpiar campos por defecto
        if (cliente.direcciones && cliente.direcciones.length > 0) {
            cliente.direcciones.forEach((dir, index) => {
                const field = createDireccionField();
                field.querySelector('[data-field="direccion"]').value = dir.direccion;
                field.querySelector('[data-field="referencias"]').value = dir.referencias || '';
                field.querySelector('[data-field="tipo"]').value = dir.tipo;
                if (dir.lat && dir.long) {
                    field.querySelector('[data-field="latitud"]').value = dir.lat;
                    field.querySelector('[data-field="longitud"]').value = dir.long;
                }
                direccionesContainer.appendChild(field);
                // CORREGIDO: Inicializar el mapa DESPUÉS de poblar los datos.
                const mapId = field.querySelector('.map-container').id;
                initializeMap(mapId);

                // Ocultar todos los mapas excepto el primero
                if (index > 0) {
                    field.querySelector('.map-container').style.display = 'none';
                }
            });
        }
        // --- Fin de la población de datos ---

        // Configurar event listeners
        saveButton.addEventListener('click', () => handleUpdateCliente(cliente.id));
        modalElement.querySelector('#anadir-cliente-cancelar-btn').addEventListener('click', closeAndRemoveModal);
        modalElement.querySelector('#btn-anadir-telefono').addEventListener('click', () => {
            telefonosContainer.appendChild(createTelefonoField());
        });
        modalElement.querySelector('#btn-anadir-direccion').addEventListener('click', () => {
            // Ocultar todos los mapas existentes
            direccionesContainer.querySelectorAll('.map-container').forEach(map => map.style.display = 'none');
            
            const newField = createDireccionField();
            direccionesContainer.appendChild(newField);
            const newMapId = newField.querySelector('.map-container').id;
            initializeMap(newMapId);
        });

        // AÑADIDO: Listener para mostrar el mapa correcto al hacer foco
        direccionesContainer.addEventListener('focusin', (event) => {
            const focusedFieldGroup = event.target.closest('.dynamic-field-group');
            if (!focusedFieldGroup) return;

            direccionesContainer.querySelectorAll('.dynamic-field-group').forEach(group => {
                const mapContainer = group.querySelector('.map-container');
                if (mapContainer) {
                    if (group === focusedFieldGroup) {
                        mapContainer.style.display = 'block';
                        const mapInstance = mapInstances[mapContainer.id];
                        if (mapInstance) {
                            setTimeout(() => mapInstance.invalidateSize(), 10);
                        }
                    } else {
                        mapContainer.style.display = 'none';
                    }
                }
            });
        });

        modalElement.querySelector('.modal-body').addEventListener('click', (event) => {
            if (event.target.matches('.btn-remove-field')) {
                event.target.closest('.dynamic-field-group').remove();
            }
        });

        setTimeout(() => modalElement.classList.add('visible'), 10);

    } catch (error) {
        console.error('Error al abrir el modal de edición de cliente:', error);
    }
}

/**
 * Maneja la actualización de un cliente existente.
 * @param {number} clienteId - El ID del cliente a actualizar.
 */
async function handleUpdateCliente(clienteId) {
    const nombre = modalElement.querySelector('#cliente-nombre').value.trim();
    if (!nombre) {
        alert('El nombre del cliente es obligatorio.');
        return;
    }

    const clienteData = {
        nombre,
        apellidos: modalElement.querySelector('#cliente-apellidos').value.trim(),
        alias: modalElement.querySelector('#cliente-alias').value.trim(),
        telefonos: [],
        direcciones: []
    };

    modalElement.querySelectorAll('#telefonos-container .dynamic-field-group').forEach(group => {
        const numero = group.querySelector('[data-field="numero"]').value.trim();
        if (numero) {
            clienteData.telefonos.push({
                numero,
                tipo: group.querySelector('[data-field="tipo"]').value
            });
        }
    });

    modalElement.querySelectorAll('#direcciones-container .dynamic-field-group').forEach(group => {
        const direccion = group.querySelector('[data-field="direccion"]').value.trim();
        if (direccion) {
            const latitudInput = group.querySelector('[data-field="latitud"]');
            const longitudInput = group.querySelector('[data-field="longitud"]');
            clienteData.direcciones.push({
                tipo: group.querySelector('[data-field="tipo"]').value,
                direccion,
                referencias: group.querySelector('[data-field="referencias"]').value.trim(),
                lat: latitudInput && latitudInput.value ? parseFloat(latitudInput.value) : null,
                long: longitudInput && longitudInput.value ? parseFloat(longitudInput.value) : null
            });
        }
    });

    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${clienteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || 'Error desconocido del servidor.';
            } catch (e) {
                errorMessage = `El servidor respondió con un error ${response.status}.`;
            }
            throw new Error(errorMessage);
        }

        alert('Cliente actualizado con éxito.');
        if (onSaveComplete) {
            onSaveComplete();
        }
        closeAndRemoveModal();

    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        alert(`No se pudo actualizar el cliente: ${error.message}`);
    }
}

/**
 * Maneja el guardado del nuevo cliente.
 */
async function handleGuardarCliente() {
    const nombre = modalElement.querySelector('#cliente-nombre').value.trim();
    if (!nombre) {
        alert('El nombre del cliente es obligatorio.');
        return;
    }

    const cliente = {
        nombre,
        apellidos: modalElement.querySelector('#cliente-apellidos').value.trim(),
        alias: modalElement.querySelector('#cliente-alias').value.trim(),
        telefonos: [],
        direcciones: []
    };

    // Recolectar teléfonos
    modalElement.querySelectorAll('#telefonos-container .dynamic-field-group').forEach(group => {
        const numero = group.querySelector('[data-field="numero"]').value.trim();
        if (numero) {
            cliente.telefonos.push({
                numero,
                tipo: group.querySelector('[data-field="tipo"]').value
            });
        }
    });

    // Recolectar direcciones
    modalElement.querySelectorAll('#direcciones-container .dynamic-field-group').forEach(group => {
        const direccion = group.querySelector('[data-field="direccion"]').value.trim();
        if (direccion) {
            const latitudInput = group.querySelector('[data-field="latitud"]');
            const longitudInput = group.querySelector('[data-field="longitud"]');

            // CORREGIDO: Los nombres de las propiedades deben coincidir con las columnas de la base de datos ('lat', 'long').
            cliente.direcciones.push({
                tipo: group.querySelector('[data-field="tipo"]').value,
                direccion,
                referencias: group.querySelector('[data-field="referencias"]').value.trim(),
                lat: latitudInput && latitudInput.value ? parseFloat(latitudInput.value) : null,
                long: longitudInput && longitudInput.value ? parseFloat(longitudInput.value) : null
            });
        }
    });

    try {
        const response = await fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });

        if (!response.ok) {
            // MODIFICADO: Manejo de errores mejorado para respuestas no-JSON.
            // El error "Unexpected token '<'" ocurre porque el servidor devuelve una página HTML (ej. una página 404)
            // y el código intenta interpretarla como JSON.
            const errorText = await response.text();
            let errorMessage;
            try {
                // Intentamos parsear como JSON por si el error sí viene en ese formato.
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || 'Error desconocido del servidor.';
            } catch (e) {
                // Si falla, la respuesta no era JSON. El 404 sugiere que la ruta no está disponible.
                console.error("La respuesta del servidor no es JSON:", errorText);
                errorMessage = `El servidor respondió con un error ${response.status} (Not Found). Asegúrate de que el backend esté corriendo y que la ruta POST /api/clientes esté definida y accesible.`;
            }
            throw new Error(errorMessage);
        }

        alert('Cliente guardado con éxito.');
        if (onSaveComplete) {
            onSaveComplete();
        }
        closeAndRemoveModal();

    } catch (error) {
        console.error('Error al guardar el cliente:', error.message);
        // La alerta ahora mostrará un mensaje de error más claro.
        alert(`No se pudo guardar el cliente: ${error.message}`);
    }
}

/**
 * Abre y configura el modal para añadir un nuevo cliente.
 * @param {Function} callback - Función a ejecutar después de guardar exitosamente.
 */
export async function openNuevoClienteModal(callback) {
    if (document.getElementById('cliente-anadir-modal-container')) return;

    onSaveComplete = callback;

    try {
        const response = await fetch('src/views/clientes/cliente.añadir.modal.html');
        if (!response.ok) throw new Error('No se pudo cargar la plantilla del modal.');
        
        document.body.insertAdjacentHTML('beforeend', await response.text());
        modalElement = document.getElementById('cliente-anadir-modal-container');

        // Añadir un campo inicial de teléfono y dirección
        const telefonosContainer = modalElement.querySelector('#telefonos-container');
        const direccionesContainer = modalElement.querySelector('#direcciones-container');
        
        telefonosContainer.appendChild(createTelefonoField());
        
        const direccionField = createDireccionField();
        direccionesContainer.appendChild(direccionField);
        // CORREGIDO: Inicializar el mapa para el campo nuevo.
        const mapId = direccionField.querySelector('.map-container').id;
        initializeMap(mapId);

        // Configurar event listeners
        modalElement.querySelector('#anadir-cliente-guardar-btn').addEventListener('click', handleGuardarCliente);
        modalElement.querySelector('#anadir-cliente-cancelar-btn').addEventListener('click', closeAndRemoveModal);
        modalElement.querySelector('#btn-anadir-telefono').addEventListener('click', () => {
            modalElement.querySelector('#telefonos-container').appendChild(createTelefonoField());
        });
        modalElement.querySelector('#btn-anadir-direccion').addEventListener('click', () => {
            // Ocultar todos los mapas existentes
            const direccionesContainer = modalElement.querySelector('#direcciones-container');
            direccionesContainer.querySelectorAll('.map-container').forEach(map => map.style.display = 'none');
            
            const newField = createDireccionField();
            direccionesContainer.appendChild(newField);
            const newMapId = newField.querySelector('.map-container').id;
            initializeMap(newMapId);
        });

        // AÑADIDO: Listener para mostrar el mapa correcto al hacer foco
        modalElement.querySelector('#direcciones-container').addEventListener('focusin', (event) => {
            const focusedFieldGroup = event.target.closest('.dynamic-field-group');
            if (!focusedFieldGroup) return;

            modalElement.querySelectorAll('#direcciones-container .dynamic-field-group').forEach(group => {
                const mapContainer = group.querySelector('.map-container');
                if (mapContainer) {
                    if (group === focusedFieldGroup) {
                        mapContainer.style.display = 'block';
                        const mapInstance = mapInstances[mapContainer.id];
                        if (mapInstance) {
                            setTimeout(() => mapInstance.invalidateSize(), 10);
                        }
                    } else {
                        mapContainer.style.display = 'none';
                    }
                }
            });
        });

        // Listener para eliminar campos dinámicos (delegación de eventos)
        modalElement.querySelector('.modal-body').addEventListener('click', (event) => {
            if (event.target.matches('.btn-remove-field')) {
                event.target.closest('.dynamic-field-group').remove();
            }
        });

        setTimeout(() => modalElement.classList.add('visible'), 10);

    } catch (error) {
        console.error('Error al abrir el modal para añadir nuevo cliente:', error);
    }
}