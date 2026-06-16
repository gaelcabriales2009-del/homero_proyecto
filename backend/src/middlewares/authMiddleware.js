const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
let token;

if (
req.headers.authorization &&
req.headers.authorization.startsWith('Bearer')
) {
try {
token = req.headers.authorization.split(' ')[1];


  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decoded.id)
    .select('-password');

  if (!user) {
    return res.status(401).json({
      success: false,
      msg: 'El usuario asociado al token ya no existe.'
    });
  }

  req.user = user;

  return next();

} catch (error) {
  console.error('Error en JWT:', error);

  return res.status(401).json({
    success: false,
    msg: 'Token inválido o expirado.'
  });
}


}

return res.status(401).json({
success: false,
msg: 'No se proporcionó token de autenticación.'
});
};

const isTeacher = (req, res, next) => {
if (
req.user &&
req.user.role === 'PROFESOR'
) {
return next();
}

return res.status(403).json({
success: false,
msg: 'Acceso denegado. Solo profesores.'
});
};

module.exports = {
protect,
isTeacher
};
