// src/modulos/interfaz/navbar.js

export async function initNavbar() {
    const navbarElement = document.getElementById('navbar');
    if (navbarElement) {
        try {
            // Cargar el contenido de la plantilla HTML
            const response = await fetch('src/modulos/interfaz/navbar.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const navbarHtml = await response.text();

            // Insertar el contenido en el elemento #navbar
            navbarElement.innerHTML = navbarHtml;

            // Marcar el enlace activo basado en la ruta actual
            markActiveLink();

            // Escuchar cambios en la URL para actualizar el enlace activo
            window.addEventListener('popstate', markActiveLink);
            document.body.addEventListener('click', e => {
                 // Esperar un ciclo de evento para que el router actualice la URL
                 setTimeout(markActiveLink, 0);
            });


        } catch (error) {
            console.error('Error loading navbar:', error);
            navbarElement.innerHTML = '<p>Error al cargar la barra de navegación.</p>';
        }
    }
}

// Función para marcar el enlace activo
function markActiveLink() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        // Eliminar la clase 'active-link' de todos los elementos
        item.classList.remove('active-link');

        // Comparar la ruta del enlace con la ruta actual
        // Asegurarse de comparar rutas base si es necesario, o rutas completas
        const itemPath = new URL(item.href).pathname;

        if (path === itemPath) {
            item.classList.add('active-link');
        }
        // Manejar la ruta raíz '/' específicamente si es necesario
        if (path === '/' && itemPath === '/') {
             item.classList.add('active-link');
        }
         // Si la ruta actual es '/venta' y el enlace es '/venta', marcarlo
        if (path === '/venta' && itemPath === '/venta') {
            item.classList.add('active-link');
        }
         // Puedes añadir lógica adicional aquí si las rutas activas son más complejas
         // Por ejemplo, si '/venta/producto/1' debe marcar '/venta' como activo
         if (path.startsWith(itemPath) && itemPath !== '/') {
             item.classList.add('active-link');
         } else if (path === '/' && itemPath === '/') {
             item.classList.add('active-link');
         }
    });
}
