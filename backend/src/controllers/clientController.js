const clientService = require('../services/clientService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await clientService.getAll({ limit, offset });
    res.json({
      ok: true,
      message: 'Clientes obtenidos correctamente',
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
    const client = await clientService.getById(Number(id));

    res.json({
      ok: true,
      message: 'Cliente obtenido correctamente',
      data: client,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await clientService.create(req.body);

    res.status(201).json({
      ok: true,
      message: 'Cliente creado correctamente',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await clientService.update(Number(id), req.body);

    res.json({
      ok: true,
      message: 'Cliente actualizado correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await clientService.remove(Number(id));

    res.json({
      ok: true,
      message: 'Cliente eliminado correctamente',
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

