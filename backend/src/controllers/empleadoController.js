const empleadoService = require('../services/empleadoService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await empleadoService.getAll({ limit, offset });
    res.json({
      ok: true,
      message: 'Empleados obtenidos correctamente',
      data: rows,
      pagination: buildPaginationMeta({ total, page, limit }),
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const empleado = await empleadoService.getById(Number(req.params.id));
    res.json({ ok: true, message: 'Empleado obtenido correctamente', data: empleado });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await empleadoService.create(req.body);
    res.status(201).json({ ok: true, message: 'Empleado creado correctamente', data: created });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated = await empleadoService.update(Number(req.params.id), req.body);
    res.json({ ok: true, message: 'Empleado actualizado correctamente', data: updated });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await empleadoService.remove(Number(req.params.id));
    res.json({ ok: true, message: 'Empleado eliminado correctamente', data: deleted });
  } catch (error) {
    next(error);
  }
}

async function getDisponibles(req, res, next) {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ ok: false, message: 'fecha es requerida' });
    }
    const empleados = await empleadoService.getDisponibles(fecha);
    res.json({ ok: true, message: 'Empleados disponibles obtenidos', data: empleados });
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
  getDisponibles,
};
