import {
  stockDenominaciones,
  registrarVenta,
  calcularCambioGreedy,
  denominacionColors,
} from "./caja.logica.js";

let modalElement = null;
const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
let totalPedido = 0;
let ventaActualData = null; // NUEVO: Para almacenar los datos de la venta
let pagoSeleccionado = [];
let onVentaSuccessCallback = null;

function closeCobrarModal() {
  if (modalElement) {
    console.log("[Cobrar Modal] Cerrando modal de cobro.");
    modalElement.remove();
    modalElement = null;
    pagoSeleccionado = [];
    onVentaSuccessCallback = null;
  }
}

// --- NUEVAS FUNCIONES EXPORTABLES Y REUTILIZABLES ---

/**
 * Renderiza los botones de todas las denominaciones disponibles.
 * @param {HTMLElement} gridContainer - El contenedor donde se renderizarán los botones.
 */
export function renderDenominacionBotones(gridContainer) {
  if (!gridContainer) return;
  gridContainer.innerHTML = "";
  denominaciones.forEach((valor) => {
    const color = denominacionColors[valor] || "#7f8c8d";
    const button = document.createElement("button");
    button.className = "denominacion-btn";
    button.dataset.valor = valor;
    button.style.backgroundColor = color;
    button.textContent = valor;
    gridContainer.appendChild(button);
  });
}

/**
 * Renderiza las "píldoras" de las denominaciones seleccionadas.
 * @param {HTMLElement} container - El contenedor para las píldoras.
 * @param {number[]} seleccionArray - El array con las denominaciones seleccionadas.
 */
export function renderDenominacionSeleccion(container, seleccionArray) {
  if (!container) return;
  container.innerHTML = "";
  const conteo = seleccionArray.reduce((acc, valor) => {
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});

  Object.entries(conteo)
    .sort((a, b) => b[0] - a[0])
    .forEach(([valor, cantidad]) => {
      const color = denominacionColors[valor] || "#7f8c8d";
      const pill = document.createElement("div");
      pill.className = "pago-seleccion-item";
      pill.style.backgroundColor = color;
      pill.innerHTML = `<span>${valor} x ${cantidad}</span><button class="remover-denominacion-btn" data-valor="${valor}">&times;</button>`;
      container.appendChild(pill);
    });
}

// --- FUNCIONES INTERNAS DEL MODAL (AHORA USAN LAS REUTILIZABLES) ---

function renderPagoSeleccionado() {
  const container = modalElement.querySelector("#cobrar-pago-seleccion");
  renderDenominacionSeleccion(container, pagoSeleccionado);
}

function renderCambioGrid(cambio) {
  const grid = modalElement.querySelector("#cobrar-cambio-grid");
  grid.innerHTML = "";
  if (!cambio || Object.keys(cambio).length === 0) {
    grid.innerHTML =
      '<p style="width: 100%; text-align: center; font-size: 0.9em; color: var(--gris-texto-secundario);">No se requiere cambio.</p>';
    return;
  }
  const sortedCambio = Object.entries(cambio).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  );
  for (const [valor, cantidad] of sortedCambio) {
    const color = denominacionColors[valor] || "#7f8c8d";
    const item = document.createElement("div");
    item.className = "pago-seleccion-item";
    item.style.backgroundColor = color;
    item.textContent = `${valor} x ${cantidad}`;
    grid.appendChild(item);
  }
}

