# Pollería Montiel - Single Page Application

Aplicación web de una sola página (SPA) diseñada para la gestión de pedidos y ventas en una carnicería de cortes de pollo fresco.

## Propósito

El objetivo principal de esta aplicación es proporcionar una interfaz eficiente y amigable para que el personal de "Pollería Montiel" pueda:

*   Visualizar el catálogo de productos disponibles.
*   Añadir productos de pollo al carrito, especificando cantidad/peso y personalizaciones (cortes, procesamientos, etc.).
*   **Añadir Productos Adicionales (PA) con descripción y costo.**
*   **Añadir Cargos Manuales con descripción y monto.**
*   **Añadir opciones de Envío (predefinidas o manuales).**
*   Gestionar los items en el carrito (eliminar items).
*   **Aplicar descuentos a items específicos del carrito.**
*   Calcular el total de la venta.
*   **Visualizar un detalle del pedido simulando un ticket de impresión.**
*   (Funcionalidades futuras) Procesar el cobro y guardar pedidos.

La interfaz está optimizada para dispositivos móviles, inspirada en principios de diseño de iOS para una experiencia de usuario intuitiva.

## Tecnologías Utilizadas

*   **Frontend:** HTML, CSS (con variables y estilos inspirados en iOS), JavaScript nativo.
*   **Build Tool:** Vite.js
*   **Manejo de Rutas:** Router simple implementado en JavaScript.

## Estructura del Proyecto

```
.
├── .github/
│   └── prompts/
│       └── estilo.prompt.md
├── src/
│   ├── app.js          # Punto de entrada principal de la aplicación
│   ├── router.js       # Manejo de rutas de la SPA
│   ├── css/            # Archivos CSS
│   │   └── styles.css  # Estilos generales y variables
│   ├── images/         # Imágenes de la aplicación
│   │   └── catalogo/   # Imágenes de productos del catálogo
│   ├── modulos/        # Módulos de la aplicación
│   │   ├── interfaz/   # Módulos de interfaz de usuario (navbar, inicio)
│   │   └── venta/      # Módulos relacionados con la venta (catalogo, carrito, modal)
│   │       ├── carrito/
│   │       │   ├── carrito.js
│   │       │   └── carrito.ver.items.js # Lógica para el modal de detalle del ticket
│   │       ├── catalogo/
│   │       │   ├── catalogo.datos.js
│   │       │   ├── catalogo.js
│   │       │   └── catalogo.modal.js # Lógica para el modal de producto
│   │       ├── cargo/
│   │       │   └── cargo.modal.js # Lógica para el modal de cargo
│   │       ├── descuento/
│   │       │   └── descuento.modal.js # Lógica para el modal de descuento
│   │       ├── envio/
│   │       │   └── envio.modal.js # Lógica para el modal de envío
│   │       ├── pa/
│   │       │   └── pa.modal.js # Lógica para el modal de producto adicional
│   │       └── venta.js
│   └── views/          # Archivos HTML de las vistas y componentes
│       ├── cargo.modal.html # Plantilla HTML para el modal de cargo
│       ├── carrito.html
│       ├── carrito.ver.items.html # Plantilla HTML para el modal de detalle del ticket
│       ├── catalogo.html
│       ├── catalogo.modal.html
│       ├── descuento.modal.html # Plantilla HTML para el modal de descuento
│       ├── envio.modal.html # Plantilla HTML para el modal de envío
│       ├── navbar.html
│       ├── pa.modal.html # Plantilla HTML para el modal de producto adicional
├── index.html          # Archivo HTML principal
├── package.json        # Dependencias y scripts de npm
├── README.md           # Este archivo
└── vite.config.js      # Configuración de Vite
```

## Configuración e Inicio Rápido

Para poner en marcha el proyecto localmente, sigue estos pasos:

1.  Clona este repositorio (o asegúrate de tener los archivos del proyecto).
2.  Abre una terminal en la raíz del proyecto.
3.  Instala las dependencias usando npm, yarn o pnpm:

    ```bash
    npm install
    # o
    yarn install
    # o
    pnpm install
    ```

4.  Inicia el servidor de desarrollo con Vite:

    ```bash
    npm run dev
    # o
    yarn dev
    # o
    pnpm dev
    ```

5.  Vite iniciará un servidor local (generalmente en `http://localhost:5173`). Abre esta URL en tu navegador web (preferiblemente en la vista de desarrollador para móviles).

## Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo con recarga en caliente.
*   `npm run build`: Compila la aplicación para producción en la carpeta `dist/`.
*   `npm run preview`: Sirve la versión de producción compilada localmente para previsualización.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.



