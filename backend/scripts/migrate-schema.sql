-- Migración: reemplaza el schema viejo por el schema correcto que usa el backend
-- Elimina tablas en orden inverso de dependencias FK

BEGIN;

DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS horarios CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

-- CLIENTES
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clientes_email_uniq UNIQUE (email)
);
CREATE INDEX idx_clientes_created_at ON clientes (created_at);

-- SERVICIOS
CREATE TABLE servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  duracion_minutos INTEGER NOT NULL,
  precio NUMERIC(12,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT servicios_duracion_min CHECK (duracion_minutos > 0),
  CONSTRAINT servicios_precio_nonneg CHECK (precio >= 0)
);
CREATE INDEX idx_servicios_activo ON servicios (activo);
CREATE INDEX idx_servicios_created_at ON servicios (created_at);

-- HORARIOS
CREATE TABLE horarios (
  id SERIAL PRIMARY KEY,
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE
);

-- RESERVAS
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  servicio_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  observaciones TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reservas_cliente_fk
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  CONSTRAINT reservas_servicio_fk
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE RESTRICT,
  CONSTRAINT reservas_uniq_turno
    UNIQUE (cliente_id, servicio_id, fecha, hora_inicio)
);
CREATE INDEX idx_reservas_servicio_fecha ON reservas (servicio_id, fecha);

COMMIT;
