# Pruebas Funcionales — Sistema de Reservas

**Versión:** 1.0  
**Fecha:** 2026-06-22  
**Entorno:** `http://localhost:3000`  
**Herramienta:** Postman

---

## Variables de entorno (Postman)

| Variable | Descripción |
|---|---|
| `{{base_url}}` | `http://localhost:3000` |
| `{{token_admin}}` | Token JWT de un usuario con rol `admin` |
| `{{token_empleado}}` | Token JWT de un usuario con rol `empleado` |

---

## Tabla resumen

| # | Funcionalidad | Caso | Método | Endpoint | Rol | Estado esperado | ¿Pasó? |
|---|---|---|---|---|---|---|---|
| CP-L01 | Login | Login exitoso | POST | /auth/login | — | 200 + token | |
| CP-L02 | Login | Correo con formato inválido | POST | /auth/login | — | 400 | |
| CP-L03 | Login | Contraseña vacía | POST | /auth/login | — | 400 | |
| CP-L04 | Login | Correo no registrado | POST | /auth/login | — | 401 | |
| CP-L05 | Login | Contraseña incorrecta | POST | /auth/login | — | 401 | |
| CP-L06 | Login | Ver perfil con token válido | GET | /auth/profile | admin | 200 + datos | |
| CP-L07 | Login | Ver perfil sin token | GET | /auth/profile | — | 401 | |
| CP-C01 | Clientes | Crear cliente válido | POST | /clientes | admin | 201 | |
| CP-C02 | Clientes | Crear cliente sin nombre | POST | /clientes | admin | 400 | |
| CP-C03 | Clientes | Crear cliente con email inválido | POST | /clientes | admin | 400 | |
| CP-C04 | Clientes | Empleado consulta lista | GET | /clientes | empleado | 200 | |
| CP-C05 | Clientes | Cliente por ID inexistente | GET | /clientes/:id | admin | 404 | |
| CP-C06 | Clientes | Empleado intenta crear | POST | /clientes | empleado | 403 | |
| CP-S01 | Servicios | Admin crea servicio válido | POST | /servicios | admin | 201 | |
| CP-S02 | Servicios | Precio negativo | POST | /servicios | admin | 400 | |
| CP-S03 | Servicios | Duración igual a 0 | POST | /servicios | admin | 400 | |
| CP-S04 | Servicios | Empleado intenta crear | POST | /servicios | empleado | 403 | |
| CP-S05 | Servicios | Consultar todos | GET | /servicios | empleado | 200 | |
| CP-S06 | Servicios | Empleado intenta eliminar | DELETE | /servicios/:id | empleado | 403 | |
| CP-H01 | Horarios | Crear horario válido | POST | /horarios | admin | 201 | |
| CP-H02 | Horarios | hora_fin menor a hora_inicio | POST | /horarios | admin | 400 | |
| CP-H03 | Horarios | hora_fin igual a hora_inicio | POST | /horarios | admin | 400 | |
| CP-H04 | Horarios | Formato de hora inválido | POST | /horarios | admin | 400 | |
| CP-H05 | Horarios | Consultar lista de horarios | GET | /horarios | empleado | 200 | |
| CP-H06 | Horarios | Actualizar solo disponible | PUT | /horarios/:id | admin | 200 | |
| CP-R01 | Reservas | Crear reserva válida | POST | /reservas | admin | 201 | |
| CP-R02 | Reservas | Cliente inexistente | POST | /reservas | admin | 400 | |
| CP-R03 | Reservas | Servicio inexistente | POST | /reservas | admin | 400 | |
| CP-R04 | Reservas | Traslape de horario | POST | /reservas | admin | 409 | |
| CP-R05 | Reservas | Fecha con formato inválido | POST | /reservas | admin | 400 | |
| CP-R06 | Reservas | Empleado consulta reservas | GET | /reservas | empleado | 200 | |
| CP-R07 | Reservas | Empleado intenta eliminar | DELETE | /reservas/:id | empleado | 403 | |

---

## 1. Login / Autenticación

