const { validationResult } = require('express-validator');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  
  // Si existen errores de validación, detenemos el flujo aquí
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        campo: err.path,
        msg: err.msg
      }))
    });
  }
  
  // Si todo está limpio, damos paso al siguiente middleware o controlador
  next();
};

module.exports = validateFields;