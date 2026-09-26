const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'cliente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS piezas (
        id SERIAL PRIMARY KEY,
        codigo_parte VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Base de datos configurada correctamente.');
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  }
};

initDb();

app.get('/', (req, res) => {
  res.send('API Refaccionaria Mecanicus activa 🚀');
});

app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, creado_en',
      [nombre, email, password, rol || 'cliente']
    );
    res.status(201).json({ mensaje: 'Usuario registrado', usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/piezas', async (req, res) => {
  const { codigo_parte, nombre, descripcion, precio, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO piezas (codigo_parte, nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [codigo_parte, nombre, descripcion, precio, stock || 0]
    );
    res.status(201).json({ mensaje: 'Pieza registrada', pieza: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar pieza' });
  }
});

app.get('/api/piezas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM piezas ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar piezas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
