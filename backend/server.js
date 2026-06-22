require('dotenv').config({ quiet: true });

const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Servidor backend ejecutandose en http://localhost:${PORT}`);
});
