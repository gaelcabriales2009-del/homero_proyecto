const express = require('express');
const router = express.Router();
const { getGroupCleaningStats } = require('../controller/reportController');
const { protect, isTeacher } = require('../middlewares/authMiddleware');


router.get('/stats-equipos', protect, isTeacher, getGroupCleaningStats);

module.exports = router;