// routes/attendance.js — URL definitions for Attendance
// Attendance has the most routes because it's the core
// feature — biostar-style clock-in/clock-out tracking.
//
// Mounted at /api/attendance in index.js

const router = require('express').Router();
const ctrl   = require('../controllers/attendanceController');

// STANDARD CRUD

// GET /api/attendance
// Returns ALL attendance records (useful for admin/reports)
router.get('/', ctrl.getAll);

// GET /api/attendance/42
// Returns one specific attendance record by its own id
router.get('/:id', ctrl.getById);

// DELETE /api/attendance/42
// Removes a specific attendance record (e.g. for corrections)
router.delete('/:id', ctrl.remove);

// BIOSTAR CORE FEATURES

// POST /api/attendance/clock-in
// Body: { "intern_id": 5 }
// Stamps the current time as the intern's clock-in time
router.post('/clock-in', ctrl.clockIn);

// PUT /api/attendance/clock-out
// Body: { "intern_id": 5 }
// Finds the open clock-in for that intern and stamps clock-out
router.put('/clock-out', ctrl.clockOut);

// REPORTING ROUTES

// GET /api/attendance/intern/5
// Returns all attendance records for a specific intern
router.get('/intern/:intern_id', ctrl.getByIntern);

// GET /api/attendance/report?start=2025-01-01&end=2025-01-31
// Returns records within a date range — uses query parameters
// ?start= and ?end= which are read from req.query
router.get('/report/range', ctrl.getByDateRange);

module.exports = router;
