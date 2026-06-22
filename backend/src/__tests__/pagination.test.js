const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

describe('parsePagination', () => {
  test('devuelve defaults cuando no se pasan parámetros', () => {
    const result = parsePagination({});
    expect(result).toEqual({ page: 1, limit: 10, offset: 0 });
  });

  test('parsea page y limit correctamente', () => {
    const result = parsePagination({ page: '3', limit: '20' });
    expect(result).toEqual({ page: 3, limit: 20, offset: 40 });
  });

  test('page mínimo es 1 aunque se envíe 0 o negativo', () => {
    expect(parsePagination({ page: '0' }).page).toBe(1);
    expect(parsePagination({ page: '-5' }).page).toBe(1);
  });

  test('limit mínimo es 1', () => {
    expect(parsePagination({ limit: '0' }).limit).toBe(1);
    expect(parsePagination({ limit: '-10' }).limit).toBe(1);
  });

  test('limit máximo es 100', () => {
    expect(parsePagination({ limit: '999' }).limit).toBe(100);
  });

  test('valores no numéricos caen al default', () => {
    const result = parsePagination({ page: 'abc', limit: 'xyz' });
    expect(result).toEqual({ page: 1, limit: 10, offset: 0 });
  });

  test('calcula offset correctamente', () => {
    expect(parsePagination({ page: '2', limit: '15' }).offset).toBe(15);
    expect(parsePagination({ page: '5', limit: '10' }).offset).toBe(40);
  });
});

describe('buildPaginationMeta', () => {
  test('calcula totalPages correctamente', () => {
    const meta = buildPaginationMeta({ total: 50, page: 1, limit: 10 });
    expect(meta).toEqual({ total: 50, page: 1, limit: 10, totalPages: 5 });
  });

  test('redondea hacia arriba en totalPages', () => {
    const meta = buildPaginationMeta({ total: 51, page: 1, limit: 10 });
    expect(meta.totalPages).toBe(6);
  });

  test('total 0 devuelve totalPages 0', () => {
    const meta = buildPaginationMeta({ total: 0, page: 1, limit: 10 });
    expect(meta.totalPages).toBe(0);
  });
});
