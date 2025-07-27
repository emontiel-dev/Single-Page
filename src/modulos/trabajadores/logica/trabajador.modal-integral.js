import { trabajadoresDB, ROLES, PERMISOS, nominaConfig } from './trabajadores.datos.js';

let modalElement = null;
let onUpdateCallback = null;
let currentTrabajador = null;
let selectedDateForEditing = null; // <-- NUEVO: Para saber qué día se está editando

const ESTATUS_ASISTENCIA = { ASISTIO: 'asistio', FALTA: 'falta', RETARDO: 'retardo', DESCANSO: 'descanso', PENDIENTE: 'pendiente' };
const DIAS_SEMANA_ABR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_SEMANA_COMPLETO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// --- LÓGICA DE PESTAÑAS ---
function switchTab(event) {
    const tabId = event.target.dataset.tab;
    if (!tabId) return;

    modalElement.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    modalElement.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    modalElement.querySelector(`#tab-${tabId}`).classList.add('active');
}

// --- LÓGICA DE GUARDADO CENTRALIZADA ---
function handleSave() {
    // Guardar datos de la pestaña "Información General"
    currentTrabajador.nombre = modalElement.querySelector('#trabajador-nombre').value.trim();
    currentTrabajador.apellidos = modalElement.querySelector('#trabajador-apellidos').value.trim();
    currentTrabajador.cargo = modalElement.querySelector('#trabajador-cargo').value.trim();
    currentTrabajador.diaDescanso = modalElement.querySelector('#trabajador-descanso').value;

    // Guardar datos de la pestaña "Usuario y Permisos"
    const username = modalElement.querySelector('#usuario-username').value.trim();
    if (!username) {
        currentTrabajador.usuario = null;
    } else {
        if (!currentTrabajador.usuario) currentTrabajador.usuario = {};
        currentTrabajador.usuario.username = username;
        currentTrabajador.usuario.rol = modalElement.querySelector('#usuario-rol').value;
        const permisosSeleccionados = [];
        modalElement.querySelectorAll('#usuario-permisos-container input:checked').forEach(cb => permisosSeleccionados.push(cb.value));
        currentTrabajador.usuario.permisos = permisosSeleccionados;
    }

    console.log('Trabajador actualizado:', currentTrabajador);
    if (onUpdateCallback) onUpdateCallback();
    closeAndRemoveModal();
}

// --- LÓGICA DE RENDERIZADO DE PESTAÑAS ---
function populateGeneralTab() {
    modalElement.querySelector('#trabajador-nombre').value = currentTrabajador.nombre;
    modalElement.querySelector('#trabajador-apellidos').value = currentTrabajador.apellidos;
    modalElement.querySelector('#trabajador-cargo').value = currentTrabajador.cargo;
    modalElement.querySelector('#trabajador-descanso').value = currentTrabajador.diaDescanso;
}

