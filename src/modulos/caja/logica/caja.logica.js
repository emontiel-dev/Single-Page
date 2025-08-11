import { openAñadirIngresoModal } from './caja.añadir.ingreso.modal.js';
import { openAñadirEgresoModal } from './caja.añadir.egreso.modal.js';
import { openRecargarDenominacionesModal } from './caja.recargar.denominaciones.modal.js';
import { openCorteCajaModal } from './caja.corte.caja.modal.js';
import { openMovimientoDetalleModal } from './movimiento.detalle.modal.js'; // <-- AÑADIR
import { ventasDelDia } from './caja.ventas.datos.js'; // <-- MODIFICADO: Importación local

// Datos de ejemplo
export const stockDenominaciones = {
    1000: 0, 500: 0, 200: 6, 100: 6, 50: 6, 20: 8, 10: 20, 5: 20, 2: 10, 1: 10, 0.5: 10
};

// AÑADIDO: Exportar los colores para que sean reutilizables
export const denominacionColors = {
    1000: '#A774F2', 500: '#3498DB', 200: '#2ECC71', 100: '#E74C3C',
    50: '#F1C40F', 20: '#E67E22', 10: '#95A5A6', 5: '#7D3C98',
    2: '#1ABC9C', 1: '#34495E', 0.5: '#F39C12'
};

const movimientos = [
    //{ origen: 'Sistema', hora: '10:01 AM', tipo: 'Ingreso(Venta)', monto: 26, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:54 AM', tipo: 'Ingreso(Venta)', monto: 63, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:35 AM', tipo: 'Ingreso(Venta)', monto: 124, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:27 AM', tipo: 'Ingreso(Venta)', monto: 263, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:25 AM', tipo: 'Egreso(Compra PA)', monto: -25, tipoMonto: 'egreso' },
    //{ origen: 'Sistema', hora: '09:23 AM', tipo: 'Ingreso(Venta)', monto: 215, tipoMonto: 'ingreso' },
];

function renderStock() {
    const grid = document.getElementById('caja-stock-grid');
    const totalEl = document.getElementById('caja-total-acumulado');
    if (!grid || !totalEl) return;

    grid.innerHTML = '';
    let totalAcumulado = 0;

    // Simplificado: Iteramos sobre todas las denominaciones. El CSS se encarga de las columnas.
    Object.entries(stockDenominaciones)
        .sort((a, b) => b[0] - a[0]) // Ordenar de mayor a menor
        .forEach(([valor, cantidad]) => {
            const item = document.createElement('div');
            item.className = 'denominacion-item';

            // --- ESTRUCTURA SIMPLIFICADA ---
            // Se elimina el multiplicador y se usa un layout más limpio.
            item.innerHTML = `
                <span class="denominacion-valor" style="background-color: ${denominacionColors[valor] || '#7f8c8d'}">${valor}</span>
                <span class="denominacion-cantidad">${cantidad}</span>
            `;
            grid.appendChild(item);
        });

    // Calcular el total acumulado (sin cambios en esta parte)
    Object.entries(stockDenominaciones).forEach(([valor, cantidad]) => {
        totalAcumulado += parseFloat(valor) * cantidad;
    });

    totalEl.textContent = `$${totalAcumulado.toFixed(2)}`;
}

function renderMovimientos() {
    const lista = document.getElementById('caja-movimientos-lista');
    if (!lista) return;

    lista.innerHTML = '';
    movimientos.forEach((mov, index) => { // <-- AÑADIR 'index'
        const item = document.createElement('div');
        item.className = 'movimiento-item';
        item.dataset.index = index; // <-- AÑADIR: Vincular el elemento con su dato
        const montoFormateado = mov.monto < 0 ? `-$${Math.abs(mov.monto).toFixed(2)}` : `$${mov.monto.toFixed(2)}`;
        
        // --- MODIFICACIÓN: Separar tipo y concepto ---
        let tipoHtml = '';
        const tipoMatch = mov.tipo.match(/(.+?)\s*\((.+?)\)/);

        if (tipoMatch) {
            const tipoPrincipal = tipoMatch[1].trim();
            const concepto = tipoMatch[2].trim();
            tipoHtml = `
                <span class="tipo-principal">${tipoPrincipal}</span>
                <span class="tipo-concepto">(${concepto})</span>
            `;
        } else {
            tipoHtml = `<span class="tipo-principal">${mov.tipo}</span>`;
        }
        // --- FIN MODIFICACIÓN ---

        item.innerHTML = `
            <div class="movimiento-origen-hora">
                <div class="origen">${mov.origen}</div>
                <div class="hora">${mov.hora}</div>
            </div>
            <div class="movimiento-tipo">${tipoHtml}</div>
            <div class="movimiento-monto ${mov.tipoMonto}">${montoFormateado}</div>
        `;
        lista.appendChild(item);
    });
}

