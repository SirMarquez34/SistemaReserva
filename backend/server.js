require('dotenv').config({ quiet: true });

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Inicia el servidor HTTP usando la aplicacion Express.
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutandose en http://localhost:${PORT}`);
});