### CP-L01 — Login exitoso

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que un usuario registrado puede iniciar sesión y obtener un token JWT |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/auth/login` |
| **Headers** | `Content-Type: application/json` |
| **Datos de entrada** | `{ "correo": "admin@correo.com", "contrasena": "123456" }` |
| **Resultado esperado** | HTTP 200 · Respuesta contiene `ok: true` y campo `token` (string JWT) |
| **Resultado obtenido** | |

---

### CP-L02 — Correo con formato inválido

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador rechaza correos con formato incorrecto |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/auth/login` |
| **Headers** | `Content-Type: application/json` |
| **Datos de entrada** | `{ "correo": "correo-invalido", "contrasena": "123456" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · `errors[0].field: "correo"` · mensaje de formato inválido |
| **Resultado obtenido** | |

---

### CP-L03 — Contraseña vacía

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el campo contraseña es obligatorio |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/auth/login` |
| **Headers** | `Content-Type: application/json` |
| **Datos de entrada** | `{ "correo": "admin@correo.com", "contrasena": "" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error indicando que la contraseña es obligatoria |
| **Resultado obtenido** | |

---

### CP-L04 — Correo no registrado

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el sistema rechaza credenciales de un usuario inexistente |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/auth/login` |
| **Headers** | `Content-Type: application/json` |
| **Datos de entrada** | `{ "correo": "noexiste@correo.com", "contrasena": "123456" }` |
| **Resultado esperado** | HTTP 401 · `ok: false` · mensaje de credenciales inválidas |
| **Resultado obtenido** | |

---

### CP-L05 — Contraseña incorrecta

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el sistema rechaza una contraseña errónea para un correo existente |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/auth/login` |
| **Headers** | `Content-Type: application/json` |
| **Datos de entrada** | `{ "correo": "admin@correo.com", "contrasena": "incorrecta" }` |
| **Resultado esperado** | HTTP 401 · `ok: false` · mensaje de credenciales inválidas |
| **Resultado obtenido** | |

---

### CP-L06 — Ver perfil con token válido

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que un token válido permite acceder al perfil del usuario autenticado |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/auth/profile` |
| **Headers** | `Authorization: Bearer {{token_admin}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 200 · `ok: true` · datos del usuario (`pk_usuario`, `correo`, `rol`) sin contraseña |
| **Resultado obtenido** | |

---

### CP-L07 — Ver perfil sin token

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el middleware de autenticación bloquea acceso sin token |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/auth/profile` |
| **Headers** | — |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 401 · `ok: false` · `message: "Token no proporcionado"` |
| **Resultado obtenido** | |

---

## 2. Clientes

### CP-C01 — Crear cliente con datos válidos

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que un admin puede registrar un cliente con todos los campos requeridos |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/clientes` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Juan Pérez", "telefono": "55512345", "email": "juan@correo.com" }` |
| **Resultado esperado** | HTTP 201 · `ok: true` · datos del cliente creado con `pk_cliente` |
| **Resultado obtenido** | |

---

### CP-C02 — Crear cliente sin nombre

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el campo nombre es obligatorio al crear un cliente |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/clientes` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "telefono": "55512345", "email": "juan@correo.com" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · `errors[0].field: "nombre"` · mensaje campo obligatorio |
| **Resultado obtenido** | |

---

### CP-C03 — Crear cliente con email inválido

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador rechaza emails con formato incorrecto |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/clientes` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Juan", "telefono": "55512345", "email": "email-malo" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error de formato en campo `email` |
| **Resultado obtenido** | |

---

### CP-C04 — Empleado consulta lista de clientes

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que un empleado tiene permiso para consultar la lista de clientes |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/clientes` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 200 · `ok: true` · arreglo de clientes |
| **Resultado obtenido** | |

---

### CP-C05 — Consultar cliente por ID inexistente

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el sistema responde 404 cuando el ID no existe en la base de datos |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/clientes/99999` |
| **Headers** | `Authorization: Bearer {{token_admin}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 404 · `ok: false` · mensaje cliente no encontrado |
| **Resultado obtenido** | |

---

### CP-C06 — Empleado intenta crear cliente (acceso denegado)

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el middleware de roles bloquea a un empleado para crear clientes |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/clientes` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Ana López", "telefono": "55598765", "email": "ana@correo.com" }` |
| **Resultado esperado** | HTTP 403 · `ok: false` · `message: "Acceso denegado. Se requiere rol: admin"` |
| **Resultado obtenido** | |