// --- MODIFICADA: Acepta denominaciones de ingreso y egreso (cambio) ---
export function registrarIngresoManual(concepto, monto, denominacionesIngresadas, denominacionesDeCambio) {
    console.log('[Caja Lógica] Registrando ingreso manual:', { concepto, monto, denominacionesIngresadas, denominacionesDeCambio });
    // 1. Actualizar el stock: entra el pago, sale el cambio
    for (const valor in denominacionesIngresadas) {
        stockDenominaciones[valor] = (stockDenominaciones[valor] || 0) + denominacionesIngresadas[valor];
    }
    for (const valor in denominacionesDeCambio) {
        stockDenominaciones[valor] -= denominacionesDeCambio[valor];
    }

    // 2. Añadir un único movimiento de ingreso por el monto real
    const nuevoMovimiento = {
        origen: 'Manual',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Ingreso (${concepto})`,
        monto: monto,
        tipoMonto: 'ingreso',
        // --- AÑADIDO: Guardar detalles ---
        detalles: {
            pagoCon: denominacionesIngresadas,
            cambioEntregado: denominacionesDeCambio
        }
    };
    movimientos.unshift(nuevoMovimiento);

    // 3. Re-renderizar la UI
    renderStock();
    renderMovimientos();
}

// --- MODIFICADA: Acepta denominaciones de egreso y de ingreso (cambio recibido) ---
export function registrarEgresoManual(concepto, monto, denominacionesEgresadas, denominacionesDeCambioRecibido) {
    console.log('[Caja Lógica] Registrando egreso manual:', { concepto, monto, denominacionesEgresadas, denominacionesDeCambioRecibido });
    // 1. Actualizar el stock: sale el pago, entra el cambio
    for (const valor in denominacionesEgresadas) {
        stockDenominaciones[valor] -= denominacionesEgresadas[valor];
    }
    for (const valor in denominacionesDeCambioRecibido) {
        stockDenominaciones[valor] = (stockDenominaciones[valor] || 0) + denominacionesDeCambioRecibido[valor];
    }

    // 2. Añadir un único movimiento de egreso por el monto real
    const nuevoMovimiento = {
        origen: 'Manual',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Egreso (${concepto})`,
        monto: -monto,
        tipoMonto: 'egreso',
        // --- AÑADIDO: Guardar detalles ---
        detalles: {
            egresadoDeCaja: denominacionesEgresadas,
            cambioRecibido: denominacionesDeCambioRecibido
        }
    };
    movimientos.unshift(nuevoMovimiento);

    // 3. Re-renderizar la UI
    renderStock();
    renderMovimientos();
}

export function registrarRecargaDenominaciones(denominacionesEgreso, denominacionesIngreso, montoTotal) {
    // 1. Actualizar el stock (primero egreso, luego ingreso)
    for (const valor in denominacionesEgreso) {
        const cantidad = denominacionesEgreso[valor];
        if (stockDenominaciones.hasOwnProperty(valor)) {
            stockDenominaciones[valor] -= cantidad;
        }
    }
    for (const valor in denominacionesIngreso) {
        const cantidad = denominacionesIngreso[valor];
        if (stockDenominaciones.hasOwnProperty(valor)) {
            stockDenominaciones[valor] += cantidad;
        }
    }

    // 2. Añadir los dos movimientos al historial para un registro claro
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    
    const movimientoEgreso = {
        origen: 'Manual',
        hora: hora,
        tipo: 'Egreso (Recarga)',
        monto: -montoTotal,
        tipoMonto: 'egreso'
    };
    
    const movimientoIngreso = {
        origen: 'Manual',
        hora: hora,
        tipo: 'Ingreso (Recarga)',
        monto: montoTotal,
        tipoMonto: 'ingreso'
    };

    movimientos.unshift(movimientoIngreso);
    movimientos.unshift(movimientoEgreso);

    // 3. Re-renderizar la UI
    renderStock();
    renderMovimientos();
}

