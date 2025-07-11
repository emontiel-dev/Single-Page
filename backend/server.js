import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (Vite)
app.use(express.json()); // Permite entender el body de las peticiones como JSON

const dataPath = path.resolve('./backend/data');
const clientesFilePath = path.join(dataPath, 'clientes.json');

// Endpoint para obtener los clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const clientesData = await fs.readFile(clientesFilePath, 'utf-8');
        res.json(JSON.parse(clientesData));
    } catch (error) {
        res.status(500).json({ message: 'Error al leer los datos de clientes' });
    }
});

// --- NUEVO: Endpoint para crear un cliente ---
app.post('/api/clientes', async (req, res) => {
    try {
        const nuevoCliente = req.body;
        const clientesData = await fs.readFile(clientesFilePath, 'utf-8');
        const clientes = JSON.parse(clientesData);

        const nuevoId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
        nuevoCliente.id = nuevoId;

        clientes.push(nuevoCliente);

        await fs.writeFile(clientesFilePath, JSON.stringify(clientes, null, 2), 'utf-8');
        res.status(201).json(nuevoCliente);
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ message: 'Error al crear el cliente' });
    }
});

// Puedes añadir más endpoints aquí (PUT, DELETE) para modificar los datos

app.listen(port, () => {
    console.log(`Backend server escuchando en http://localhost:${port}`);
});