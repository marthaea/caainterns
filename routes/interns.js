// routes/interns.js — URL definitions for the Interns resource
// A Router is like a mini Express app that handles only
// the routes for one specific resource (interns, in this case).
//
// In index.js we mounted this router at '/api/interns',
// so ALL paths here are RELATIVE to that prefix.
// Meaning: router.get('/') here = GET /api/interns in real life


// express.Router() creates a new, isolated router object
const router = require('express').Router();

// Import the controller — the file with the actual logic
const ctrl = require('../controllers/internsController');

// GET /api/interns
// Returns a list of ALL interns
router.get('/', ctrl.getAll);

// GET /api/interns/123
// The :id is a URL parameter — it captures whatever number
// is in that position and makes it available as req.params.id
router.get('/:id', ctrl.getById);

// POST /api/interns
// Creates a new intern. The data comes in req.body (JSON)
router.post('/', ctrl.create);

// PUT /api/interns/123
// Updates the intern with that id. PUT = replace/update
router.put('/:id', ctrl.update);

// DELETE /api/interns/123
// Deletes the intern with that id
router.delete('/:id', ctrl.remove);

// Make this router available to index.js via require()
module.exports = router;
