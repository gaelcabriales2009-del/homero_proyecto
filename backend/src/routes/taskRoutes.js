const express = require('express');
const router = express.Router();
const { createTask, getGroupTasks } = require('../controller/taskController');
const { protect, isTeacher } = require('../middlewares/authMiddleware');

// Ambas rutas requieren estar logueado y ser profesor
router.post('/create', protect, isTeacher, createTask);
router.get('/my-group', protect, isTeacher, getGroupTasks);

module.exports = router;