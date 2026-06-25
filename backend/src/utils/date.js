const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function getDiaSemana(fecha) {
  // Always resolve to a YYYY-MM-DD string first so getDay() uses local midnight,
  // not UTC midnight (which .toDate() from express-validator produces and would
  // shift the day one step backward in timezones ahead of UTC).
  const dateStr = fecha instanceof Date
    ? fecha.toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);
  const [year, month, day] = dateStr.split('-').map(Number);
  return DIAS_SEMANA[new Date(year, month - 1, day).getDay()];
}

module.exports = { getDiaSemana };
