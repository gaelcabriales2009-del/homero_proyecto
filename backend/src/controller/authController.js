const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  const { nombre, password, role, correo, numeroTelefono, numeroLista, grupo, rfc, claveEscolar, grupoAsignado } = req.body;
  try {
    if (!nombre || !password || !role) {
      return res.status(400).json({ msg: 'Faltan datos obligatorios esenciales.' });
    }

    let userData = { nombre, password, role };

    if (role === 'ESTUDIANTE') {
      const userExists = await User.findOne({ correo });
      if (userExists) return res.status(400).json({ msg: 'El correo electrónico ya se encuentra registrado.' });
      
      userData.correo = correo;
      userData.numeroTelefono = numeroTelefono;
      userData.numeroLista = numeroLista;
      userData.grupo = grupo.toUpperCase(); // Estandarizamos a mayúsculas

    } else if (role === 'PROFESOR') {

if (!rfc) {
return res.status(400).json({
msg: 'El RFC es obligatorio.'
});
}

if (
claveEscolar !==
process.env.CLAVE_ESCOLAR_PROFESOR
) {
return res.status(401).json({
msg: 'La clave única del departamento escolar es incorrecta.'
});
}

const rfcUpper = rfc.toUpperCase();

const rfcExists = await User.findOne({
rfc: rfcUpper
});

if (rfcExists) {
return res.status(400).json({
msg: 'El RFC ya se encuentra registrado.'
});
}

userData.rfc = rfcUpper;
userData.grupoAsignado =
grupoAsignado.toUpperCase();
}


    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({
      success: true,
      msg: `Usuario registrado exitosamente como ${role}.`,
      user: { id: newUser._id, nombre: newUser.nombre, role: newUser.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error interno en el servidor al registrar.' });
  }
};

const loginUser = async (req, res) => {
  const { role, password, correo, rfc } = req.body;
  try {
    let user;

    if (role === 'ESTUDIANTE') {
      user = await User.findOne({ correo });
    } else if (role === 'PROFESOR') {

if (!rfc) {
return res.status(400).json({
msg: 'RFC requerido.'
});
}

user = await User.findOne({
rfc: rfc.toUpperCase()
});
}

    // MENSAJE DISCRETO: Si el usuario no existe, usamos un mensaje genérico
    if (!user) {
      return res.status(401).json({ msg: 'Credenciales inválidas. Por favor, verifica tus datos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // MENSAJE DISCRETO: Si la contraseña no coincide, usamos exactamente el mismo mensaje
    if (!isMatch) {
      return res.status(401).json({ msg: 'Credenciales inválidas. Por favor, verifica tus datos.' });
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: { id: user._id, nombre: user.nombre, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error interno en el servidor durante el login.' });
  }
};

module.exports = { registerUser, loginUser };