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

module.exports = {
  register,
  login,
  profile,
};
