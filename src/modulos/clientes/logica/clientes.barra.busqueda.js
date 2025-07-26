/**
 * Función de utilidad para "debounce". Retrasa la ejecución de una función
 * hasta que haya pasado un cierto tiempo sin que se llame de nuevo.
 * @param {Function} func - La función a ejecutar.
 * @param {number} delay - El tiempo de espera en milisegundos.
 * @returns {Function} La nueva función "debounced".
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Función para normalizar texto (eliminar acentos).
 * @param {string} str - La cadena de texto a normalizar.
 * @returns {string} La cadena sin acentos.
 */
function normalizeText(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


/**
 * Inicializa la funcionalidad de la barra de búsqueda para la vista de clientes.
 * @param {HTMLInputElement} searchInput - El elemento input de la barra de búsqueda.
 * @param {Array<Object>} allClients - El array completo de objetos de cliente para buscar.
 * @param {Function} onSearch - La función callback a ejecutar con los resultados filtrados.
 */
export function initSearchBar(searchInput, allClients, onSearch) {
    if (!searchInput || !allClients || typeof onSearch !== 'function') {
        console.error('initSearchBar requiere el input, la lista de clientes y una función de callback.');
        return;
    }

    const debouncedSearch = debounce((searchTerm) => {
        const normalizedSearchTerm = normalizeText(searchTerm.toLowerCase().trim());
        const searchWords = normalizedSearchTerm.split(' ').filter(word => word);

        if (searchWords.length === 0) {
            onSearch(allClients);
            return;
        }

        const filteredClients = allClients.filter(cliente => {
            // MEJORA: Incluir direcciones y referencias en la cadena de búsqueda de texto.
            const clientText = normalizeText([
                cliente.nombre,
                cliente.apellidos,
                cliente.alias || '',
                // Añadir todas las direcciones y referencias a la búsqueda
                ...cliente.direcciones.map(d => `${d.direccion} ${d.referencias || ''}`)
            ].join(' ')).toLowerCase();
            
            // Crear una cadena solo con los dígitos de todos los teléfonos del cliente
            const clientPhones = cliente.telefonos.map(t => t.numero.replace(/\D/g, '')).join(' ');

            // La búsqueda es exitosa si CADA palabra buscada coincide con el texto O con los números de teléfono
            return searchWords.every(word => {
                // Comprobar si la palabra coincide con el texto del cliente
                const isTextMatch = clientText.includes(word);

                // Normalizar la palabra de búsqueda para que solo contenga dígitos
                const wordDigits = word.replace(/\D/g, '');
                
                // Comprobar si los dígitos de la palabra coinciden con los teléfonos del cliente
                // Solo se considera una coincidencia de teléfono si la palabra contiene al menos un dígito
                const isPhoneMatch = wordDigits.length > 0 && clientPhones.includes(wordDigits);

                return isTextMatch || isPhoneMatch;
            });
        });

        onSearch(filteredClients);
    }, 300);

    searchInput.addEventListener('input', (event) => {
        debouncedSearch(event.target.value);
    });
}