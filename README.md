# Sparta Barbershop — Sistema de Reservas

Sistema web de gestión de turnos para una barbería. Permite a los clientes reservar servicios en línea y al personal administrar empleados, horarios, servicios y reservas desde un panel dedicado.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion |
| Backend | Node.js · Express · PostgreSQL · JWT |
| Auth | JWT con roles (`admin`, `empleado`, `cliente`) |

## Estructura

```
SistemaReserva/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   ├── scripts/
│   │   ├── seed-admin.js        # Crea el usuario admin inicial
│   │   └── migrate-schema.sql   # Esquema de base de datos
│   └── server.js
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── layouts/
        └── pages/
```

## Configuración

### Variables de entorno — Backend

Crear `backend/.env` a partir de `backend/.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservas_bd
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=clave_secreta_fuerte
JWT_EXPIRES_IN=1d
```

### Levantar el proyecto

**Backend**
```bash
cd backend
npm install
npm run dev          # Desarrollo con nodemon
npm start            # Producción
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

El backend corre en `http://localhost:3000` y el frontend en `http://localhost:5173`.

### Crear usuario administrador

```bash
cd backend
node scripts/seed-admin.js
```

## API — Endpoints principales

Todos los endpoints protegidos requieren `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/api/auth/login` | Público | Iniciar sesión (staff) |
| `POST` | `/api/auth/register` | Público | Registrar cliente |
| `GET` | `/api/servicios` | Público | Listar servicios |
| `GET` | `/api/clientes` | Admin / Empleado | Listar clientes |
| `GET` | `/api/reservas` | Admin / Empleado | Listar reservas |
| `POST` | `/api/reservas` | Admin / Empleado | Crear reserva |
| `GET` | `/api/horarios` | Admin / Empleado | Listar horarios |
| `GET` | `/api/empleados` | Admin | Listar empleados |
| `GET` | `/api/mis-reservas` | Cliente autenticado | Reservas del cliente |
| `POST` | `/api/mis-reservas` | Cliente autenticado | Crear propia reserva |

### Health check

```http
GET http://localhost:3000/health
GET http://localhost:3000/health/db
```

## Base de datos

Esquema en `backend/scripts/migrate-schema.sql`. Tablas principales:

- `usuarios` — staff con roles `admin` / `empleado`
- `clientes` — clientes registrados

- `servicios` — catálogo de servicios con precio y duración
- `horarios` — disponibilidad semanal por empleado
- `reservas` — turnos con validación de traslape

## Roles y permisos

| Rol | Acceso |
|-----|--------|
| `admin` | Panel completo: empleados, clientes, servicios, horarios, reservas |
| `empleado` | Ve sus propias reservas y horarios |
| `cliente` | Reserva servicios, consulta sus turnos desde el portal público |
