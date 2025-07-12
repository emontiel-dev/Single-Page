let clientes = [];
let datosCargados = false;

/**
 * Carga los clientes desde la API si no han sido cargados previamente.
 * Se asegura de que los datos se carguen solo una vez.
 */
export async function cargarClientes() {
    if (datosCargados) {
        return; // Evita recargar si ya los tenemos
    }
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes`);
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de clientes del backend.');
        }
        clientes = await response.json();
        datosCargados = true;
        console.log('Clientes cargados desde la API:', clientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        clientes = []; // En caso de error, asegúrate de que clientes sea un array vacío.
    }
}

/**
 * Devuelve la lista completa de clientes que ya fue cargada.
 * @returns {Array<Object>}
 */
export function getClientes() {
    return clientes;
}

/**
 * Busca un cliente por su ID en la lista cargada.
 * @param {number} id - El ID del cliente a buscar.
 * @returns {Object|null}
 */
export function findClienteById(id) {
    if (!id) return null;
    // El ID de Supabase puede ser un número grande, así que usamos '==' para una comparación flexible.
    return clientes.find(c => c.id == id) || null;
}

/**
 * Elimina un cliente por su ID a través de la API.
 * @param {number} id - El ID del cliente a eliminar.
 */
export async function deleteClienteById(id) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            // Si el servidor envía un mensaje de error específico (ej. 409 Conflict)
            if (response.status === 409) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        // Forzar la recarga de datos en la próxima llamada a cargarClientes
        datosCargados = false; 

    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        // Re-lanzar el error para que la UI pueda manejarlo (ej. mostrar una alerta)
        throw error;
    }
}