const reservationService = require('../services/reservationService');

async function getAll(req, res, next) {
  try {
    const reservas = await reservationService.getAll();
    res.json({
      ok: true,
      message: 'Reservas obtenidas correctamente',
      data: reservas,
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const reserva = await reservationService.getById(Number(id));

    res.json({
      ok: true,
      message: 'Reserva obtenida correctamente',
      data: reserva,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await reservationService.create(req.body);

    res.status(201).json({
      ok: true,
      message: 'Reserva creada correctamente',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await reservationService.update(Number(id), req.body);

    res.json({
      ok: true,
      message: 'Reserva actualizada correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await reservationService.remove(Number(id));

    res.json({
      ok: true,
      message: 'Reserva eliminada correctamente',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};

