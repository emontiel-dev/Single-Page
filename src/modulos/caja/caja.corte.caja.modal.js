let modalElement = null;

function closeCorteModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
}

function handleFinalizarCorte() {
    console.log('Finalizando corte de caja...');
    // Lógica para comparar conteo físico con sistema y guardar
    closeCorteModal();
}

export async function openCorteCajaModal() {
    if (modalElement) return;

    try {
        const response = await fetch('src/views/caja.corte.caja.modal.html');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('caja-corte-modal-container');

        // Aquí se renderizaría el resumen del sistema y los inputs de conteo
        modalElement.querySelector('#corte-resumen-sistema').innerHTML = '<p>Resumen del sistema no implementado.</p>';
        modalElement.querySelector('#corte-denominaciones-grid').innerHTML = '<p>Conteo físico no implementado.</p>';

        modalElement.querySelector('#corte-modal-cancelar-btn').addEventListener('click', closeCorteModal);
        modalElement.querySelector('#corte-modal-finalizar-btn').addEventListener('click', handleFinalizarCorte);

    } catch (error) {
        console.error("Error al abrir el modal de corte de caja:", error);
    }
}