// Este archivo almacenará las ventas completadas durante la sesión actual.
export let ventasDelDia = [
    {
        id: 'VTA-EXAMPLE-01',
        cliente: {
            id: 4,
            nombre: "Pedro",
            apellidos: "",
            alias: "Peter",
            telefonos: [
                { tipo: "Móvil", numero: "275-333-4444" }
            ],
            direcciones: []
        },
        items: [
            {
                productId: 'PECH',
                optionId: 'PP-PECH',
                optionName: 'Pulpa de Pechuga',
                quantity: 0.750,
                cost: 138.75,
                priceType: 'publico',
                pricePerKg: 185,
                personalizations: { Procesamientos: ['Milanesa'] }
            },
            {
                productId: 'AL',
                optionId: 'AL',
                optionName: 'Ala',
                quantity: 1.200,
                cost: 110.00,
                priceType: 'publico',
                pricePerKg: 100,
                personalizations: { Procesamientos: ['Cortada en 2'] },
                discount: {
                    monto: 10.00,
                    descripcion: 'Descuento especial',
                    originalCost: 120.00,
                    tipoDescuentoAplicado: 'Cantidad'
                }
            },
            {
                productId: 'PA',
                optionId: 'manual',
                optionName: 'Producto Adicional',
                quantity: 1,
                cost: 25.00,
                priceType: null,
                pricePerKg: null,
                personalizations: { descripcion: ['Jitomates'] }
            },
            {
                productId: 'ENVIO',
                optionId: 'express-chiautla',
                optionName: 'D. Express Chiautla',
                quantity: 1,
                cost: 15.00,
                priceType: null,
                pricePerKg: null,
                personalizations: { descripcion: ['$15.00'] }
            }
        ],
        total: 289,
        fechaCompletado: new Date().toISOString(),
        pagoCon: { '200': 1, '100': 1 },
        cambioEntregado: { '10': 1, '1': 1 }
    }
];