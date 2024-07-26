// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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

app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los datos');
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10); // Asegúrate de convertir el id a un número entero
    const { activo } = req.body;

    if (isNaN(id)) {
        return res.status(400).send('ID inválido');
    }

    try {
        const result = await pool.query(
            'UPDATE clientes SET activo = $1 WHERE id = $2 RETURNING *',
            [activo, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar el cliente:', err);
        res.status(500).send('Error al actualizar el cliente');
    }
});


app.post('/api/clientes', async (req, res) => {
    const { Nombre, Barrio, Apellido } = req.body;

    console.log("server");

    try {
        const result = await pool.query(
            'INSERT INTO clientes (nombre, barrio, apellido) VALUES ($1, $2, $3) RETURNING *',
            [Nombre, Barrio, Apellido]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al insertar los datos');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
