const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const horarioRoutes = require('./routes/horarioRouter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');




const app = express();

// Permite recibir datos JSON en el cuerpo de las peticiones.
app.use(express.json());

// Habilita peticiones desde el frontend u otros clientes como Postman.
app.use(cors());

// Ruta simple para comprobar que la API esta activa.
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend del sistema de reservas funcionando',
  });
});

// Ruta temporal para validar que PostgreSQL responde correctamente.
app.get('/health/db', async (req, res, next) => {
  try {
    const result = await db.query('SELECT NOW() AS fecha_servidor');

    res.json({
      ok: true,
      message: 'Conexion a PostgreSQL correcta',
      database: process.env.DB_NAME,
      fecha_servidor: result.rows[0].fecha_servidor,
    });
  } catch (error) {
    next(error);
  }
});

app.use('/auth', authRoutes);

app.use('/clientes', clientRoutes);
app.use('/servicios', serviceRoutes);
app.use('/reservas', reservationRoutes);
app.use('/horarios', horarioRoutes);


app.use(notFound);

app.use(errorHandler);

module.exports = app;