function populateUsuarioTab() {
    const rolSelect = modalElement.querySelector('#usuario-rol');
    rolSelect.innerHTML = Object.values(ROLES).map(rol => `<option value="${rol}">${rol.charAt(0).toUpperCase() + rol.slice(1)}</option>`).join('');

    const permisosContainer = modalElement.querySelector('#usuario-permisos-container');
    permisosContainer.innerHTML = Object.values(PERMISOS).map(p => `
        <div class="form-group-checkbox">
            <input type="checkbox" id="permiso-${p.id}" value="${p.id}">
            <label for="permiso-${p.id}">${p.descripcion}</label>
        </div>`).join('');

    if (currentTrabajador.usuario) {
        modalElement.querySelector('#usuario-username').value = currentTrabajador.usuario.username;
        rolSelect.value = currentTrabajador.usuario.rol;
        currentTrabajador.usuario.permisos.forEach(permisoId => {
            const checkbox = modalElement.querySelector(`#permiso-${permisoId}`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// --- LÓGICA DE ASISTENCIA REFACTORIZADA ---

/** Obtiene las fechas de la semana actual (Dom-Sáb) */
function getSemanaActual() {
    const hoy = new Date();
    const primerDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
    return Array.from({ length: 7 }, (_, i) => {
        const dia = new Date(primerDia);
        dia.setDate(dia.getDate() + i);
        return dia;
    });
}

/** Formatea una fecha a YYYY-MM-DD */
const formatDate = (date) => date.toISOString().split('T')[0];

/** Muestra y puebla el editor de detalles para un día específico */
function renderDetalleDia(fecha) {
    const container = modalElement.querySelector('#asistencia-detalle-dia');
    container.style.display = 'block';
    
    const registro = currentTrabajador.asistencia.find(a => a.fecha === fecha) || {};

    container.querySelector('#detalle-dia-entrada').value = registro.horaEntrada || '';
    container.querySelector('#detalle-dia-salida').value = registro.horaSalida || '';

    const bonosContainer = container.querySelector('#detalle-dia-bonos-container');
    bonosContainer.innerHTML = Object.values(nominaConfig.bonos).map(bono => `
        <label class="bono-btn-label">
            <input type="checkbox" class="hidden-checkbox" value="${bono.id}" ${registro.bonos?.includes(bono.id) ? 'checked' : ''}>
            <span class="bono-btn-text">${bono.descripcion}</span>
        </label>
    `).join('');
}

/** Actualiza los datos del trabajador en memoria cuando se edita un detalle del día */
function handleDetalleDiaChange(event) {
    if (!selectedDateForEditing) return;

    // Si el cambio viene de un bono, actualizamos los bonos.
    if (event.target.classList.contains('hidden-checkbox')) {
        const bonosSeleccionados = [];
        modalElement.querySelectorAll('#detalle-dia-bonos-container input:checked').forEach(cb => bonosSeleccionados.push(cb.value));
        
        let registro = currentTrabajador.asistencia.find(a => a.fecha === selectedDateForEditing);
        if (registro) {
            registro.bonos = bonosSeleccionados;
        }
    } else { // Si el cambio viene de las horas
        let registro = currentTrabajador.asistencia.find(a => a.fecha === selectedDateForEditing);
        if (!registro) {
            registro = { fecha: selectedDateForEditing, estatus: 'asistio', bonos: [] };
            currentTrabajador.asistencia.push(registro);
        }

        registro.horaEntrada = modalElement.querySelector('#detalle-dia-entrada').value || null;
        registro.horaSalida = modalElement.querySelector('#detalle-dia-salida').value || null;
    }

    renderAsistenciaYNomina(); // Recalcular todo en tiempo real
}

/** Renderiza la cuadrícula de asistencia y el cálculo de nómina actualizado */
function renderAsistenciaYNomina() {
    if (!modalElement || !currentTrabajador) return;

    const semana = getSemanaActual();
    const asistenciaGrid = modalElement.querySelector('#asistencia-grid');
    const nominaContainer = modalElement.querySelector('#nomina-semanal-calculo');
    const cargoConfig = nominaConfig.cargos[currentTrabajador.cargo];

    if (!cargoConfig) {
        nominaContainer.innerHTML = `<div class="alerta-error">Cargo no configurado.</div>`;
        return;
    }

    let pagoBaseTotal = 0, pagoExtraTotal = 0, bonosMonetariosTotal = 0, puntosTotales = 0, diasConAsistencia = 0;

    asistenciaGrid.innerHTML = semana.map((dia, index) => {
        const fechaStr = formatDate(dia);
        const registro = currentTrabajador.asistencia.find(a => a.fecha === fechaStr);
        let estatus = registro ? registro.estatus : (DIAS_SEMANA_COMPLETO[index] === currentTrabajador.diaDescanso ? ESTATUS_ASISTENCIA.DESCANSO : ESTATUS_ASISTENCIA.PENDIENTE);

        if (registro && (estatus === 'asistio' || estatus === 'retardo')) {
            diasConAsistencia++;
            if (registro.horaEntrada && registro.horaSalida) {
                const entrada = new Date(`${fechaStr}T${registro.horaEntrada}`);
                const salida = new Date(`${fechaStr}T${registro.horaSalida}`);
                const horasTrabajadas = (salida - entrada) / 3600000; // en horas

                const horasNormales = Math.min(horasTrabajadas, nominaConfig.horasNormales);
                const horasExtra = Math.max(0, horasTrabajadas - nominaConfig.horasNormales);

                pagoBaseTotal += horasNormales * cargoConfig.valorHora;
                pagoExtraTotal += horasExtra * cargoConfig.valorExtra;
            }
            if (registro.bonos) {
                registro.bonos.forEach(bonoId => {
                    const bonoConf = nominaConfig.bonos[bonoId];
                    if (bonoConf?.tipo === 'monto') {
                        bonosMonetariosTotal += bonoConf.valor;
                    } else if (bonoConf?.tipo === 'puntos') {
                        puntosTotales += bonoConf.valor;
                    }
                });
            }
        }
        return `
            <div class="dia-asistencia ${estatus} ${fechaStr === selectedDateForEditing ? 'selected' : ''}" data-fecha="${fechaStr}">
                <div class="nombre-dia">${DIAS_SEMANA_ABR[index]}</div>
                <div class="fecha-dia">${dia.getDate()}</div>
            </div>
        `;
    }).join('');

    const pagoDiarioNormal = cargoConfig.valorHora * nominaConfig.horasNormales;
    const pagoDescansoProporcional = (pagoDiarioNormal / nominaConfig.diasParaDescansoCompleto) * diasConAsistencia;
    const nominaTotal = pagoBaseTotal + pagoExtraTotal + bonosMonetariosTotal + pagoDescansoProporcional;

    nominaContainer.innerHTML = `
        <div class="nomina-detalle"><span>Salario Base</span><span>$${pagoBaseTotal.toFixed(2)}</span></div>
        <div class="nomina-detalle"><span>Horas Extra</span><span>$${pagoExtraTotal.toFixed(2)}</span></div>
        <div class="nomina-detalle"><span>Bonos</span><span>$${bonosMonetariosTotal.toFixed(2)}</span></div>
        <div class="nomina-detalle"><span>Día de Descanso (Prop.)</span><span>$${pagoDescansoProporcional.toFixed(2)}</span></div>
        <div class="nomina-detalle puntos"><span>Puntos Acumulados</span><span>${puntosTotales} pts</span></div>
        <div class="nomina-total"><strong>Total a Pagar</strong><strong>$${nominaTotal.toFixed(2)}</strong></div>
    `;
}

/** Maneja el clic en un día para mostrar el editor de detalles */
function handleAsistenciaClick(event) {
    const diaElement = event.target.closest('.dia-asistencia');
    if (!diaElement || diaElement.classList.contains('descanso')) return;

    const fecha = diaElement.dataset.fecha;
    const detalleContainer = modalElement.querySelector('#asistencia-detalle-dia');

    let registroIndex = currentTrabajador.asistencia.findIndex(a => a.fecha === fecha);
    let registro = registroIndex > -1 ? currentTrabajador.asistencia[registroIndex] : null;

    const estatusActual = registro ? registro.estatus : ESTATUS_ASISTENCIA.PENDIENTE;

    // Definir el ciclo: Pendiente -> Asistió -> Falta -> Pendiente
    const STATUS_CYCLE = [ESTATUS_ASISTENCIA.PENDIENTE, ESTATUS_ASISTENCIA.ASISTIO, ESTATUS_ASISTENCIA.FALTA];
    const currentIndex = STATUS_CYCLE.indexOf(estatusActual);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    if (nextStatus === ESTATUS_ASISTENCIA.PENDIENTE) {
        // Si volvemos a Pendiente, eliminamos el registro y ocultamos los detalles.
        if (registroIndex > -1) {
            currentTrabajador.asistencia.splice(registroIndex, 1);
        }
        detalleContainer.style.display = 'none';
        selectedDateForEditing = null;
    } else {
        // Si no hay registro, lo creamos.
        if (!registro) {
            registro = { fecha: fecha, bonos: [] };
            currentTrabajador.asistencia.push(registro);
        }
        
        registro.estatus = nextStatus;

        if (nextStatus === ESTATUS_ASISTENCIA.ASISTIO) {
            // Al marcar como Asistió, precargamos horas y mostramos detalles.
            selectedDateForEditing = fecha;
            if (!registro.horaEntrada && !registro.horaSalida) {
                const cargoConfig = nominaConfig.cargos[currentTrabajador.cargo];
                if (cargoConfig && cargoConfig.horario) {
                    [registro.horaEntrada, registro.horaSalida] = cargoConfig.horario.split('-');
                }
            }
            renderDetalleDia(fecha);
        } else if (nextStatus === ESTATUS_ASISTENCIA.FALTA) {
            // Al marcar como Falta, limpiamos datos y ocultamos detalles.
            registro.horaEntrada = null;
            registro.horaSalida = null;
            registro.bonos = [];
            detalleContainer.style.display = 'none';
            selectedDateForEditing = null;
        }
    }

    // Finalmente, recalculamos y renderizamos todo.
    renderAsistenciaYNomina();
}

// --- FUNCIÓN PRINCIPAL DE APERTURA DEL MODAL (MODIFICADA) ---
export async function openTrabajadorIntegralModal(trabajadorId, onUpdate) {
    if (document.getElementById('trabajador-integral-modal-container')) return;

    onUpdateCallback = onUpdate;
    currentTrabajador = trabajadoresDB.find(t => t.id === trabajadorId);
    if (!currentTrabajador) return alert('Trabajador no encontrado.');

    const response = await fetch('src/modulos/trabajadores/views/trabajador.modal-integral.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('trabajador-integral-modal-container');

    // Poblar datos
    modalElement.querySelector('#detalle-trabajador-nombre').textContent = `${currentTrabajador.nombre} ${currentTrabajador.apellidos}`;
    populateGeneralTab();
    populateUsuarioTab();
    renderAsistenciaYNomina(); // La función de asistencia ya existente

    // Configurar Listeners
    modalElement.querySelector('.modal-tabs').addEventListener('click', switchTab);
    modalElement.querySelector('#integral-trabajador-guardar-btn').addEventListener('click', handleSave);
    modalElement.querySelector('#integral-trabajador-cancelar-btn').addEventListener('click', closeAndRemoveModal);
    modalElement.querySelector('#asistencia-grid').addEventListener('click', handleAsistenciaClick);
    
    // NUEVOS LISTENERS para el detalle del día
    const detalleContainer = modalElement.querySelector('#asistencia-detalle-dia');
    detalleContainer.addEventListener('change', handleDetalleDiaChange); // 'change' es más eficiente que 'input' para time/checkbox

    modalElement.addEventListener('click', e => e.target === modalElement && closeAndRemoveModal());

    setTimeout(() => modalElement.classList.add('visible'), 10);
}

function closeAndRemoveModal() {
    if (!modalElement) return;
    modalElement.classList.remove('visible');
    modalElement.addEventListener('transitionend', () => {
        modalElement.remove();
        modalElement = null;
        currentTrabajador = null;
        onUpdateCallback = null;
    }, { once: true });
}