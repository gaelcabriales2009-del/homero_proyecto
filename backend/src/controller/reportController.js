const Task = require('../models/Task');

const getGroupCleaningStats = async (req, res) => {
  // El grupo lo tomamos del profesor que inició sesión (gracias al middleware 'protect')
  const grupoProfesor = req.user.grupoAsignado; 

  try {
    // 🚀 AQUÍ INICIA TU PRIMER AGGREGATION PIPELINE
    const stats = await Task.aggregate([
      // Etapa 1: Filtrar solo las tareas que pertenecen al grupo de este profesor
      { 
        $match: { grupo: grupoProfesor } 
      },
      
      // Etapa 2: Agrupar por "equipoLimpieza" y procesar los contadores
      {
        $group: {
          _id: "$equipoLimpieza", // El campo por el cual se va a agrupar
          totalTareas: { $sum: 1 }, // Suma 1 por cada tarea encontrada en el equipo
          completadas: {
            $sum: { $cond: [{ $eq: ["$estado", "COMPLETADO"] }, 1, 0] } // Si el estado es COMPLETADO, suma 1, si no 0
          },
          incumplidas: {
            $sum: { $cond: [{ $eq: ["$estado", "INCUMPLIDO"] }, 1, 0] } // Si el estado es INCUMPLIDO, suma 1, si no 0
          }
        }
      },

      // Etapa 3: Ordenar los equipos alfabéticamente (_id es el nombre del equipo aquí)
      { 
        $sort: { _id: 1 } 
      }
    ]);

    res.json({
      success: true,
      grupo: grupoProfesor,
      reporteEquipos: stats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al generar el pipeline de estadísticas.' });
  }
};

module.exports = {
  getGroupCleaningStats
};