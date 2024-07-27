// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT3 || 3003;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(cors());

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos:', res.rows[0]);
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pedido');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los datos');
    }
});

app.post('/api/pedidos', async (req, res) => {
    const { Fecha, Cliente, Articulo, Precio, Cantidad } = req.body;

    console.log("Server received a request.");

    try {
        const result = await pool.query(
            'INSERT INTO pedido (fecha, cliente, articulo, precio, cantidad) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [Fecha, Cliente, Articulo, Precio, Cantidad]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al insertar los datos:', err);
        res.status(500).send('Error al insertar los datos');
    }
});

app.put('/api/pedidos/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { cantidad } = req.body;

    if (isNaN(id)) {
        return res.status(400).send('ID inválido');
    }

    try {
        const result = await pool.query(
            'UPDATE pedido SET cantidad = $1 WHERE id = $2 RETURNING *',
            [cantidad, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Pedido no encontrado');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar el pedido:', err);
        res.status(500).send('Error al actualizar el pedido');
    }
});

app.get('/api/cliente', async (req, res) => {
    const { nombre, apellido } = req.query;

    console.log('Nombre recibido:', nombre);
    console.log('Apellido recibido:', apellido);

    try {
        const result = await pool.query(
            'SELECT activo FROM clientes WHERE nombre ILIKE $1 AND apellido ILIKE $2',
            [nombre, apellido]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        // Extraer el estado del cliente del resultado
        const estado = result.rows[0].activo;
        console.log('Estado del cliente:', estado);

        // Devolver el estado del cliente como respuesta
        res.json({ activo: estado });
    } catch (err) {
        console.error('Error al obtener el estado del cliente:', err);
        res.status(500).send('Error al obtener el estado del cliente');
    }
});







app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
