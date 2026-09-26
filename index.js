const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir la interfaz gráfica (index.html)
app.use(express.static('.'));

// Configuración de conexión a PostgreSQL en Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Inicialización de tablas en la Base de Datos
const inicializarBaseDeDatos = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS piezas (
          id SERIAL PRIMARY KEY,
          codigo_parte VARCHAR(50) NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          precio NUMERIC(10, 2) NOT NULL,
          stock INT NOT NULL DEFAULT 0,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS autos (
          id SERIAL PRIMARY KEY,
          marca VARCHAR(50) NOT NULL,
          modelo VARCHAR(50) NOT NULL,
          anio INT NOT NULL,
          placa VARCHAR(20) UNIQUE,
          cliente VARCHAR(100),
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          rol VARCHAR(20) DEFAULT 'usuario',
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tablas (piezas, autos, usuarios) creadas/verificadas en PostgreSQL');
  } catch (err) {
    console.error('❌ Error al inicializar tablas:', err);
  }
};

inicializarBaseDeDatos();

// Ruta base
app.get('/api', (req, res) => {
  res.send('API Refaccionaria Mecanicus activa 🚀');
});

// ==========================================
// 1. RUTAS PARA PIEZAS
// ==========================================
app.get('/api/piezas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM piezas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener piezas' });
  }
});

app.post('/api/piezas', async (req, res) => {
  const { codigo_parte, nombre, descripcion, precio, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO piezas (codigo_parte, nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [codigo_parte, nombre, descripcion, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar pieza' });
  }
});

// ==========================================
// 2. RUTAS PARA AUTOS
// ==========================================
app.get('/api/autos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM autos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener autos' });
  }
});

app.post('/api/autos', async (req, res) => {
  const { marca, modelo, anio, placa, cliente } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO autos (marca, modelo, anio, placa, cliente) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [marca, modelo, anio, placa, cliente]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar auto' });
  }
});

// ==========================================
// 3. RUTAS PARA USUARIOS
// ==========================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, creado_en',
      [nombre, email, password, rol || 'usuario']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});