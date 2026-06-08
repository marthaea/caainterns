// ============================================================
// index.js — The Entry Point / "Front Door" of Your API
// ============================================================
// This is the FIRST file Node.js runs when you do `node index.js`
// Think of it as the reception desk of your building —
// every request that comes in passes through here first.
// ============================================================

// 1. Import Express — the framework that handles HTTP for us
//    Without this, we'd have to write raw Node.js HTTP code (much harder)
const express = require('express');

// 2. Import dotenv — reads our .env file and loads values into process.env
//    This keeps secrets (passwords, keys) OUT of our code
require('dotenv').config();

// 3. Create the Express "app" — this is our actual server object
//    Everything we configure goes onto this object
const app = express();

// ============================================================
// MIDDLEWARE
// Middleware = functions that run on EVERY request before
// it reaches your route handlers. Like security at the door.
// ============================================================

// Tells Express to automatically parse incoming JSON request bodies.
// Without this, req.body would be undefined when someone POSTs JSON.
// Example: POST /api/interns with body {"name":"Alice"} -> req.body.name === "Alice"
app.use(express.json());

// ============================================================
// ROUTES
// These lines connect URL paths to your route files.
// When a request comes in for /api/interns/..., Express
// hands it off to the interns router to handle.
// ============================================================

app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/departments',  require('./routes/departments'));
app.use('/api/interns',      require('./routes/interns'));
app.use('/api/supervisors',  require('./routes/supervisors'));
app.use('/api/universities', require('./routes/universities'));

// ============================================================
// ROOT ROUTE — just a health check so you know it's alive
// Visit http://localhost:3000/ in your browser to test
// ============================================================
app.get('/', (req, res) => {
  res.json({ message: 'CAA Interns Attendance API is running' });
});

// ============================================================
// GLOBAL ERROR HANDLER
// If any route throws an error, it lands here instead of crashing.
// The 4 parameters (err, req, res, next) tell Express this is
// an error handler — the 4th param "next" is the key signal.
// ============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// ============================================================
// START THE SERVER
// process.env.PORT reads from your .env file.
// The || 3000 means "use 3000 if PORT isn't set"
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
