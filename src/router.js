// src/router.js
import { renderInicio } from './modulos/interfaz/inicio.js';
import { renderVenta } from './modulos/venta/venta.js';
import { renderClientes } from './modulos/clientes/clientes.js';
import { renderPedidosGuardados } from './modulos/pedidos/logica/pedidos.guardados.js';
import { renderItemsTablajero } from './modulos/items.tablajero/logica/items.tablajero.js';
import { renderCaja } from './modulos/caja/caja.js';
import { renderTrabajadores } from './modulos/trabajadores/trabajadores.js';
import { renderHistorial } from './modulos/historial/historial.js';

const routes = {
    '/': renderInicio,
    '/venta': renderVenta,
    '/clientes': renderClientes,
    '/pedidos': renderPedidosGuardados,
    '/items-tablajero': renderItemsTablajero,
    '/caja': renderCaja,
    '/trabajadores': renderTrabajadores,
    '/historial': renderHistorial,
    // Agrega más rutas aquí
};

// --- Función privada para renderizar el contenido ---
function render(path) {
    const mainContent = document.getElementById('main-content');
    // Asegurarse de que la ruta sea válida, si no, ir a inicio.
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const renderFunction = routes[cleanPath] || renderInicio;
    
    if (mainContent) {
        mainContent.innerHTML = ''; // Limpiar contenido actual
        renderFunction(mainContent); // Renderizar nuevo contenido
    }
}

// --- API Pública del Router ---
export const router = {
    navigate: (path) => {
        // Evitar navegar a la misma página
        if (location.pathname === path) return;
        
        history.pushState(null, null, path);
        render(path);
    }
};

export function initRouter() {
    // Manejar la navegación con los botones de atrás/adelante del navegador
    window.addEventListener('popstate', () => {
        render(location.pathname);
    });

    // Manejar clics en todos los enlaces con el atributo [data-link]
    document.body.addEventListener('click', e => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            router.navigate(href); // Usar nuestro método de navegación
        }
    });

    // Renderizar la ruta inicial al cargar la página
    render(location.pathname);
}
