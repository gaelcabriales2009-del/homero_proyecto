const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const normalizeDate = (dateValue) => {
  const date = new Date(dateValue);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const markAttendance = async (req, res, next) => {
  try {
    const {
      estudianteId,
      fecha,
      status,
      equipoLimpieza,
      actividades,
      comentario,
      fotoEvidencia
    } = req.body;

    if (!estudianteId || !status) {
      res.status(400);
      return next(new Error('Estudiante y estado de asistencia son obligatorios.'));
    }

    if (!mongoose.Types.ObjectId.isValid(estudianteId)) {
      res.status(400);
      return next(new Error('ID de estudiante inválido.'));
    }

    const estudiante = await User.findById(estudianteId);
    if (!estudiante || estudiante.role !== 'ESTUDIANTE') {
      res.status(404);
      return next(new Error('El estudiante no existe o no tiene rol de estudiante.'));
    }

    if (req.user.role === 'PROFESOR') {
      if (!req.user.grupoAsignado || estudiante.grupo.toUpperCase() !== req.user.grupoAsignado.toUpperCase()) {
        res.status(403);
        return next(new Error('No puedes registrar asistencia para un estudiante de otro grupo.'));
      }
    }

    if (req.user.role === 'ESTUDIANTE' && req.user._id.toString() !== estudianteId) {
      res.status(403);
      return next(new Error('No puedes registrar asistencia para otro estudiante.'));
    }

    const attendanceDate = normalizeDate(fecha || new Date());
    const validStatuses = ['Cumplió', 'No cumplió', 'Pendiente'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      return next(new Error('El estado de asistencia debe ser Cumplió, No cumplió o Pendiente.'));
    }

    const attendanceData = {
      estudiante: estudiante._id,
      grupo: estudiante.grupo || req.user.grupoAsignado || 'NINGUNO',
      equipoLimpieza: equipoLimpieza ? equipoLimpieza.toUpperCase() : estudiante.equipoLimpieza || 'NINGUNO',
      fecha: attendanceDate,
      status,
      comentario: comentario || '',
      fotoEvidencia: fotoEvidencia || undefined,
      registradoPor: req.user._id
    };

    if (Array.isArray(actividades)) {
      attendanceData.actividades = actividades.map((item) => ({
        tarea: item.tarea || '',
        completada: Boolean(item.completada)
      })).filter((item) => item.tarea);
    }

    const attendance = await Attendance.findOneAndUpdate(
      { estudiante: estudiante._id, fecha: attendanceDate },
      attendanceData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('estudiante', 'nombre numeroLista equipoLimpieza grupo');

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

const getGroupAttendance = async (req, res, next) => {
  try {
    const grupoProfesor = req.user.grupoAsignado;
    if (!grupoProfesor) {
      res.status(400);
      return next(new Error('El profesor no tiene un grupo asignado.'));
    }

    const dateQuery = req.query.fecha ? normalizeDate(req.query.fecha) : normalizeDate(new Date());
    const records = await Attendance.find({ grupo: grupoProfesor.toUpperCase(), fecha: dateQuery })
      .populate('estudiante', 'nombre numeroLista equipoLimpieza grupo')
      .sort({ 'estudiante.numeroLista': 1 });

    res.status(200).json({ success: true, fecha: dateQuery.toISOString().split('T')[0], records });
  } catch (error) {
    next(error);
  }
};

const getAttendanceStats = async (req, res, next) => {
  try {
    const grupoProfesor = req.user.grupoAsignado;
    if (!grupoProfesor) {
      res.status(400);
      return next(new Error('El profesor no tiene un grupo asignado.'));
    }

    const dateQuery = req.query.fecha ? normalizeDate(req.query.fecha) : normalizeDate(new Date());

    const stats = await Attendance.aggregate([
      { $match: { grupo: grupoProfesor.toUpperCase(), fecha: dateQuery } },
      {
        $group: {
          _id: '$status',
          total: { $sum: 1 }
        }
      }
    ]);

    const formatted = stats.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      fecha: dateQuery.toISOString().split('T')[0],
      grupo: grupoProfesor,
      totals: {
        cumplio: formatted['Cumplió'] || 0,
        noCumplio: formatted['No cumplió'] || 0,
        pendiente: formatted['Pendiente'] || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getGroupAttendance,
  getAttendanceStats
};
