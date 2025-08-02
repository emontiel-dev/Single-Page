export const nominaConfig = {
    horasNormales: 8,
    diasParaDescansoCompleto: 6,
    cargos: {
        'Administrador': { valorHora: 30, valorExtra: 35, horario: null, rol: 'admin' },
        'Procesador': { valorHora: 24, valorExtra: 28, horario: '04:00-14:00', rol: 'procesador' },
        'Tablajero': { valorHora: 27, valorExtra: 31, horario: '06:30-16:00', rol: 'tablajero' },
        'Cajero': { valorHora: 25, valorExtra: 29, horario: '06:30-16:00', rol: 'cajero' },
        'Repartidor': { valorHora: 25, valorExtra: 30, horario: '06:30-16:00', rol: 'repartidor' }
    },
    bonos: {
        produccion: { id: 'produccion', descripcion: 'Bono de Producción', tipo: 'monto', valor: 25 },
        ventas: { id: 'ventas', descripcion: 'Bono de Ventas', tipo: 'monto', valor: 25 },
        eficiencia: { id: 'eficiencia', descripcion: 'Punto de Eficiencia', tipo: 'puntos', valor: 1 },
        desempeno: { id: 'desempeno', descripcion: 'Punto de Desempeño', tipo: 'puntos', valor: 1 }
    }
};

// La estructura de asistencia ahora será: { fecha: 'YYYY-MM-DD', estatus: 'asistio', horaEntrada: 'HH:MM', horaSalida: 'HH:MM', bonos: ['produccion'] }
// NUEVO: Se puede añadir un objeto `nominaOverrides` a cada trabajador para valores personalizados.
// Ejemplo: nominaOverrides: { valorHora: 28, horario: '07:00-15:00' }
export const trabajadoresDB = [
    {
        id: 1,
        nombre: 'Juan Valentin',
        apellidos: 'Herrera Torres',
        cargo: 'Procesador',
        fechaIngreso: '2023-01-15',
        diaDescanso: 'Martes',
        activo: true,
        asistencia: [],
        usuario: {
            username: 'juanv',
            permisos: ['pedidos', 'items.tablajero', 'clientes']
        }
    },
    {
        id: 2,
        nombre: 'Nora',
        apellidos: 'Chavez Cortéz',
        cargo: 'Tablajero',
        fechaIngreso: '2023-05-20',
        diaDescanso: 'Viernes',
        activo: true,
        asistencia: [],
        usuario: {
            username: 'nora',
            permisos: ['venta', 'items.tablajero', 'clientes']
        }
    },
    {
        id: 3,
        nombre: 'Ciro',
        apellidos: 'Montiel Oropeza',
        cargo: 'Administrador',
        fechaIngreso: '2024-02-01',
        diaDescanso: 'Jueves',
        activo: true,
        asistencia: [],
        usuario: {
            username: 'ciro',
            permisos: ['venta', 'caja', 'pedidos', 'items.tablajero', 'clientes', 'trabajadores']
        }
    },
    {
        id: 4,
        nombre: 'Rosy',
        apellidos: 'Sanchez Perez',
        cargo: 'Administrador',
        fechaIngreso: '2025-02-01',
        diaDescanso: 'Sábado',
        activo: true,
        asistencia: [],
        usuario: {
            username: 'rozy',
            permisos: ['venta', 'caja', 'pedidos', 'items.tablajero', 'clientes', 'trabajadores']
        }
    },
    {
        id: 5,
        nombre: 'Yesenia',
        apellidos: 'Aguilar Morales',
        cargo: 'Cajero',
        fechaIngreso: '2022-11-10',
        diaDescanso: 'Miércoles',
        activo: true,
        asistencia: [],
        usuario: {
            username: 'yess',
            rol: 'cajero',
            permisos: ['venta', 'caja', 'pedidos', 'clientes']
        }
    }
];

export const ROLES = {
    ADMIN: 'admin',
    PROCESADOR: 'procesador',
    TABLAJERO: 'tablajero',
    CAJERO: 'cajero',
    REPARTIDOR: 'repartidor'
};

export const PERMISOS = {
    VENTA: { id: 'venta', descripcion: 'Acceso al módulo de ventas' },
    CAJA: { id: 'caja', descripcion: 'Acceso al módulo de caja' },
    PEDIDOS: { id: 'pedidos', descripcion: 'Gestionar todos los pedidos' },
    ITEMS_TABLAJERO: { id: 'items.tablajero', descripcion: 'Ver y marcar items para tablajeros' },
    CLIENTES: { id: 'clientes', descripcion: 'Gestionar la base de datos de clientes' },
    TRABAJADORES: { id: 'trabajadores', descripcion: 'Gestionar trabajadores y usuarios' }
};