import { FASES_PEDIDO } from './pedidos.fases.datos.js';

// Haremos que los pedidos sean exportables y modificables
export let pedidosGuardados = [
    // --- PEDIDO DE EJEMPLO PARA PRUEBAS ---
    {
        id: 'PED-TEST-01',
        clienteId: null,
        faseId: FASES_PEDIDO.LISTO_PARA_ENTREGA.id, // <-- Estado ideal para probar el modal
        precioTipoPredominante: 'Publico',
        fechaCreacion: new Date().toISOString(),
        repartidorAsignado: null,
        cambioPreparado: null,
        items: [
            {
                productId: 'PECH',
                optionId: 'PECH',
                optionName: 'Pechuga (Entera)',
                quantity: 0.5, // 0.5 kg
                cost: 60.00,
                personalizaciones: { Procesamientos: ['E'] },
                estado: 'LISTO' // <-- Importante: todos los items deben estar listos
            },
            {
                productId: 'AL',
                optionId: 'AL',
                optionName: 'Ala (Entera)',
                quantity: 0.3, // 0.3 kg
                cost: 30.00,
                personalizaciones: { Procesamientos: ['E'] },
                estado: 'LISTO'
            }
        ]
    }
];