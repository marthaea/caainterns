// routes/supervisors.js — URL definitions for Supervisors
// Mounted at /api/supervisors in index.js


const router = require('express').Router();
const ctrl   = require('../controllers/supervisorsController');

// GET  /api/supervisors
router.get('/',    ctrl.getAll);

// GET  /api/supervisors/3
router.get('/:id', ctrl.getById);

// POST /api/supervisors
router.post('/',   ctrl.create);

// PUT  /api/supervisors/3
router.put('/:id', ctrl.update);

// DELETE /api/supervisors/3
router.delete('/:id', ctrl.remove);

module.exports = router;
