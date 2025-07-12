const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rutas de la API
app.get('/api/clientes', async (req, res) => {
    try {
        // Usamos la capacidad de Supabase para obtener datos relacionados en una sola consulta.
        // Esto pide todos los clientes y, para cada uno, todos sus telefonos y direcciones.
        const { data: clientes, error } = await supabase
            .from('clientes')
            .select(`
                id,
                nombre,
                apellidos,
                alias,
                telefonos ( tipo, numero ),
                direcciones ( tipo, direccion, referencias, lat, long )
            `);

        if (error) {
            throw error;
        }

        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// --- AÑADIR NUEVO ENDPOINT PARA CREAR CLIENTES ---
app.post('/api/clientes', async (req, res) => {
    const { nombre, apellidos, alias, tipo_precio, telefonos, direcciones } = req.body;

    try {
        // 1. Insertar el cliente principal
        const { data: nuevoCliente, error: clienteError } = await supabase
            .from('clientes')
            .insert({ nombre, apellidos, alias, tipo_precio: tipo_precio || 'publico' })
            .select()
            .single();

        if (clienteError) throw clienteError;

        const clienteId = nuevoCliente.id;

        // 2. Insertar teléfonos si existen
        if (telefonos && telefonos.length > 0) {
            const telefonosParaInsertar = telefonos.map(t => ({ ...t, cliente_id: clienteId }));
            const { error: telefonoError } = await supabase.from('telefonos').insert(telefonosParaInsertar);
            if (telefonoError) throw telefonoError;
        }

        // 3. Insertar direcciones si existen
        if (direcciones && direcciones.length > 0) {
            const direccionesParaInsertar = direcciones.map(d => ({ ...d, cliente_id: clienteId }));
            const { error: direccionError } = await supabase.from('direcciones').insert(direccionesParaInsertar);
            if (direccionError) throw direccionError;
        }

        res.status(201).json(nuevoCliente);

    } catch (error) {
        console.error('Error al crear cliente:', error.message);
        res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
    }
});

// --- AÑADIR NUEVO ENDPOINT PARA ACTUALIZAR CLIENTES ---
app.patch('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, alias, tipo_precio, telefonos, direcciones } = req.body;

    try {
        // 1. Actualizar el cliente principal
        const { data: clienteActualizado, error: clienteError } = await supabase
            .from('clientes')
            .update({ nombre, apellidos, alias, tipo_precio: tipo_precio || 'publico' })
            .eq('id', id)
            .select()
            .single();

        if (clienteError) throw clienteError;
        if (!clienteActualizado) return res.status(404).json({ message: 'Cliente no encontrado' });

        // 2. Actualizar teléfonos: borrar los existentes y re-insertar los nuevos.
        await supabase.from('telefonos').delete().eq('cliente_id', id);
        if (telefonos && telefonos.length > 0) {
            const telefonosParaInsertar = telefonos.map(t => ({ ...t, cliente_id: id }));
            const { error: telefonoError } = await supabase.from('telefonos').insert(telefonosParaInsertar);
            if (telefonoError) throw telefonoError;
        }

        // 3. Actualizar direcciones: misma estrategia de borrar y re-insertar.
        await supabase.from('direcciones').delete().eq('cliente_id', id);
        if (direcciones && direcciones.length > 0) {
            const direccionesParaInsertar = direcciones.map(d => ({ ...d, cliente_id: id }));
            const { error: direccionError } = await supabase.from('direcciones').insert(direccionesParaInsertar);
            if (direccionError) throw direccionError;
        }

        res.status(200).json(clienteActualizado);

    } catch (error) {
        console.error(`Error al actualizar cliente ${id}:`, error.message);
        res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
    }
});

// --- AÑADIR NUEVO ENDPOINT PARA ELIMINAR CLIENTES ---
app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            // Si el error es por una restricción de clave foránea (ej. el cliente tiene pedidos)
            if (error.code === '23503') {
                return res.status(409).json({ 
                    message: 'Este cliente no se puede eliminar porque tiene pedidos asociados. Considera inactivar al cliente en el futuro.',
                    code: 'HAS_RELATED_RECORDS'
                });
            }
            throw error;
        }

        res.status(204).send(); // 204 No Content: Éxito, sin cuerpo de respuesta.

    } catch (error) {
        console.error(`Error al eliminar cliente ${id}:`, error.message);
        res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});