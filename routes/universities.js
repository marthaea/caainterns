// routes/universities.js — URL definitions for Universities
// Mounted at /api/universities in index.js


const router = require('express').Router();
const ctrl   = require('../controllers/universitiesController');

// GET  /api/universities
router.get('/',    ctrl.getAll);

// GET  /api/universities/2
router.get('/:id', ctrl.getById);

// POST /api/universities
router.post('/',   ctrl.create);

// PUT  /api/universities/2
router.put('/:id', ctrl.update);

// DELETE /api/universities/2
router.delete('/:id', ctrl.remove);

module.exports = router;
