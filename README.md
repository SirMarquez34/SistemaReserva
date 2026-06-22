# Sistema de Reserva

## Modelo Entidad Relacion

![Modelo ER](<Modelo ER.png>)

## Backend

La carpeta principal del backend esta en `SistemaReserva/backend`.

### Semana 1 - Avance

1. Estructura base creada dentro de `SistemaReserva/backend`.
2. Dependencias revisadas en `package.json` y `node_modules`; no fue necesario instalar de nuevo.
3. Express configurado en `src/app.js`.
4. Servidor configurado en `server.js`.
5. Conexion a PostgreSQL configurada con `pg` en `src/config/db.js`.
6. Base de datos inspeccionada en modo solo lectura; las tablas ya existen en `reservas_bd`.
7. Modelo de usuario creado en `src/models/userModel.js`.
8. Autenticacion JWT creada con registro, login y perfil.
9. Validaciones de entrada agregadas con `express-validator`.
10. Middleware de errores separado en `src/middleware/errorMiddleware.js`.

### Comandos

Desde la carpeta `SistemaReserva/backend`:

```bash
npm run dev
```

Tambien se puede ejecutar en modo normal:

```bash
npm start
```

Para inspeccionar tablas y columnas existentes sin modificar la base:

```bash
npm run inspect:db
```

### Variables de entorno

El archivo `SistemaReserva/backend/.env` contiene:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservas_bd
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=reserva_backend_jwt_secret_dev_cambiar_en_produccion
JWT_EXPIRES_IN=1d
```

En tu entorno local ya se configuro la conexion a PostgreSQL. `JWT_SECRET` debe cambiarse por una clave privada fuerte antes de usar el sistema en produccion.

### Ruta de prueba

```http
GET http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Backend del sistema de reservas funcionando"
}
```

### Ruta de prueba para PostgreSQL

Antes de probar esta ruta, revisa `SistemaReserva/backend/.env` y ajusta el usuario o password de PostgreSQL si no coinciden con tu pgAdmin 4.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservas_bd
DB_USER=postgres
DB_PASSWORD=tu_password
```

Luego prueba:

```http
GET http://localhost:3000/health/db
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Conexion a PostgreSQL correcta",
  "database": "reservas_bd",
  "fecha_servidor": "2026-06-10T00:00:00.000Z"
}
```

### Autenticacion

#### Registrar usuario

```http
POST http://localhost:3000/auth/register
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Administrador",
  "correo": "admin@correo.com",
  "contrasena": "123456",
  "rol": "admin"
}
```

#### Iniciar sesion

```http
POST http://localhost:3000/auth/login
Content-Type: application/json
```

Body:

```json
{
  "correo": "admin@correo.com",
  "contrasena": "123456"
}
```

La respuesta devuelve un `token` JWT.

#### Ver perfil

```http
GET http://localhost:3000/auth/profile
Authorization: Bearer TOKEN_AQUI
```

### Validaciones implementadas

`POST /auth/register` valida:

- `nombre` obligatorio, maximo 100 caracteres.
- `correo` obligatorio, formato email, maximo 100 caracteres.
- `contrasena` obligatoria, minimo 6 caracteres.
- `rol` obligatorio, maximo 50 caracteres.

`POST /auth/login` valida:

- `correo` obligatorio y con formato email.
- `contrasena` obligatoria.

Ejemplo de error de validacion:

```json
{
  "ok": false,
  "message": "Datos de entrada invalidos",
  "errors": [
    {
      "field": "correo",
      "message": "El correo debe tener un formato valido"
    }
  ]
}
```

## Base de datos

El script de creacion de tablas se encuentra en [schema.sql](schema.sql).

Importante: la base real conectada desde el backend se llama `reservas_bd`. Las tablas ya estaban creadas en PostgreSQL, por eso el backend no ejecuta `CREATE TABLE` automaticamente.

Incluye las tablas principales del sistema:

- `usuarios`
- `clientes`
- `servicios`
- `horarios`
- `reservas`

### Tabla usuarios detectada

La tabla `usuarios` ya existe con estos campos:

```text
pk_usuario integer PRIMARY KEY
nombre varchar(100) NOT NULL
correo varchar(100) UNIQUE NOT NULL
contrasena varchar(255) NOT NULL
rol varchar(50) NOT NULL
```

El modelo `src/models/userModel.js` usa consultas parametrizadas para:

- Buscar usuario por correo.
- Buscar usuario por id sin devolver la contrasena.
- Crear usuario devolviendo solo datos publicos.

## Archivos principales del backend

```text
SistemaReserva/backend/
├── server.js
├── package.json
├── .env.example
├── scripts/
│   └── inspect-db.js
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── authController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── errorMiddleware.js
    │   └── validateRequest.js
    ├── models/
    │   └── userModel.js
    ├── routes/
    │   └── authRoutes.js
    ├── services/
    │   └── authService.js
    ├── utils/
    │   └── jwt.js
    └── validators/
        └── authValidators.js
```

## Pruebas en Postman

Antes de probar, iniciar el backend:

```bash
cd SistemaReserva/backend
npm run dev
```

### 1. Probar servidor

Metodo: `GET`

URL:

```http
http://localhost:3000/health
```

Resultado esperado: status `200`.

### 2. Probar conexion a PostgreSQL

Metodo: `GET`

URL:

```http
http://localhost:3000/health/db
```

Resultado esperado: status `200` y mensaje `Conexion a PostgreSQL correcta`.

### 3. Registrar usuario

Metodo: `POST`

URL:

```http
http://localhost:3000/auth/register
```

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Administrador",
  "correo": "admin@correo.com",
  "contrasena": "123456",
  "rol": "admin"
}
```

Resultado esperado: status `201`, datos publicos del usuario y `token`.

Si el correo ya existe, la respuesta esperada es status `409`.

### 4. Iniciar sesion

Metodo: `POST`

URL:

```http
http://localhost:3000/auth/login
```

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "correo": "admin@correo.com",
  "contrasena": "123456"
}
```

Resultado esperado: status `200`, datos publicos del usuario y `token`.

### 5. Ver perfil

Metodo: `GET`

URL:

```http
http://localhost:3000/auth/profile
```

Headers:

```http
Authorization: Bearer TOKEN_AQUI
```

Resultado esperado: status `200` y datos del usuario autenticado.

### 6. Probar validaciones

Metodo: `POST`

URL:

```http
http://localhost:3000/auth/register
```

Body invalido:

```json
{
  "correo": "correo-invalido"
}
```

Resultado esperado: status `400` con errores de validacion.

?============= Backend Completo ===================

## Pruebas funcionales

| # | Funcionalidad | Casos cubiertos |
|---|---|---|
| 1 | Login / Autenticación | 7 casos (login válido, validaciones, token, perfil) |
| 2 | Clientes | 6 casos (CRUD, roles, 404) |
| 3 | Servicios | 6 casos (CRUD, validaciones de precio/duración, roles) |
| 4 | Horarios | 6 casos (validación hora_fin > hora_inicio, formato, actualización parcial) |
| 5 | Reservas | 7 casos (traslape, referencias inválidas, roles, formato de fecha) |

Ver documentación completa: [`docs/pruebas-funcionales.md`](SistemaReserva/docs/pruebas-funcionales.md)
