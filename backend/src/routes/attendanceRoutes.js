const express = require('express');
const router = express.Router();
const { markAttendance, getGroupAttendance, getAttendanceStats } = require('../controller/attendanceController');
const { protect, isTeacher } = require('../middlewares/authMiddleware');

router.post('/mark', protect, markAttendance);
router.get('/group', protect, isTeacher, getGroupAttendance);
router.get('/stats', protect, isTeacher, getAttendanceStats);

module.exports = router;
