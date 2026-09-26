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

// Ruta base para verificar estado
app.get('/api', (req, res) => {
  res.send('API Refaccionaria Mecanicus activa 🚀');
});

// ==========================================
// 1. RUTAS PARA PIEZAS (INVENTARIO)
// ==========================================

// Obtener todas las piezas
app.get('/api/piezas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM piezas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener piezas' });
  }
});

// Registrar una nueva pieza
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
// 2. RUTAS PARA USUARIOS
// ==========================================

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Registrar un nuevo usuario
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});