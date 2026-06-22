const horarioService = require('../services/horarioService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await horarioService.getAll({ limit, offset });
    res.json({
      ok: true,
      message: 'Horarios obtenidos correctamente',
      data: rows,
      pagination: buildPaginationMeta({ total, page, limit }),
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const horario = await horarioService.getById(Number(id));

    res.json({
      ok: true,
      message: 'Horario obtenido correctamente',
      data: horario,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await horarioService.create(req.body);

    res.status(201).json({
      ok: true,
      message: 'Horario creado correctamente',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await horarioService.update(Number(id), req.body);

    res.json({
      ok: true,
      message: 'Horario actualizado correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await horarioService.remove(Number(id));

    res.json({
      ok: true,
      message: 'Horario eliminado correctamente',
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

