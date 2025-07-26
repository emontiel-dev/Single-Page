# Pollería Montiel - Sistema de Punto de Venta (POS)

Aplicación web de una sola página (SPA) diseñada como un sistema de Punto de Venta (POS) para la gestión integral de "Pollería Montiel", una carnicería especializada en cortes de pollo fresco. La interfaz está optimizada para ser rápida e intuitiva en dispositivos móviles, con una experiencia de usuario inspirada en iOS.

## Características Principales

*   **Módulo de Venta:**
    *   Catálogo de productos interactivo.
    *   Personalización de items en el carrito (cortes, procesamientos).
    *   Adición de productos adicionales (PA), cargos manuales, descuentos y opciones de envío.
    *   Visualización del resumen del pedido en formato de ticket.

*   **Módulo de Caja:**
    *   Procesamiento de cobros con cálculo de cambio en tiempo real.
    *   Gestión interactiva de denominaciones de efectivo.
    *   Registro de ingresos y egresos manuales con manejo de cambio.
    *   Funcionalidad para realizar cortes de caja.

*   **Módulo de Clientes:**
    *   Creación, lectura, actualización y eliminación (CRUD) de clientes.
    *   Gestión de múltiples teléfonos y direcciones por cliente.

*   **Gestión de Pedidos:**
    *   Sistema para guardar pedidos y consultar su estado.
    *   Interfaz de "Tablajero" para que el personal de preparación visualice y marque los items como listos.

*   **Historial de Transacciones:**
    *   Registro y visualización de todos los movimientos de venta y caja.

## Tecnologías Utilizadas

*   **Frontend:**
    *   JavaScript Nativo (ES Modules)
    *   HTML5 y CSS3 (con Variables Nativas)
    *   **Vite.js** como herramienta de desarrollo y empaquetado.
    *   Router simple implementado en JavaScript para la navegación SPA.
*   **Backend:**
    *   Node.js con Express.js para la API REST.
    *   **Supabase** como proveedor de base de datos (PostgreSQL) y autenticación.

## Estructura del Proyecto

```
.
├── backend/              # Lógica del servidor
│   ├── server.js         # Servidor Express y endpoints de la API
│   └── seed.js           # Script para poblar la base de datos
├── src/
│   ├── app.js            # Punto de entrada principal de la aplicación
│   ├── router.js         # Manejo de rutas de la SPA
│   ├── css/              # Estilos CSS organizados por módulos
│   └── modulos/          # Módulos principales de la aplicación
│       ├── caja/         # Gestión de caja, cobros y cortes
│       ├── clientes/     # Gestión de la base de datos de clientes
│       ├── historial/    # Historial de ventas y transacciones
│       ├── interfaz/     # Componentes de UI globales (navbar)
│       ├── items.tablajero/ # Vista para preparación de pedidos
│       ├── pedidos/      # Gestión de pedidos guardados
│       └── venta/        # Flujo principal de venta y gestión del carrito
├── index.html            # Archivo HTML raíz
├── package.json          # Dependencias y scripts del frontend
└── vite.config.js        # Configuración de Vite
```

## Configuración e Inicio Rápido

Para poner en marcha el proyecto localmente, sigue estos pasos:

1.  **Clona el repositorio.**

2.  **Configura el Backend:**
    *   Navega a la carpeta `backend`: `cd backend`.
    *   Instala las dependencias: `npm install`.
    *   Crea un archivo `.env` y añade tus credenciales de Supabase:
        ```
        SUPABASE_URL=URL_DE_TU_PROYECTO_SUPABASE
        SUPABASE_KEY=TU_SUPABASE_ANON_KEY
        ```
    *   Inicia el servidor del backend: `npm start`. Por defecto, correrá en `http://localhost:3000`.

3.  **Configura el Frontend:**
    *   En una nueva terminal, navega a la raíz del proyecto.
    *   Instala las dependencias: `npm install`.
    *   Inicia el servidor de desarrollo de Vite: `npm run dev`.

4.  Abre la URL proporcionada por Vite (generalmente `http://localhost:5173`) en tu navegador.

## Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo del frontend con recarga en caliente.
*   `npm run build`: Compila la aplicación para producción en la carpeta `dist/`.
*   `npm run preview`: Sirve la versión de producción compilada localmente.
*   En la carpeta `backend`, `npm start` inicia el servidor de Node.js.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para discutir los cambios propuestos.



