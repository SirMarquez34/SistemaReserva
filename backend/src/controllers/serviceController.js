const serviceService = require('../services/serviceService');

async function getAll(req, res, next) {
  try {
    const servicios = await serviceService.getAll();
    res.json({
      ok: true,
      message: 'Servicios obtenidos correctamente',
      data: servicios,
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const servicio = await serviceService.getById(Number(id));

    res.json({
      ok: true,
      message: 'Servicio obtenido correctamente',
      data: servicio,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await serviceService.create(req.body);

    res.status(201).json({
      ok: true,
      message: 'Servicio creado correctamente',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await serviceService.update(Number(id), req.body);

    res.json({
      ok: true,
      message: 'Servicio actualizado correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await serviceService.remove(Number(id));

    res.json({
      ok: true,
      message: 'Servicio eliminado correctamente',
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

