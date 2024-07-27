const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configura CORS
app.use(cors()); // Permite todas las solicitudes de origen cruzado

app.use(express.json());

const port = process.env.PORT2 || 3002;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.get('/api/productos', async (req, res) => {
    try {
        const searchTerm = req.query.term || ''; 
        const result = await pool.query(
            'SELECT idarticulo, nombrearticulo FROM articulo WHERE nombrearticulo ILIKE $1',
            [`%${searchTerm}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los datos');
    }
});

app.get('/api/precios/:id', async (req, res) => {
    try {
        const idarticulo = req.params.id;
        const result = await pool.query(
            `SELECT precio FROM articulo WHERE idarticulo = ${idarticulo}`
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los datos');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
