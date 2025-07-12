require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Asegúrate de que tu archivo .env esté configurado
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    // Importamos dinámicamente los datos de clientes desde el archivo ES Module
    const { clientes: clientesData } = await import('../src/modulos/clientes/clientes.datos.js');

    console.log('Limpiando tablas existentes...');
    await supabase.from('telefonos').delete().neq('id', 0);
    await supabase.from('direcciones').delete().neq('id', 0);
    await supabase.from('clientes').delete().neq('id', 0);
    console.log('Tablas limpiadas.');

    console.log('Iniciando la inserción de datos...');

    for (const cliente of clientesData) {
        // 1. Inserta el cliente principal
        const { data: insertedCliente, error: clienteError } = await supabase
            .from('clientes')
            .insert({
                nombre: cliente.nombre,
                apellidos: cliente.apellidos,
                alias: cliente.alias,
                // Aquí podrías añadir lógica para asignar un tipo_precio diferente si quisieras
            })
            .select()
            .single();

        if (clienteError) {
            console.error(`Error insertando cliente ${cliente.nombre}:`, clienteError.message);
            continue;
        }

        const clienteId = insertedCliente.id;
        console.log(`Cliente insertado: ${insertedCliente.nombre} (ID: ${clienteId})`);

        // 2. Inserta sus teléfonos
        if (cliente.telefonos && cliente.telefonos.length > 0) {
            const telefonosToInsert = cliente.telefonos.map(t => ({ ...t, cliente_id: clienteId }));
            const { error } = await supabase.from('telefonos').insert(telefonosToInsert);
            if (error) console.error(`  -> Error en teléfonos:`, error.message);
        }

        // 3. Inserta sus direcciones
        if (cliente.direcciones && cliente.direcciones.length > 0) {
            const direccionesToInsert = cliente.direcciones.map(d => ({ ...d, cliente_id: clienteId }));
            const { error } = await supabase.from('direcciones').insert(direccionesToInsert);
            if (error) console.error(`  -> Error en direcciones:`, error.message);
        }
    }

    console.log('¡Proceso de seeding completado!');
}

seedData().catch(console.error);