---

## 3. Servicios

### CP-S01 — Admin crea servicio con datos válidos

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que un admin puede registrar un servicio con todos los campos correctos |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/servicios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Corte de cabello", "descripcion": "Corte básico", "duracion_minutos": 30, "precio": 150.00 }` |
| **Resultado esperado** | HTTP 201 · `ok: true` · datos del servicio creado con `pk_servicio` |
| **Resultado obtenido** | |

---

### CP-S02 — Crear servicio con precio negativo

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador rechaza un precio menor a 0 |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/servicios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Servicio X", "duracion_minutos": 30, "precio": -50 }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error en campo `precio` indicando que debe ser mayor o igual a 0 |
| **Resultado obtenido** | |

---

### CP-S03 — Crear servicio con duración igual a 0

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que `duracion_minutos` debe ser un entero mayor a 0 |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/servicios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Servicio Y", "duracion_minutos": 0, "precio": 100 }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error en `duracion_minutos` indicando que debe ser mayor a 0 |
| **Resultado obtenido** | |

---

### CP-S04 — Empleado intenta crear servicio (acceso denegado)

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el middleware de roles bloquea a un empleado para crear servicios |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/servicios` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "nombre": "Masaje", "duracion_minutos": 60, "precio": 200 }` |
| **Resultado esperado** | HTTP 403 · `ok: false` · `message: "Acceso denegado. Se requiere rol: admin"` |
| **Resultado obtenido** | |

---

### CP-S05 — Consultar todos los servicios (empleado)

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que tanto admin como empleado pueden consultar la lista de servicios |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/servicios` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 200 · `ok: true` · arreglo de servicios |
| **Resultado obtenido** | |

---

### CP-S06 — Empleado intenta eliminar servicio (acceso denegado)

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que un empleado no puede eliminar servicios |
| **Método** | `DELETE` |
| **Endpoint** | `{{base_url}}/servicios/1` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 403 · `ok: false` · `message: "Acceso denegado. Se requiere rol: admin"` |
| **Resultado obtenido** | |

---

## 4. Horarios

### CP-H01 — Crear horario con datos válidos

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que se puede crear un horario con hora_fin mayor a hora_inicio |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/horarios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "dia_semana": "Lunes", "hora_inicio": "09:00", "hora_fin": "10:00", "disponible": true }` |
| **Resultado esperado** | HTTP 201 · `ok: true` · datos del horario creado con `pk_horario` |
| **Resultado obtenido** | |

---

### CP-H02 — hora_fin menor que hora_inicio

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador rechaza cuando hora_fin < hora_inicio |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/horarios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "dia_semana": "Martes", "hora_inicio": "10:00", "hora_fin": "09:00" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error `"La hora_fin debe ser mayor que hora_inicio"` |
| **Resultado obtenido** | |

---

### CP-H03 — hora_fin igual a hora_inicio

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador rechaza cuando hora_fin = hora_inicio (intervalo nulo) |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/horarios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "dia_semana": "Miercoles", "hora_inicio": "08:00", "hora_fin": "08:00" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error `"La hora_fin debe ser mayor que hora_inicio"` |
| **Resultado obtenido** | |

---

### CP-H04 — Formato de hora inválido

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador detecta formatos de hora que no siguen HH:MM |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/horarios` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "dia_semana": "Jueves", "hora_inicio": "9am", "hora_fin": "10am" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error `"Formato de hora invalido (use HH:MM)"` |
| **Resultado obtenido** | |

---

### CP-H05 — Consultar lista de horarios

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que cualquier usuario autenticado puede consultar los horarios registrados |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/horarios` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 200 · `ok: true` · arreglo de horarios |
| **Resultado obtenido** | |

---

