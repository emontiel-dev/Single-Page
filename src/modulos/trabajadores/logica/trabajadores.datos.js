export const nominaConfig = {
    horasNormales: 8,
    diasParaDescansoCompleto: 6,
    cargos: {
        'Administrador': { valorHora: 30, valorExtra: 35, horario: null }, // Sin horario definido
        'Procesador': { valorHora: 24, valorExtra: 28, horario: '04:00-14:00' },
        'Tablajero Principal': { valorHora: 27, valorExtra: 31, horario: '06:30-16:00' },
        'Tablajero': { valorHora: 27, valorExtra: 31, horario: '06:30-16:00' },
        'Cajero': { valorHora: 25, valorExtra: 29, horario: '06:30-16:00' },
        'Vendedora de Mostrador': { valorHora: 25, valorExtra: 29, horario: '06:30-16:00' },
        'Repartidor': { valorHora: 25, valorExtra: 30, horario: '06:30-16:00' }
    },
    bonos: {
        produccion: { id: 'produccion', descripcion: 'Bono de Producción', tipo: 'monto', valor: 25 },
        ventas: { id: 'ventas', descripcion: 'Bono de Ventas', tipo: 'monto', valor: 25 },
        eficiencia: { id: 'eficiencia', descripcion: 'Punto de Eficiencia', tipo: 'puntos', valor: 1 },
        desempeno: { id: 'desempeno', descripcion: 'Punto de Desempeño', tipo: 'puntos', valor: 1 }
    }
};

// La estructura de asistencia ahora será: { fecha: 'YYYY-MM-DD', estatus: 'asistio', horaEntrada: 'HH:MM', horaSalida: 'HH:MM', bonos: ['produccion'] }
export const trabajadoresDB = [
    {
        id: 1,
        nombre: 'Juan',
        apellidos: 'Pérez García',
        cargo: 'Tablajero Principal',
        fechaIngreso: '2023-01-15',
        diaDescanso: 'Martes',
        activo: true,
        asistencia: [],
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
        diaDescanso: 'Miércoles',
        activo: true,
        asistencia: [],
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
        diaDescanso: 'Jueves',
        activo: true,
        asistencia: [],
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
        diaDescanso: 'Lunes',
        activo: false,
        asistencia: [],
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