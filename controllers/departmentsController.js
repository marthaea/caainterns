// Logic for Departments
// Departments contain id and name.
// But we enrich GET responses with the COUNT of interns
// in each department, which is useful for dashboards and analysis.


const db = require('../db');
// GET /api/departments
// Returns all departments and how many interns are in each

exports.getAll = async (req, res) => {
  try {
    // COUNT(i.id) counts interns per department.
    // GROUP BY groups the results so each department gets
    // its own row with its own count.
    // AS intern_count gives that calculated column a name.
    const [rows] = await db.query(`
      SELECT
        d.*,
        COUNT(i.id) AS intern_count
      FROM department d
      LEFT JOIN intern i ON i.department_id = d.id
      GROUP BY d.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET /api/departments/:id
// Returns one department + the interns who belong to it
exports.getById = async (req, res) => {
  try {
    // First fetch the department itself
    const [dept] = await db.query(
      'SELECT * FROM department WHERE id = ?',
      [req.params.id]
    );
    if (!dept[0]) return res.status(404).json({ error: 'Department not found' });

    // Then fetch all interns in that department as a second query
    const [interns] = await db.query(
      'SELECT id, first_name, last_name, email FROM intern WHERE department_id = ?',
      [req.params.id]
    );

    // Combine both into one response object
    res.json({ ...dept[0], interns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// POST /api/departments
// Creates a new department
exports.create = async (req, res) => {
  try {
    const { dpt_name } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const [result] = await db.query(
      'INSERT INTO department (name) VALUES (?)',
      [name]
    );
    res.status(201).json({ message: 'Department created', department_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/departments/:id
// Updates a department name
exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE Department SET dpt_name = ? WHERE department_id = ?', [dpt_name, req.params.id]);
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// DELETE /api/departments/:id
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM department WHERE id = ?', [req.params.id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