// --- NUEVA FUNCIÓN PARA CAMBIO DE REPARTIDOR (AHORA ROBUSTA) ---
export function registrarEgresoParaRepartidor(repartidor, montoCambio, denominacionesEgreso) {
    // 1. Actualizar el stock de denominaciones
    for (const valor in denominacionesEgreso) {
        if (stockDenominaciones.hasOwnProperty(valor)) {
            stockDenominaciones[valor] -= denominacionesEgreso[valor];
        }
    }

    // 2. Registrar el movimiento para seguimiento
    const nuevoMovimiento = {
        origen: 'Sistema',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Egreso (Cambio a ${repartidor.nombre})`,
        monto: -montoCambio,
        tipoMonto: 'egreso'
    };
    movimientos.unshift(nuevoMovimiento);

    // 3. Re-renderizar la UI de caja si está visible
    if (document.getElementById('caja-movimientos-lista')) {
        renderStock(); // <-- AÑADIDO: Actualizar el stock visualmente
        renderMovimientos();
    }
}

// --- NUEVA FUNCIÓN PARA PREPARAR CAMBIO DE ENTREGA ---
export function registrarCambioParaEntrega(pedido, repartidor, cambioDenominaciones) {
    let montoCambio = 0;
    // 1. Actualizar (descontar) el stock de denominaciones
    for (const valor in cambioDenominaciones) {
        const cantidad = cambioDenominaciones[valor];
        if (stockDenominaciones.hasOwnProperty(valor)) {
            stockDenominaciones[valor] -= cantidad;
            montoCambio += valor * cantidad;
        }
    }

    // 2. Registrar el movimiento para seguimiento
    const nuevoMovimiento = {
        origen: 'Sistema',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Egreso (Cambio p/ Ped. ${pedido.id} - ${repartidor.nombre})`,
        monto: -montoCambio,
        tipoMonto: 'egreso'
    };
    movimientos.unshift(nuevoMovimiento);

    // 3. Re-renderizar la UI de caja si está visible
    if (document.getElementById('caja-movimientos-lista')) {
        renderStock();
        renderMovimientos();
    }
}


// --- NUEVA FUNCIÓN DE VALIDACIÓN CENTRALIZADA ---
/**
 * Valida una selección de denominaciones contra un monto objetivo y el stock disponible.
 * @param {number} montoObjetivo - El monto que se debe alcanzar.
 * @param {number[]} denominacionesSeleccionadas - Array de las denominaciones seleccionadas.
 * @param {string} tipoOperacion - 'egreso' para validar contra el stock, 'ingreso' para ignorar el stock.
 * @returns {{esValido: boolean, mensaje: string, totalSeleccionado: number}}
 */
export function validarSeleccionDenominaciones(montoObjetivo, denominacionesSeleccionadas, tipoOperacion = 'egreso') {
    const totalSeleccionado = denominacionesSeleccionadas.reduce((acc, val) => acc + val, 0);

    // 1. Validar si hay stock suficiente (solo para egresos)
    if (tipoOperacion === 'egreso') {
        const conteoSeleccion = denominacionesSeleccionadas.reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {});
        for (const valor in conteoSeleccion) {
            if (stockDenominaciones[valor] < conteoSeleccion[valor]) {
                return {
                    esValido: false,
                    mensaje: `Stock insuficiente para $${valor}. Disponible: ${stockDenominaciones[valor]}.`,
                    totalSeleccionado
                };
            }
        }
    }

    // 2. Validar si el monto seleccionado coincide con el objetivo (solo si el objetivo es mayor a cero)
    if (montoObjetivo > 0 && parseFloat(totalSeleccionado.toFixed(2)) !== parseFloat(montoObjetivo.toFixed(2))) {
        return {
            esValido: false,
            mensaje: `El monto seleccionado ($${totalSeleccionado.toFixed(2)}) no coincide con el objetivo ($${montoObjetivo.toFixed(2)}).`,
            totalSeleccionado
        };
    }

    // 3. Si todo es correcto
    return {
        esValido: true,
        mensaje: 'Selección válida.',
        totalSeleccionado
    };
}


