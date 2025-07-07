let modalElement = null;

function closeIngresoModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
}

function handleGuardarIngreso() {
    const concepto = modalElement.querySelector('#ingreso-concepto-input').value;
    const monto = modalElement.querySelector('#ingreso-monto-input').value;
    if (!concepto || !monto) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    console.log('Guardando ingreso:', { concepto, monto });
    // Aquí iría la lógica para actualizar el estado global y la UI
    closeIngresoModal();
}

export async function openAñadirIngresoModal() {
    if (modalElement) return;

    try {
        const response = await fetch('src/views/caja.añadir.ingreso.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-ingreso-modal-container');

        modalElement.querySelector('#ingreso-modal-cancelar-btn').addEventListener('click', closeIngresoModal);
        modalElement.querySelector('#ingreso-modal-guardar-btn').addEventListener('click', handleGuardarIngreso);

    } catch (error) {
        console.error("Error al abrir el modal de ingreso:", error);
    }
}