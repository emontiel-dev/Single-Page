// src/modulos/venta/venta.js

// Este archivo se encargará de la conexión entre el módulo de venta y el router.
// Actuará como el punto de entrada para la vista de venta.

import { renderCatalogo } from './logica/catalogo.js';
import { renderCarrito } from './logica/carrito.js'; // Importamos la función de renderizado del carrito

export function renderVenta(container) {
    // Limpiar el contenedor principal de la aplicación
    container.innerHTML = '';

    // Crear un wrapper específico para la vista de venta que contendrá nuestro layout
    const ventaLayout = document.createElement('div');
    ventaLayout.className = 'venta-layout'; // Aplicar la clase de layout a este wrapper

    // Renderizar el catálogo y añadirlo al wrapper de venta
    const catalogoContainer = document.createElement('div');
    catalogoContainer.id = 'catalogo-section';
    ventaLayout.appendChild(catalogoContainer);
    renderCatalogo(catalogoContainer);

    // Renderizar el carrito y añadirlo también al wrapper de venta
    const carritoContainer = document.createElement('div');
    carritoContainer.id = 'carrito-section';
    ventaLayout.appendChild(carritoContainer);
    renderCarrito(carritoContainer);

    // Finalmente, añadir el layout de venta completo al contenedor principal de la aplicación
    container.appendChild(ventaLayout);
}
