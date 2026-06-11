const db = require('../db');

// GET /api/interns
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        i.*,
        d.dpt_name,
        u.uni_name,
        s.first_name AS supervisor_first_name,
        s.last_name  AS supervisor_last_name
      FROM Intern i
      LEFT JOIN Department d ON i.department_id = d.department_id
      LEFT JOIN University  u ON i.university_id  = u.university_id
      LEFT JOIN Supervisor  s ON i.supervisor_id  = s.supervisor_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/interns/:id
exports.getById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        i.*,
        d.dpt_name,
        u.uni_name,
        s.first_name AS supervisor_first_name,
        s.last_name  AS supervisor_last_name
      FROM Intern i
      LEFT JOIN Department d ON i.department_id = d.department_id
      LEFT JOIN University  u ON i.university_id  = u.university_id
      LEFT JOIN Supervisor  s ON i.supervisor_id  = s.supervisor_id
      WHERE i.intern_id = $1
    `, [req.params.id]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Intern not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/interns
exports.create = async (req, res) => {
  try {
    const { first_name, last_name, email, address, start_date, end_date, active_status, department_id, supervisor_id, university_id } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    const result = await db.query(
      `INSERT INTO Intern
        (first_name, last_name, email, address, start_date, end_date, active_status, department_id, supervisor_id, university_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING intern_id`,
      [first_name, last_name, email, address, start_date, end_date, active_status, department_id, supervisor_id, university_id]
    );

    res.status(201).json({
      message:   'Intern created successfully',
      intern_id: result.rows[0].intern_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/interns/:id
exports.update = async (req, res) => {
  try {
    const { first_name, last_name, email, address, start_date, end_date, active_status, department_id, supervisor_id, university_id } = req.body;

    await db.query(
      `UPDATE Intern
       SET first_name=$1, last_name=$2, email=$3, address=$4,
           start_date=$5, end_date=$6, active_status=$7,
           department_id=$8, supervisor_id=$9, university_id=$10
       WHERE intern_id = $11`,
      [first_name, last_name, email, address, start_date, end_date, active_status, department_id, supervisor_id, university_id, req.params.id]
    );

    res.json({ message: 'Intern updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/interns/:id
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM Intern WHERE intern_id = $1', [req.params.id]);
    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};