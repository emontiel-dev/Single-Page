let modalElement = null;

function closeEgresoModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
}

function handleGuardarEgreso() {
    const concepto = modalElement.querySelector('#egreso-concepto-input').value;
    const monto = modalElement.querySelector('#egreso-monto-input').value;
    if (!concepto || !monto) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    console.log('Guardando egreso:', { concepto, monto });
    // Aquí iría la lógica para actualizar el estado global y la UI
    closeEgresoModal();
}

export async function openAñadirEgresoModal() {
    if (modalElement) return;

    try {
        const response = await fetch('src/views/caja.añadir.egreso.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-egreso-modal-container');

        modalElement.querySelector('#egreso-modal-cancelar-btn').addEventListener('click', closeEgresoModal);
        modalElement.querySelector('#egreso-modal-guardar-btn').addEventListener('click', handleGuardarEgreso);

    } catch (error) {
        console.error("Error al abrir el modal de egreso:", error);
    }
}