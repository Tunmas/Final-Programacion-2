// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(express.json());
app.use(cors());

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
    const { id } = req.params;
    const { nombre, barrio, apellido } = req.body;

    try {
        const result = await pool.query(
            'UPDATE clientes SET nombre = $1, barrio = $2, apellido = $3 WHERE id = $4 RETURNING *',
            [nombre, barrio, apellido, id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Cliente no encontrado');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el dato');
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
