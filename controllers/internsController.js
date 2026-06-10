// Logic for Intern routes
// Controllers are where the ACTUAL WORK happens.
// Routes just show what URL maps to a particular functionfunction."
// Controllers contain that function and its database logic.
// Pattern used throughout: async/await with try/catch
//   - async  → marks the function as asynchronous (it will wait for DB)
//   - await  → pauses execution until the DB responds
//   - try    → attempt the database operation
//   - catch  → if anything goes wrong, return a clean error instead of crashing

// db is our MySQL connection pool from db.js
const db = require('../db');

// GET /api/interns
// Returns every intern — with their department and university
// names joined in (so you get readable data, not just IDs)

exports.getAll = async (req, res) => {
  try {
    // JOIN pulls matching rows from other tables.
    // LEFT JOIN means: include the intern even if they have
    // no matching department or university row yet.
    // i.* = all columns from intern table
    // d.name AS department_name = rename the column so it
    //   doesn't clash with other "name" columns
    const [rows] = await db.query(`
      SELECT
        i.*,
        d.dpt_name,
        u.uni_name,
        s.first_name AS supervisor_first_name,
        s.last_name  AS supervisor_last_name
      FROM intern i
      LEFT JOIN Department d ON i.department_id = d.department_id
      LEFT JOIN university  u ON i.university_id  = u.university_id
      LEFT JOIN Supervisor  s ON i.supervisor_id   = s.supervisor_id
    `);

    // rows is an array of objects, one per intern
    // res.json() converts it to JSON and sends it back
    res.json(rows);
  } catch (err) {
    // 500 = Internal Server Error
    // Sending the error message so that I can debug it in Postman
    res.status(500).json({ error: err.message });
  }
};

// GET /api/interns/:id
// Returns ONE intern by their ID

exports.getById = async (req, res) => {
  try {
    // req.params.id captures the number from the URL
    // e.g. GET /api/interns/7 → req.params.id === "7"
    //
    // The ? is a PLACEHOLDER — mysql2 replaces it with the
    // value in the array [req.params.id] safely.
    // This prevents SQL injection attacks!
    const [rows] = await db.query(`
      SELECT
        i.*,
        d.name AS department_name,
        u.name AS university_name
      FROM intern i
      LEFT JOIN department d ON i.department_id = d.id
      LEFT JOIN university  u ON i.university_id  = u.id
      WHERE i.id = ?
    `, [req.params.id]);

    // rows[0] = first (and only) result
    // If nothing found, rows is empty — send 404
    if (!rows[0]) return res.status(404).json({ error: 'Intern not found' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/interns
// Creates a new intern record
exports.create = async (req, res) => {
  try {
    // Destructure the request body — pull out the specific
    // fields we expect the caller to send as JSON
    const { first_name, last_name, email, phone, department_id, university_id, supervisor_id } = req.body;

    // Basic validation — make sure required fields are present
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    // INSERT INTO adds a new row.
    // The VALUES (?,?,?,?,?,?,?) placeholders match the array order below.
    const [result] = await db.query(
      `INSERT INTO intern
        (first_name, last_name, email, phone, department_id, university_id, supervisor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, department_id, university_id, supervisor_id]
    );

    // result.insertId = the auto-generated id of the new row
    res.status(201).json({
      message:   'Intern created successfully',
      intern_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/interns/:id
// Updates an existing intern's details

exports.update = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department_id, university_id, supervisor_id } = req.body;

    await db.query(
      `UPDATE intern
       SET first_name=?, last_name=?, email=?, phone=?,
           department_id=?, university_id=?, supervisor_id=?
       WHERE id = ?`,
      // The last value in the array matches the WHERE id = ?
      [first_name, last_name, email, phone, department_id, university_id, supervisor_id, req.params.id]
    );

    res.json({ message: 'Intern updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/interns/:id
// Removes an intern from the database
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM intern WHERE id = ?', [req.params.id]);
    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
