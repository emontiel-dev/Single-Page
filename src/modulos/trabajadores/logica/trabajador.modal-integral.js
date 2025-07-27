import { trabajadoresDB } from './trabajadores.datos.js';
import { openTrabajadorModal } from './trabajador.añadir.modal.js';
import { openUsuarioModal } from './trabajador.usuario.modal.js'; // <-- AÑADIR IMPORTACIÓN

let modalElement = null;
let currentOnUpdate = null; // <-- Guardar el callback de actualización

/**
 * Cierra y elimina el modal del DOM de forma segura.
 */
function closeAndRemoveModal() {
    if (!modalElement) return;
    modalElement.classList.remove('visible');
    modalElement.addEventListener('transitionend', () => {
        modalElement.remove();
        modalElement = null;
        currentOnUpdate = null; // Limpiar al cerrar
    }, { once: true });
}

/**
 * Rellena el modal con los datos del trabajador.
 * @param {Object} trabajador - El objeto del trabajador.
 */
function populateModal(trabajador) {
    modalElement.querySelector('#detalle-trabajador-nombre').textContent = `${trabajador.nombre} ${trabajador.apellidos}`;
    modalElement.querySelector('#detalle-trabajador-cargo').textContent = trabajador.cargo || 'No especificado';
    modalElement.querySelector('#detalle-trabajador-ingreso').textContent = trabajador.fechaIngreso || 'No especificada';
    modalElement.querySelector('#detalle-trabajador-salario').textContent = `$${trabajador.salarioDiario.toFixed(2)}` || '$0.00';
    modalElement.querySelector('#detalle-trabajador-descanso').textContent = trabajador.diaDescanso || 'No asignado';

    // Lógica para mostrar información del usuario (si existe)
    const userInfoContainer = modalElement.querySelector('#detalle-trabajador-usuario-info');
    if (trabajador.usuario) {
        userInfoContainer.innerHTML = `
            <div class="info-item"><strong>Username:</strong> <span>${trabajador.usuario.username}</span></div>
            <div class="info-item"><strong>Rol:</strong> <span>${trabajador.usuario.rol}</span></div>
            <p><strong>Permisos:</strong> ${trabajador.usuario.permisos.join(', ')}</p>
        `;
    } else {
        userInfoContainer.innerHTML = '<p>Este trabajador no tiene un usuario asignado.</p>';
    }
}

/**
 * Abre y configura el modal integral para un trabajador específico.
 * @param {number} trabajadorId - El ID del trabajador a mostrar.
 * @param {Function} onUpdate - Callback para ejecutar cuando los datos se actualizan, para refrescar la lista principal.
 */
export async function openTrabajadorIntegralModal(trabajadorId, onUpdate) {
    if (document.getElementById('trabajador-integral-modal-container')) return;

    currentOnUpdate = onUpdate; // Guardar el callback
    const trabajador = trabajadoresDB.find(t => t.id === trabajadorId);
    if (!trabajador) {
        console.error(`No se encontró el trabajador con ID: ${trabajadorId}`);
        alert('No se pudo encontrar la información del trabajador.');
        return;
    }

    try {
        const response = await fetch('src/modulos/trabajadores/views/trabajador.modal-integral.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        modalElement = document.getElementById('trabajador-integral-modal-container');

        populateModal(trabajador);

        // Asignar event listeners
        modalElement.querySelector('#integral-trabajador-volver-btn').addEventListener('click', closeAndRemoveModal);
        modalElement.querySelector('#integral-trabajador-editar-btn').addEventListener('click', () => {
            closeAndRemoveModal();
            openTrabajadorModal(onUpdate, trabajador);
        });

        // --- NUEVO LISTENER ---
        modalElement.querySelector('#btn-gestionar-usuario').addEventListener('click', () => {
            openUsuarioModal(trabajador, () => {
                // Al guardar el usuario, repoblamos este modal y ejecutamos el callback principal
                populateModal(trabajador);
                if (currentOnUpdate) currentOnUpdate();
            });
        });

        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                closeAndRemoveModal();
            }
        });

        // Mostrar el modal con una transición
        setTimeout(() => modalElement.classList.add('visible'), 10);

    } catch (error) {
        console.error('Error al abrir el modal integral del trabajador:', error);
    }
}