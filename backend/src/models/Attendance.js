const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El estudiante es obligatorio.']
  },
  grupo: {
    type: String,
    uppercase: true,
    required: [true, 'El grupo es obligatorio.']
  },
  equipoLimpieza: {
    type: String,
    uppercase: true,
    default: 'NINGUNO'
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha de asistencia es obligatoria.']
  },
  status: {
    type: String,
    enum: ['Cumplió', 'No cumplió', 'Pendiente'],
    default: 'Pendiente'
  },
  fotoEvidencia: {
    type: String,
    trim: true
  },
  actividades: [
    {
      tarea: { type: String, required: true, trim: true },
      completada: { type: Boolean, default: false }
    }
  ],
  comentario: {
    type: String,
    trim: true
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

attendanceSchema.index({ estudiante: 1, fecha: 1 }, { unique: true });
attendanceSchema.index({ grupo: 1, fecha: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
