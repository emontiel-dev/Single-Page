// src/modulos/venta/carrito/carrito.js

// Este archivo maneja la lógica y renderizado del carrito de compras.

// No necesitamos importar carrito.detalle.js si eliminamos el modal de detalle
// import { openCarritoDetalleModal } from './carrito.detalle.js';

import { openCarritoVerItemsModal } from "./carrito.ver.items.js"; // <-- Importar la función del nuevo modal
import { openCobrarModal } from "../../caja/logica/caja.cobrar.modal.js"; // <-- AÑADIR IMPORT
import { router } from "../../../router.js"; // Importar el router
import { pedidosGuardados } from "../../pedidos/logica/pedidos.guardados.datos.js"; // Importar los pedidos
import { FASES_PEDIDO } from "../../pedidos/logica/pedidos.fases.datos.js"; // Importar las fases

export let cartItems = []; // Array para almacenar los items del carrito - AHORA EXPORTADO
export let selectedClient = null; // <-- NUEVO: Variable para el cliente seleccionado

// <-- NUEVO: Función para establecer el cliente -->
export function setCliente(cliente) {
  selectedClient = cliente;
  console.log("Cliente seleccionado para la venta:", selectedClient);
  updateCarritoDisplay(); // Actualizar la UI para reflejar el cambio (ej. botón activo)
}

// Función para renderizar la plantilla HTML del carrito
export async function renderCarrito(container) {
  try {
    const response = await fetch("src/modulos/venta/views/carrito.html");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const carritoHtml = await response.text();

    // Insertar el contenido en el contenedor proporcionado
    container.innerHTML = carritoHtml;

    // Añadir event listeners a los botones de acción
    // Ahora obtenemos la referencia al botón 'Ver todo'
    const btnVerItems = container.querySelector("#btn-ver-items");
    const btnCobrar = container.querySelector("#btn-cobrar");
    const btnGuardarPedido = container.querySelector("#btn-guardar-pedido");
    // Eliminamos la referencia a verTodosMensaje
    // const verTodosMensaje = container.querySelector('#ver-todos-mensaje'); // Obtener el elemento del mensaje
    const itemsListBody = container.querySelector("#carrito-items-list"); // Get the tbody for item list

    // --- MODIFICACIÓN: Añadir listener al botón 'Ver todo' ---
    if (btnVerItems) {
      btnVerItems.addEventListener("click", () => {
        console.log('Botón "Ver todos los items" clicado.');
        openCarritoVerItemsModal(); // Abrir el nuevo modal de detalle
      });
    }
    // --> Fin de la MODIFICACIÓN <--

    if (btnCobrar) btnCobrar.addEventListener("click", handleCobrar);
    if (btnGuardarPedido)
      btnGuardarPedido.addEventListener("click", handleGuardarPedido);
    // Eliminamos el listener del div verTodosMensaje
    // if (verTodosMensaje) verTodosMensaje.addEventListener('click', handleVerItems); // Add listener to the message too

    // Add event listener for remove buttons using event delegation on the tbody
    if (itemsListBody) {
      itemsListBody.addEventListener("click", handleItemAction);
    }

    // Renderizar el estado inicial del carrito
    updateCarritoDisplay();
  } catch (error) {
    console.error("Error loading carrito:", error);
    container.innerHTML = "<p>Error al cargar el carrito.</p>";
  }
}

// Function to handle clicks on item actions (like remove)
function handleItemAction(event) {
  const target = event.target;
  // Check if the clicked element or its parent is a remove button
  const removeButton = target.closest(".remove-item-btn");

  if (removeButton) {
    const itemRow = removeButton.closest("tr");
    if (itemRow) {
      // Obtenemos el índice del item desde el atributo data
      const itemIndex = parseInt(itemRow.dataset.itemIndex, 10);
      if (!isNaN(itemIndex)) {
        removeItemFromCart(itemIndex);
      }
    }
  }
}

// Función para añadir un item al carrito
export function addItemToCart(item) {
  // Aquí podrías añadir lógica para agrupar items si son iguales
  // Por ahora, simplemente añadimos el item tal cual
  cartItems.push(item);
  console.log("[Carrito] Item añadido:", item, "Carrito actual:", cartItems);
  updateCarritoDisplay(); // Actualizar la interfaz del carrito
}

// Función para remover un item del carrito por su índice
function removeItemFromCart(index) {
  if (index >= 0 && index < cartItems.length) {
    const removedItem = cartItems.splice(index, 1);
    console.log(
      "[Carrito] Item removido:",
      removedItem,
      "Carrito actual:",
      cartItems
    );
    updateCarritoDisplay(); // Actualizar la interfaz del carrito
  } else {
    console.warn(
      "[Carrito] Intento de remover item con índice inválido:",
      index
    );
  }
}

