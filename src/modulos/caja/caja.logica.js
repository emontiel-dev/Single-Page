import { openAñadirIngresoModal } from './caja.añadir.ingreso.modal.js';
import { openAñadirEgresoModal } from './caja.añadir.egreso.modal.js';
import { openRecargarDenominacionesModal } from './caja.recargar.denominaciones.modal.js';
import { openCorteCajaModal } from './caja.corte.caja.modal.js';

// Datos de ejemplo
const stockDenominaciones = {
    1000: 0, 500: 8, 200: 8, 100: 10, 50: 3, 20: 8, 10: 10, 5: 3, 2: 10, 1: 10, 0.5: 10
};

const movimientos = [
    { origen: 'Sistema', hora: '10:01 AM', tipo: 'Ingreso(Venta)', monto: 26, tipoMonto: 'ingreso' },
    { origen: 'Sistema', hora: '09:54 AM', tipo: 'Ingreso(Venta)', monto: 63, tipoMonto: 'ingreso' },
    { origen: 'Sistema', hora: '09:35 AM', tipo: 'Ingreso(Venta)', monto: 124, tipoMonto: 'ingreso' },
    { origen: 'Sistema', hora: '09:27 AM', tipo: 'Ingreso(Venta)', monto: 263, tipoMonto: 'ingreso' },
    { origen: 'Sistema', hora: '09:25 AM', tipo: 'Egreso(Compra PA)', monto: -25, tipoMonto: 'egreso' },
    { origen: 'Sistema', hora: '09:23 AM', tipo: 'Ingreso(Venta)', monto: 215, tipoMonto: 'ingreso' },
];

const denominacionColors = {
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
        item.innerHTML = `
            <div class="movimiento-origen-hora">
                <div class="origen">${mov.origen}</div>
                <div class="hora">${mov.hora}</div>
            </div>
            <div class="movimiento-tipo">${mov.tipo}</div>
            <div class="movimiento-monto ${mov.tipoMonto}">${montoFormateado}</div>
        `;
        lista.appendChild(item);
    });
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