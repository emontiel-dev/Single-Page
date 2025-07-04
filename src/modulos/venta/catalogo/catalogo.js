// src/modulos/venta/catalogo/catalogo.js

import { catalogoProductos } from './catalogo.datos.js'; // Importamos los datos del catálogo
import { openCatalogoModal } from './catalogo.modal.js'; // Importamos la función para abrir el modal del catálogo
import { openEnvioModal } from '../envio/envio.modal.js'; // Importamos la función para abrir el modal de envío
import { openCargoModal } from '../cargo/cargo.modal.js'; // Importamos la función para abrir el modal de cargo
import { openDescuentoModal } from '../descuento/descuento.modal.js'; // Importamos la función para abrir el modal de descuento
import { openPaModal } from '../pa/pa.modal.js'; // <-- Importamos la función para abrir el modal de PA
import { openClienteModal } from '../../clientes/cliente.modal.js'; // <-- IMPORTAR MODAL DE CLIENTE


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
                    // Cuando se hace clic en un botón de producto, abrimos el modal del catálogo
                    openCatalogoModal(productId);
                }
            });
        });

        // Añadir event listener al botón de "Envio" en acciones rápidas
        const envioButton = container.querySelector('#btn-abrir-envio-modal'); // CORREGIDO: Usar ID
         if (envioButton) {
             envioButton.addEventListener('click', () => {
                 console.log('Botón de Envío clicado.');
                 openEnvioModal(); // Abrir el modal de envío
             });
         }

        // Añadir event listener al botón de "Cargo" en acciones rápidas
        const cargoButton = container.querySelector('#btn-agregar-cargo-rapido'); // Obtener el botón por su ID
         if (cargoButton) {
             cargoButton.addEventListener('click', () => {
                 console.log('Botón de Cargo clicado.');
                 openCargoModal(); // Abrir el modal de cargo
             });
         }

        // Añadir event listener al botón de "Descuento" en acciones rápidas
        const descuentoButton = container.querySelector('#btn-aplicar-descuento-rapido'); // Obtener el botón por su ID
         if (descuentoButton) {
             descuentoButton.addEventListener('click', () => {
                 console.log('Botón de Descuento clicado.');
                 openDescuentoModal(); // Abrir el modal de descuento
             });
         }

        // <-- Añadir event listener al botón de "Cliente" en acciones rápidas -->
        const clienteButton = container.querySelector('#btn-seleccionar-cliente-rapido');
        if (clienteButton) {
            clienteButton.addEventListener('click', () => {
                console.log('Botón de Cliente clicado.');
                openClienteModal();
            });
        }

        // <-- Añadir event listener al botón de "PA" en acciones rápidas -->
        const paButton = container.querySelector('#btn-agregar-pa-rapido'); // Obtener el botón por su ID
         if (paButton) {
             paButton.addEventListener('click', () => {
                 console.log('Botón de PA clicado.');
                 openPaModal(); // Abrir el modal de PA
             });
         }
        // --> Fin de la adición <--


    } catch (error) {
        console.error('Error loading catalogo:', error);
        container.innerHTML = '<p>Error al cargar el catálogo de productos.</p>';
    }
}