-- Agrega usuario_id a horarios (turno pertenece a un empleado)
-- y empleado_id a reservas (reserva asignada a un empleado)

BEGIN;

ALTER TABLE horarios
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER
    REFERENCES usuarios(pk_usuario) ON DELETE CASCADE;

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS empleado_id INTEGER
    REFERENCES usuarios(pk_usuario) ON DELETE SET NULL;

-- Índice para consultar ocupación por empleado+fecha
CREATE INDEX IF NOT EXISTS idx_reservas_empleado_fecha
  ON reservas (empleado_id, fecha);

COMMIT;
