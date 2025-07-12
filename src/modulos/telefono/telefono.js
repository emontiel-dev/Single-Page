export async function renderTelefono(container) {
    try {
        const response = await fetch('src/views/telefono/telefono.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista del teléfono.');
        container.innerHTML = await response.text();

        const display = container.querySelector('#telefono-display');
        const keys = container.querySelector('#telefono-keys');
        const callBtn = container.querySelector('#btn-llamar');
        const whatsappBtn = container.querySelector('#btn-whatsapp');

        let currentNumber = '';

        function updateDisplay() {
            display.textContent = currentNumber || ' ';
            const hasNumber = currentNumber.length > 0;
            callBtn.disabled = !hasNumber;
            whatsappBtn.disabled = !hasNumber;
        }

        keys.addEventListener('click', (event) => {
            const key = event.target.closest('button')?.dataset.key;
            if (!key) return;

            if (key === 'backspace') {
                currentNumber = currentNumber.slice(0, -1);
            } else if (currentNumber.length < 15) { // Limitar longitud
                currentNumber += key;
            }
            updateDisplay();
        });

        callBtn.addEventListener('click', () => {
            if (currentNumber) {
                window.location.href = `tel:${currentNumber}`;
            }
        });

        whatsappBtn.addEventListener('click', () => {
            if (currentNumber) {
                // Asume un código de país si es necesario, ej: '52' para México.
                // Si el número ya lo incluye, no se necesita prefijo.
                const whatsappNumber = currentNumber.length === 10 ? `52${currentNumber}` : currentNumber;
                window.open(`https://wa.me/${whatsappNumber}`, '_blank');
            }
        });

        updateDisplay();

    } catch (error) {
        console.error('Error al renderizar el teléfono:', error);
        container.innerHTML = '<p>Error al cargar la vista del teléfono.</p>';
    }
}

