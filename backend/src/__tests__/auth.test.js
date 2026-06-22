jest.mock('../config/db', () => ({ query: jest.fn(), pool: { end: jest.fn() } }));
jest.mock('../models/userModel');
jest.mock('../middleware/rateLimitMiddleware', () => ({
  loginLimiter: (req, res, next) => next(),
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const userModel = require('../models/userModel');

let hashedPassword;

beforeAll(async () => {
  hashedPassword = await bcrypt.hash('123456', 10);
});

const mockAdmin = () => ({
  pk_usuario: 1,
  nombre: 'Admin',
  correo: 'admin@test.com',
  contrasena: hashedPassword,
  rol: 'admin',
});

describe('POST /auth/login', () => {
  test('devuelve 200 y token con credenciales válidas', async () => {
    userModel.findByEmail.mockResolvedValue(mockAdmin());

    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'admin@test.com', contrasena: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('devuelve 401 con contraseña incorrecta', async () => {
    userModel.findByEmail.mockResolvedValue(mockAdmin());

    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'admin@test.com', contrasena: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 401 si el correo no existe', async () => {
    userModel.findByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'noexiste@test.com', contrasena: '123456' });

    expect(res.status).toBe(401);
  });

  test('devuelve 400 con formato de correo inválido', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'correo-invalido', contrasena: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors[0].field).toBe('correo');
  });

  test('devuelve 400 con contraseña vacía', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'admin@test.com', contrasena: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /auth/profile', () => {
  let token;

  beforeAll(async () => {
    userModel.findByEmail.mockResolvedValue(mockAdmin());
    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'admin@test.com', contrasena: '123456' });
    token = res.body.data.token;
  });

  test('devuelve 200 y datos del usuario con token válido', async () => {
    userModel.findById.mockResolvedValue({
      pk_usuario: 1, nombre: 'Admin', correo: 'admin@test.com', rol: 'admin',
    });

    const res = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.correo).toBe('admin@test.com');
  });

  test('devuelve 401 sin token', async () => {
    const res = await request(app).get('/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token no proporcionado');
  });

  test('devuelve 401 con token malformado', async () => {
    const res = await request(app)
      .get('/auth/profile')
      .set('Authorization', 'Bearer token.invalido.xyz');
    expect(res.status).toBe(401);
  });
});

describe('PUT /auth/password', () => {
  let token;

  beforeAll(async () => {
    userModel.findByEmail.mockResolvedValue(mockAdmin());
    const res = await request(app)
      .post('/auth/login')
      .send({ correo: 'admin@test.com', contrasena: '123456' });
    token = res.body.data.token;
  });

  test('devuelve 200 al cambiar contraseña correctamente', async () => {
    userModel.findByIdWithPassword.mockResolvedValue(mockAdmin());
    userModel.updatePassword.mockResolvedValue();

    const res = await request(app)
      .put('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ contrasena_actual: '123456', contrasena_nueva: 'nueva123' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('devuelve 401 si la contraseña actual es incorrecta', async () => {
    userModel.findByIdWithPassword.mockResolvedValue(mockAdmin());

    const res = await request(app)
      .put('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ contrasena_actual: 'incorrecta', contrasena_nueva: 'nueva123' });

    expect(res.status).toBe(401);
  });

  test('devuelve 400 si la nueva contraseña tiene menos de 6 caracteres', async () => {
    const res = await request(app)
      .put('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ contrasena_actual: '123456', contrasena_nueva: '123' });

    expect(res.status).toBe(400);
  });

  test('devuelve 401 sin token', async () => {
    const res = await request(app)
      .put('/auth/password')
      .send({ contrasena_actual: '123456', contrasena_nueva: 'nueva123' });

    expect(res.status).toBe(401);
  });
});
