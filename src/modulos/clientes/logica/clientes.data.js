// 1. Importar los datos locales del archivo de datos estáticos.
import { clientes as clientesData } from './clientes.datos.js';

let clientes = [];
let datosCargados = false;

/**
 * Carga los clientes desde el archivo local si no han sido cargados previamente.
 */
export async function cargarClientes() {
    if (datosCargados) {
        return; // Evita recargar si ya los tenemos
    }
    try {
        // 2. Lógica de fetch comentada para usar datos locales en su lugar.
        /*
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes`);
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de clientes del backend.');
        }
        clientes = await response.json();
        */

        // Asignar los datos importados del archivo local.
        clientes = clientesData;
        datosCargados = true;
        console.log('Clientes cargados desde el archivo local (modo temporal):', clientes);

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
    return clientes.find(c => c.id == id) || null;
}

/**
 * Elimina un cliente por su ID del array local.
 * @param {number} id - El ID del cliente a eliminar.
 */
export async function deleteClienteById(id) {
    // 3. Lógica de fetch comentada para operar sobre el array local.
    /*
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            if (response.status === 409) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        datosCargados = false; 

    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
    */

    // Lógica para eliminar del array local
    const index = clientes.findIndex(c => c.id == id);
    if (index > -1) {
        clientes.splice(index, 1);
        console.log(`Cliente con ID ${id} eliminado del array local.`);
    }
}