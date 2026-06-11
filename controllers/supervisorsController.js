const db = require('../db');

// GET /api/supervisors
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.*,
        COUNT(i.intern_id) AS intern_count
      FROM Supervisor s
      LEFT JOIN Intern i ON i.supervisor_id = s.supervisor_id
      GROUP BY s.supervisor_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/supervisors/:id
exports.getById = async (req, res) => {
  try {
    const supervisorResult = await db.query(
      'SELECT * FROM Supervisor WHERE supervisor_id = $1',
      [req.params.id]
    );
    if (!supervisorResult.rows[0]) return res.status(404).json({ error: 'Supervisor not found' });

    const internsResult = await db.query(
      'SELECT intern_id, first_name, last_name, email FROM Intern WHERE supervisor_id = $1',
      [req.params.id]
    );

    res.json({ ...supervisorResult.rows[0], interns: internsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/supervisors
exports.create = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name and email are required' });
    }

    const result = await db.query(
      `INSERT INTO Supervisor (first_name, last_name, email)
       VALUES ($1, $2, $3)
       RETURNING supervisor_id`,
      [first_name, last_name, email]
    );
    res.status(201).json({ message: 'Supervisor created', supervisor_id: result.rows[0].supervisor_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/supervisors/:id
exports.update = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    await db.query(
      `UPDATE Supervisor
       SET first_name = $1, last_name = $2, email = $3
       WHERE supervisor_id = $4`,
      [first_name, last_name, email, req.params.id]
    );
    res.json({ message: 'Supervisor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/supervisors/:id
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM Supervisor WHERE supervisor_id = $1', [req.params.id]);
    res.json({ message: 'Supervisor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};