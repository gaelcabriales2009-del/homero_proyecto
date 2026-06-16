// src/controller/taskController.js
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');

// 1. Crear una nueva tarea de limpieza (Actualizado con next(error))
const createTask = async (req, res, next) => {
  const { descripcion, estudianteAsignado, fechaEntrega } = req.body;
  const grupoProfesor = req.user.grupoAsignado; // Obtenido del token del profesor

  try {
    if (!descripcion || !estudianteAsignado || !fechaEntrega) {
      res.status(400);
      return next(new Error('Faltan campos obligatorios para crear la tarea.'));
    }
if (!mongoose.Types.ObjectId.isValid(estudianteAsignado)) {
  res.status(400);
  return next(new Error('ID de estudiante inválido.'));
}
    const alumno = await User.findById(estudianteAsignado);
    if (!alumno || alumno.role !== 'ESTUDIANTE') {
      res.status(404);
      return next(new Error('El estudiante asignado no existe o no tiene rol de estudiante.'));
    }

    // 🔴 TRAMPA PARA LA CONSOLA: Esto nos dirá qué está leyendo realmente el servidor
    console.log("👉 Grupo del Alumno en DB:", alumno.grupo);
    console.log("👉 Grupo del Profesor logueado:", grupoProfesor);

    // 🟢 VALIDACIÓN BLINDADA: Revisa que existan, convierte a texto, borra espacios y hace mayúsculas
    if (!alumno.grupo || !grupoProfesor || alumno.grupo.toString().trim().toUpperCase() !== grupoProfesor.toString().trim().toUpperCase()) {
      res.status(400);
      return next(new Error(`No coinciden. (Alumno: ${alumno.grupo} | Profesor: ${grupoProfesor})`));
    }
    const fecha = new Date(fechaEntrega);

if (fecha <= new Date()) {
  res.status(400);
  return next(
    new Error('La fecha de entrega debe ser posterior al momento actual.')
  );
}
    const newTask = new Task({
      descripcion,
      grupo: grupoProfesor,
      estudianteAsignado,
      equipoLimpieza: alumno.equipoLimpieza || 'NINGUNO',
      fechaEntrega
    });

    await newTask.save();

    res.status(201).json({
      success: true,
      msg: 'Tarea asignada correctamente.',
      task: newTask
    });

  } catch (error) {
    next(error);
  }
};

// 2. Obtener todas las tareas del grupo con PAGINACIÓN y middleware de errores
const getGroupTasks = async (req, res, next) => {
  try {
    // 1. Extraer página y límite de la URL (Ej: /api/tasks?page=1&limit=10)
    // Si no los mandan, por defecto va a la página 1 y trae 10 tareas.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filtroGrupo = { grupo: req.user.grupoAsignado };

    // 2. Buscar las tareas del grupo aplicando skip, limit y ordenamiento
    const tasks = await Task.find(filtroGrupo)
      .populate('estudianteAsignado', 'nombre numeroLista equipoLimpieza') 
      .skip(skip)
      .limit(limit)
      .sort({ fechaEntrega: 1 }); // Sigue ordenando por fecha más cercana

    // 3. Contar el total de tareas existentes exclusivas de ESTE grupo
    const totalTasks = await Task.countDocuments(filtroGrupo);

    // 4. Responder con la data y la metadata de la paginación para el Frontend
    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        totalTasks,
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        hasNextPage: page * limit < totalTasks,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    // Le pasamos el error al middleware global
    next(error);
  }
};

module.exports = {
  createTask,
  getGroupTasks
};