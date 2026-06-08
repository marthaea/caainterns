// routes/departments.js — URL definitions for Departments
// Mounted at /api/departments in index.js
// Same pattern as interns — CRUD for the department table


const router = require('express').Router();
const ctrl   = require('../controllers/departmentsController');

// GET  /api/departments        — list all departments
router.get('/',    ctrl.getAll);

// GET  /api/departments/5      — get one department by id
router.get('/:id', ctrl.getById);

// POST /api/departments        — create a new department
router.post('/',   ctrl.create);

// PUT  /api/departments/5      — update department with id=5
router.put('/:id', ctrl.update);

// DELETE /api/departments/5    — delete department with id=5
router.delete('/:id', ctrl.remove);

module.exports = router;
