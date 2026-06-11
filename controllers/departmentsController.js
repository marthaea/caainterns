const db = require('../db');

// GET /api/departments
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        d.*,
        COUNT(i.intern_id) AS intern_count
      FROM Department d
      LEFT JOIN Intern i ON i.department_id = d.department_id
      GROUP BY d.department_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/departments/:id
exports.getById = async (req, res) => {
  try {
    const deptResult = await db.query(
      'SELECT * FROM Department WHERE department_id = $1',
      [req.params.id]
    );
    if (!deptResult.rows[0]) return res.status(404).json({ error: 'Department not found' });

    const internsResult = await db.query(
      'SELECT intern_id, first_name, last_name, email FROM Intern WHERE department_id = $1',
      [req.params.id]
    );

    res.json({ ...deptResult.rows[0], interns: internsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/departments
exports.create = async (req, res) => {
  try {
    const { dpt_name } = req.body;
    if (!dpt_name) return res.status(400).json({ error: 'dpt_name is required' });

    const result = await db.query(
      'INSERT INTO Department (dpt_name) VALUES ($1) RETURNING department_id',
      [dpt_name]
    );
    res.status(201).json({ message: 'Department created', department_id: result.rows[0].department_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/departments/:id
exports.update = async (req, res) => {
  try {
    const { dpt_name } = req.body;
    await db.query(
      'UPDATE Department SET dpt_name = $1 WHERE department_id = $2',
      [dpt_name, req.params.id]
    );
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/departments/:id
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM Department WHERE department_id = $1', [req.params.id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};