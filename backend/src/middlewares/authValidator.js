const { body } = require('express-validator');
const validateFields = require('./validateFields');

const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios.'),
  
  // REGLA ENDURECIDA: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula.')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula.')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número.')
    .matches(/[@$!%*?&]/).withMessage('La contraseña debe contener al menos un carácter especial (@$!%*?&).'),
  
  body('role')
    .isIn(['ESTUDIANTE', 'PROFESOR']).withMessage('El rol debe ser ESTUDIANTE o PROFESOR.'),

  // Filtros exclusivos para ESTUDIANTE
  body('correo').custom((value, { req }) => {
    if (req.body.role === 'ESTUDIANTE') {
      if (!value) throw new Error('El correo electrónico es obligatorio para estudiantes.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('El formato del correo no es válido.');
    }
    return true;
  }),

  body('numeroTelefono').custom((value, { req }) => {
    if (req.body.role === 'ESTUDIANTE') {
      if (!value) throw new Error('El número de teléfono es obligatorio.');
      if (!/^\d{10}$/.test(value)) throw new Error('El teléfono debe contener exactamente 10 dígitos.');
    }
    return true;
  }),

  body('numeroLista').custom((value, { req }) => {
    if (req.body.role === 'ESTUDIANTE') {
      if (!value) throw new Error('El número de lista es obligatorio.');
      if (!Number.isInteger(Number(value)) || Number(value) <= 0) throw new Error('Debe ser un número entero positivo.');
    }
    return true;
  }),

  body('grupo').custom((value, { req }) => {
    if (req.body.role === 'ESTUDIANTE') {
      if (!value) throw new Error('El grupo es obligatorio para estudiantes.');
      
      // REGEX ESTRICTA: 
      // ^[1-9]      -> Debe empezar obligatoriamente con un número del 1 al 9
      // [\s°\-]* -> Puede (o no) tener espacios, guiones o el símbolo de grado en medio
      // [a-zA-Z]$   -> Debe terminar obligatoriamente con UNA sola letra
      if (!/^[1-9][\s°\-]*[a-zA-Z]$/.test(value)) {
        throw new Error('El formato del grupo es inválido. Debe contener un número y una letra (Ej: 4-B, 6A, 1° C).');
      }
    }
    return true;
  }),

  // Filtros exclusivos para PROFESOR
  body('rfc').custom((value, { req }) => {
    if (req.body.role === 'PROFESOR') {
      if (!value) throw new Error('El RFC es obligatorio para profesores.');
      const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:-?\d{2})(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]) ?(?:[A-Z\d]{2})([A-Z\d])$/i;
      if (!rfcRegex.test(value)) throw new Error('El formato del RFC no es válido.');
    }
    return true;
  }),

  body('claveEscolar').custom((value, { req }) => {
    if (req.body.role === 'PROFESOR' && !value) throw new Error('La clave escolar es obligatoria.');
    return true;
  }),

  body('grupoAsignado').custom((value, { req }) => {
    if (req.body.role === 'PROFESOR') {
      if (!value) throw new Error('El grupo asignado es obligatorio.');
      if (!/^[a-zA-Z0-9\s°\-áéíóúÁÉÍÓÚñÑ]+$/.test(value)) throw new Error('El grupo contiene caracteres inválidos.');
    }
    return true;
  }),

  validateFields
];

const validateLogin = [
  body('role').isIn(['ESTUDIANTE', 'PROFESOR']).withMessage('Rol no válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  body('correo').custom((value, { req }) => {
    if (req.body.role === 'ESTUDIANTE' && !value) throw new Error('El correo es obligatorio.');
    return true;
  }),
  body('rfc').custom((value, { req }) => {
    if (req.body.role === 'PROFESOR' && !value) throw new Error('El RFC es obligatorio.');
    return true;
  }),
  validateFields
];

module.exports = { validateRegister, validateLogin };