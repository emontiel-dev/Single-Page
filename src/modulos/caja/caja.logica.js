import { openAñadirIngresoModal } from './caja.añadir.ingreso.modal.js';
import { openAñadirEgresoModal } from './caja.añadir.egreso.modal.js';
import { openRecargarDenominacionesModal } from './caja.recargar.denominaciones.modal.js';
import { openCorteCajaModal } from './caja.corte.caja.modal.js';

// Datos de ejemplo
export const stockDenominaciones = {
    1000: 0, 500: 0, 200: 6, 100: 6, 50: 6, 20: 8, 10: 20, 5: 20, 2: 10, 1: 10, 0.5: 10
};

const movimientos = [
    //{ origen: 'Sistema', hora: '10:01 AM', tipo: 'Ingreso(Venta)', monto: 26, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:54 AM', tipo: 'Ingreso(Venta)', monto: 63, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:35 AM', tipo: 'Ingreso(Venta)', monto: 124, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:27 AM', tipo: 'Ingreso(Venta)', monto: 263, tipoMonto: 'ingreso' },
    //{ origen: 'Sistema', hora: '09:25 AM', tipo: 'Egreso(Compra PA)', monto: -25, tipoMonto: 'egreso' },
    //{ origen: 'Sistema', hora: '09:23 AM', tipo: 'Ingreso(Venta)', monto: 215, tipoMonto: 'ingreso' },
];

export const denominacionColors = { // <-- EXPORTAR COLORES
    1000: '#A774F2', 500: '#3498DB', 200: '#2ECC71', 100: '#E74C3C',
    50: '#F1C40F', 20: '#E67E22', 10: '#95A5A6', 5: '#7D3C98',
    2: '#1ABC9C', 1: '#34495E', 0.5: '#F39C12'
};

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
    movimientos.forEach(mov => {
        const item = document.createElement('div');
        item.className = 'movimiento-item';
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

// --- NUEVA FUNCIÓN EXPORTADA ---
export function registrarIngresoManual(concepto, monto, denominacionesIngresadas) {
    // 1. Actualizar el stock de denominaciones
    for (const valor in denominacionesIngresadas) {
        const cantidad = denominacionesIngresadas[valor];
        if (stockDenominaciones.hasOwnProperty(valor)) {
            stockDenominaciones[valor] += cantidad;
        }
    }

    // 2. Añadir el nuevo movimiento al historial
    const nuevoMovimiento = {
        origen: 'Manual',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Ingreso (${concepto})`,
        monto: monto,
        tipoMonto: 'ingreso'
    };
    movimientos.unshift(nuevoMovimiento); // Añadir al principio

    // 3. Re-renderizar la UI para reflejar los cambios
    renderStock();
    renderMovimientos();
}

export function registrarEgresoManual(concepto, monto, denominacionesEgresadas) {
    // 1. Actualizar el stock de denominaciones
    for (const valor in denominacionesEgresadas) {
        const cantidad = denominacionesEgresadas[valor];
        if (stockDenominaciones.hasOwnProperty(valor)) {
            stockDenominaciones[valor] -= cantidad;
        }
    }

    // 2. Añadir el nuevo movimiento al historial
    const nuevoMovimiento = {
        origen: 'Manual',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Egreso (${concepto})`,
        monto: -monto, // El monto del egreso es negativo
        tipoMonto: 'egreso'
    };
    movimientos.unshift(nuevoMovimiento); // Añadir al principio

    // 3. Re-renderizar la UI para reflejar los cambios
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

export function registrarVenta(pedidoTotal, denominacionesIngreso, denominacionesEgreso) {
    // 1. Registrar ingreso del pago
    for (const valor in denominacionesIngreso) {
        stockDenominaciones[valor] = (stockDenominaciones[valor] || 0) + denominacionesIngreso[valor];
    }

    // 2. Registrar egreso del cambio
    for (const valor in denominacionesEgreso) {
        stockDenominaciones[valor] -= denominacionesEgreso[valor];
    }

    // 3. Añadir movimiento de venta al historial
    const nuevoMovimiento = {
        origen: 'Sistema',
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        tipo: `Ingreso (Venta)`,
        monto: pedidoTotal,
        tipoMonto: 'ingreso'
    };
    movimientos.unshift(nuevoMovimiento);

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
    renderStock();
    renderMovimientos();
    setupActionButtons();
}