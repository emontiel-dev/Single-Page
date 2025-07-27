import { trabajadoresDB, nominaConfig } from './logica/trabajadores.datos.js';
import { openTrabajadorIntegralModal } from './logica/trabajador.modal-integral.js';
import { openTrabajadorModal } from './logica/trabajador.añadir.modal.js'; // <-- Mantener para AÑADIR

let mainContainer = null;

/**
 * Renderiza la lista de trabajadores en el contenedor.
 * @param {HTMLElement} container - El elemento donde se renderizará la lista.
 * @param {Array<Object>} trabajadores - La lista de trabajadores a mostrar.
 */
function renderListaTrabajadores(container, trabajadores) {
    container.innerHTML = ''; // Limpiar lista anterior
    trabajadores.forEach(trabajador => {
        const item = document.createElement('div');
        item.className = 'trabajador-item';
        item.dataset.trabajadorId = trabajador.id;
        item.innerHTML = `
            <div class="trabajador-info">
                <div class="nombre">${trabajador.nombre} ${trabajador.apellidos}</div>
                <div class="cargo">${trabajador.cargo}</div>
            </div>
            <div class="trabajador-status">
                <span class="status-indicator ${trabajador.activo ? 'activo' : 'inactivo'}"></span>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Calcula y renderiza los KPIs.
 * @param {Array<Object>} trabajadores - La lista completa de trabajadores.
 */
function renderKPIs(trabajadores) {
    const activos = trabajadores.filter(t => t.activo);
    
    const nominaSemanal = activos.reduce((total, t) => {
        const cargoConfig = nominaConfig.cargos[t.cargo];
        if (cargoConfig) {
            const pagoDiario = cargoConfig.valorHora * nominaConfig.horasNormales;
            return total + (pagoDiario * nominaConfig.diasParaDescansoCompleto);
        }
        return total;
    }, 0);

    document.getElementById('kpi-trabajadores-activos').textContent = activos.length;
    document.getElementById('kpi-nomina-semanal').textContent = `$${nominaSemanal.toFixed(2)}`;
}

/**
 * Inicializa los event listeners para la sección de trabajadores.
 */
function initEventListeners() {
    const listaContainer = mainContainer.querySelector('.trabajadores-list-wrapper');
    listaContainer.addEventListener('click', (event) => {
        const item = event.target.closest('.trabajador-item');
        if (item) {
            const trabajadorId = parseInt(item.dataset.trabajadorId, 10);
            // La llamada ahora es más simple
            openTrabajadorIntegralModal(trabajadorId, () => {
                renderTrabajadores(mainContainer);
            });
        }
    });

    const btnAnadir = mainContainer.querySelector('#btn-anadir-trabajador');
    btnAnadir.addEventListener('click', () => {
        // Usamos el modal de añadir solo para CREAR. El primer argumento es el callback.
        openTrabajadorModal(() => {
            renderTrabajadores(mainContainer);
        });
    });
}

/**
 * Función principal para renderizar la vista de trabajadores.
 * @param {HTMLElement} container - El contenedor principal donde se renderizará la vista.
 */
export async function renderTrabajadores(container) {
    mainContainer = container;
    try {
        const response = await fetch('src/modulos/trabajadores/views/trabajadores.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista de trabajadores.');
        container.innerHTML = await response.text();

        const listaContainer = container.querySelector('.trabajadores-list-wrapper');
        
        // Por ahora, usamos la base de datos simulada
        const trabajadores = trabajadoresDB;

        renderKPIs(trabajadores);
        renderListaTrabajadores(listaContainer, trabajadores);
        initEventListeners();

    } catch (error) {
        console.error('Error al renderizar trabajadores:', error);
        container.innerHTML = `<p class="alerta-error">Error al cargar el módulo de trabajadores.</p>`;
    }
}