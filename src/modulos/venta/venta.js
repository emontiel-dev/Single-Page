// src/modulos/venta/venta.js

// Este archivo se encargará de la conexión entre el módulo de venta y el router.
// Actuará como el punto de entrada para la vista de venta.

import { renderCatalogo } from './catalogo/catalogo.js';
import { renderCarrito } from './carrito/carrito.js'; // Importamos la función de renderizado del carrito

export function renderVenta(container) {
    // Limpiar el contenedor principal de la vista de venta
    container.innerHTML = '';

    // Crear un contenedor para el catálogo
    const catalogoContainer = document.createElement('div');
    catalogoContainer.id = 'catalogo-section';
    container.appendChild(catalogoContainer);

    // Renderizar el catálogo dentro de su contenedor
    renderCatalogo(catalogoContainer);

    // Crear un contenedor para el carrito (este contenedor usará la clase pos-footer para posicionarse)
    const carritoContainer = document.createElement('div');
    // No le asignamos una clase aquí, la plantilla de carrito.html ya tiene el contenedor principal con la clase pos-footer
    // Simplemente le damos un ID para que renderCarrito sepa dónde inyectar su contenido
    carritoContainer.id = 'carrito-section';
    container.appendChild(carritoContainer);

    // Renderizar el carrito dentro de su contenedor
    renderCarrito(carritoContainer);

    // Agrega aquí la renderización de otras partes de la interfaz de venta si es necesario
}
