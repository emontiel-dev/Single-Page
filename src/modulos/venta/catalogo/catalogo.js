// src/modulos/venta/catalogo/catalogo.js

// Este archivo se encarga de renderizar la vista del catálogo de productos.

import { openCatalogoModal } from './catalogo.modal.js'; // Importamos la función para abrir el modal

export async function renderCatalogo(container) {
    try {
        // Cargar el contenido de la plantilla HTML del catálogo
        const response = await fetch('src/views/catalogo.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const catalogoHtml = await response.text();

        // Insertar el contenido en el contenedor proporcionado
        container.innerHTML = catalogoHtml;

        // Añadir event listeners a los botones de producto
        const productButtons = container.querySelectorAll('.product-btn');
        productButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                if (productId) {
                    // Cuando se hace clic en un botón de producto, abrimos el modal
                    openCatalogoModal(productId);
                }
            });
        });

    } catch (error) {
        console.error('Error loading catalogo:', error);
        container.innerHTML = '<p>Error al cargar el catálogo de productos.</p>';
    }
}