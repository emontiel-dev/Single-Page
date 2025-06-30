// src/modulos/venta/venta.js

// Este archivo se encargará de la conexión entre el módulo de venta y el router.
// Actuará como el punto de entrada para la vista de venta.

import { renderCatalogo } from './catalogo/catalogo.js';
import { renderCarrito } from './carrito/carrito.js'; // Importamos la función de renderizado del carrito

export function renderVenta(container) {
    // Limpiar el contenedor principal de la vista de venta
    container.innerHTML = '';

    // Crear un contenedor para el carrito
    const carritoContainer = document.createElement('div');
    carritoContainer.id = 'carrito-section';
    // Añadir el contenedor del carrito PRIMERO
    container.appendChild(carritoContainer);

    // Renderizar el carrito dentro de su contenedor
    renderCarrito(carritoContainer);

    // Crear un contenedor para el catálogo
    const catalogoContainer = document.createElement('div');
    catalogoContainer.id = 'catalogo-section';
    // Añadir el contenedor del catálogo DESPUÉS del carrito
    container.appendChild(catalogoContainer);

    // Renderizar el catálogo dentro de su contenedor
    renderCatalogo(catalogoContainer);


    // Agrega aquí la renderización de otras partes de la interfaz de venta si es necesario
}
