const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  role: {
    type: String,
    enum: ['ESTUDIANTE', 'PROFESOR'],
    required: [true, 'El rol es obligatorio']
  },
  
  // ─── Campos exclusivos para ESTUDIANTE ───
  correo: {
    type: String,
    unique: true,
    sparse: true, // Evita colisiones de campos vacíos entre profesores y estudiantes
    trim: true
  },
  numeroTelefono: {
    type: String,
    sparse: true
  },
  numeroLista: {
    type: Number,
    sparse: true
  },
  equipoLimpieza: {
    type: String,
    sparse: true,
    uppercase: true // Convertimos a mayúsculas para estandarizar
  },
  // 🟢 ¡AQUÍ ESTÁ EL CAMPO CLAVE QUE FALTABA!
  grupo: {
    type: String,
    sparse: true,
    uppercase: true
  },

  // ─── Campos exclusivos para PROFESOR ───
  rfc: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  grupoAsignado: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Middleware de Mongoose: Encriptación automática antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);