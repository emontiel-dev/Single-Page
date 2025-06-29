// src/router.js
import { renderInicio } from './modulos/interfaz/inicio.js';
import { renderVenta } from './modulos/venta/venta.js';

const routes = {
    '/': renderInicio,
    '/venta': renderVenta,
    // Agrega más rutas aquí
};

export function initRouter() {
    const mainContent = document.getElementById('main-content');

    function navigateTo(url) {
        history.pushState(null, null, url);
        renderContent(url);
    }

    function renderContent(url) {
        const path = url === '' ? '/' : url;
        const renderFunction = routes[path] || renderInicio; // Default to inicio
        if (mainContent) {
            mainContent.innerHTML = ''; // Limpiar contenido actual
            renderFunction(mainContent); // Renderizar nuevo contenido
        }
    }

    // Manejar la navegación inicial y los cambios de historial
    window.addEventListener('popstate', () => {
        renderContent(location.pathname);
    });

    // Manejar clics en enlaces internos
    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    // Renderizar la ruta inicial
    renderContent(location.pathname);
}

// Función para navegar programáticamente
export function navigate(url) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
         history.pushState(null, null, url);
         const path = url === '' ? '/' : url;
         const renderFunction = routes[path] || renderInicio; // Default to inicio
         mainContent.innerHTML = ''; // Limpiar contenido actual
         renderFunction(mainContent); // Renderizar nuevo contenido
    }
}
