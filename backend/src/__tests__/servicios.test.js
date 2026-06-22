jest.mock('../config/db', () => ({ query: jest.fn(), pool: { end: jest.fn() } }));
jest.mock('../models/userModel');
jest.mock('../models/serviceModel');
jest.mock('../middleware/rateLimitMiddleware', () => ({
  loginLimiter: (req, res, next) => next(),
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const userModel = require('../models/userModel');
const serviceModel = require('../models/serviceModel');

const mockServicio = {
  id: 1, nombre: 'Corte', descripcion: 'Corte básico',
  duracion_minutos: 30, precio: '150.00', activo: true,
  created_at: new Date().toISOString(),
};

async function loginAs(rol) {
  const hashed = await bcrypt.hash('123456', 10);
  userModel.findByEmail.mockResolvedValue({
    pk_usuario: rol === 'admin' ? 1 : 2,
    nombre: rol, correo: `${rol}@test.com`,
    contrasena: hashed, rol,
  });
  const res = await request(app)
    .post('/auth/login')
    .send({ correo: `${rol}@test.com`, contrasena: '123456' });
  return res.body.data.token;
}

describe('GET /servicios', () => {
  test('devuelve 200 con paginación para admin', async () => {
    const token = await loginAs('admin');
    serviceModel.getAll.mockResolvedValue({ rows: [mockServicio], total: 1 });

    const res = await request(app)
      .get('/servicios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  test('devuelve 200 con paginación para empleado', async () => {
    const token = await loginAs('empleado');
    serviceModel.getAll.mockResolvedValue({ rows: [mockServicio], total: 1 });

    const res = await request(app)
      .get('/servicios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('devuelve 401 sin token', async () => {
    const res = await request(app).get('/servicios');
    expect(res.status).toBe(401);
  });
});

describe('POST /servicios', () => {
  test('admin crea servicio y devuelve 201', async () => {
    const token = await loginAs('admin');
    serviceModel.create.mockResolvedValue(mockServicio);

    const res = await request(app)
      .post('/servicios')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Corte', duracion_minutos: 30, precio: 150 });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  test('empleado recibe 403 al intentar crear', async () => {
    const token = await loginAs('empleado');

    const res = await request(app)
      .post('/servicios')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Corte', duracion_minutos: 30, precio: 150 });

    expect(res.status).toBe(403);
  });

  test('devuelve 400 con precio negativo', async () => {
    const token = await loginAs('admin');

    const res = await request(app)
      .post('/servicios')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Corte', duracion_minutos: 30, precio: -10 });

    expect(res.status).toBe(400);
  });

  test('devuelve 400 con duración igual a 0', async () => {
    const token = await loginAs('admin');

    const res = await request(app)
      .post('/servicios')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Corte', duracion_minutos: 0, precio: 100 });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /servicios/:id', () => {
  test('empleado recibe 403 al intentar eliminar', async () => {
    const token = await loginAs('empleado');

    const res = await request(app)
      .delete('/servicios/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('admin puede eliminar un servicio existente', async () => {
    const token = await loginAs('admin');
    serviceModel.getById.mockResolvedValue(mockServicio);
    serviceModel.remove.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete('/servicios/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
