let modalElement = null;

const denominaciones = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];

function closeRecargaModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
}

function handleGuardarRecarga() {
    const recarga = {};
    denominaciones.forEach(valor => {
        const input = modalElement.querySelector(`#recarga-denominacion-${String(valor).replace('.', '')}`);
        const cantidad = parseInt(input.value, 10) || 0;
        if (cantidad > 0) {
            recarga[valor] = cantidad;
        }
    });
    console.log('Guardando recarga:', recarga);
    // Lógica para actualizar estado global
    closeRecargaModal();
}

function renderRecargaInputs() {
    const grid = modalElement.querySelector('#recarga-denominaciones-grid');
    grid.innerHTML = '';
    denominaciones.forEach(valor => {
        const inputId = `recarga-denominacion-${String(valor).replace('.', '')}`;
        const group = document.createElement('div');
        group.className = 'denominacion-input-group';
        group.innerHTML = `
            <label for="${inputId}">$${valor}:</label>
            <input type="number" id="${inputId}" placeholder="0" min="0">
        `;
        grid.appendChild(group);
    });
}

export async function openRecargarDenominacionesModal() {
    if (modalElement) return;

    try {
        const response = await fetch('src/views/caja.recargar.denominaciones.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-recarga-modal-container');

        renderRecargaInputs();

        modalElement.querySelector('#recarga-modal-cancelar-btn').addEventListener('click', closeRecargaModal);
        modalElement.querySelector('#recarga-modal-guardar-btn').addEventListener('click', handleGuardarRecarga);

    } catch (error) {
        console.error("Error al abrir el modal de recarga:", error);
    }
}