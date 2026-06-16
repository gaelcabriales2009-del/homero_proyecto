const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: [true, 'La descripción de la tarea es obligatoria.'], // Ej: "Barrer y trapear"
    trim: true
  },
  grupo: {
    type: String,
    required: [true, 'El grupo es obligatorio.'], // Ej: "4-B"
    uppercase: true
  },
  estudianteAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Hace referencia al modelo de Usuarios
    required: [true, 'La tarea debe estar asignada a un estudiante.']
  },
  equipoLimpieza: {
    type: String,
    required: [true, 'El nombre del equipo es obligatorio.'] // Ej: "EQUIPO 1"
  },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'COMPLETADO', 'INCUMPLIDO'],
    default: 'PENDIENTE'
  },
  fechaEntrega: {
    type: Date,
    required: [true, 'La fecha de la tarea es obligatoria.']
  }
}, {
  timestamps: true
});
taskSchema.index({
  grupo: 1
});

taskSchema.index({
  grupo: 1,
  estado: 1
});

module.exports = mongoose.model('Task', taskSchema);