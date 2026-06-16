// src/middlewares/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // Mostramos el error en la consola solo para nosotros los desarrolladores
  console.error(`[Error del Servidor]: ${err.message}`);

  // Definimos el código de estado (si no hay uno, usamos 500 por defecto)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Ocurrió un error interno en el servidor',
    // Si estamos en desarrollo, enviamos el rastro del error, si no, lo ocultamos por seguridad
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;