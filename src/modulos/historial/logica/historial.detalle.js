// filepath: src/modulos/historial/logica/historial.detalle.js

// Importaciones de otros módulos
import { renderHistorial } from "../historial.js";
import { ventasDelDia } from "../../caja/logica/caja.ventas.datos.js";

// Objeto para almacenar todas las referencias del DOM para un acceso eficiente
const dom = {};

// Función principal para renderizar el detalle de una venta
export async function renderVentaDetalle(container, ventaId) {
  const venta = ventasDelDia.find((v) => v.id === ventaId);
  if (!venta) {
    console.error(`Venta con ID ${ventaId} no encontrada.`);
    container.innerHTML = "<p>Error: Venta no encontrada.</p>";
    return;
  }

  const response = await fetch(
    "src/modulos/historial/views/historial.detalle.html"
  );
  container.innerHTML = await response.text();

  // Capturamos todas las referencias del DOM una única vez
  captureDomElements(container);

  // Renderizar Encabezado con datos de la venta
  dom.ventaId.textContent = venta.id;
  const fecha = new Date(venta.fechaCompletado);
  const fechaFormateada = fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaFormateada = fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  dom.ventaFecha.textContent = `${fechaFormateada} - ${horaFormateada}`;

  // Añadir event listeners usando los nuevos selectores de atributos
  dom.btnVolver.addEventListener("click", () => renderHistorial(dom.container));
  // Aquí podrías añadir listeners para los otros botones de "imprimir", "whatsapp", etc.
  // dom.btnImprimir.addEventListener('click', () => { /* tu lógica aquí */ });

  // Orquesta el renderizado de todo el contenido del detalle
  renderDetalleContent(venta);
}

// Función auxiliar para capturar todos los elementos del DOM y guardarlos en el objeto 'dom'
function captureDomElements(container) {
  dom.container = container;
  dom.ventaId = container.querySelector('[data-js-id="venta-id"]');
  dom.ventaFecha = container.querySelector('[data-js-id="venta-fecha"]');
  dom.btnVolver = container.querySelector('[data-action="volver-historial"]');
  dom.polloSection = container.querySelector(".items-subsection.pollo-items");
  dom.paSection = container.querySelector(".items-subsection.pa-items");
  dom.polloList = container.querySelector('[data-js-id="items-pollo"]');
  dom.paList = container.querySelector('[data-js-id="items-pa"]');
  dom.clienteInfo = container.querySelector('[data-js-id="cliente-info"]');
  dom.totales = container.querySelector('[data-js-id="totales"]');
  dom.pago = container.querySelector('[data-js-id="pago"]');
}

// Lógica principal para clasificar y renderizar el contenido
function renderDetalleContent(venta) {
  // Clasificar items
  const polloItems = venta.items.filter(
    (item) =>
      item.productId !== "PA" &&
      item.productId !== "CARGO" &&
      item.productId !== "ENVIO"
  );
  const paItems = venta.items.filter((item) => item.productId === "PA");

  // Renderizar cada sección
  renderClienteInfo(venta.cliente);
  // Usamos la función genérica para renderizar cada lista de ítems
  renderItems(
    polloItems,
    dom.polloList,
    renderPolloItemDetalle,
    dom.polloSection
  );
  renderItems(paItems, dom.paList, renderPaItemDetalle, dom.paSection);
  renderTotales(venta);
  renderPago(venta);
}

// Función genérica para renderizar listas de ítems
function renderItems(items, container, renderFunction, sectionContainer) {
  if (!container || !sectionContainer) return;

  container.innerHTML = "";

  if (items.length > 0) {
    sectionContainer.classList.remove("hidden");
    items.forEach((item) => container.appendChild(renderFunction(item)));
  } else {
    sectionContainer.classList.add("hidden");
  }
}

// RENDERIZADO ESPECÍFICO DE SECCIONES

function renderClienteInfo(cliente) {
  const container = dom.clienteInfo;
  if (!container) return;

  if (cliente && cliente.nombre !== "Cliente Mostrador") {
    container.innerHTML = `
            <p><strong>Cliente:</strong> ${cliente.nombre}</p>
            ${
              cliente.telefono
                ? `<p><strong>Teléfono:</strong> ${cliente.telefono}</p>`
                : ""
            }
            ${
              cliente.direccion
                ? `<p><strong>Dirección:</strong> ${cliente.direccion}</p>`
                : ""
            }
        `;
  } else {
    container.innerHTML = `<p><strong>Cliente:</strong> Mostrador</p>`;
  }
}

