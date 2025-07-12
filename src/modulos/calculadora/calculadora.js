export async function renderCalculadora(container) {
    try {
        const response = await fetch('src/views/calculadora/calculadora.html');
        if (!response.ok) throw new Error('No se pudo cargar la vista de la calculadora.');
        container.innerHTML = await response.text();

        const display = container.querySelector('#calculadora-display');
        const operationDisplay = container.querySelector('#calculadora-operation-display');
        const keys = container.querySelector('.calculadora-keys');

        let currentValue = '0';
        let previousValue = null;
        let operator = null;
        let waitingForSecondOperand = false;

        function updateDisplay() {
            display.textContent = currentValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (operator && previousValue !== null) {
                const prev = previousValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                operationDisplay.textContent = `${prev} ${getOperatorSymbol(operator)}`;
            } else {
                operationDisplay.textContent = '';
            }
        }

        function getOperatorSymbol(op) {
            const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
            return symbols[op] || '';
        }

        function handleNumber(number) {
            if (currentValue === 'Error') resetCalculator();
            if (waitingForSecondOperand) {
                currentValue = number;
                waitingForSecondOperand = false;
            } else {
                currentValue = currentValue === '0' ? number : currentValue + number;
            }
            updateDisplay();
        }

        function handleOperator(nextOperator) {
            if (currentValue === 'Error') return;
            const inputValue = parseFloat(currentValue);

            if (operator && waitingForSecondOperand) {
                operator = nextOperator;
                updateDisplay();
                return;
            }

            if (previousValue === null) {
                previousValue = inputValue;
            } else if (operator) {
                const result = calculate(previousValue, inputValue, operator);
                if (result === 'Error') {
                    resetCalculator('Error');
                    return;
                }
                currentValue = String(result);
                previousValue = result;
            }

            waitingForSecondOperand = true;
            operator = nextOperator;
            updateDisplay();
        }

        function calculate(firstOperand, secondOperand, op) {
            let result;
            switch (op) {
                case '+': result = firstOperand + secondOperand; break;
                case '-': result = firstOperand - secondOperand; break;
                case '*': result = firstOperand * secondOperand; break;
                case '/': 
                    if (secondOperand === 0) return 'Error';
                    result = firstOperand / secondOperand; 
                    break;
                case '%': result = firstOperand % secondOperand; break;
                default: return secondOperand;
            }
            return parseFloat(result.toPrecision(15));
        }

        function resetCalculator(displayValue = '0') {
            currentValue = displayValue;
            previousValue = null;
            operator = null;
            waitingForSecondOperand = false;
            updateDisplay();
        }
        
        function handleEquals() {
            if (operator && previousValue !== null && !waitingForSecondOperand) {
                const secondOperand = parseFloat(currentValue);
                const result = calculate(previousValue, secondOperand, operator);
                if (result === 'Error') {
                    resetCalculator('Error');
                    return;
                }
                const prevStr = previousValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                const currStr = secondOperand.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                operationDisplay.textContent = `${prevStr} ${getOperatorSymbol(operator)} ${currStr} =`;
                currentValue = String(result);
                display.textContent = currentValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                
                operator = null;
                previousValue = null;
                waitingForSecondOperand = true;
            }
        }

        function handleBackspace() {
            if (currentValue === 'Error') {
                resetCalculator();
                return;
            }
            currentValue = currentValue.slice(0, -1) || '0';
            updateDisplay();
        }

        function handleDecimal() {
            if (currentValue === 'Error') return;
            if (waitingForSecondOperand) {
                currentValue = '0.';
                waitingForSecondOperand = false;
            } else if (!currentValue.includes('.')) {
                currentValue += '.';
            }
            updateDisplay();
        }

        function handleKeyPress(key) {
            if (/\d/.test(key)) handleNumber(key);
            else if (key === '.') handleDecimal();
            else if (['+', '-', '*', '/', '%'].includes(key)) handleOperator(key);
            else if (key === 'Enter' || key === '=') handleEquals();
            else if (key === 'Backspace') handleBackspace();
            else if (key.toLowerCase() === 'c' || key === 'Escape') resetCalculator();
        }

        keys.addEventListener('click', (event) => {
            const { target } = event;
            if (!target.matches('button')) return;
            const { value } = target.dataset;
            const { id } = target;

            if (value) {
                if (/\d/.test(value)) handleNumber(value);
                else if (value === '.') handleDecimal();
                else handleOperator(value);
            } else if (id === 'equals') handleEquals();
            else if (id === 'clear') resetCalculator();
            else if (id === 'backspace') handleBackspace();
        });

        // Limpiar el listener anterior si existe para evitar duplicados al navegar
        const existingListener = window.calculadoraKeyListener;
        if (existingListener) {
            window.removeEventListener('keydown', existingListener);
        }
        
        window.calculadoraKeyListener = (event) => {
            if (['/', '*', '-', '+'].includes(event.key)) event.preventDefault();
            handleKeyPress(event.key);
        };
        window.addEventListener('keydown', window.calculadoraKeyListener);

        resetCalculator();

    } catch (error) {
        console.error('Error al renderizar la calculadora:', error);
        container.innerHTML = '<p>Error al cargar la calculadora.</p>';
    }
}