// NUEVA FUNCIÓN: Actualiza todo el estado del cobro en tiempo real
function updateCobroState() {
  const totalPagado = pagoSeleccionado.reduce((acc, valor) => acc + valor, 0);
  console.log(
    `[Cobrar Modal] Actualizando estado: Total Pedido: $${totalPedido.toFixed(
      2
    )}, Total Pagado: $${totalPagado.toFixed(2)}`
  );
  modalElement.querySelector(
    "#cobrar-total-pagado"
  ).textContent = `$${totalPagado.toFixed(2)}`;

  const cambio = totalPagado - totalPedido;
  const confirmarBtn = modalElement.querySelector(
    "#cobrar-modal-confirmar-btn"
  );
  const alertaInsuficiente = modalElement.querySelector(
    "#cobrar-cambio-insuficiente"
  );

  if (cambio < 0) {
    modalElement.querySelector("#cobrar-total-cambio").textContent = "$0.00";
    renderCambioGrid(null);
    confirmarBtn.disabled = true;
    alertaInsuficiente.style.display = "none";
    return;
  }

  modalElement.querySelector(
    "#cobrar-total-cambio"
  ).textContent = `$${cambio.toFixed(2)}`;
  const resultadoCambio = calcularCambioGreedy(cambio);

  console.log(
    "[Cobrar Modal] Denominaciones de cambio calculadas:",
    resultadoCambio.cambioDenominaciones
  );

  if (resultadoCambio.success) {
    renderCambioGrid(resultadoCambio.cambioDenominaciones);
    alertaInsuficiente.style.display = "none";
    confirmarBtn.disabled = false;
  } else {
    console.warn(
      "[Cobrar Modal] No hay cambio suficiente en caja.",
      resultadoCambio
    );
    renderCambioGrid(null);
    alertaInsuficiente.style.display = "block";
    confirmarBtn.disabled = true;
  }
}

function handleDenominacionClick(event) {
  const button = event.target.closest(".denominacion-btn");
  if (!button) return;
  pagoSeleccionado.push(parseFloat(button.dataset.valor));
  renderPagoSeleccionado();
  updateCobroState();
}

function handleRemoverDenominacionClick(event) {
  if (!event.target.classList.contains("remover-denominacion-btn")) return;
  const valor = parseFloat(event.target.dataset.valor);
  const index = pagoSeleccionado.lastIndexOf(valor);
  if (index > -1) {
    pagoSeleccionado.splice(index, 1);
  }
  renderPagoSeleccionado();
  updateCobroState();
}

function renderPagoDenominaciones() {
  const grid = modalElement.querySelector("#cobrar-pago-grid");
  renderDenominacionBotones(grid);
}

// Ya no hay pasos, esta función confirma la transacción final
function handleConfirmarVenta() {
  console.log("[Cobrar Modal] Confirmando venta.");
  const totalPagado = pagoSeleccionado.reduce((acc, valor) => acc + valor, 0);
  const cambio = totalPagado - totalPedido;
  const resultadoCambio = calcularCambioGreedy(cambio);

  if (totalPagado < totalPedido || !resultadoCambio.success) {
    alert(
      "No se puede confirmar la venta. Verifique el pago o el cambio disponible."
    );
    return;
  }

  const denominacionesPago = pagoSeleccionado.reduce((acc, valor) => {
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});

  // MODIFICADO: Pasar el objeto ventaActualData completo a registrarVenta
  registrarVenta(
    ventaActualData,
    denominacionesPago,
    resultadoCambio.cambioDenominaciones
  );
  console.log("[Cobrar Modal] Venta registrada. Ejecutando callback de éxito.");

  if (onVentaSuccessCallback) {
    onVentaSuccessCallback();
  }
  closeCobrarModal();
}

export async function openCobrarModal(ventaData, onVentaSuccess) {
  console.log("[Cobrar Modal] Abriendo modal de cobro para venta:", ventaData);
  ventaActualData = ventaData; // Guardar los datos de la venta
  totalPedido = ventaData.total; // Usar el total del objeto de venta
  onVentaSuccessCallback = onVentaSuccess;

  const response = await fetch("src/modulos/caja/views/caja.cobrar.modal.html");
  document.body.insertAdjacentHTML("beforeend", await response.text());
  modalElement = document.getElementById("caja-cobrar-modal-container");

  modalElement.querySelector(
    "#cobrar-total-pedido"
  ).textContent = `$${totalPedido.toFixed(2)}`;
  renderPagoDenominaciones();
  updateCobroState(); // Llamada inicial para establecer el estado

  modalElement
    .querySelector("#cobrar-modal-cancelar-btn")
    .addEventListener("click", closeCobrarModal);
  modalElement
    .querySelector("#cobrar-modal-confirmar-btn")
    .addEventListener("click", handleConfirmarVenta);
  modalElement
    .querySelector("#cobrar-pago-grid")
    .addEventListener("click", handleDenominacionClick);
  modalElement
    .querySelector("#cobrar-pago-seleccion")
    .addEventListener("click", handleRemoverDenominacionClick);

  modalElement.classList.add("visible");
}
