export const trabajadoresDB = [
    {
        id: 1,
        nombre: 'Juan',
        apellidos: 'Pérez García',
        cargo: 'Tablajero Principal',
        fechaIngreso: '2023-01-15',
        salarioDiario: 350.00,
        diaDescanso: 'Martes',
        activo: true,
        usuario: {
            username: 'juanp',
            rol: 'admin', // roles: admin, tablajero, vendedor
            permisos: ['venta', 'caja', 'pedidos', 'items.tablajero', 'clientes', 'trabajadores']
        }
    },
    {
        id: 2,
        nombre: 'Maria',
        apellidos: 'López Hernández',
        cargo: 'Vendedora de Mostrador',
        fechaIngreso: '2023-05-20',
        salarioDiario: 280.00,
        diaDescanso: 'Miércoles',
        activo: true,
        usuario: {
            username: 'marial',
            rol: 'vendedor',
            permisos: ['venta', 'clientes']
        }
    },
    {
        id: 3,
        nombre: 'Carlos',
        apellidos: 'Gómez Cruz',
        cargo: 'Tablajero',
        fechaIngreso: '2024-02-01',
        salarioDiario: 300.00,
        diaDescanso: 'Jueves',
        activo: true,
        usuario: {
            username: 'carlosg',
            rol: 'tablajero',
            permisos: ['items.tablajero']
        }
    },
    {
        id: 4,
        nombre: 'Ana',
        apellidos: 'Martínez Díaz',
        cargo: 'Cajera',
        fechaIngreso: '2022-11-10',
        salarioDiario: 300.00,
        diaDescanso: 'Lunes',
        activo: false,
        usuario: null
    }
];

export const ROLES = {
    ADMIN: 'admin',
    VENDEDOR: 'vendedor',
    TABLAJERO: 'tablajero',
    CAJERO: 'cajero'
};

export const PERMISOS = {
    VENTA: { id: 'venta', descripcion: 'Acceso al módulo de ventas' },
    CAJA: { id: 'caja', descripcion: 'Acceso al módulo de caja' },
    PEDIDOS: { id: 'pedidos', descripcion: 'Gestionar todos los pedidos' },
    ITEMS_TABLAJERO: { id: 'items.tablajero', descripcion: 'Ver y marcar items para tablajeros' },
    CLIENTES: { id: 'clientes', descripcion: 'Gestionar la base de datos de clientes' },
    TRABAJADORES: { id: 'trabajadores', descripcion: 'Gestionar trabajadores y usuarios' }
};