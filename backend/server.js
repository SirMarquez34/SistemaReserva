require('dotenv').config({ quiet: true });

const app = require('./src/app');
const logger = require('./src/utils/logger');
const reservationService = require('./src/services/reservationService');

const PORT = process.env.PORT || 3000;

async function ejecutarMarcarNoAsistio() {
  try {
    const cantidad = await reservationService.marcarNoAsistioVencidas();
    if (cantidad > 0) {
      logger.info(`[job] ${cantidad} reserva(s) marcadas como no_asistio por fecha vencida`);
    }
  } catch (err) {
    logger.error('[job] Error al marcar reservas vencidas:', err);
  }
}

app.listen(PORT, async () => {
  logger.info(`Servidor backend ejecutandose en http://localhost:${PORT}`);
  await ejecutarMarcarNoAsistio();
  // Revisar cada hora
  setInterval(ejecutarMarcarNoAsistio, 60 * 60 * 1000);
});
