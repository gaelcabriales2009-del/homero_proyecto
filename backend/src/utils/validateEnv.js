// src/utils/validateEnv.js

const validateEnv = () => {
const requiredVariables = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'CLAVE_ESCOLAR_PROFESOR'
];
  const missingVariables = [];

  // Revisar cuáles faltan
  requiredVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingVariables.push(envVar);
    }
  });

  // Si falta alguna, apagamos el servidor y avisamos
  if (missingVariables.length > 0) {
    console.error(`🚨 ERROR CRÍTICO: Faltan variables de entorno en tu archivo .env:`);
    console.error(`👉 ${missingVariables.join(', ')}`);
    console.error(`Apagando el servidor por seguridad...`);
    process.exit(1); // Esto mata el proceso inmediatamente
  }
};

module.exports = validateEnv;