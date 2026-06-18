# Postman - Semana 2 (Clientes, Servicios, Reservas)

## Base URL

`http://localhost:3000`

## Auth - Login (para obtener Bearer Token)

### POST `/auth/login`

**Body (raw JSON)**

```json
{
  "correo": "admin@demo.com",
  "contrasena": "123456"
}
```

**Respuesta esperada**

- `data.token`

Guarda el token como variable en Postman:

- `token = {{token}}`

---

## CLIENTES

### GET `/clientes`

Headers:

- Authorization: `Bearer {{token}}`

### POST `/clientes`

Headers:

- Authorization: `Bearer {{token}}`

**Body**

```json
{
  "nombre": "Juan Perez",
  "telefono": "+56912345678",
  "email": "juan.perez@example.com"
}
```

### PUT `/clientes/:id`

**Body (ejemplo)**

```json
{
  "nombre": "Juan Perez Updated",
  "telefono": "+56911111111",
  "email": "juan.perez.updated@example.com"
}
```

### DELETE `/clientes/:id`

Headers:

- Authorization: `Bearer {{token}}`

---

## SERVICIOS

### GET `/servicios`

Headers:

- Authorization: `Bearer {{token}}`

### POST `/servicios`

**Body**

```json
{
  "nombre": "Corte de cabello",
  "descripcion": "Incluye lavado y corte",
  "duracion_minutos": 30,
  "precio": 12000.0,
  "activo": true
}
```

### PUT `/servicios/:id`

**Body (ejemplo)**

```json
{
  "precio": 15000.0,
  "duracion_minutos": 35
}
```

### DELETE `/servicios/:id`

Headers:

- Authorization: `Bearer {{token}}`

---

## RESERVAS

### POST `/reservas`

**Body (ejemplo)**

```json
{
  "cliente_id": 1,
  "servicio_id": 1,
  "fecha": "2026-06-16",
  "hora_inicio": "10:30",
  "estado": "confirmada",
  "observaciones": "Cliente solicita puntualidad"
}
```

Reglas importantes:

- `hora_fin` se calcula automáticamente con la duración del servicio.
- No se permite duplicado exacto de `cliente_id + servicio_id + fecha + hora_inicio`.

### GET `/reservas`

Headers:

- Authorization: `Bearer {{token}}`

### PUT `/reservas/:id`

**Body (ejemplo)**

```json
{
  "hora_inicio": "11:00",
  "estado": "confirmada"
}
```

### DELETE `/reservas/:id`

Headers:

- Authorization: `Bearer {{token}}`
