# Validación de traslapes - Reservas

## Regla (interval overlap)

Dos reservas se cruzan/traslapan si:

- `nuevo_inicio < existente_fin` **y**
- `nuevo_fin > existente_inicio`

Con esto:

- Se rechaza cruce parcial
- Se rechaza cruce total
- No se rechaza cuando es contiguo (ej. `11:00-12:00` vs `10:00-11:00`) porque ahí `nuevo_inicio == existente_fin`.

## Archivos modificados

- `src/models/reservationModel.js`
  - Se agregó `existsOverlappingReservation(...)` que consulta PostgreSQL con parámetros.
- `src/services/reservationService.js`
  - Se agregó `validateNoOverlappingReservation(...)` y se llama antes de `create` y `update`.

## Mensaje de error

Se devuelve HTTP **409 Conflict** con:

- `Conflicto de horario: ya existe una reserva para el mismo servicio que se traslapa con el intervalo solicitado`

## Nota de negocio

La regla se aplica por **fecha y servicio_id** (mismo servicio no puede tener reservas traslapadas).
