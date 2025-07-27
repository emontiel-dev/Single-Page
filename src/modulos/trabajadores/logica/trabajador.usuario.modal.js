import { trabajadoresDB, ROLES, PERMISOS } from './trabajadores.datos.js';

let modalElement = null;
let onSaveCallback = null;
let currentTrabajador = null;

function closeAndRemoveModal() {
    if (!modalElement) return;
    modalElement.remove();
    modalElement = null;
}

function handleSave() {
    const username = modalElement.querySelector('#usuario-username').value.trim();
    const rol = modalElement.querySelector('#usuario-rol').value;
    
    const permisosSeleccionados = [];
    modalElement.querySelectorAll('#usuario-permisos-container input[type="checkbox"]:checked').forEach(checkbox => {
        permisosSeleccionados.push(checkbox.value);
    });

    if (!username) {
        // Si no hay username, se asume que se quiere eliminar el usuario
        currentTrabajador.usuario = null;
    } else {
        if (!currentTrabajador.usuario) {
            currentTrabajador.usuario = {}; // Crear el objeto si no existe
        }
        currentTrabajador.usuario.username = username;
        currentTrabajador.usuario.rol = rol;
        currentTrabajador.usuario.permisos = permisosSeleccionados;
    }
    
    console.log('Usuario del trabajador actualizado:', currentTrabajador);

    if (onSaveCallback) onSaveCallback();
    closeAndRemoveModal();
}

export async function openUsuarioModal(trabajador, callback) {
    currentTrabajador = trabajador;
    onSaveCallback = callback;

    const response = await fetch('src/modulos/trabajadores/views/trabajador.usuario.modal.html');
    document.body.insertAdjacentHTML('beforeend', await response.text());
    modalElement = document.getElementById('trabajador-usuario-modal-container');

    // Poblar roles
    const rolSelect = modalElement.querySelector('#usuario-rol');
    Object.values(ROLES).forEach(rol => {
        rolSelect.innerHTML += `<option value="${rol}">${rol.charAt(0).toUpperCase() + rol.slice(1)}</option>`;
    });

    // Poblar permisos
    const permisosContainer = modalElement.querySelector('#usuario-permisos-container');
    Object.values(PERMISOS).forEach(permiso => {
        permisosContainer.innerHTML += `
            <div class="form-group-checkbox">
                <input type="checkbox" id="permiso-${permiso.id}" value="${permiso.id}">
                <label for="permiso-${permiso.id}">${permiso.descripcion}</label>
            </div>
        `;
    });

    // Rellenar con datos existentes si el trabajador tiene usuario
    if (trabajador.usuario) {
        modalElement.querySelector('#usuario-username').value = trabajador.usuario.username;
        rolSelect.value = trabajador.usuario.rol;
        trabajador.usuario.permisos.forEach(permisoId => {
            const checkbox = modalElement.querySelector(`#permiso-${permisoId}`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Listeners
    modalElement.querySelector('#usuario-modal-guardar-btn').addEventListener('click', handleSave);
    modalElement.querySelector('#usuario-modal-cancelar-btn').addEventListener('click', closeAndRemoveModal);
    modalElement.addEventListener('click', e => e.target === modalElement && closeAndRemoveModal());

    setTimeout(() => modalElement.classList.add('visible'), 10);
}