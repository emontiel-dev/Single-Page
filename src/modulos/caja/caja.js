import { initCajaLogic } from './logica/caja.logica.js';

export async function renderCaja(container) {
    try {
        const response = await fetch('src/modulos/caja/views/caja.html');
        if (!response.ok) {
            throw new Error('No se pudo cargar la vista de caja.');
        }
        container.innerHTML = await response.text();

        initCajaLogic();

    } catch (error) {
        console.error('Error al renderizar el módulo de caja:', error);
        container.innerHTML = '<p>No se pudo cargar el módulo de caja.</p>';
    }
}