export const catalogoProductos = [
  // ======================================
  // PECHUGA
  // ======================================
  {
    id: 'PECH',
    nombre: 'Pechuga',
    imagen: '../../../images/catalogo/PECH.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios:  { publico: 120, cocina: 117, aliado: 110, leal: 110, mayoreo: 105 },
    personalizaciones: [
      {
        grupo: "Procesamientos",
        tipo: "checkbox",
        default: ['E'], //  (asegúrate de que los IDs aquí también estén en mayúsculas si los cambiaste en las opciones)
        options: [
          { id: 'E', nombre: 'Entera' }, // 
          { id: 'C2', nombre: 'Cortada en 2' }, // 
          { id: 'C3', nombre: 'Cortada en 3' }, // 
          { id: 'C4', nombre: 'Cortada en 4' }, // 
          { id: 'C6', nombre: 'Cortada en 6' }, // 
          { id: 'S/P', nombre: 'Sin piel' }, // 
          { id: 'S/H', nombre: 'Sin Hueso' }, // 
          { id: 'PP', nombre: 'En Pulpa' }, // 
          { id: 'ASR', nombre: 'Asar' }, // 
          { id: 'FR', nombre: 'Freir' }, // 
          { id: 'MIL', nombre: 'Milanesa' }, // 
          { id: 'FJ', nombre: 'Fajitas' }, // 
          { id: 'CUB', nombre: 'Cubos' }, // 
          { id: 'MOL', nombre: 'Molida' }, // 
        ]
      }
    ],
    subproductos: [
      {
        id: 'PP-PECH', // 
        nombre: 'Pulpa de Pechuga',
        tipoVenta: 'peso',
        precios: { publico: 185, cocina: 175, leal: null, aliado: null, mayoreo: 150 },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['MIL'],
          options: [
            { id: 'E', nombre: 'Entera' }, // 
            { id: 'ASR', nombre: 'Asar' }, // 
            { id: 'FR', nombre: 'Freir' }, // 
            { id: 'MIL', nombre: 'Milanesa' }, // 
            { id: 'FJ', nombre: 'Fajitas' }, // 
            { id: 'CUB', nombre: 'Cubos' }, // 
            { id: 'MOL', nombre: 'Molida' }, // 
          ]
        }]
      }
    ]
  },

  // ======================================
  // ALA
  // ======================================
  {
    id: 'AL',
    nombre: 'Ala',
    imagen: '../../../images/catalogo/AL.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 100, cocina: 85, aliado: 85, leal: null, mayoreo: null },
    promociones: [
      { tipo: 'publico', desde: 10, precio: 120 }
    ],
    personalizaciones: [{
      grupo: "Procesamientos",
      tipo: "checkbox",
      default: ['E'],
      options: [
        { id: 'E', nombre: 'Entera' },
        { id: 'C2', nombre: 'Cortada en 2' }, // 
        { id: 'C3', nombre: 'Cortada en 3' } // 
      ]
    }]
  },

  // ======================================
  // RETAZO
  // ======================================
  {
    id: 'RTZ',
    nombre: 'Retazo',
    imagen: '../../../images/catalogo/RTZ.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 100, cocina: 85, aliado: 85, leal: null, mayoreo: null },
    promociones: [
      { desde: 3, precio: 33.33 },
      { desde: 5, precio: 20 }
    ],
    personalizaciones: [{
      grupo: "Procesamientos",
      tipo: "checkbox",
      default: ['E'],
      options: [
        { id: 'E', nombre: 'Entero' },
        { id: 'C', nombre: 'Cortado' }, // 
        { id: 'S/P', nombre: 'Sin piel' } // 
        
      ]
    }],
    variantes: [
      {
        id: 'RTZ | AL', // 
        nombre: 'Retazo con ala',
        tipoVenta: 'peso',
        precios: { publico: 55, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['E'],
          options: [
            { id: 'E', nombre: 'Entero' },
            { id: 'S/P', nombre: 'Sin piel' }, // 
            { id: 'C', nombre: 'Cortado' } // 
          ]
        }]
      }
    ],
    subproductos: [
      {
        id: 'H', // 
        nombre: 'Huacal',
        tipoVenta: 'peso',
        precios: { publico: 45, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['E'],
          options: [
            { id: 'E', nombre: 'Entero' }, // 
            { id: 'S/P', nombre: 'Sin piel' }, // 
            { id: 'C', nombre: 'Cortado' } // 
            
          ]
        }]
      },
      {
        id: 'CD', // 
        nombre: 'Cadera',
        tipoVenta: 'peso',
        precios: { publico: 45, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['C'],
          options: [
            { id: 'E', nombre: 'Entero' }, // 
            { id: 'S/P', nombre: 'Sin piel' }, // 
            { id: 'C', nombre: 'Cortada' } // 
            
          ]
        }]
      }
    ]
  },

  // ======================================
  // PERNILES
  // ======================================
  {
    id: 'PM', // 
    nombre: 'Pierna con Muslo',
    imagen: '../../../images/catalogo/PM.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 100, cocina: 85, aliado: 85, leal: null, mayoreo: null },
    personalizaciones: [{
      grupo: "Procesamientos",
      tipo: "checkbox",
      default: ['C'],
      options: [
        { id: 'E', nombre: 'Enteras' }, // 
        { id: 'C', nombre: 'Cortadas' }, // 
        { id: 'S/P', nombre: 'Sin piel' }, // 
        { id: 'S/H', nombre: 'Sin Hueso' }, // 
        { id: 'PP', nombre: 'En Pulpa' }, // 
        { id: 'ASR', nombre: 'Asar' }, // 
        { id: 'FR', nombre: 'Freir' }, // 
        { id: 'MIL', nombre: 'Milanesa' }, // 
        { id: 'FJ', nombre: 'Fajitas' }, // 
        { id: 'CUB', nombre: 'Cubos' }, // 
        { id: 'MOL', nombre: 'Molida' } // 
      ]
    }],
    subproductos: [
      {
        id: 'PP-PM', // 
        nombre: 'Pulpa de Pierna con Muslo',
        tipoVenta: 'peso',
        precios: { publico: 125, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['E'],
          options: [
            { id: 'E', nombre: 'Sin Procesar' }, // 
            { id: 'MOL', nombre: 'Molida' } // 
          ]
        }]
      }
    ],
    especiales: [
      {
        id: 'PG', // 
        nombre: 'Pierna',
        tipoVenta: 'peso',
        precios: { publico: 105, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['E'],
          options: [
            { id: 'E', nombre: 'Entera' }, // 
            { id: 'C', nombre: 'Cortada' }, // 
            { id: 'S/P', nombre: 'Sin piel' }, // 
            { id: 'S/H', nombre: 'Sin Hueso' }, // 
            { id: 'PP', nombre: 'En Pulpa' }, // 
            { id: 'ASR', nombre: 'Asar' }, // 
            { id: 'FR', nombre: 'Freir' }, // 
            { id: 'MIL', nombre: 'Milanesa' }, // 
            { id: 'MOL', nombre: 'Molida' } // 
          ]
        }]
      },
      {
        id: 'MSL', // 
        nombre: 'Muslo',
        tipoVenta: 'peso',
        precios: { publico: 100, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['E'],
          options: [
            { id: 'E', nombre: 'Entero' }, // 
            { id: 'C', nombre: 'Cortado' }, // 
            { id: 'S/P', nombre: 'Sin piel' }, // 
            { id: 'S/H', nombre: 'Sin Hueso' }, // 
            { id: 'PP', nombre: 'En Pulpa' }, // 
            { id: 'ASR', nombre: 'Asar' }, // 
            { id: 'FR', nombre: 'Freir' }, // 
            { id: 'MIL', nombre: 'Milanesa' }, // 
            { id: 'MOL', nombre: 'Molido' } // 
          ]
        }]
      }
    ]
  },

  // ======================================
  // PATAS
  // ======================================
  {
    id: 'PT', // 
    nombre: 'Patas',
    imagen: '../../../images/catalogo/PT.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 65, cocina: null, leal: null, aliado: null, mayoreo: null }
  },

  // ======================================
  // MOLLEJA CON HIGADO
  // ======================================
  {
    id: 'MHG', // 
    nombre: 'Molleja con Hígado',
    imagen: './js/data/images/MLJ.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 40, cocina: null, leal: null, aliado: null, mayoreo: null },
    promociones: [{ desde: 2, precio: 35 }],
    personalizaciones: [{
      grupo: "Procesamientos",
      tipo: "checkbox",
      default: [],
      options: [
        { id: 'S/G', nombre: 'Sin grasa' } // 
      ]
    }],
    especiales: [
      {
        id: 'HG', // 
        nombre: 'Hígado',
        tipoVenta: 'peso',
        precios: { publico: 35, cocina: null, leal: null, aliado: null, mayoreo: null }
      },
      {
        id: 'MLJ', // 
        nombre: 'Molleja',
        tipoVenta: 'peso',
        precios: { publico: 75, cocina: null, leal: null, aliado: null, mayoreo: null },
        personalizaciones: [{
          grupo: "Procesamientos",
          tipo: "checkbox",
          default: ['S/G'],
          options: [
            { id: 'S/G', nombre: 'Sin grasa' } // 
          ]
        }]
      }
    ]
  },

  // ======================================
  // POLLO ENTERO
  // ======================================
  {
    id: 'PE', // 
    nombre: 'Pollo Entero',
    imagen: '../../../images/catalogo/PE.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 90, cocina: null, leal: null, aliado: null, mayoreo: null },
    promociones: [{ tipo: 'peso', desde: 8, precio: 82 }], // Asumiendo que 3 pollos son ~8kg
    personalizaciones: [{
      grupo: "Procesamientos",
      tipo: "radio",
      default: ['DST4'], // 
      options: [
        { id: 'E', nombre: 'Entero' }, // 
        { id: 'DST2', nombre: 'Destazado (Pechuga en 2)' }, // 
        { id: 'DST4', nombre: 'Destazado (Pechuga en 4)' }, // 
        { id: 'DST6', nombre: 'Destazado (Pechuga en 6)' }, // 
        { id: 'DST-ASR', nombre: 'Destazado (Pechuga p/Asar)' }, // 
        { id: 'DST-FR', nombre: 'Destazado (Pechuga p/Freir)' }, // 
        { id: 'DST-MIL', nombre: 'Destazado (Pechuga p/Milanesa)' }, // 
        { id: 'DST-FJ', nombre: 'Destazado (Pechuga p/Fajitas)' }, // 
      ]
    }],
    variantes: [
      {
        id: 'CNL', // 
        nombre: 'Canal',
        tipoVenta: 'peso',
        precios: { publico: 75, cocina: null, leal: null, aliado: null, mayoreo: null }
      }
    ]
  },

  // ======================================
  // SURTIDA
  // ======================================
  {
    id: 'SRT', // 
    nombre: 'Surtida',
    imagen: '../../../images/catalogo/SRT.png', // <-- Ruta local
    tipoVenta: 'peso',
    precios: { publico: 85, cocina: 74, leal: null, aliado: null, mayoreo: null },
    promociones: [{ desde: 2, precio: 80 }, { desde: 3, precio: 70 }],
    personalizaciones: [{
      grupo: "Procesamientos",
      tipo: "checkbox",
      default: ['C | H'],
      options: [
        { id: 'C | H', nombre: 'Con Huacal' }, // 
        { id: 'C | CD', nombre: 'Con Cadera' }, // 
        { id: 'S/P', nombre: 'Sin piel' } // 
      ]
    }]
  },
  // ======================================
  // DESPERDICIO 
  // ======================================
  {
    id: 'DSP',
    nombre: 'Surtido',
    imagen: '../../../images/catalogo/DSP.png', // <-- Ruta local
    tipoVenta: 'peso',
    // El precio de 'publico' aquí actúa como el precio por defecto de la variante "Desperdicio Surtido".
    precios: { publico: 15, cocina: null, leal: null, aliado: null, mayoreo: null },
    // El "Desperdicio" base no tiene personalizaciones propias.
    personalizaciones: [], 
    
    variantes: [
      {
        id: 'DSH',
        nombre: 'Solo Huesos',
        tipoVenta: 'peso',
        precios: { publico: 20, cocina: null, leal: null, aliado: null, mayoreo: null },
        // Puedes añadir personalizaciones aquí si es necesario
      },
      {
        id: 'CBZ',
        nombre: 'Cabezas',
        tipoVenta: 'peso',
        precios: { publico: 20, cocina: null, leal: null, aliado: null, mayoreo: null },
      },
      {
        id: 'DSL',
        nombre: 'Piezas Last..das',
        tipoVenta: 'peso',
        precios: { publico: 25, cocina: null, leal: null, aliado: null, mayoreo: null },
      }
    ]
  },
  
];