import { pedidosGuardados } from "./pedidos.guardados.datos.js";
import { findClienteById } from "../../clientes/logica/clientes.data.js";

// Objeto para almacenar referencias del DOM
const dom = {};

export async function renderPedidoGuardadoDetalle(
  container,
  pedidoId,
  onVolverCallback
) {
  const pedido = pedidosGuardados.find((p) => p.id === pedidoId);
  if (!pedido) {
    console.error(`Pedido con ID ${pedidoId} no encontrado.`);
    container.innerHTML = `<p>Error: Pedido no encontrado. <a href="#" id="volver-link">Volver</a></p>`;
    container.querySelector("#volver-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      onVolverCallback();
    });
    return;
  }

  try {
    const response = await fetch(
      "src/modulos/pedidos/views/pedido.guardado.detalle.html"
    );
    container.innerHTML = await response.text();

    captureDomElements(container);

    // Renderizar Encabezado
    dom.pedidoId.textContent = `Pedido: ${pedido.id}`;
    const fecha = new Date(pedido.fechaCreacion);
    dom.pedidoFecha.textContent = fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Añadir event listener
    dom.btnVolver.addEventListener("click", onVolverCallback);

    // Orquestar renderizado del contenido
    renderDetalleContent(pedido);
  } catch (error) {
    console.error("Error al renderizar el detalle del pedido:", error);
    container.innerHTML = `<p>Error al cargar la vista de detalle. <a href="#" id="volver-link">Volver</a></p>`;
    container.querySelector("#volver-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      onVolverCallback();
    });
  }
}

// Captura referencias del DOM
function captureDomElements(container) {
  dom.container = container;
  dom.pedidoId = container.querySelector('[data-js-id="pedido-id"]');
  dom.pedidoFecha = container.querySelector('[data-js-id="pedido-fecha"]');
  dom.btnVolver = container.querySelector('[data-action="volver-pedidos"]');
  dom.clienteInfo = container.querySelector('[data-js-id="cliente-info"]');
  dom.itemsList = container.querySelector('[data-js-id="items-lista"]');
  dom.totales = container.querySelector('[data-js-id="totales"]');
}

// Lógica principal para clasificar y renderizar el contenido
function renderDetalleContent(pedido) {
  const cliente = pedido.clienteId ? findClienteById(pedido.clienteId) : null;

  const itemsMostrables = pedido.items.filter(
    (item) => item.productId !== "ENVIO" && item.productId !== "CARGO"
  );

  renderClienteInfo(cliente);
  renderItems(itemsMostrables, dom.itemsList);
  renderTotales(pedido.items, dom.totales);
}

// Renderiza la lista de ítems
function renderItems(items, container) {
  if (!container) return;
  container.innerHTML = "";
  if (items.length > 0) {
    items.forEach((item) => container.appendChild(renderItemDetalle(item)));
  } else {
    container.innerHTML = "<li>No hay items en este pedido.</li>";
  }
}

// RENDERIZADO ESPECÍFICO DE SECCIONES
function renderClienteInfo(cliente) {
  const container = dom.clienteInfo;
  if (!container) return;

  if (cliente) {
    let nombreMostrado = `${cliente.nombre} ${cliente.apellidos || ""}`.trim();
    if (cliente.alias) nombreMostrado += ` (${cliente.alias})`;
    container.innerHTML = `<h4>Cliente</h4><p>${nombreMostrado}</p>`;
    container.classList.remove("hidden");
  } else {
    container.innerHTML = "";
    container.classList.add("hidden");
  }
}

function renderTotales(items, container) {
  if (!container) return;
  container.innerHTML = "";

  const subtotal = items
    .filter((item) => item.productId !== "ENVIO" && item.productId !== "CARGO")
    .reduce((acc, item) => acc + item.cost, 0);

  container.appendChild(createTotalRow("Subtotal", subtotal.toFixed(2)));

  const cargos = items.filter(
    (item) => item.productId === "ENVIO" || item.productId === "CARGO"
  );
  cargos.forEach((cargo) => {
    container.appendChild(
      createTotalRow(cargo.optionName, cargo.cost.toFixed(2))
    );
  });

  const total = items.reduce((acc, item) => acc + item.cost, 0);
  container.appendChild(
    createTotalRow("TOTAL", Math.round(total).toFixed(2), true)
  );
}

// --- Funciones Auxiliares de Renderizado para ítems ---

function renderItemDetalle(item) {
  if (item.productId === "PA") {
    return renderPaItemDetalle(item);
  }
  return renderPedidoItemDetalle(item);
}

function createBaseItemRow(item) {
  const li = document.createElement("li");
  li.className = "item-row-ui";

  const itemInfoDiv = document.createElement("div");
  itemInfoDiv.classList.add("item-info");

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("name");

  const detailsContainer = document.createElement("div");
  detailsContainer.classList.add("details");

  itemInfoDiv.appendChild(nameDiv);
  itemInfoDiv.appendChild(detailsContainer);
  li.appendChild(itemInfoDiv);

  const priceSpan = document.createElement("span");
  priceSpan.classList.add("item-price");
  priceSpan.textContent = `$${item.cost.toFixed(2)}`;
  li.appendChild(priceSpan);

  return { li, nameDiv, detailsContainer, priceSpan };
}

function renderPedidoItemDetalle(item) {
  const { li, nameDiv, detailsContainer } = createBaseItemRow(item);

  let nameText = item.optionName || item.productId;
  if (item.personalizations) {
    const allPersonalizations = Object.values(item.personalizations)
      .flat()
      .join(", ");
    if (allPersonalizations) {
      nameText += ` (${allPersonalizations})`;
    }
  }
  nameDiv.textContent = nameText;

  const detallesPartes = [];
  if (item.quantity) {
    const unitPrice = item.pricePerKg || item.cost / item.quantity || 0;
    detallesPartes.push(
      `${item.quantity.toFixed(3)}(kg) × $${unitPrice.toFixed(2)}`
    );
  }

  detailsContainer.textContent = detallesPartes.join(" | ");

  return li;
}

function renderPaItemDetalle(item) {
  const { li, nameDiv, detailsContainer } = createBaseItemRow(item);
  nameDiv.textContent =
    item.personalizations?.descripcion?.[0] || "Producto Adicional";
  detailsContainer.textContent = item.optionName;
  return li;
}

function createTotalRow(label, value, isGrandTotal = false) {
  const div = document.createElement("div");
  div.className = isGrandTotal ? "total-row-ui grand-total-ui" : "total-row-ui";
  div.innerHTML = `
        <span class="label">${label}</span>
        <span class="value">$${value}</span>
    `;
  return div;
}
