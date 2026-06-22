require('dotenv').config({ quiet: true });

const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const ADMIN = {
  nombre: 'Administrador',
  correo: 'admin@reservas.com',
  contrasena: 'Admin1234',
  rol: 'admin',
};

const SALT_ROUNDS = 10;

async function seedAdmin() {
  const existing = await db.query(
    'SELECT pk_usuario FROM usuarios WHERE correo = $1',
    [ADMIN.correo]
  );

  if (existing.rows.length > 0) {
    console.log(`El usuario admin ya existe (correo: ${ADMIN.correo}). No se creó nada.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN.contrasena, SALT_ROUNDS);

  const result = await db.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING pk_usuario, nombre, correo, rol`,
    [ADMIN.nombre, ADMIN.correo, hashedPassword, ADMIN.rol]
  );

  const user = result.rows[0];

  console.log('Admin creado exitosamente:');
  console.log(`  ID:     ${user.pk_usuario}`);
  console.log(`  Nombre: ${user.nombre}`);
  console.log(`  Correo: ${user.correo}`);
  console.log(`  Rol:    ${user.rol}`);
  console.log('');
  console.log('Credenciales para el primer login:');
  console.log(`  correo:    ${ADMIN.correo}`);
  console.log(`  contrasena: ${ADMIN.contrasena}`);
  console.log('');
  console.log('IMPORTANTE: Cambia la contraseña después del primer login.');
}

seedAdmin()
  .catch((error) => {
    console.error('Error al crear el admin:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
