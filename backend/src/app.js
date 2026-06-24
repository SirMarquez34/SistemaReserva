const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const horarioRoutes = require('./routes/horarioRouter');
const empleadoRoutes = require('./routes/empleadoRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

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
app.use('/empleados', empleadoRoutes);


app.use(notFound);

app.use(errorHandler);

module.exports = app;
