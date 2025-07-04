export const clientes = [
    // Escenario 1: Cliente estándar con toda la información completa.
    {
        id: 1,
        nombre: "María Elena",
        apellidos: "García López",
        alias: "Nena",
        telefonos: [
            { tipo: "Móvil", numero: "275-123-4567" }
        ],
        direcciones: [
            { tipo: "Casa", direccion: "Av. Principal 45, Col. El Sol", referencias: "Casa de dos pisos, portón blanco.", lat: 18.8462, long: -98.9545 }
        ]
    },

    // Escenario 2: Cliente con múltiples números de teléfono.
    {
        id: 2,
        nombre: "Carlos Alberto",
        apellidos: "Sánchez",
        alias: "Beto",
        telefonos: [
            { tipo: "Móvil", numero: "275-987-6543" },
            { tipo: "Casa", numero: "275-555-1234" }
        ],
        direcciones: [
            { tipo: "Casa", direccion: "Calle 5 de Mayo #10, Centro", referencias: "Junto a la farmacia.", lat: 18.8488, long: -98.9511 }
        ]
    },

    // Escenario 3: Cliente con múltiples direcciones (Casa y Trabajo).
    {
        id: 3,
        nombre: "Laura",
        apellidos: "Martínez",
        alias: "", // Sin alias
        telefonos: [
            { tipo: "Móvil", numero: "275-111-2222" }
        ],
        direcciones: [
            { tipo: "Casa", direccion: "Privada Las Flores 8", referencias: "Fraccionamiento cerrado, timbre no sirve.", lat: 18.8510, long: -98.9590 },
            { tipo: "Trabajo", direccion: "Oficina 301, Edificio Central", referencias: "Preguntar en recepción.", lat: 18.8495, long: -98.9523 }
        ]
    },

    // Escenario 4: Cliente con información mínima (solo nombre y un teléfono).
    {
        id: 4,
        nombre: "Pedro",
        apellidos: "", // Sin apellidos
        alias: "Peter",
        telefonos: [
            { tipo: "Móvil", numero: "275-333-4444" }
        ],
        direcciones: [] // Sin direcciones, compra en mostrador
    },

    // Escenario 5: Cliente con una dirección sin referencias y sin coordenadas.
    {
        id: 5,
        nombre: "Ana Sofía",
        apellidos: "Ramírez",
        alias: "Sofi",
        telefonos: [
            { tipo: "Móvil", numero: "275-888-9999" }
        ],
        direcciones: [
            { tipo: "Casa", direccion: "Callejón del Beso #69", referencias: "", lat: null, long: null } // Referencias vacías y sin lat/long
        ]
    },

    // Escenario 6: Cliente que es un negocio (ej. una cocina o restaurante).
    {
        id: 6,
        nombre: "Cocina Económica",
        apellidos: "Doña Lucha", // Se usa para el nombre del contacto
        alias: "Restaurante El Buen Sabor",
        telefonos: [
            { tipo: "Negocio", numero: "275-777-0000" }
        ],
        direcciones: [
            { tipo: "Negocio", direccion: "Mercado Municipal, Local 15 y 16", referencias: "Entrada por la puerta principal.", lat: 18.8475, long: -98.9530 }
        ]
    },

    // Escenario 7: Cliente sin teléfono, solo con dirección.
    {
        id: 7,
        nombre: "Jorge",
        apellidos: "Hernández",
        alias: "El Mudo",
        telefonos: [], // Sin teléfonos
        direcciones: [
            { tipo: "Casa", direccion: "Rancho 'El Girasol', a 2km de la carretera", referencias: "Portón de madera grande.", lat: 18.8391, long: -98.9658 }
        ]
    }
];