// --- FUNCIÓN REFACTORIZADA Y CORREGIDA ---
export function updateCarritoDisplay() {
  console.log("[Carrito] Actualizando display del carrito.");
  const carritoContainer = document.getElementById("carrito-container");
  const itemsListBody = document.getElementById("carrito-items-list");
  const totalValueSpan = document.getElementById("carrito-total-value");
  const mainContent = document.getElementById("main-content");
  const itemCountSpan = document.getElementById("item-count");

  if (
    !itemsListBody ||
    !totalValueSpan ||
    !carritoContainer ||
    !mainContent ||
    !itemCountSpan
  ) {
    // No es un error, simplemente no estamos en la vista de venta. Salir silenciosamente.
    return;
  }

  // --- INICIO: Lógica de Comisión por Productos Adicionales (PA) ---
  const commissionId = "COMISION_PA"; // ID único para este tipo de cargo.
  const commissionFreeLimit = 3;
  const commissionPerItem = 4.0;

  // 1. Remover la comisión existente para recalcularla desde cero.
  const existingCommissionIndex = cartItems.findIndex(
    (item) => item.optionId === commissionId
  );
  if (existingCommissionIndex > -1) {
    cartItems.splice(existingCommissionIndex, 1);
  }

  // 2. Contar los Productos Adicionales.
  const paCount = cartItems.filter((item) => item.productId === "PA").length;

  // 3. Si se excede el límite, calcular y añadir la comisión.
  if (paCount > commissionFreeLimit) {
    const commissionableItems = paCount - commissionFreeLimit;
    const commissionCost = commissionableItems * commissionPerItem;

    const commissionItem = {
      productId: "CARGO", // Usamos el tipo 'CARGO' para que se renderice correctamente.
      optionId: commissionId, // ID único para poder encontrarlo y removerlo.
      optionName: "Comisión por Productos Adicionales",
      quantity: 1,
      cost: commissionCost,
      priceType: null,
      pricePerKg: null,
      personalizations: {
        descripcion: [
          `${commissionableItems} PA(s) extra ( $${commissionPerItem.toFixed(
            2
          )} c/u)`,
        ],
      },
    };
    cartItems.push(commissionItem); // Añadir al final del carrito.
  }
  // --- FIN: Lógica de Comisión ---

  // 1. CALCULAR TOTALES Y CONTEOS PRIMERO
  // El total es la suma del costo de TODOS los items, incluyendo el envío.
  const total = cartItems.reduce((acc, item) => acc + item.cost, 0);
  // El contador de items excluye el item de envío.
  const itemCount = cartItems.filter(
    (item) => item.productId !== "ENVIO"
  ).length;
  console.log(
    `[Carrito] Total calculado: ${total.toFixed(
      2
    )}, Conteo de items: ${itemCount}`
  );

  // 2. ACTUALIZAR LA UI CON LOS VALORES CALCULADOS
  totalValueSpan.textContent = Math.round(total).toFixed(2); // MODIFICADO: Redondeo aplicado
  itemCountSpan.textContent = itemCount;

  // 3. RENDERIZAR LA LISTA DE ITEMS
  itemsListBody.innerHTML = ""; // Limpiar la lista actual

  if (itemCount > 0) {
    // Solo mostrar el carrito si hay items visibles (no solo envío)
    cartItems.forEach((item, index) => {
      // Omitir el item de envío de la lista visible
      if (item.productId === "ENVIO") {
        return;
      }

      const row = document.createElement("tr");
      row.dataset.itemIndex = index;

      let productCell;
      if (item.productId === "CARGO") {
        productCell = renderCargoItem(item);
      } else if (item.productId === "PA") {
        productCell = renderPaItem(item);
      } else {
        productCell = renderProductItem(item);
      }
      row.appendChild(productCell);

      const subtotalCell = document.createElement("td");
      subtotalCell.classList.add("item-subtotal");
      subtotalCell.textContent = `$${item.cost.toFixed(2)}`;
      row.appendChild(subtotalCell);

      const actionsCell = document.createElement("td");
      actionsCell.classList.add("item-acciones");
      actionsCell.innerHTML = `<button class="remove-item-btn" aria-label="Eliminar item"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></button>`;
      row.appendChild(actionsCell);

      itemsListBody.appendChild(row);
    });

    carritoContainer.classList.add("visible");
  } else {
    // Ocultar el carrito si está completamente vacío
    carritoContainer.classList.remove("visible");
    mainContent.style.paddingBottom = "";
  }

  updateActionButtonsState();
}

