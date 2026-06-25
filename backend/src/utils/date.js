const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function getDiaSemana(fecha) {
  let date;
  if (fecha instanceof Date) {
    date = fecha;
  } else {
    const [year, month, day] = String(fecha).split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  return DIAS_SEMANA[date.getDay()];
}

module.exports = { getDiaSemana };
