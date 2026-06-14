CREATE TABLE usuarios (
    pk_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

CREATE TABLE clientes (
    pk_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    correo VARCHAR(100),
    fecha_nacimiento DATE
);

CREATE TABLE servicios (
    pk_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    duracion_estimada INTEGER NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE horarios (
    pk_horario SERIAL PRIMARY KEY,
    fk_usuario INTEGER NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    CONSTRAINT fk_horarios_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuarios(pk_usuario)
);

CREATE TABLE reservas (
    pk_reserva SERIAL PRIMARY KEY,
    fk_cliente INTEGER NOT NULL,
    fk_usuario INTEGER NOT NULL,
    fk_servicio INTEGER NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    estado VARCHAR(30) NOT NULL,

    CONSTRAINT fk_reserva_cliente
        FOREIGN KEY (fk_cliente)
        REFERENCES clientes(pk_cliente),

    CONSTRAINT fk_reserva_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuarios(pk_usuario),

    CONSTRAINT fk_reserva_servicio
        FOREIGN KEY (fk_servicio)
        REFERENCES servicios(pk_servicio)
);
