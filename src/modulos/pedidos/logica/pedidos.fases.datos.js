export const FASES_PEDIDO = {
    GUARDADO: {
        id: 'GUARDADO',
        nombre: 'Guardado',
        color: 'var(--blanco)',
        backgroundColor: 'var(--azul-info)'
    },
    PROCESANDO: {
        id: 'PROCESANDO',
        nombre: 'Procesando',
        color: 'var(--negro-azabache)',
        backgroundColor: 'var(--amarillo-polleria)'
    },
    LISTO_PARA_ENTREGA: {
        id: 'LISTO_PARA_ENTREGA',
        nombre: 'Listo p/entrega',
        color: 'var(--blanco)',
        backgroundColor: 'var(--verde-accion)' // Usaremos un verde distintivo
    },
    EN_RUTA: {
        id: 'EN_RUTA',
        nombre: 'En Ruta',
        color: 'var(--blanco)',
        backgroundColor: 'var(--verde-exito)'
    },
    COMPLETADO: {
        id: 'COMPLETADO',
        nombre: 'Completado',
        color: 'var(--blanco)',
        backgroundColor: 'var(--gris-texto-secundario)'
    },
    CANCELADO: {
        id: 'CANCELADO',
        nombre: 'Cancelado',
        color: 'var(--blanco)',
        backgroundColor: 'var(--rojo-peligro)'
    }
};