function renderTotales(venta) {
  const container = dom.totales;
  if (!container) return;
  container.innerHTML = "";

  const subtotal = venta.items
    .filter((item) => item.productId !== "CARGO" && item.productId !== "ENVIO")
    .reduce((acc, item) => acc + item.cost, 0);

  container.appendChild(createTotalRow("Subtotal", subtotal.toFixed(2)));

  const cargosEnVenta = venta.items.filter(
    (item) => item.productId === "CARGO" || item.productId === "ENVIO"
  );
  cargosEnVenta.forEach((cargo) => {
    const esCargoManual =
      cargo.productId === "CARGO" && cargo.optionId === "manual";
    const label =
      esCargoManual && cargo.personalizations?.descripcion?.[0]
        ? cargo.personalizations.descripcion[0]
        : cargo.optionName;
    container.appendChild(createTotalRow(label, cargo.cost.toFixed(2)));
  });
  if (venta.comisionPA && venta.comisionPA > 0) {
    container.appendChild(
      createTotalRow("Comisión PA", venta.comisionPA.toFixed(2))
    );
  }

  container.appendChild(createTotalRow("TOTAL", venta.total.toFixed(2), true));
}

function renderPago(venta) {
  const container = dom.pago;
  if (!container) return;

  if (!venta.pagoCon || Object.keys(venta.pagoCon).length === 0) {
    container.style.display = "none";
    return;
  }

  const sortDesc = (a, b) => Number(b[0]) - Number(a[0]);

  const pagoConHtml = Object.entries(venta.pagoCon)
    .sort(sortDesc)
    .map(([valor, cant]) => `<li>$${valor} &times; ${cant}</li>`)
    .join("");

  const cambioHtml = Object.entries(venta.cambioEntregado)
    .sort(sortDesc)
    .map(([valor, cant]) => `<li>$${valor} &times; ${cant}</li>`)
    .join("");

  const totalPagado = Object.entries(venta.pagoCon).reduce(
    (acc, [valor, cant]) => acc + valor * cant,
    0
  );

  container.innerHTML = `
        <div class="payment-section">
            <strong>Pagó con: $${totalPagado.toFixed(2)}</strong>
            <ul>${pagoConHtml}</ul>
        </div>
        <div class="payment-section">
            <strong>Cambio entregado: $${(totalPagado - venta.total).toFixed(
              2
            )}</strong>
            <ul>${cambioHtml}</ul>
        </div>
    `;
}

// --- Funciones Auxiliares de Renderizado para ítems ---

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

function renderPolloItemDetalle(item) {
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

  const originalUnitPrice =
    item.pricePerKg !== undefined && item.pricePerKg !== null
      ? item.pricePerKg
      : item.discount && item.discount.originalCost && item.quantity > 0
      ? item.discount.originalCost / item.quantity
      : item.cost > 0 && item.quantity > 0
      ? item.cost / item.quantity
      : 0;

  const quantityPriceLine = document.createElement("div");
  quantityPriceLine.textContent = `${item.quantity.toFixed(
    3
  )}(kg) × $${originalUnitPrice.toFixed(2)}`;
  detailsContainer.appendChild(quantityPriceLine);

  if (item.discount) {
    const discountType = item.discount.tipoDescuentoAplicado;
    const originalCost = item.discount.originalCost;
    const discountAmount = item.discount.monto;
    const newPricePerKg = item.discount.newPricePerKg;

    const discountDetailsDiv = document.createElement("div");
    discountDetailsDiv.className = "discount-details";

    let discountDetailsHtml = "";
    switch (discountType) {
      case "Cantidad":
        discountDetailsHtml = `Dto. por cantidad: -$${discountAmount.toFixed(
          2
        )}`;
        break;
      case "Porcentaje":
        const percentageApplied =
          originalCost > 0 ? (discountAmount / originalCost) * 100 : 0;
        discountDetailsHtml = `Dto. por porcentaje (${percentageApplied.toFixed(
          1
        )}%): -$${discountAmount.toFixed(2)}`;
        break;
      case "Precio por Kg":
        discountDetailsHtml = `Precio por kg cambiado: $${originalUnitPrice.toFixed(
          2
        )} → $${newPricePerKg.toFixed(2)}`;
        break;
      default:
        discountDetailsHtml = `${
          item.discount.descripcion || "Dto. aplicado"
        }: -$${(discountAmount || 0).toFixed(2)}`;
        break;
    }
    discountDetailsDiv.innerHTML = discountDetailsHtml;
    detailsContainer.appendChild(discountDetailsDiv);
  }

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