function updateActionButtonsState() {
  const btnEnvio = document.getElementById("btn-abrir-envio-modal");
  const btnCargo = document.getElementById("btn-agregar-cargo-rapido");
  const btnDescuento = document.getElementById("btn-aplicar-descuento-rapido");
  const btnCliente = document.getElementById("btn-seleccionar-cliente-rapido");
  const btnPa = document.getElementById("btn-agregar-pa-rapido");

  // Comprobar estado para Envío
  if (btnEnvio) {
    const hasEnvio = cartItems.some(
      (item) => item.productId === "ENVIO" && item.optionId !== "mostrador"
    );
    btnEnvio.classList.toggle("active", hasEnvio);
  }

  // Comprobar estado para Cliente
  if (btnCliente) {
    btnCliente.classList.toggle("active", selectedClient !== null);
  }

  // Comprobar estado para Descuento
  if (btnDescuento) {
    const hasDescuento = cartItems.some((item) => item.discount);
    btnDescuento.classList.toggle("active", hasDescuento);
  }

  // Comprobar estado para Cargo y PA
  if (btnCargo)
    btnCargo.classList.toggle(
      "active",
      cartItems.some((item) => item.productId === "CARGO")
    );
  if (btnPa)
    btnPa.classList.toggle(
      "active",
      cartItems.some((item) => item.productId === "PA")
    );
}

// --- Funciones Auxiliares de Renderizado de Items ---

// Renderiza un item de producto de pollo (ahora también maneja descuentos)
function renderProductItem(item) {
  const productCell = document.createElement("td");

  // Usar item.optionName si está disponible, de lo contrario item.optionId
  const optionNameDisplay = item.optionName || item.productId; // Usar productId como fallback si optionName no está definido
  // Asegurarse de que item.optionId exista y sea diferente del productId para mostrar el detalle del ID si es una variante/subproducto
  const optionDetailId =
    item.optionId && item.optionId !== item.productId
      ? ` (${item.optionId})`
      : ""; // Incluir paréntesis aquí

  // Construir el string de personalizaciones
  let personalizationsString = "";
  if (item.personalizations) {
    // Aplanar todos los nombres de personalización de todos los grupos
    const allPersonalizations = Object.values(item.personalizations).flat();
    if (allPersonalizations.length > 0) {
      // Unir las personalizaciones con coma y espacio, y encerrarlas en paréntesis
      personalizationsString = ` (${allPersonalizations.join(", ")})`;
    }
  }

  let itemHtml = "";

  // --- Lógica para mostrar descuento si existe ---
  if (item.discount) {
    // Mostrar formato detallado con descuento
    const originalCost = item.discount.originalCost;
    const originalUnitPrice =
      item.quantity > 0 ? originalCost / item.quantity : 0;
    const newUnitPrice = item.quantity > 0 ? item.cost / item.quantity : 0; // item.cost ya es el costo final

    itemHtml = `
            <div class="item-nombre">${optionNameDisplay}${personalizationsString}</div>
            <div class="item-detalle">${item.quantity.toFixed(
              3
            )}(kg) * $${originalUnitPrice.toFixed(2)}</div>
            <div class="item-detalle item-descuento-detalle" style="color: var(--rojo-error);">${
              item.discount.descripcion
            }</div> <!-- Estilo para descuento -->
            <div class="item-detalle">${item.quantity.toFixed(
              3
            )}(kg) * $${newUnitPrice.toFixed(
      2
    )}</div> <!-- Nuevo precio unitario -->
        `;
    // Nota: El subtotal final ($item.cost.toFixed(2)) se muestra en la celda .item-subtotal
  } else {
    // Mostrar formato estándar sin descuento
    const unitPriceDisplay =
      item.pricePerKg !== undefined && item.pricePerKg !== null
        ? item.pricePerKg.toFixed(2) // Usar el precio del catálogo si está almacenado
        : item.quantity > 0
        ? (item.cost / item.quantity).toFixed(2)
        : "0.00"; // Fallback si no está almacenado o cantidad es 0

    itemHtml = `
            <div class="item-nombre">${optionNameDisplay}${personalizationsString}</div>
            <div class="item-detalle">${item.quantity.toFixed(
              3
            )}(kg) * $${unitPriceDisplay}</div>
        `;
  }

  productCell.innerHTML = itemHtml;

  return productCell;
}

// Renderiza un item de envío
function renderEnvioItem(item) {
  const productCell = document.createElement("td");

  // Mostrar solo el nombre y la descripción/monto
  const envioDesc =
    item.personalizations &&
    item.personalizations.descripcion &&
    item.personalizations.descripcion.length > 0
      ? item.personalizations.descripcion[0] // Asumimos que la descripción manual está en el primer elemento
      : item.descripcion || ""; // Fallback a la descripción original si no hay personalización

  productCell.innerHTML = `
        <div class="item-nombre">${item.optionName}</div>
        <div class="item-detalle">${envioDesc}</div>
    `;

  return productCell;
}

