const { authorize } = require('../middleware/roleMiddleware');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authorize middleware', () => {
  test('llama next() cuando el rol coincide', () => {
    const req = { user: { rol: 'admin' } };
    const res = makeRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('llama next() cuando el rol está en la lista de roles permitidos', () => {
    const req = { user: { rol: 'empleado' } };
    const res = makeRes();
    const next = jest.fn();

    authorize('admin', 'empleado')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('devuelve 403 cuando el rol no está permitido', () => {
    const req = { user: { rol: 'empleado' } };
    const res = makeRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false })
    );
  });

  test('devuelve 401 cuando req.user no existe', () => {
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('el mensaje de 403 incluye el rol requerido', () => {
    const req = { user: { rol: 'empleado' } };
    const res = makeRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.message).toContain('admin');
  });
});
