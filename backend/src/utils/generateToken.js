const jwt = require('jsonwebtoken');

// El token ahora expira en 4 horas para mitigar el robo de sesiones
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '4h',
  });
};

module.exports = generateToken;