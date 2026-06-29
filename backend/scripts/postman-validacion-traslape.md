# Postman - Pruebas de validación por traslape (409)

> Estas pruebas asumen que:
>
> - Existe un servicio con `id = 1` y `duracion_minutos` coherente.
> - Usas `/reservas` (POST y PUT) del backend.
> - El sistema calcula `hora_fin = hora_inicio + servicio.duracion_minutos`.
>
> Ajusta `servicio_id` y la `fecha` si en tu BD no coinciden.

## 0) Precondición (reserva existente)

Crea una reserva que será el conflicto.

### POST /reservas

**Body (JSON)**

```json
{
  "cliente_id": 1,
  "servicio_id": 1,
  "fecha": "2026-06-18",
  "hora_inicio": "10:00",
  "estado": "confirmada",
  "observaciones": "reserva base"
}
```

## 1) Rechazar: 10:30 - 11:30 (traslape parcial)

### POST /reservas

**Body (JSON)**

```json
{
  "cliente_id": 2,
  "servicio_id": 1,
  "fecha": "2026-06-18",
  "hora_inicio": "10:30",
  "estado": "confirmada",
  "observaciones": "deberia fallar por traslape"
}
```

**Resultado esperado:**

- HTTP **409**
- `message` con texto: `Conflicto de horario...`

## 2) Rechazar: 09:45 - 10:30 (traslape parcial)

### POST /reservas

```json
{
  "cliente_id": 2,
  "servicio_id": 1,
  "fecha": "2026-06-18",
  "hora_inicio": "09:45",
  "observaciones": "deberia fallar por traslape"
}
```

**Resultado esperado:** 409

## 3) Rechazar: 10:00 - 11:00 (igual / exacto)

### POST /reservas

```json
{
  "cliente_id": 2,
  "servicio_id": 1,
  "fecha": "2026-06-18",
  "hora_inicio": "10:00",
  "observaciones": "deberia fallar por traslape exacto"
}
```

**Resultado esperado:** 409

## 4) Rechazar: 09:00 - 12:00 (nuevo contiene al existente)

> Para que “contenga” funcione, la duración del servicio debe hacer que `hora_fin` sea ~12:00.
> Si tu `duracion_minutos` no coincide, usa un `servicio_id` con duración equivalente.

### POST /reservas

```json
{
  "cliente_id": 2,
  "servicio_id": 1,
  "fecha": "2026-06-18",
  "hora_inicio": "09:00",
  "observaciones": "deberia fallar por contener al existente"
}
```

**Resultado esperado:** 409

## 5) Validación en UPDATE

### PUT /reservas/:id

> Reemplaza `:id` por el id de una reserva existente que quieres modificar.

**Body (JSON)**

```json
{
  "cliente_id": 3,
  "servicio_id": 1,
  "fecha": "2026-06-18",
  "hora_inicio": "10:30",
  "observaciones": "intentando actualizar y traslapar"
}
```

**Resultado esperado:**

- Si el nuevo intervalo traslapa con la reserva base, HTTP **409**.

---

## Qué valida exactamente

Se hace el check de traslape usando:

- `fecha`
- `servicio_id`
- `hora_inicio` y el `hora_fin` calculado

SQL (conceptual):
`WHERE servicio_id=? AND fecha=? AND new_start < hora_fin_existente AND new_end > hora_inicio_existente`
