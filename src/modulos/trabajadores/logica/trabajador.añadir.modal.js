import { trabajadoresDB } from './trabajadores.datos.js';

let modalElement = null;
let onSaveCallback = null;
let currentTrabajador = null; // Contendrá el objeto del trabajador si estamos editando

/**
 * Cierra y elimina el modal del DOM de forma segura.
 */
function closeAndRemoveModal() {
    if (!modalElement) return;
    modalElement.classList.remove('visible');
    modalElement.addEventListener('transitionend', () => {
        modalElement.remove();
        modalElement = null;
        onSaveCallback = null;
        currentTrabajador = null;
    }, { once: true });
}

/**
 * Maneja el evento de clic en el botón "Guardar".
 */
function handleSave() {
    const nombre = modalElement.querySelector('#trabajador-nombre').value.trim();
    const apellidos = modalElement.querySelector('#trabajador-apellidos').value.trim();
    const cargo = modalElement.querySelector('#trabajador-cargo').value.trim();
    const diaDescanso = modalElement.querySelector('#trabajador-descanso').value;

    if (!nombre || !apellidos) {
        alert('El nombre y los apellidos son obligatorios.');
        return;
    }

    if (currentTrabajador) {
        // --- MODO EDICIÓN ---
        const trabajadorToUpdate = trabajadoresDB.find(t => t.id === currentTrabajador.id);
        if (trabajadorToUpdate) {
            trabajadorToUpdate.nombre = nombre;
            trabajadorToUpdate.apellidos = apellidos;
            trabajadorToUpdate.cargo = cargo;
            trabajadorToUpdate.diaDescanso = diaDescanso;
            console.log('Trabajador actualizado:', trabajadorToUpdate);
        }
    } else {
        // --- MODO CREACIÓN ---
        const nuevoId = trabajadoresDB.length > 0 ? Math.max(...trabajadoresDB.map(t => t.id)) + 1 : 1;
        const nuevoTrabajador = {
            id: nuevoId,
            nombre,
            apellidos,
            cargo,
            fechaIngreso: new Date().toISOString().split('T')[0],
            diaDescanso,
            activo: true,
            usuario: null
        };
        trabajadoresDB.push(nuevoTrabajador);
        console.log('Trabajador añadido:', nuevoTrabajador);
    }

    if (typeof onSaveCallback === 'function') {
        onSaveCallback();
    }
    closeAndRemoveModal();
}

/**
 * Abre y configura el modal para añadir o editar un trabajador.
 * @param {Function} callback - Función a ejecutar después de guardar exitosamente.
 * @param {Object|null} trabajador - El objeto del trabajador a editar, o null para crear uno nuevo.
 */
export async function openTrabajadorModal(callback, trabajador = null) {
    if (document.getElementById('trabajador-anadir-modal-container')) return;

    onSaveCallback = callback;
    currentTrabajador = trabajador;

    try {
        const response = await fetch('src/modulos/trabajadores/views/trabajador.añadir.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        modalElement = document.getElementById('trabajador-anadir-modal-container');
        const headerTitle = modalElement.querySelector('.modal-header h3');
        const saveButton = modalElement.querySelector('#anadir-trabajador-guardar-btn');

        if (trabajador) {
            // Poblar para editar
            headerTitle.textContent = 'Editar Trabajador';
            saveButton.textContent = 'Guardar Cambios';
            modalElement.querySelector('#trabajador-nombre').value = trabajador.nombre;
            modalElement.querySelector('#trabajador-apellidos').value = trabajador.apellidos;
            modalElement.querySelector('#trabajador-cargo').value = trabajador.cargo;
            modalElement.querySelector('#trabajador-salario').value = trabajador.salarioDiario;
            modalElement.querySelector('#trabajador-descanso').value = trabajador.diaDescanso;
        } else {
            // Configurar para crear
            headerTitle.textContent = 'Registrar Nuevo Trabajador';
            saveButton.textContent = 'Guardar';
        }

        // Asignar event listeners
        saveButton.addEventListener('click', handleSave);
        modalElement.querySelector('#anadir-trabajador-cancelar-btn').addEventListener('click', closeAndRemoveModal);
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                closeAndRemoveModal();
            }
        });

        setTimeout(() => modalElement.classList.add('visible'), 10);

    } catch (error) {
        console.error('Error al abrir el modal de trabajador:', error);
    }
}