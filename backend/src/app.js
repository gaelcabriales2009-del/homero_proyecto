const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// ─── IMPORTACIÓN DE RUTAS ─────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const taskRoutes = require('./routes/taskRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// ─── 1. CAPAS DE SEGURIDAD GLOBALES ───────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize()); 

// ─── 2. ANTI FUERZA BRUTA (RATE LIMIT) ────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { msg: 'Demasiadas solicitudes desde esta IP, por favor intenta en 15 minutos.' }
});
app.use('/api/', apiLimiter);

app.use(cors());

// ─── DOCUMENTACIÓN CON SWAGGER (OBJETO DEFINITIVO) ────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Control de Limpieza Escolar - Proyecto Sergio',
      version: '1.0.0',
      description: 'Documentación oficial del backend para la gestión de tareas de limpieza, roles de profesores y alumnos.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor Local de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token con el formato: Bearer <TOKEN>',
        },
      },
    },
    paths: {
      // ─── AUTENTICACIÓN ──────────────────────────────────────────
      '/api/auth/register': {
        post: {
          summary: 'Registrar un nuevo usuario (Estudiante o Profesor)',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'correo', 'password', 'role'],
                  properties: {
                    nombre: { type: 'string', example: 'Rosales Alumno' },
                    correo: { type: 'string', example: 'rosales@escuela.edu' },
                    password: { type: 'string', example: 'RosaAlumno2026!' },
                    role: { type: 'string', enum: ['ESTUDIANTE', 'PROFESOR'], example: 'ESTUDIANTE' },
                    grupo: { type: 'string', example: '2B' },
                    equipoLimpieza: { type: 'string', example: 'EQUIPO_BETA' }
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Usuario registrado con éxito' },
            400: { description: 'Error de validación' }
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión en la plataforma',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['correo', 'password', 'role'],
                  properties: {
                    correo: { type: 'string', example: 'rosales@escuela.edu' },
                    password: { type: 'string', example: 'RosaAlumno2026!' },
                    role: { type: 'string', example: 'ESTUDIANTE' }
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login exitoso y retorno de Token JWT' },
            401: { description: 'Credenciales inválidas' }
          },
        },
      },
      '/api/auth/test-profe': {
        get: {
          summary: 'Verificar zona segura exclusiva de Profesores',
          tags: ['Autenticación'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Acceso autorizado al panel del docente' },
            401: { description: 'Token no válido o ausente' }
          },
        },
      },
      // ─── GESTIÓN DE TAREAS (TASKS) ──────────────────────────────
      '/api/tasks': {
        get: {
          summary: 'Listar todas las tareas de limpieza registradas',
          tags: ['Tareas de Limpieza'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de tareas obtenida correctamente' },
            401: { description: 'No autorizado' }
          },
        },
        post: {
          summary: 'Crear o asignar una nueva tarea de limpieza (Solo Profesores)',
          tags: ['Tareas de Limpieza'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['aula', 'equipoAsignado', 'fecha'],
                  properties: {
                    aula: { type: 'string', example: 'Aula 2B' },
                    equipoAsignado: { type: 'string', enum: ['EQUIPO_ALFA', 'EQUIPO_BETA', 'EQUIPO_GAMMA'], example: 'EQUIPO_BETA' },
                    fecha: { type: 'string', format: 'date', example: '2026-06-15' },
                    descripcion: { type: 'string', example: 'Limpieza general de mesabancos, ventanas y retirar basura.' }
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Tarea creada y asignada con éxito' },
            400: { description: 'Faltan datos requeridos' },
            403: { description: 'Prohibido. Se requiere rol de PROFESOR' }
          },
        },
      },
      '/api/tasks/{id}': {
        put: {
          summary: 'Actualizar o modificar una tarea por su ID',
          tags: ['Tareas de Limpieza'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la tarea en MongoDB' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    aula: { type: 'string', example: 'Aula 2B Modificada' },
                    estado: { type: 'string', enum: ['PENDIENTE', 'COMPLETADA'], example: 'COMPLETADA' }
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Tarea actualizada con éxito' },
            404: { description: 'Tarea no encontrada' }
          },
        },
        delete: {
          summary: 'Eliminar una tarea de limpieza del sistema',
          tags: ['Tareas de Limpieza'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la tarea a borrar' }
          ],
          responses: {
            200: { description: 'Tarea eliminada de la base de datos' },
            404: { description: 'Tarea no encontrada' }
          },
        },
      },
      // ─── REPORTES DE EVALUACIÓN (REPORTS) ───────────────────────
      '/api/reports': {
        get: {
          summary: 'Listar todos los reportes de cumplimiento e incidencias',
          tags: ['Reportes y Calificaciones'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Historial de reportes obtenido' }
          },
        },
        post: {
          summary: 'Calificar el cumplimiento de un equipo (Solo Profesores)',
          tags: ['Reportes y Calificaciones'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['tareaId', 'calificacion', 'comentarios'],
                  properties: {
                    tareaId: { type: 'string', example: '64bbf67a21394c8e71c99f01' },
                    calificacion: { type: 'integer', minimum: 1, maximum: 10, example: 9 },
                    comentarios: { type: 'string', example: 'El equipo limpió muy bien, pero llegaron 5 minutos tarde.' },
                    incidencias: { type: 'boolean', example: false }
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Reporte evaluado y guardado correctamente' },
            403: { description: 'Acceso denegado. Rol insuficiente' }
          },
        },
      },
    },
  },
  apis: [], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── 3. CONTROLADORES DE RUTAS ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);

const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API corriendo. Ve a /api-docs para ver la documentación interactiva.');
});

module.exports = app;