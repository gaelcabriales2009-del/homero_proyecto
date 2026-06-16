require('dotenv').config(); // Carga las variables del entorno primero
const validateEnv = require('./utils/validateEnv');

// Ejecutamos el validador
validateEnv();
const app = require('./app');
const connectDB = require('./database');

const PORT = process.env.PORT || 5000;

// Ejecutar conexión a la base de datos
connectDB();

// Levantar el servidor escuchando en el puerto designado
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});