const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    res.json({
      ok: true,
      message: 'Inicio de sesion correcto',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.pk_usuario);

    res.json({
      ok: true,
      message: 'Perfil obtenido correctamente',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    await authService.changePassword(req.user.pk_usuario, req.body);
    res.json({ ok: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
}

async function registerCliente(req, res, next) {
  try {
    const result = await authService.registerCliente(req.body);
    res.status(201).json({ ok: true, message: 'Cliente registrado correctamente', data: result });
  } catch (error) {
    next(error);
  }
}

async function loginCliente(req, res, next) {
  try {
    const result = await authService.loginCliente(req.body);
    res.json({ ok: true, message: 'Inicio de sesión correcto', data: result });
  } catch (error) {
    next(error);
  }
}

async function loginUnificado(req, res, next) {
  try {
    const result = await authService.loginUnificado(req.body);
    res.json({ ok: true, message: 'Inicio de sesión correcto', data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  profile,
  changePassword,
  registerCliente,
  loginCliente,
  loginUnificado,
};