// Renderiza un item de cargo manual
function renderCargoItem(item) {
  const productCell = document.createElement("td");

  // Obtener la descripción ingresada por el usuario desde personalizations
  const cargoDescription =
    item.personalizations &&
    item.personalizations.descripcion &&
    item.personalizations.descripcion.length > 0
      ? item.personalizations.descripcion[0]
      : "Cargo Manual"; // Usar 'Cargo Manual' como fallback si por alguna razón no hay descripción (aunque el input es requerido)

  productCell.innerHTML = `
        <div class="item-nombre">${cargoDescription}</div> <!-- Descripción ingresada por el usuario -->
        <div class="item-detalle">Cargo Manual</div> <!-- Nombre fijo como detalle -->
    `;

  return productCell;
}

// <-- NUEVA: Renderiza un item de Producto Adicional (PA) -->
function renderPaItem(item) {
  const productCell = document.createElement("td");

  // Obtener la descripción ingresada por el usuario desde personalizations
  const paDescription =
    item.personalizations &&
    item.personalizations.descripcion &&
    item.personalizations.descripcion.length > 0
      ? item.personalizations.descripcion[0]
      : "Producto Adicional"; // Usar 'Producto Adicional' como fallback si no hay descripción

  // Mostrar la descripción y el costo (si tiene)
  // Eliminamos la lógica de añadir el costo aquí, ya que el costo total se muestra en la columna de subtotal
  // let paDetails = paDescription;
  // if (item.cost > 0) {
  //     paDetails += ` ($${item.cost.toFixed(2)})`;
  // }

  // --- MODIFICACIÓN: Intercambiar nombre y detalle ---
  productCell.innerHTML = `
        <div class="item-nombre">${paDescription}</div> <!-- Descripción ingresada por el usuario -->
        <div class="item-detalle">${item.optionName}</div> <!-- Nombre fijo: Producto Adicional -->
    `;
  // --> Fin de la MODIFICACIÓN <--

  return productCell;
}
// --> Fin de la NUEVA función <--

// --- Handlers de botones de acción ---

function handleCobrar() {
  console.log('[Carrito] Botón "Cobrar" clicado.');
  if (cartItems.length === 0) {
    alert("El carrito está vacío. No se puede cobrar.");
    return;
  }

  const total = cartItems.reduce((acc, item) => acc + item.cost, 0);

  // AÑADIDO: Crear el objeto de venta completo
  const ventaData = {
    id: `VTA-${Date.now()}`, // ID de venta único
    cliente: selectedClient,
    items: [...cartItems], // Copia inmutable de los items
    total: Math.round(total),
  };
  console.log("[Carrito] Preparando datos para cobrar:", ventaData);

  // MODIFICADO: Abrir el modal de cobro, pasando el objeto de venta y el callback
  openCobrarModal(ventaData, () => {
    console.log("[Carrito] Callback de venta exitosa ejecutado.");

    // Limpiar el carrito actual
    cartItems.length = 0;
    setCliente(null);
  });
}

// --- AÑADIDO: Función para generar un ID de pedido único ---
function generateUniquePedidoId() {
  const existingIds = new Set(pedidosGuardados.map((p) => p.id));
  let newId;
  do {
    // Generar un número aleatorio entre 10000 y 99999
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    newId = `PED-${randomNum}`;
  } while (existingIds.has(newId)); // Repetir si el ID ya existe
  return newId;
}

function handleGuardarPedido() {
  console.log('[Carrito] Botón "Guardar Pedido" clicado.');

  if (cartItems.length === 0) {
    alert("No puedes guardar un pedido vacío.");
    return;
  }

  // Crear un nuevo objeto de pedido
  const nuevoPedido = {
    id: generateUniquePedidoId(), // <-- Usar la nueva función para el ID
    clienteId: selectedClient ? selectedClient.id : null,
    faseId: FASES_PEDIDO.GUARDADO.id, // Fase inicial
    precioTipoPredominante: "Publico", // TODO: Calcular esto dinámicamente si es necesario
    fechaCreacion: new Date().toISOString(),
    items: [...cartItems], // Copiar los items del carrito
  };

  // Añadir el nuevo pedido a la lista de pedidos guardados
  pedidosGuardados.unshift(nuevoPedido); // Añadir al principio para que aparezca primero

  console.log("[Carrito] Pedido guardado:", nuevoPedido);
  alert("Pedido guardado con éxito.");

  // Limpiar el carrito actual
  cartItems.length = 0;
  setCliente(null); // Esto también llama a updateCarritoDisplay

  // Navegar a la vista de pedidos
  router.navigate("/pedidos");
}

// TODO: Considerar añadir funciones para editar cantidades de items directamente en la tabla o via un modal separado.