// --- NUEVAS FUNCIONES PARA EL PROCESO DE COBRO ---

export function calcularCambioGreedy(montoCambio) {
    const cambioDenominaciones = {};
    let cambioRestante = montoCambio;
    const denominacionesOrdenadas = Object.keys(stockDenominaciones).map(Number).sort((a, b) => b - a);

    for (const valor of denominacionesOrdenadas) {
        if (cambioRestante < valor) continue;
        
        const cantidadNecesaria = Math.floor(cambioRestante / valor);
        const cantidadDisponible = stockDenominaciones[valor];
        const cantidadAUsar = Math.min(cantidadNecesaria, cantidadDisponible);

        if (cantidadAUsar > 0) {
            cambioDenominaciones[valor] = cantidadAUsar;
            cambioRestante -= cantidadAUsar * valor;
            cambioRestante = parseFloat(cambioRestante.toFixed(2)); // Evitar errores de punto flotante
        }
    }

    if (cambioRestante > 0) {
        return { success: false, cambioDenominaciones: null, faltante: cambioRestante };
    }

    return { success: true, cambioDenominaciones, faltante: 0 };
}

export function registrarVenta(ventaData, denominacionesIngreso, denominacionesEgreso) {
    console.log('[Caja Lógica] Registrando venta:', { ventaData, denominacionesIngreso, denominacionesEgreso });
    // 1. Actualizar stock de caja (ingreso del pago, egreso del cambio)
    for (const valor in denominacionesIngreso) {
        stockDenominaciones[valor] = (stockDenominaciones[valor] || 0) + denominacionesIngreso[valor];
    }
    for (const valor in denominacionesEgreso) {
        stockDenominaciones[valor] -= denominacionesEgreso[valor];
    }

    // 2. Crear el movimiento para el historial de caja
    const nuevoMovimiento = {
        origen: 'Sistema',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Ingreso (Venta)`,
        monto: ventaData.total,
        tipoMonto: 'ingreso',
        // --- AÑADIDO: Guardar detalles ---
        detalles: {
            pagoCon: denominacionesIngreso,
            cambioEntregado: denominacionesEgreso,
            ventaId: ventaData.id // Referencia a la venta en el historial
        }
    };
    movimientos.unshift(nuevoMovimiento);

    // 3. CREAR Y GUARDAR LA INSTANTÁNEA COMPLETA DE LA VENTA
    const ventaCompleta = {
        ...ventaData,
        fechaCompletado: new Date().toISOString(),
        pagoCon: denominacionesIngreso,
        cambioEntregado: denominacionesEgreso
    };
    ventasDelDia.unshift(ventaCompleta); // Guardar en el módulo de historial

    // 4. Re-renderizar la UI de caja
    renderStock();
    renderMovimientos();
}

function setupActionButtons() {
    document.getElementById('btn-añadir-ingreso')?.addEventListener('click', openAñadirIngresoModal);
    document.getElementById('btn-añadir-egreso')?.addEventListener('click', openAñadirEgresoModal);
    document.getElementById('btn-recargar-denominaciones')?.addEventListener('click', openRecargarDenominacionesModal);
    document.getElementById('btn-corte-caja')?.addEventListener('click', openCorteCajaModal);
}

export function initCajaLogic() {
    console.log('[Caja Lógica] Inicializando lógica de caja.');
    renderStock();
    renderMovimientos();
    setupActionButtons();

    // --- AÑADIDO: Listener para los detalles del movimiento ---
    const movimientosLista = document.getElementById('caja-movimientos-lista');
    if (movimientosLista) {
        movimientosLista.addEventListener('click', (e) => {
            const item = e.target.closest('.movimiento-item');
            if (item && item.dataset.index) {
                const movimiento = movimientos[item.dataset.index];
                if (movimiento && movimiento.detalles) {
                    openMovimientoDetalleModal(movimiento);
                }
            }
        });
    }
}