### CP-H06 — Actualizar solo el campo disponible

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que es posible actualizar un horario enviando solo el campo `disponible` sin los demás |
| **Método** | `PUT` |
| **Endpoint** | `{{base_url}}/horarios/1` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "disponible": false }` |
| **Resultado esperado** | HTTP 200 · `ok: true` · horario actualizado con `disponible: false` |
| **Resultado obtenido** | |

---

## 5. Reservas

### CP-R01 — Crear reserva con datos válidos

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que se puede crear una reserva con cliente, servicio y horario válidos |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/reservas` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "cliente_id": 1, "servicio_id": 1, "fecha": "2026-07-10", "hora_inicio": "09:00" }` |
| **Resultado esperado** | HTTP 201 · `ok: true` · reserva creada con `hora_fin` calculada automáticamente y `estado: "confirmada"` |
| **Resultado obtenido** | |

---

### CP-R02 — Crear reserva con cliente inexistente

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el sistema valida la existencia del cliente antes de crear la reserva |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/reservas` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "cliente_id": 99999, "servicio_id": 1, "fecha": "2026-07-10", "hora_inicio": "09:00" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · `message: "Cliente no existe"` |
| **Resultado obtenido** | |

---

### CP-R03 — Crear reserva con servicio inexistente

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el sistema valida la existencia del servicio antes de crear la reserva |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/reservas` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "cliente_id": 1, "servicio_id": 99999, "fecha": "2026-07-10", "hora_inicio": "09:00" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · `message: "Servicio no existe"` |
| **Resultado obtenido** | |

---

### CP-R04 — Crear reserva con traslape de horario

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el sistema rechaza una reserva cuyo intervalo se superpone con una ya existente para el mismo servicio |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/reservas` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Precondición** | Existe una reserva para `servicio_id: 1` el `2026-07-10` de `09:00` a `09:30` |
| **Datos de entrada** | `{ "cliente_id": 2, "servicio_id": 1, "fecha": "2026-07-10", "hora_inicio": "09:15" }` |
| **Resultado esperado** | HTTP 409 · `ok: false` · mensaje de conflicto de horario por traslape |
| **Resultado obtenido** | |

---

### CP-R05 — Crear reserva con fecha de formato inválido

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el validador rechaza fechas que no cumplan el formato ISO8601 (YYYY-MM-DD) |
| **Método** | `POST` |
| **Endpoint** | `{{base_url}}/reservas` |
| **Headers** | `Authorization: Bearer {{token_admin}}` · `Content-Type: application/json` |
| **Datos de entrada** | `{ "cliente_id": 1, "servicio_id": 1, "fecha": "10-07-2026", "hora_inicio": "09:00" }` |
| **Resultado esperado** | HTTP 400 · `ok: false` · error en campo `fecha` con mensaje de formato inválido |
| **Resultado obtenido** | |

---

### CP-R06 — Empleado consulta lista de reservas

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el rol empleado tiene acceso de lectura sobre las reservas |
| **Método** | `GET` |
| **Endpoint** | `{{base_url}}/reservas` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 200 · `ok: true` · arreglo de reservas |
| **Resultado obtenido** | |

---

### CP-R07 — Empleado intenta eliminar una reserva (acceso denegado)

| Campo | Detalle |
|---|---|
| **Objetivo** | Verificar que el middleware de roles bloquea al empleado para eliminar reservas |
| **Método** | `DELETE` |
| **Endpoint** | `{{base_url}}/reservas/1` |
| **Headers** | `Authorization: Bearer {{token_empleado}}` |
| **Datos de entrada** | — |
| **Resultado esperado** | HTTP 403 · `ok: false` · `message: "Acceso denegado. Se requiere rol: admin"` |
| **Resultado obtenido** | |

---

## Fragmento para el README

```markdown
## Pruebas funcionales

| # | Funcionalidad | Casos cubiertos |
|---|---|---|
| 1 | Login / Autenticación | 7 casos (login válido, validaciones, token, perfil) |
| 2 | Clientes | 6 casos (CRUD, roles, 404) |
| 3 | Servicios | 6 casos (CRUD, validaciones de precio/duración, roles) |
| 4 | Horarios | 6 casos (validación hora_fin > hora_inicio, formato, actualización parcial) |
| 5 | Reservas | 7 casos (traslape, referencias inválidas, roles, formato de fecha) |

Ver documentación completa: [`docs/pruebas-funcionales.md`](docs/pruebas-funcionales.md)
```
